# Health-Matters Backend Tutorial
### How to Build a New Endpoint from Zero — and Connect It to the Frontend

> **Who is this for?**
> You have built pages on the frontend (React) but have not yet wired them up to the database. This guide walks you through every single step — from creating a backend route, all the way to calling it inside a React component — with zero assumed knowledge.

---

## Table of Contents

1. [The Big Picture — How Everything Connects](#1-the-big-picture)
2. [How Clerk Tokens Work](#2-how-clerk-tokens-work)
3. [Step 1 — Create a Mongoose Model](#3-step-1--create-a-mongoose-model)
4. [Step 2 — Create a DTO (Input Validation)](#4-step-2--create-a-dto)
5. [Step 3 — Create a Controller](#5-step-3--create-a-controller)
6. [Step 4 — Create a Router](#6-step-4--create-a-router)
7. [Step 5 — Register the Router in index.ts](#7-step-5--register-the-router-in-indexts)
8. [Step 6 — Create the Frontend API Slice](#8-step-6--create-the-frontend-api-slice)
9. [Step 7 — Use the Hook Inside a Component](#9-step-7--use-the-hook-inside-a-component)
10. [Real-World Examples by User Role](#10-real-world-examples-by-user-role)
11. [Error Types & When to Use Them](#11-error-types--when-to-use-them)
12. [Common Mistakes](#12-common-mistakes)

---

## 1. The Big Picture

Think of a request travelling through the system like this:

```
React Component
    │
    │  calls a hook  e.g. useGetReferralsQuery()
    ▼
RTK Query (store/api/referralsApi.js)
    │
    │  HTTP request with Clerk token in Authorization header
    ▼
Express Server  (Backend/src/index.ts)
    │
    │  clerkMiddleware() verifies the token
    │  then hands off to the right router
    ▼
Router  (Backend/src/routes/referralRoutes.ts)
    │
    │  matches the URL pattern  e.g. GET /api/referrals
    ▼
Controller  (Backend/src/controllers/referralController.ts)
    │
    │  validates the input with a DTO
    │  queries MongoDB via Mongoose
    ▼
MongoDB
    │
    │  returns data back up the chain
    ▼
React Component receives the data
```

Every single layer has one job:

| Layer | File location | Job |
|---|---|---|
| **Model** | `Backend/src/models/` | Describes what a document looks like in MongoDB |
| **DTO** | `Backend/src/Dtos/` | Validates that incoming data is the correct shape |
| **Controller** | `Backend/src/controllers/` | Does the actual database work and sends the response |
| **Router** | `Backend/src/routes/` | Maps a URL + HTTP verb to a controller function |
| **index.ts** | `Backend/src/index.ts` | Starts the server and registers all routers |
| **API slice** | `Frontend/src/store/api/` | Defines frontend queries/mutations that call the backend |
| **Component** | `Frontend/src/pages/` | Calls a hook from the API slice and renders the data |

---

## 2. How Clerk Tokens Work

Clerk is the authentication system. When a user signs in through the frontend, Clerk gives them a **JWT token** — a short string that proves who they are.

### On the Frontend — attaching the token automatically

Look at `Frontend/src/store/api/baseApi.js`:

```js
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: async (headers) => {
    // Every time ANY request is made, this function runs first.
    // It grabs the user's Clerk session token...
    if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        // ...and attaches it to the Authorization header.
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  },
});
```

> **You do not need to touch this file.** Every request you make through RTK Query automatically gets the token attached. This is already set up.

### On the Backend — verifying the token

In `Backend/src/index.ts` there is this line:

```ts
server.use(clerkMiddleware());
```

This runs on **every request**. Clerk's middleware reads the `Authorization` header, verifies the token is genuine, and then makes the logged-in user's ID available via `getAuth(req)`.

### Reading who is logged in inside a Controller

```ts
import { getAuth } from '@clerk/express';

export const updateUserByClerkId = async (req, res, next) => {
  const auth = getAuth(req);

  // auth.userId is the Clerk ID of whoever is making the request
  // e.g.  "user_2abc123xyz"
  if (!auth.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  // Now you can use auth.userId to find their record in MongoDB
  const user = await User.findOne({ clerkUserId: auth.userId });
};
```

> **Summary:** The frontend silently attaches `Bearer <token>` to every request. The backend's `clerkMiddleware()` reads it and makes `auth.userId` available in every controller. You never store passwords — Clerk handles all of that.

---

## 3. Step 1 — Create a Mongoose Model

A **Model** is the blueprint for a document in MongoDB. Every piece of data you want to store needs a model.

**File location:** `Backend/src/models/`

### Example: creating an `Appointment` model

```ts
// Backend/src/models/Appointment.ts
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    // Who is the appointment for?
    patientClerkUserId: {
      type: String,
      required: true,  // this field MUST be provided
    },

    // Which practitioner is running it?
    practitionerClerkUserId: {
      type: String,
      required: true,
    },

    // What service is being delivered?
    serviceType: {
      type: String,
      trim: true,
    },

    // When is it?
    scheduledDate: {
      type: Date,
      required: true,
    },

    // What state is it in?
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// Export the model so controllers can use it
export const Appointment = mongoose.model('Appointment', appointmentSchema);
```

> **Rule of thumb:** If you are storing something new in the database, you need a model for it first.

---

## 4. Step 2 — Create a DTO

**DTO** stands for *Data Transfer Object*. Its only job is to **validate** the shape of data coming into the backend before you do anything with it. We use a library called **Zod** for this.

**File location:** `Backend/src/Dtos/`

### Why do we validate?

Without validation, someone could send `{ scheduledDate: "banana" }` and your code would crash. Zod catches bad data before it reaches your database.

### Example: creating `appointment.dto.ts`

```ts
// Backend/src/Dtos/appointment.dto.ts
import { z } from 'zod';

// Validates the body of a POST /api/appointments request
export const createAppointmentBodySchema = z.object({
  patientClerkUserId: z.string().trim().min(1, 'patientClerkUserId is required'),
  practitionerClerkUserId: z.string().trim().min(1, 'practitionerClerkUserId is required'),
  serviceType: z.string().trim().optional(),
  scheduledDate: z.coerce.date(), // turns a string like "2026-03-09" into a real Date
  notes: z.string().trim().optional(),
});

// Validates the :appointmentId in the URL  e.g. /api/appointments/abc123
export const appointmentIdParamsSchema = z.object({
  appointmentId: z.string().trim().min(1, 'appointmentId is required'),
});

// Validates the body of a PUT request — all fields are optional
// but at least one must be provided
export const updateAppointmentBodySchema = createAppointmentBodySchema
  .omit({ patientClerkUserId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });
```

### How to use Zod in a controller (pattern you will always use)

```ts
const parsedBody = createAppointmentBodySchema.safeParse(req.body);

// safeParse never throws. It returns { success: true, data: ... }
// or { success: false, error: ... }
if (!parsedBody.success) {
  throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
}

// parsedBody.data is now guaranteed to be the correct shape
const newAppointment = await Appointment.create(parsedBody.data);
```

---

## 5. Step 3 — Create a Controller

A **Controller** is where the actual work happens. It:
1. Reads the incoming request (body, URL params, query string)
2. Validates it using the DTO
3. Queries or updates MongoDB
4. Sends back a response

**File location:** `Backend/src/controllers/`

### Full example: `appointmentController.ts`

```ts
// Backend/src/controllers/appointmentController.ts
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Appointment } from '../models/Appointment';
import {
  createAppointmentBodySchema,
  appointmentIdParamsSchema,
  updateAppointmentBodySchema,
} from '../Dtos/appointment.dto';
import { ValidationError, NotFoundError, UnauthorizedError } from '../errors/errors';
import { getAuth } from '@clerk/express';

// Helper — turns Zod errors into a readable array
const formatValidationErrors = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));


// ─── GET ALL APPOINTMENTS ─────────────────────────────────────────────────────
// Handles:  GET /api/appointments
export const getAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // .find() with no filter returns every document in the collection
    // .sort({ createdAt: -1 }) puts the newest first
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    next(error); // passes unexpected errors to the global error handler
  }
};


// ─── GET APPOINTMENTS FOR ONE PRACTITIONER ────────────────────────────────────
// Handles:  GET /api/appointments/practitioner/:practitionerId
export const getAppointmentsByPractitionerId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Validate the URL parameter
    const parsedParams = appointmentIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    // 2. Query MongoDB — only return appointments for this practitioner
    const appointments = await Appointment.find({
      practitionerClerkUserId: req.params.practitionerId,
    }).sort({ scheduledDate: 1 }); // soonest first

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};


// ─── CREATE AN APPOINTMENT ────────────────────────────────────────────────────
// Handles:  POST /api/appointments
export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check the user is logged in
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // 2. Validate the request body
    const parsedBody = createAppointmentBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }

    // 3. Create the document in MongoDB
    const newAppointment = await Appointment.create(parsedBody.data);

    // 4. Send back the created document with HTTP status 201 (Created)
    res.status(201).json(newAppointment);
  } catch (error) {
    next(error);
  }
};


// ─── UPDATE AN APPOINTMENT ────────────────────────────────────────────────────
// Handles:  PUT /api/appointments/:appointmentId
export const updateAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate the URL param
    const parsedParams = appointmentIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    // 2. Validate the body
    const parsedBody = updateAppointmentBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }

    // 3. Find the document by its MongoDB _id and update it
    const updated = await Appointment.findByIdAndUpdate(
      parsedParams.data.appointmentId,
      { $set: parsedBody.data },   // $set only changes the fields you provide
      { new: true, runValidators: true } // new: true returns the UPDATED document
    );

    // 4. If no document was found, throw a 404
    if (!updated) {
      throw new NotFoundError('Appointment not found');
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};


// ─── DELETE AN APPOINTMENT ────────────────────────────────────────────────────
// Handles:  DELETE /api/appointments/:appointmentId
export const deleteAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedParams = appointmentIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const deleted = await Appointment.findByIdAndDelete(parsedParams.data.appointmentId);

    if (!deleted) {
      throw new NotFoundError('Appointment not found');
    }

    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
```

### HTTP status codes you need to know

| Code | Meaning | When to use it |
|---|---|---|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (new document created) |
| `400` | Bad Request | Validation failed — data was wrong shape |
| `401` | Unauthorized | No Clerk token / not logged in |
| `403` | Forbidden | Logged in but not allowed to do this |
| `404` | Not Found | Document does not exist in MongoDB |
| `500` | Internal Server Error | Unexpected crash — handled automatically |

---

## 6. Step 4 — Create a Router

A **Router** maps URLs to controller functions. Think of it as a phone directory — when a request comes in for `/api/appointments`, the router looks up which function should handle it.

**File location:** `Backend/src/routes/`

### Example: `appointmentRoutes.ts`

```ts
// Backend/src/routes/appointmentRoutes.ts
import express from 'express';
import {
  getAllAppointments,
  getAppointmentsByPractitionerId,
  createAppointment,
  updateAppointmentById,
  deleteAppointmentById,
} from '../controllers/appointmentController';

const AppointmentRouter = express.Router();

// GET /api/appointments
AppointmentRouter.get('/', getAllAppointments);

// GET /api/appointments/practitioner/:practitionerId
AppointmentRouter.get('/practitioner/:practitionerId', getAppointmentsByPractitionerId);

// POST /api/appointments
AppointmentRouter.post('/', createAppointment);

// PUT /api/appointments/:appointmentId
AppointmentRouter.put('/:appointmentId', updateAppointmentById);

// DELETE /api/appointments/:appointmentId
AppointmentRouter.delete('/:appointmentId', deleteAppointmentById);

export default AppointmentRouter;
```

> **The colon (`:`) in `:appointmentId` means it is a variable.** If someone requests `/api/appointments/abc123`, then `req.params.appointmentId` will equal `"abc123"`.

---

## 7. Step 5 — Register the Router in index.ts

This is the step people most often forget. You've built your router, but the server doesn't know it exists yet.

Open `Backend/src/index.ts` and add two things:

```ts
// 1. Import your new router at the top of the file
import appointmentRoutes from './routes/appointmentRoutes';  // ← ADD THIS

// 2. Register it (add this line near the other server.use lines)
server.use('/api/appointments', appointmentRoutes);          // ← ADD THIS
```

After these two additions your file should look like this:

```ts
// Backend/src/index.ts  (the relevant section)
import userRoutes from './routes/userRoutes';
import referralRoutes from './routes/referralRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes'; // ← NEW

// ...

server.use('/api/users', userRoutes);
server.use('/api/referrals', referralRoutes);
server.use('/api/services', serviceRoutes);
server.use('/api/appointments', appointmentRoutes);          // ← NEW
```

> **That's it for the backend.** Your new endpoint is now live. You can test it with a tool like Postman or your browser at `http://localhost:3000/api/appointments`.

---

## 8. Step 6 — Create the Frontend API Slice

Now we move to the frontend. The frontend uses **RTK Query** (Redux Toolkit Query) to talk to the backend. Each resource (users, referrals, appointments, etc.) has its own "API slice" file inside `Frontend/src/store/api/`.

### How RTK Query works (simplified)

RTK Query automatically generates React hooks from the endpoints you define. For a `getAppointments` query it will create a hook called `useGetAppointmentsQuery`. You just call the hook inside your component and RTK Query handles the HTTP request, loading state, error state, and caching — all automatically.

### Example: `appointmentsApi.js`

```js
// Frontend/src/store/api/appointmentsApi.js
import { baseApi } from './baseApi';

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── QUERIES (reading data) ─────────────────────────────────────────────
    // builder.query = GET request

    // GET /api/appointments
    getAppointments: builder.query({
      query: () => '/appointments',
      providesTags: ['Appointments'], // used for cache invalidation (see below)
    }),

    // GET /api/appointments/practitioner/:practitionerId
    getAppointmentsByPractitionerId: builder.query({
      query: (practitionerId) => `/appointments/practitioner/${practitionerId}`,
      providesTags: ['Appointments'],
    }),


    // ── MUTATIONS (changing data) ──────────────────────────────────────────
    // builder.mutation = POST / PUT / DELETE request

    // POST /api/appointments
    createAppointment: builder.mutation({
      query: (body) => ({
        url: '/appointments',
        method: 'POST',
        body, // the object you pass to the hook becomes req.body on the backend
      }),
      invalidatesTags: ['Appointments'], // after creating, re-fetch the list
    }),

    // PUT /api/appointments/:appointmentId
    updateAppointmentById: builder.mutation({
      query: ({ appointmentId, body }) => ({
        url: `/appointments/${appointmentId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Appointments'],
    }),

    // DELETE /api/appointments/:appointmentId
    deleteAppointmentById: builder.mutation({
      query: (appointmentId) => ({
        url: `/appointments/${appointmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointments'],
    }),

  }),
  overrideExisting: false,
});

// Export the auto-generated hooks — these are what you use in your components
export const {
  useGetAppointmentsQuery,
  useGetAppointmentsByPractitionerIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentByIdMutation,
  useDeleteAppointmentByIdMutation,
} = appointmentsApi;
```

### What is `providesTags` / `invalidatesTags`?

This is the cache system. Think of tags as labels:

- `providesTags: ['Appointments']` — "this query provides data labelled Appointments"
- `invalidatesTags: ['Appointments']` — "after this mutation, the Appointments cache is stale — re-fetch it"

**In plain English:** When you create a new appointment, the list on screen automatically refreshes without you having to do anything.

### Adding the new tag to baseApi

Open `Frontend/src/store/api/baseApi.js` and add `'Appointments'` to the `tagTypes` array:

```js
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Users', 'Referrals', 'Services', 'Appointments'], // ← ADD 'Appointments'
  endpoints: () => ({}),
});
```

---

## 9. Step 7 — Use the Hook Inside a Component

Now you can use your new hooks in any React component. Here are both patterns — reading data (query) and writing data (mutation).

### Pattern A — Fetching data with a query hook

```jsx
// e.g. Frontend/src/pages/DashBoards/PractitionerDashboard/test-appointments.jsx

import { useGetAppointmentsQuery } from '@/store/api/appointmentsApi';

export function PractitionerTestAppointments() {
  // Calling the hook triggers the GET request automatically when the component mounts.
  // RTK Query gives you three things back:
  //   data    — the response from the backend (undefined while loading)
  //   isLoading — true on the very first load
  //   error   — contains the error if the request failed
  const { data: appointments, isLoading, error } = useGetAppointmentsQuery();

  if (isLoading) {
    return <p>Loading appointments...</p>;
  }

  if (error) {
    return <p>Something went wrong: {error.message}</p>;
  }

  return (
    <div>
      <h1>My Appointments</h1>
      {appointments.map((appt) => (
        <div key={appt._id}>
          <p>Date: {new Date(appt.scheduledDate).toLocaleDateString()}</p>
          <p>Status: {appt.status}</p>
          <p>Notes: {appt.notes}</p>
        </div>
      ))}
    </div>
  );
}
```

### Pattern B — Fetching with a parameter (e.g. a practitioner's own appointments)

```jsx
import { useUser } from '@clerk/clerk-react';
import { useGetAppointmentsByPractitionerIdQuery } from '@/store/api/appointmentsApi';

export function MyAppointments() {
  // useUser() gives you the currently logged-in Clerk user
  const { user } = useUser();

  // Pass the Clerk user ID as the argument — this becomes the :practitionerId in the URL
  const { data: appointments, isLoading, error } =
    useGetAppointmentsByPractitionerIdQuery(user?.id, {
      skip: !user?.id, // don't run the query until we have the user ID
    });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading appointments</p>;

  return (
    <ul>
      {appointments?.map((appt) => (
        <li key={appt._id}>{appt.serviceType} — {appt.status}</li>
      ))}
    </ul>
  );
}
```

### Pattern C — Creating / updating / deleting with a mutation hook

```jsx
import { useState } from 'react';
import { useCreateAppointmentMutation } from '@/store/api/appointmentsApi';

export function BookAppointment() {
  const [scheduledDate, setScheduledDate] = useState('');

  // Mutations return a tuple: [triggerFunction, resultObject]
  const [createAppointment, { isLoading, isSuccess, error }] = useCreateAppointmentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the trigger function with the body you want to send to the backend
      const result = await createAppointment({
        patientClerkUserId: 'user_patientABC',
        practitionerClerkUserId: 'user_practitionerXYZ',
        scheduledDate,
        serviceType: 'Physiotherapy',
      }).unwrap(); // .unwrap() throws if the request failed, instead of silently failing

      console.log('Appointment created:', result);
    } catch (err) {
      console.error('Failed to create appointment:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        value={scheduledDate}
        onChange={(e) => setScheduledDate(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Booking...' : 'Book Appointment'}
      </button>
      {isSuccess && <p>Appointment booked!</p>}
      {error && <p>Error: {error.data?.message || 'Something went wrong'}</p>}
    </form>
  );
}
```

---

## 10. Real-World Examples by User Role

Below is every user story mapped to backend endpoints. Each story is marked with its current status and what needs to be built. Use the checklist in Section 12 for each "Needs building" item.

---

### Manager

> *"As a manager, I want to send referrals for my team, so they can get the right health support."*

**Status: Already exists**
- `POST /api/referrals` — creates a referral for a team member
- Hook: `useCreateReferralMutation` in `referralsApi.js`

```jsx
import { useCreateReferralMutation } from '@/store/api/referralsApi';
import { useUser } from '@clerk/clerk-react';

export function SubmitReferralForm({ selectedEmployee }) {
  const { user } = useUser();
  const [createReferral, { isLoading, isSuccess, error }] = useCreateReferralMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createReferral({
      patientClerkUserId: selectedEmployee.clerkUserId, // the employee being referred
      submittedByClerkUserId: user.id,                   // the manager submitting it
      serviceType: 'Mental Health Support',
      referralReason: 'Stress and anxiety reported by team member',
    }).unwrap();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* your form fields */}
      <button type="submit" disabled={isLoading}>Submit Referral</button>
      {isSuccess && <p>Referral submitted successfully.</p>}
      {error && <p>Error: {error.data?.message}</p>}
    </form>
  );
}
```

---

> *"As a manager, I want to see my referral information, so I can track progress and updates."*

**Status: Already exists**
- `GET /api/referrals` — all referrals
- `GET /api/referrals/patient/:patientId` — referrals for a specific team member
- Hooks: `useGetReferralsQuery`, `useGetReferralsByPatientIdQuery` in `referralsApi.js`

```jsx
import { useGetReferralsByPatientIdQuery } from '@/store/api/referralsApi';

export function TeamMemberReferrals({ employeeClerkUserId }) {
  const { data: referrals, isLoading, error } =
    useGetReferralsByPatientIdQuery(employeeClerkUserId, {
      skip: !employeeClerkUserId, // don't run until we have the ID
    });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load referrals.</p>;

  return (
    <ul>
      {referrals?.map((ref) => (
        <li key={ref._id}>
          {ref.serviceType} — Status: <strong>{ref.referralStatus}</strong>
        </li>
      ))}
    </ul>
  );
}
```

---

> *"As a manager, I want to see my team's health data, so I can keep track of their wellbeing."*

**Status: Needs building**

This requires aggregating referral, appointment, and outcome data across a team. The `AnalyticsSnapshot` model already exists at `Backend/src/models/AnalyticsSnapshot.ts` and stores pre-computed metrics including referral counts, SLA data, and service breakdowns. You need to build the controller + routes + frontend slice for it.

**Files to create:**
- `Backend/src/Dtos/analytics.dto.ts`
- `Backend/src/controllers/analyticsController.ts`
- `Backend/src/routes/analyticsRoutes.ts`
- Register in `index.ts`: `server.use('/api/analytics', analyticsRoutes)`
- `Frontend/src/store/api/analyticsApi.js`

**Key endpoint to expose:**
```
GET /api/analytics?snapshotType=monthly_summary
```

**Frontend usage once built:**
```jsx
import { useGetAnalyticsQuery } from '@/store/api/analyticsApi';

const { data: analytics, isLoading } = useGetAnalyticsQuery({ snapshotType: 'monthly_summary' });
// analytics.metrics.totalReferrals, analytics.metrics.avgDaysToCompletion, etc.
```

---

### Practitioner

> *"As a practitioner, I want to access my appointments, so that I can plan and manage appointments effectively."*

**Status: Needs building — `Appointment` model already exists at `Backend/src/models/Appointment.ts`**

The model has: `patientClerkUserId`, `practitionerClerkUserId`, `serviceId`, `status` (scheduled/completed/cancelled), `scheduledDate`, `notes`.

**Files to create:**
- `Backend/src/Dtos/appointment.dto.ts`
- `Backend/src/controllers/appointmentController.ts`
- `Backend/src/routes/appointmentRoutes.ts`
- Register in `index.ts`: `server.use('/api/appointments', appointmentRoutes)`
- Add `'Appointments'` to `tagTypes` in `baseApi.js`
- `Frontend/src/store/api/appointmentsApi.js`

**Minimum endpoints needed:**
```
GET  /api/appointments/practitioner/:practitionerId  — practitioner's own diary
POST /api/appointments                               — schedule a new appointment
PUT  /api/appointments/:appointmentId                — update status/notes
```

**Frontend usage once built:**
```jsx
import { useGetAppointmentsByPractitionerIdQuery } from '@/store/api/appointmentsApi';
import { useUser } from '@clerk/clerk-react';

export function MyDiary() {
  const { user } = useUser();
  const { data: appointments, isLoading } =
    useGetAppointmentsByPractitionerIdQuery(user?.id, { skip: !user?.id });

  return (
    <ul>
      {appointments?.map((appt) => (
        <li key={appt._id}>
          {new Date(appt.scheduledDate).toLocaleDateString()} — {appt.status}
        </li>
      ))}
    </ul>
  );
}
```

---

> *"As a practitioner, I want to generate and send outcome reports, so that users and managers are informed of the results."*

**Status: Needs building**

Outcome reports are a type of `MedicalRecord` (model at `Backend/src/models/MedicalRecord.ts`). The `recordType` field supports `'consultation_notes' | 'assessment' | 'diagnosis' | 'treatment_plan' | 'test_results'`. An outcome report is best represented as a `treatment_plan` or `consultation_notes` record.

**Files to create:**
- `Backend/src/Dtos/medicalRecord.dto.ts`
- `Backend/src/controllers/medicalRecordController.ts`
- `Backend/src/routes/medicalRecordRoutes.ts`
- Register in `index.ts`: `server.use('/api/records', medicalRecordRoutes)`
- Add `'Records'` to `tagTypes` in `baseApi.js`
- `Frontend/src/store/api/medicalRecordsApi.js`

**Key endpoint:**
```
POST /api/records  — practitioner submits a new outcome report
```

```jsx
import { useCreateMedicalRecordMutation } from '@/store/api/medicalRecordsApi';

const [createRecord, { isLoading }] = useCreateMedicalRecordMutation();

await createRecord({
  employeeId: patientMongoId,
  practitionerId: practitionerMongoId,
  appointmentId: appt._id,
  recordType: 'consultation_notes',
  title: 'Session Outcome — March 2026',
  content: 'Patient showed significant improvement...',
}).unwrap();
```

---

> *"As a practitioner, I want to access user record history, so that I can deliver informed care."*

**Status: Needs building — same `MedicalRecord` model as above**

Once the records endpoint is built (above), add a GET endpoint:

```
GET /api/records/patient/:patientId  — fetch all records for a patient
```

```jsx
import { useGetRecordsByPatientIdQuery } from '@/store/api/medicalRecordsApi';

const { data: records, isLoading } = useGetRecordsByPatientIdQuery(patientMongoId, {
  skip: !patientMongoId,
});
```

> **Note on GDPR:** The `MedicalRecord` model includes an `accessLog` array. Every time a practitioner reads a patient's records, log the access in this array. This is required for GDPR audit trails.

---

> *"As a practitioner, I want to receive notifications when a referral is appointed, so that I can plan my schedule accordingly."*

**Status: Needs building — `Notification` model already exists at `Backend/src/models/Notification.ts`**

The `Notification` model supports types including `'referral_assigned'` and `'appointment_scheduled'`, has in-app / email / SMS delivery channels, and supports a `priority` field.

**Files to create:**
- `Backend/src/Dtos/notification.dto.ts`
- `Backend/src/controllers/notificationController.ts`
- `Backend/src/routes/notificationRoutes.ts`
- Register in `index.ts`: `server.use('/api/notifications', notificationRoutes)`
- Add `'Notifications'` to `tagTypes` in `baseApi.js`
- `Frontend/src/store/api/notificationsApi.js`

**Key endpoints:**
```
GET   /api/notifications/:recipientId   — fetch notifications for a user
PATCH /api/notifications/:notificationId/read  — mark as read
```

**Frontend usage once built:**
```jsx
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from '@/store/api/notificationsApi';

const { data: notifications } = useGetNotificationsQuery(user?.id, { skip: !user?.id });

// Show a badge count for unread
const unreadCount = notifications?.filter(
  (n) => !n.channels.inApp.read
).length;
```

---

> *"As a practitioner, I want to refer users to other practitioners, so that they get the right health support."*

**Status: Already exists — same referral creation endpoint used by managers**
- `POST /api/referrals`
- Hook: `useCreateReferralMutation` in `referralsApi.js`

```jsx
// Practitioner submitting a referral to another practitioner
await createReferral({
  patientClerkUserId: patient.clerkUserId,
  submittedByClerkUserId: user.id,          // current practitioner
  practitionerClerkUserId: targetPractitionerId, // the practitioner to refer to
  serviceType: 'Physiotherapy',
  referralReason: 'Requires specialist physiotherapy assessment',
}).unwrap();
```

---

### Admin

> *"As an admin, I want to review and assign referrals to practitioners, so that users are assigned to the right practitioners effectively."*

**Status: Already exists**
- `GET /api/referrals` — see all pending referrals
- `PUT /api/referrals/:referralId/assign` — assign a practitioner
- Hooks: `useGetReferralsQuery`, `useAssignReferralByIdMutation` in `referralsApi.js`

```jsx
import { useGetReferralsQuery, useAssignReferralByIdMutation } from '@/store/api/referralsApi';

export function ReferralTriagePanel() {
  const { data: referrals, isLoading } = useGetReferralsQuery();
  const [assignReferral] = useAssignReferralByIdMutation();

  const handleAssign = async (referralId, practitionerClerkUserId) => {
    await assignReferral({ referralId, practitionerClerkUserId }).unwrap();
    // The list auto-refreshes because invalidatesTags: ['Referrals'] is set
  };

  if (isLoading) return <p>Loading referrals...</p>;

  return (
    <table>
      <tbody>
        {referrals
          ?.filter((r) => r.referralStatus === 'pending')
          .map((ref) => (
            <tr key={ref._id}>
              <td>{ref.patientClerkUserId}</td>
              <td>{ref.serviceType}</td>
              <td>
                <button onClick={() => handleAssign(ref._id, 'user_practitionerXYZ')}>
                  Assign
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
```

---

> *"As an admin, I want to manage system users (managers, practitioners, etc.), so that organisational structure is displayed accurately."*

**Status: Already exists**
- `GET /api/users` — list all users, filterable by `role`
- Hook: `useGetUsersQuery` in `usersApi.js`

```jsx
import { useGetUsersQuery } from '@/store/api/usersApi';

// Get all practitioners
const { data: practitioners } = useGetUsersQuery({ role: 'practitioner' });

// Get all managers
const { data: managers } = useGetUsersQuery({ role: 'manager' });

// Get all active users
const { data: activeUsers } = useGetUsersQuery({ isActive: true });
```

> **Note:** Deactivating a user (setting `isActive: false`) is done via `PUT /api/users/me` but that only works for the logged-in user updating themselves. To let an admin deactivate *any* user, build a new endpoint:
> `PUT /api/users/:clerkUserId/status` — admin-only route to toggle a user's `isActive` flag.

---

> *"As an admin, I want to view and edit service pricing and durations, so that offerings remain up to date."*

**Status: Already exists**
- `GET /api/services` — list all services
- `GET /api/services/:serviceId` — get one service
- `PUT /api/services/:serviceId` — edit a service
- `POST /api/services` — create a new service
- Hooks: `useGetServicesQuery`, `useGetServiceByIdQuery`, `useUpdateServiceByIdMutation`, `useCreateServiceMutation` in `servicesApi.js`

```jsx
import { useGetServicesQuery, useUpdateServiceByIdMutation } from '@/store/api/servicesApi';

const { data: services } = useGetServicesQuery();
const [updateService, { isLoading }] = useUpdateServiceByIdMutation();

// When admin edits a service's price
await updateService({
  serviceId: service._id,
  body: { price: 150, duration: 60 },  // only include fields you are changing
}).unwrap();
```

---

> *"As an admin, I want to view live data on demographics, SLA/KPI, health outcomes, and finance, so that I can generate management information reports."*

**Status: Needs building — `AnalyticsSnapshot` model already exists**

Same as the Manager's health data story above. The `AnalyticsSnapshot` model at `Backend/src/models/AnalyticsSnapshot.ts` stores:
- `metrics.totalReferrals`, `metrics.selfReferrals`, `metrics.managerReferrals`
- `metrics.avgDaysToTriage`, `metrics.avgDaysToAppointment` — SLA data
- `metrics.slaBreaches` — KPI tracking
- `metrics.serviceBreakdown`, `metrics.departmentBreakdown` — demographics
- `metrics.totalCost` — finance

**Files to create** (same as Manager section above):
- `Backend/src/controllers/analyticsController.ts`
- `Backend/src/routes/analyticsRoutes.ts`
- Register: `server.use('/api/analytics', analyticsRoutes)`
- `Frontend/src/store/api/analyticsApi.js`

---

### User (Service User)

> *"As a user, I want to submit a self-referral, so that I can access services independently."*

**Status: Already exists**
- `POST /api/referrals`
- Hook: `useCreateReferralMutation` in `referralsApi.js`

```jsx
import { useCreateReferralMutation } from '@/store/api/referralsApi';
import { useUser } from '@clerk/clerk-react';

export function SelfReferralForm() {
  const { user } = useUser();
  const [createReferral, { isLoading, isSuccess }] = useCreateReferralMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createReferral({
      patientClerkUserId: user.id,       // the user IS both the patient…
      submittedByClerkUserId: user.id,   // …and the submitter
      serviceType: 'General Wellbeing',
      referralReason: 'I would like to access support services.',
    }).unwrap();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>Submit Self-Referral</button>
      {isSuccess && <p>Your referral has been submitted.</p>}
    </form>
  );
}
```

---

> *"As a user, I want to update my personal details, so that my records are up to date."*

**Status: Already exists**
- `PUT /api/users/me` — updates the currently logged-in user
- Hook: `useUpdateMeMutation` in `usersApi.js`

```jsx
import { useUpdateMeMutation } from '@/store/api/usersApi';

const [updateMe, { isLoading, isSuccess }] = useUpdateMeMutation();

await updateMe({
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '07700900000',
  address: {
    line1: '42 Example Street',
    city: 'Manchester',
    postcode: 'M1 1AA',
  },
}).unwrap();
```

---

> *"As a user, I want to receive notifications about appointments and outcomes, so that I stay informed."*

**Status: Needs building — same Notification endpoint as Practitioner story above**

Once `notificationsApi.js` is built, users can fetch their own notifications using the same hook. The `Notification` model supports `'appointment_scheduled'`, `'appointment_reminder_24h'`, `'appointment_reminder_1h'`, and `'outcome_report_ready'` notification types — all directly relevant to service users.

```jsx
import { useGetNotificationsQuery } from '@/store/api/notificationsApi';
import { useUser } from '@clerk/clerk-react';

export function NotificationBell() {
  const { user } = useUser();
  const { data: notifications } = useGetNotificationsQuery(user?.id, {
    skip: !user?.id,
  });

  const unread = notifications?.filter((n) => !n.channels.inApp.read) ?? [];

  return (
    <div>
      <span>🔔 {unread.length}</span>
      {unread.map((n) => (
        <div key={n._id}>
          <strong>{n.title}</strong>
          <p>{n.message}</p>
        </div>
      ))}
    </div>
  );
}
```

---

> *"As a user, I want to access advice sheets and guidance documents, so that I can manage my health proactively."*

**Status: Needs building**

There is no model for documents yet. You need to create one. Advice sheets can be attached to `MedicalRecord` documents (when a practitioner creates a record of type `treatment_plan`, the `content` field is the guidance text), or you can build a dedicated `Document` model.

**Simplest approach — piggyback on MedicalRecord:**
```
GET /api/records/patient/:patientId?recordType=treatment_plan
```
Filter by `recordType=treatment_plan` to return only advice/guidance records published for this patient.

**Alternative — dedicated model approach:**
Create `Backend/src/models/Document.ts` with fields like `title`, `content`, `fileUrl`, `publishedByClerkUserId`, `targetRole` (all / employee / etc.), then follow steps 3–9 to build a full `/api/documents` endpoint.

---

### System Owner

> *"As a system owner, I want the platform to be GDPR compliant and ISO 27001 certified, so that data is secure and regulatory standards are met."*

This is not a single endpoint — it is a set of practices enforced across the entire codebase. Here is what is already in place and what still needs attention:

**Already in place:**
- All routes are protected by `clerkMiddleware()` — unauthenticated requests are rejected
- `MedicalRecord` model includes an `accessLog` array for audit trails
- Input validation via Zod DTOs on all endpoints prevents injection attacks
- Passwords are not stored — Clerk handles authentication

**Still needs attention:**
- When reading a `MedicalRecord`, write to `accessLog` (`accessedBy`, `accessedByRole`, `accessedAt`, `accessPurpose`)
- Add role-based access control (RBAC) — e.g. only practitioners should be able to read medical records, only admins should be able to deactivate users. Use `getAuth(req)` + a check against the user's role from the database:
  ```ts
  const auth = getAuth(req);
  const requestingUser = await User.findOne({ clerkUserId: auth.userId });
  if (requestingUser?.role !== 'admin') {
    throw new ForbiddenError('Only admins can perform this action');
  }
  ```
- Ensure no sensitive data (passwords, full medical records) is returned in list endpoints — use `.select('-password')` in Mongoose queries
- Add data retention policies — archived/deleted records should be soft-deleted (set `isArchived: true`) not permanently removed

---

## 11. Error Types & When to Use Them

These are in `Backend/src/errors/errors.ts`. Import and throw them in any controller.

```ts
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
} from '../errors/errors';
```

| Error class | HTTP status | Use when |
|---|---|---|
| `ValidationError` | 400 | Zod validation failed / bad data shape |
| `BadRequestError` | 400 | Request makes no sense logically |
| `UnauthorizedError` | 401 | User is not logged in (`auth.userId` is null) |
| `ForbiddenError` | 403 | User is logged in but not allowed (wrong role) |
| `NotFoundError` | 404 | Document not found in MongoDB |

The global error handler in `index.ts` catches all of these and returns the right HTTP status code automatically. You never need to `res.status(404)` yourself — just `throw new NotFoundError(...)` and the middleware handles the rest.

---

## 12. Common Mistakes

**1. Forgetting to register the router in `index.ts`**
Your controller and router files can be perfect, but if you don't add `server.use('/api/your-route', yourRouter)` in `index.ts`, the endpoint simply doesn't exist.

**2. Not adding the tag to `baseApi.js`**
If your new API slice uses `providesTags: ['Appointments']` but `'Appointments'` is not listed in the `tagTypes` array in `baseApi.js`, React will warn you and caching won't work properly.

**3. Calling the mutation hook wrong**
Mutation hooks return `[triggerFn, result]` — an array of two things. A common mistake is trying to destructure it like an object `{ trigger, isLoading }`. Use the array destructuring:
```js
// ✅ Correct
const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

// ❌ Wrong
const { createAppointment, isLoading } = useCreateAppointmentMutation();
```

**4. Forgetting `.unwrap()` on a mutation**
Without `.unwrap()`, the mutation will **not** throw an error if the backend returns a 400 or 500. With `.unwrap()`, it throws and you can catch it in a try/catch. Always use `.unwrap()` inside async handlers.

**5. Sending the wrong shape of body**
The DTO (Zod schema) on the backend defines exactly what fields are allowed. If you send extra fields or miss a required field, you'll get a 400 error. Check `Backend/src/Dtos/` to see what is expected.

**6. Using `req.body` without parsing**
`server.use(express.json())` in `index.ts` is what allows `req.body` to be an object. It is already set up — do not remove it.

**7. Not using `skip` when a query argument might be undefined**
If you call `useGetAppointmentsByPractitionerIdQuery(user?.id)` before the user loads, you'll fire a request with `undefined` as the ID. Use the `skip` option:
```js
const { data } = useGetAppointmentsByPractitionerIdQuery(user?.id, {
  skip: !user?.id,
});
```

---

## Quick-Reference Checklist

When you need a new endpoint, go through this checklist in order:

- [ ] **Model** — Does the data have a model in `Backend/src/models/`? If not, create one.
- [ ] **DTO** — Create `Backend/src/Dtos/yourFeature.dto.ts` with Zod schemas.
- [ ] **Controller** — Create `Backend/src/controllers/yourFeatureController.ts`.
- [ ] **Router** — Create `Backend/src/routes/yourFeatureRoutes.ts`.
- [ ] **Register** — Add `import` + `server.use(...)` in `Backend/src/index.ts`.
- [ ] **Tag** — Add the new tag string to `tagTypes` in `Frontend/src/store/api/baseApi.js`.
- [ ] **API Slice** — Create `Frontend/src/store/api/yourFeatureApi.js`.
- [ ] **Component** — Import the hook and use it in your page component.

---

*Last updated: March 2026 | Health-Matters Platform*
