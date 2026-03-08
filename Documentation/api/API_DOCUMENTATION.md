# Health Matters API Documentation

## 1) Overview
This document defines the current backend API architecture for:
- `User`
- `Referral`
- `Service`

It also explains:
- How controllers and routers are structured
- How routes are mounted in `Backend/src/index.ts`
- How to add a new schema + controller + router + route registration
- How to add a new endpoint
- How to add a new frontend API in the RTK Query store

---

## 2) Backend Architecture

### 2.1 Server Entry (`Backend/src/index.ts`)
The backend server currently configures:
1. `dotenv`
2. CORS middleware
3. Webhooks route (`/api/webhooks`)
4. JSON parser + logger middleware + Clerk middleware
5. Feature routers:
   - `/api/users`
   - `/api/referrals`
   - `/api/services`
6. Global error handler (`globalErrorHandlingMiddleware`)
7. DB connection and server start

### 2.2 Error Handling Pattern
Use typed errors from `Backend/src/errors/errors.ts`:
- `NotFoundError`
- `ValidationError`
- `BadRequestError`
- `UnauthorizedError`
- `ForbiddenError`

Controllers should `throw` typed errors and call `next(error)` in `catch`.
The global middleware maps them to HTTP status codes.

### 2.3 Validation Pattern
Request validation uses Zod DTOs in `Backend/src/Dtos/*`.
Common flow in controllers:
1. `safeParse(req.params | req.query | req.body)`
2. If parse fails, throw `ValidationError`
3. Execute DB operation
4. Return JSON response

---

## 3) Schemas (Mongoose Models)

## 3.1 User Schema (`Backend/src/models/User.ts`)
Key fields:
- `userName?: string`
- `firstName?: string`
- `lastName?: string`
- `phone?: string`
- `dateOfBirth?: Date`
- `email: string` (required, unique)
- `password?: string` (min length 8)
- `role: "admin" | "practitioner" | "manager" | "employee"` (default `employee`)
- `address?: { line1, line2, city, postcode }`
- `department?: string`
- `isActive: boolean` (default `true`)
- `preferences.notifications.email: boolean` (default `true`)
- `preferences.notifications.sms: boolean` (default `false`)
- `clerkUserId: string` (required, unique)
- `timestamps: true`

### User DTO (`Backend/src/Dtos/user.dto.ts`)
- `createUserBodySchema`
- `updateUserBodySchema`
- `getUsersQuerySchema`

---

## 3.2 Referral Schema (`Backend/src/models/Referral.ts`)
Key fields:
- `patientClerkUserId: string` (required)
- `submittedByClerkUserId?: string`
- `practitionerClerkUserId?: string`
- `serviceType?: string`
- `referralReason?: string`
- `referralStatus: "pending" | "accepted" | "rejected"` (default `pending`)
- `notes?: string`
- `assignedbyClerkUserId?: string`
- `assignedDate?: Date`
- `acceptedDate?: Date`
- `rejectedDate?: Date`
- `completedDate?: Date`
- `timestamps: true`

### Referral DTO (`Backend/src/Dtos/referral.dto.ts`)
- Params schemas:
  - `patientIdParamsSchema`
  - `practitionerIdParamsSchema`
  - `referralIdParamsSchema`
- Body schemas:
  - `createReferralBodySchema`
  - `updateReferralBodySchema`
  - `assignReferralBodySchema`

---

## 3.3 Service Schema (`Backend/src/models/Service.ts`)
Key fields:
- `name: string` (required)
- `code: string` (required, uppercase, unique index)
- `description?: string`
- `category:`
  - `occupational_health`
  - `mental_health`
  - `physiotherapy`
  - `health_screening`
  - `counselling`
  - `ergonomic_assessment`
- `defaultDuration: number` (default 30, min 15, max 240)
- `pricing?: { internalCost?, clientCharge?, currency }`
- `requiresInitialQuestionnaire: boolean`
- `initialQuestionnaireTemplate?: { title, questions[] }`
- `requiresFollowUpQuestionnaire: boolean`
- `followUpQuestionnaireTemplate?: { title, questions[] }`
- `availableForSelfReferral: boolean`
- `requiresManagerApproval: boolean`
- `qualifiedPractitionerIds: ObjectId[]` (ref `User`)
- `isActive: boolean`
- `timestamps: true`
- Indexes:
  - `{ code: 1 }` unique
  - `{ category: 1, isActive: 1 }`

### Service DTO (`Backend/src/Dtos/service.dto.ts`)
- `createServiceBodySchema`
- `updateServiceBodySchema`
- `serviceIdParamsSchema`
- `getServicesQuerySchema`

---

## 4) Controllers

## 4.1 User Controller (`Backend/src/controllers/userController.ts`)
Implemented handlers:
- `getAllUsers`
  - validates query with `getUsersQuerySchema`
  - filters users with `User.find(parsedQuery.data)`
- `updateUserByClerkId`
  - gets authenticated user from Clerk token (`getAuth(req).userId`)
  - validates body using `updateUserBodySchema`
  - updates current user via `{ clerkUserId: auth.userId }`

## 4.2 Referral Controller (`Backend/src/controllers/referralController.ts`)
Implemented handlers:
- `getAllReferrals`
- `getReferralsByPatientId`
- `getReferralsByPractitionerId`
- `createReferral`
- `updateReferralByPatientId`
- `deleteReferralByPatientId`
- `assignReferralById`

`assignReferralById` updates one referral by `_id` and sets:
- `practitionerClerkUserId`
- `assignedDate = new Date()`
- `assignedbyClerkUserId` from auth token (when available)

## 4.3 Service Controller (`Backend/src/controllers/serviceController.ts`)
Implemented handlers:
- `getAllServices`
- `getServiceById`
- `createService`
- `updateServiceById`
- `deleteServiceById`

---

## 5) Routers and Endpoints

Base URL:
- `http://localhost:3000/api`

### 5.1 Users (`Backend/src/routes/userRoutes.ts`)
- `GET /api/users`
  - Query options currently supported by DTO:
    - `role`
    - `isActive`
    - `clerkUserId`
    - `email`
- `PUT /api/users/me`
  - Authenticated endpoint
  - Reads `clerkUserId` from token, no URL params

### 5.2 Referrals (`Backend/src/routes/referralRoutes.ts`)
- `GET /api/referrals`
- `GET /api/referrals/patient/:patientId`
- `GET /api/referrals/practitioner/:practitionerId`
- `POST /api/referrals`
- `PUT /api/referrals/patient/:patientId`
- `DELETE /api/referrals/patient/:patientId`
- `PUT /api/referrals/:referralId/assign`

### 5.3 Services (`Backend/src/routes/serviceRoutes.ts`)
- `GET /api/services`
- `GET /api/services/:serviceId`
- `POST /api/services`
- `PUT /api/services/:serviceId`
- `DELETE /api/services/:serviceId`

---

## 6) How to Add a New Schema (Backend)

Use this checklist end-to-end.

### Step 1: Create Mongoose model
Create `Backend/src/models/<NewEntity>.ts`
- define schema fields
- enable `timestamps: true`
- add indexes if needed
- export model

### Step 2: Create DTO validation file
Create `Backend/src/Dtos/<newEntity>.dto.ts`
- params schemas (`...IdParamsSchema`)
- query schema (`get...QuerySchema`)
- create/update body schemas

### Step 3: Create controller
Create `Backend/src/controllers/<newEntity>Controller.ts`
- validate request with Zod `safeParse`
- throw typed errors (`ValidationError`, `NotFoundError`, etc.)
- wrap handlers in `try/catch` and `next(error)`

### Step 4: Create router
Create `Backend/src/routes/<newEntity>Routes.ts`
- map HTTP methods + paths to controller handlers

### Step 5: Mount router in server index
In `Backend/src/index.ts`:
1. import the router
2. mount route:
   - `server.use('/api/<new-entity-plural>', <newEntity>Routes)`
3. keep global error middleware after route mounts

### Step 6: Optional seed support
If needed, add seed documents in `Backend/src/models/seed/seedDb.ts`

---

## 7) How to Add a New Endpoint (Existing Entity)

Example process for adding `GET /api/services/category/:category`:

1. **DTO**
   - add params schema for `category`
2. **Controller**
   - add handler `getServicesByCategory`
   - validate params
   - query DB and return list
3. **Router**
   - add route mapping in `serviceRoutes.ts`
4. **Frontend API store**
   - add RTK Query endpoint in `servicesApi.js`
5. **Export hook**
   - export hook from `servicesApi.js` and `store/api/index.js`

Recommended endpoint structure:
- collection read: `GET /resource`
- single read: `GET /resource/:id`
- create: `POST /resource`
- update: `PUT /resource/:id`
- delete: `DELETE /resource/:id`
- custom action: `PUT /resource/:id/<action>`

---

## 8) Frontend API Store (RTK Query)

Frontend uses RTK Query with code-splitting injection pattern.

### 8.1 Base API (`Frontend/src/store/api/baseApi.js`)
- `createApi` initialized once
- base URL from `VITE_API_BASE_URL` fallback to `http://localhost:3000/api`
- sends credentials + Clerk bearer token via `prepareHeaders`
- shared `tagTypes`: `Users`, `Referrals`, `Services`

### 8.2 API slice injection files
- `usersApi.js`
- `referralsApi.js`
- `servicesApi.js`

Each file uses:
- `baseApi.injectEndpoints({ endpoints, overrideExisting: false })`

### 8.3 Store integration (`Frontend/src/store/index.js`)
The store includes only baseApi reducer + middleware:
- reducer: `[baseApi.reducerPath]: baseApi.reducer`
- middleware: `.concat(baseApi.middleware)`

### 8.4 Hook export barrel (`Frontend/src/store/api/index.js`)
All hooks are re-exported so components can import from one place.

---

## 9) How to Add a New Frontend API (RTK Query)

If backend adds new entity `appointments`:

### Step 1: Add new injected API file
Create: `Frontend/src/store/api/appointmentsApi.js`

Pattern:
```js
import { baseApi } from './baseApi';

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query({
      query: (params) => ({ url: '/appointments', params }),
      providesTags: ['Appointments'],
    }),
    getAppointmentById: builder.query({
      query: (appointmentId) => `/appointments/${appointmentId}`,
      providesTags: ['Appointments'],
    }),
    createAppointment: builder.mutation({
      query: (body) => ({ url: '/appointments', method: 'POST', body }),
      invalidatesTags: ['Appointments'],
    }),
    updateAppointmentById: builder.mutation({
      query: ({ appointmentId, body }) => ({
        url: `/appointments/${appointmentId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Appointments'],
    }),
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

export const {
  useGetAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentByIdMutation,
  useDeleteAppointmentByIdMutation,
} = appointmentsApi;
```

### Step 2: Register tag type
In `baseApi.js`, add `'Appointments'` to `tagTypes`.

### Step 3: Export from barrel
In `Frontend/src/store/api/index.js`, export the new hooks.

### Step 4: Use in component
```js
import { useGetAppointmentsQuery } from '@/store/api';

const { data, isLoading, error } = useGetAppointmentsQuery();
```

---

## 10) Current Frontend Hooks Reference

### Users
- `useGetUsersQuery`
- `useUpdateMeMutation`

### Referrals
- `useGetReferralsQuery`
- `useGetReferralsByPatientIdQuery`
- `useGetReferralsByPractitionerIdQuery`
- `useCreateReferralMutation`
- `useUpdateReferralsByPatientIdMutation`
- `useAssignReferralByIdMutation`
- `useDeleteReferralsByPatientIdMutation`

### Services
- `useGetServicesQuery`
- `useGetServiceByIdQuery`
- `useCreateServiceMutation`
- `useUpdateServiceByIdMutation`
- `useDeleteServiceByIdMutation`

---

## 11) API Response and Error Conventions

### Success responses
- `200` for successful reads/updates/deletes
- `201` for creates
- JSON payloads (entity object or array)

### Error responses (global middleware)
- `400` validation/bad request
- `401` unauthorized
- `403` forbidden
- `404` not found
- `500` internal error

Error shape:
```json
{ "message": "..." }
```

---

## 12) Recommended Development Rules

1. Validate every input with Zod DTOs.
2. Throw typed errors; do not manually duplicate error response logic in controllers.
3. Keep route files thin; business logic belongs in controllers/services.
4. Use consistent naming:
   - controller file: `<entity>Controller.ts`
   - routes file: `<entity>Routes.ts`
   - DTO file: `<entity>.dto.ts`
5. Keep frontend API hooks grouped per entity via injected endpoints.
6. Use tags consistently for cache invalidation.

---

## 13) Quick End-to-End Template (Backend + Frontend)

### Backend
1. Add model
2. Add DTO
3. Add controller
4. Add router
5. Mount route in `Backend/src/index.ts`

### Frontend
1. Add injected API file under `Frontend/src/store/api/`
2. Add new tag type in `baseApi.js` (if new entity)
3. Export hooks in `Frontend/src/store/api/index.js`
4. Consume hook in page/component

---

## 14) Notes for Future Contributors

- Authentication currently relies on Clerk middleware and token extraction in selected endpoints (e.g. `PUT /users/me`, referral assignment metadata).
- Keep `globalErrorHandlingMiddleware` as the final middleware.
- Keep route mount prefix `/api/<resource>` for consistency across backend and frontend base URL usage.
