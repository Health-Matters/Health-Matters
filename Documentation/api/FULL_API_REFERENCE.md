# 🏥 Health Matters — Full API Reference

> 📌 **Base URL:** `http://localhost:3000/api`

> 🔐 **Authentication:** Clerk Bearer token sent automatically via `Authorization: Bearer <token>`

> 📦 **Content-Type:** `application/json` for all requests with a body

---

## 📋 Table of Contents

1. Authentication Notes
2. Error Conventions
3. User Endpoints
4. Referral Endpoints
5. Service Endpoints
6. Frontend Hook Reference
7. How to Add a New Endpoint to an Existing Entity
8. How to Add a Brand-New Entity (Full End-to-End)
9. How to Write a Controller Handler Function

---

## 1. 🔐 Authentication Notes

- Most endpoints are protected by **Clerk middleware** (`clerkMiddleware()` in `Backend/src/index.ts`).  
- The frontend (`baseApi.js`) automatically attaches the Clerk session token to every request as a Bearer token.  
- Endpoints that use the token server-side (e.g. `PUT /api/users/me`) call `getAuth(req)` to extract the authenticated user's `clerkUserId`.

---

## 2. ⚠️ Error Conventions

All errors return JSON with the shape:

```json
{ "message": "Descriptive error message here" }
```

| HTTP Status | When it is returned |
|-------------|---------------------|
| `200` | Successful read, update, or delete |
| `201` | Successful creation |
| `400` | Validation error or bad request (Zod parse failure) |
| `401` | Unauthenticated — missing or invalid Clerk token |
| `403` | Forbidden — authenticated but not authorised |
| `404` | Resource not found |
| `500` | Unexpected server error |

Validation error bodies look like this:

```json
{
  "message": "[{\"field\":\"email\",\"message\":\"Invalid email\"}]"
}
```

---

## 3. 👤 User Endpoints

**Router file:** `Backend/src/routes/userRoutes.ts`  
**Controller file:** `Backend/src/controllers/userController.ts`  
**DTO file:** `Backend/src/Dtos/user.dto.ts`  
**Model file:** `Backend/src/models/User.ts`

---

### 3.1 `GET /api/users`

**What it does:** Returns a list of all users in the database, optionally filtered by query parameters.

> 🔐 Authentication required

#### Query Parameters (all optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | `admin` / `practitioner` / `manager` / `employee` | Filter users by role |
| `isActive` | `boolean` | Filter by active status (accepts `true` / `false` as strings, coerced) |
| `clerkUserId` | `string` | Filter by a specific Clerk user ID |
| `email` | `string` (valid email) | Filter by email address |

#### Example Request

```
GET /api/users?role=practitioner&isActive=true
```

#### Success Response — `200 OK`

Returns an **array** of user objects.

```json
[
  {
    "_id": "6650e1e2b3c4d5e6f7a8b9c0",
    "userName": "jdoe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "practitioner",
    "isActive": true,
    "department": "Physiotherapy",
    "address": {
      "line1": "12 Health Street",
      "city": "London",
      "postcode": "E1 1AB"
    },
    "preferences": {
      "notifications": { "email": true, "sms": false }
    },
    "clerkUserId": "user_abc123",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-03-01T08:30:00.000Z"
  }
]
```

---

### 3.2 `PUT /api/users/me`

**What it does:** Updates the currently authenticated user's profile. The user is identified from the Clerk session token — no ID in the URL is needed.

> 🔐 Authentication required — user must be signed in via Clerk

#### Request Body

At least **one** of the following fields must be provided. All fields are optional.

| Field | Type | Description |
|-------|------|-------------|
| `userName` | `string` | Display username |
| `firstName` | `string` | First name |
| `lastName` | `string` | Last name |
| `phone` | `string` | Phone number |
| `dateOfBirth` | `string` (ISO date) | Date of birth |
| `password` | `string` (min 8 chars) | Password |
| `role` | `admin` / `practitioner` / `manager` / `employee` | User role |
| `address` | `object` | Address object (see below) |
| `address.line1` | `string` | Address line 1 |
| `address.line2` | `string` | Address line 2 |
| `address.city` | `string` | City |
| `address.postcode` | `string` | Postcode |
| `department` | `string` | Department name |
| `isActive` | `boolean` | Active status |
| `preferences.notifications.email` | `boolean` | Email notifications on/off |
| `preferences.notifications.sms` | `boolean` | SMS notifications on/off |

> 🚫 `clerkUserId` and `email` **cannot** be updated via this endpoint.

#### Example Request Body

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "07700900000",
  "address": {
    "line1": "5 Wellness Lane",
    "city": "Manchester",
    "postcode": "M1 2AB"
  }
}
```

#### What Gets Updated

`User.findOneAndUpdate({ clerkUserId: <from-token> }, { $set: <body> }, { new: true })` — updates the document matching the token's Clerk user ID and returns the updated document.

#### Success Response — `200 OK`

Returns the **updated user object** (same shape as `GET /api/users` items).

---

## 4. 🔄 Referral Endpoints

**Router file:** `Backend/src/routes/referralRoutes.ts`  
**Controller file:** `Backend/src/controllers/referralController.ts`  
**DTO file:** `Backend/src/Dtos/referral.dto.ts`  
**Model file:** `Backend/src/models/Referral.ts`

---

### 4.1 `GET /api/referrals`

**What it does:** Returns all referrals, sorted newest first.

> 🔐 Authentication required

#### Query Parameters

None.

#### Success Response — `200 OK`

Returns an **array** of referral objects, sorted by `createdAt` descending.

```json
[
  {
    "_id": "6650e1e2b3c4d5e6f7a8b9c1",
    "patientClerkUserId": "user_patient001",
    "submittedByClerkUserId": "user_manager01",
    "practitionerClerkUserId": "user_practitioner01",
    "serviceType": "physiotherapy",
    "referralReason": "Lower back pain",
    "referralStatus": "pending",
    "notes": "Urgent case",
    "assignedbyClerkUserId": null,
    "assignedDate": null,
    "acceptedDate": null,
    "rejectedDate": null,
    "completedDate": null,
    "createdAt": "2024-03-01T09:00:00.000Z",
    "updatedAt": "2024-03-01T09:00:00.000Z"
  }
]
```

---

### 4.2 `GET /api/referrals/patient/:patientId`

**What it does:** Returns all referrals where `patientClerkUserId` matches the given `:patientId`. Sorted newest first.

> 🔐 Authentication required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | `string` | Yes | The Clerk user ID of the patient |

#### Example Request

```
GET /api/referrals/patient/user_patient001
```

#### Success Response — `200 OK`

Array of referral objects (same shape as 4.1) filtered for that patient.

---

### 4.3 `GET /api/referrals/practitioner/:practitionerId`

**What it does:** Returns all referrals where `practitionerClerkUserId` matches the given `:practitionerId`. Sorted newest first.

> 🔐 Authentication required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `practitionerId` | `string` | Yes | The Clerk user ID of the practitioner |

#### Example Request

```
GET /api/referrals/practitioner/user_practitioner01
```

#### Success Response — `200 OK`

Array of referral objects for that practitioner.

---

### 4.4 `POST /api/referrals`

**What it does:** Creates a new referral document.

> 🔐 Authentication required

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patientClerkUserId` | `string` | **Yes** | Clerk user ID of the patient being referred |
| `submittedByClerkUserId` | `string` | No | Clerk user ID of who submitted the referral |
| `practitionerClerkUserId` | `string` | No | Clerk user ID of the assigned practitioner |
| `serviceType` | `string` | No | Type/name of service requested |
| `referralReason` | `string` | No | Clinical reason for the referral |
| `referralStatus` | `pending` / `accepted` / `rejected` | No | Defaults to `pending` |
| `notes` | `string` | No | Additional notes |
| `assignedbyClerkUserId` | `string` | No | Who assigned this referral |
| `assignedDate` | `string` (ISO date) | No | When it was assigned |
| `acceptedDate` | `string` (ISO date) | No | When it was accepted |
| `rejectedDate` | `string` (ISO date) | No | When it was rejected |
| `completedDate` | `string` (ISO date) | No | When it was completed |

#### What Gets Created

A new `Referral` document in MongoDB.

#### Example Request Body

```json
{
  "patientClerkUserId": "user_patient001",
  "submittedByClerkUserId": "user_manager01",
  "serviceType": "physiotherapy",
  "referralReason": "Recurring knee pain after injury"
}
```

#### Success Response — `201 Created`

Returns the newly created referral object.

```json
{
  "_id": "6650e1e2b3c4d5e6f7a8b9c2",
  "patientClerkUserId": "user_patient001",
  "submittedByClerkUserId": "user_manager01",
  "serviceType": "physiotherapy",
  "referralReason": "Recurring knee pain after injury",
  "referralStatus": "pending",
  "createdAt": "2026-03-03T12:00:00.000Z",
  "updatedAt": "2026-03-03T12:00:00.000Z"
}
```

---

### 4.5 `PUT /api/referrals/patient/:patientId`

**What it does:** Updates **all** referrals belonging to a patient (bulk update by `patientClerkUserId`).

> 🔐 Authentication required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | `string` | Yes | The Clerk user ID of the patient |

#### Request Body

At least **one** field required. Same optional fields as `POST /api/referrals`, **except** `patientClerkUserId` cannot be changed.

| Field | Type | Description |
|-------|------|-------------|
| `submittedByClerkUserId` | `string` | Update who submitted |
| `practitionerClerkUserId` | `string` | Update assigned practitioner |
| `serviceType` | `string` | Update service type |
| `referralReason` | `string` | Update reason |
| `referralStatus` | `pending` / `accepted` / `rejected` | Update status |
| `notes` | `string` | Update notes |
| `assignedbyClerkUserId` | `string` | Update assigner |
| `assignedDate` | `string` (ISO date) | Update assigned date |
| `acceptedDate` | `string` (ISO date) | Update accepted date |
| `rejectedDate` | `string` (ISO date) | Update rejected date |
| `completedDate` | `string` (ISO date) | Update completed date |

#### What Gets Updated

`Referral.updateMany({ patientClerkUserId: patientId }, { $set: body })` — updates every referral for that patient.

#### Success Response — `200 OK`

```json
{
  "message": "Referrals updated successfully",
  "modifiedCount": 2,
  "referrals": [ /* array of updated referral objects */ ]
}
```

---

### 4.6 `DELETE /api/referrals/patient/:patientId`

**What it does:** Deletes **all** referrals belonging to a patient.

> 🔐 Authentication required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | `string` | Yes | The Clerk user ID of the patient |

#### Success Response — `200 OK`

```json
{
  "message": "Referrals deleted successfully",
  "deletedCount": 3
}
```

---

### 4.7 `PUT /api/referrals/:referralId/assign`

**What it does:** Assigns a practitioner to a **single** referral by its MongoDB `_id`. Also records who made the assignment and when.

> 🔐 Authentication required — assigner's Clerk ID is captured from the token automatically

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `referralId` | `string` | Yes | MongoDB `_id` of the referral |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `practitionerClerkUserId` | `string` | **Yes** | Clerk user ID of the practitioner being assigned |

#### What Gets Updated

Fields set on the referral document:
- `practitionerClerkUserId` → the value from the request body
- `assignedDate` → `new Date()` (server time at moment of assignment)
- `assignedbyClerkUserId` → extracted from the Clerk session token

#### Example Request Body

```json
{
  "practitionerClerkUserId": "user_practitioner01"
}
```

#### Success Response — `200 OK`

Returns the updated referral object.

```json
{
  "_id": "6650e1e2b3c4d5e6f7a8b9c2",
  "patientClerkUserId": "user_patient001",
  "practitionerClerkUserId": "user_practitioner01",
  "assignedDate": "2026-03-03T12:05:00.000Z",
  "assignedbyClerkUserId": "user_manager01",
  "referralStatus": "pending",
  "createdAt": "2026-03-03T12:00:00.000Z",
  "updatedAt": "2026-03-03T12:05:00.000Z"
}
```

---

## 5. 🛠️ Service Endpoints

**Router file:** `Backend/src/routes/serviceRoutes.ts`  
**Controller file:** `Backend/src/controllers/serviceController.ts`  
**DTO file:** `Backend/src/Dtos/service.dto.ts`  
**Model file:** `Backend/src/models/Service.ts`

---

### 5.1 `GET /api/services`

**What it does:** Returns all services, sorted newest first. Optionally filterable by query parameters.

> 🔐 Authentication required

#### Query Parameters (all optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | `occupational_health` / `mental_health` / `physiotherapy` / `health_screening` / `counselling` / `ergonomic_assessment` | Filter by category |
| `isActive` | `boolean` | Filter by active status |
| `name` | `string` | Filter by service name (exact match) |

#### Example Request

```
GET /api/services?category=physiotherapy&isActive=true
```

#### Success Response — `200 OK`

Array of service objects.

```json
[
  {
    "_id": "6650e1e2b3c4d5e6f7a8b9c3",
    "name": "Back Pain Assessment",
    "code": "BACKPAIN01",
    "description": "Initial assessment for back pain",
    "category": "physiotherapy",
    "defaultDuration": 45,
    "isActive": true,
    "availableForSelfReferral": false,
    "requiresManagerApproval": true,
    "requiresInitialQuestionnaire": false,
    "requiresFollowUpQuestionnaire": false,
    "qualifiedPractitionerIds": [],
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-02-20T11:00:00.000Z"
  }
]
```

---

### 5.2 `GET /api/services/:serviceId`

**What it does:** Returns a single service by its MongoDB `_id`.

> 🔐 Authentication required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceId` | `string` | Yes | MongoDB `_id` of the service |

#### Example Request

```
GET /api/services/6650e1e2b3c4d5e6f7a8b9c3
```

#### Success Response — `200 OK`

Single service object (same shape as items in 5.1).

#### Error — `404 Not Found`

```json
{ "message": "Service not found" }
```

---

### 5.3 `POST /api/services`

**What it does:** Creates a new service.

> 🔐 Authentication required

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` (min 1 char) | **Yes** | Service name |
| `description` | `string` | No | Short description |
| `category` | `occupational_health` / `mental_health` / `physiotherapy` / `health_screening` / `counselling` / `ergonomic_assessment` | No | Service category |
| `defaultDuration` | `number` (15–240) | No | Duration in minutes (defaults to `30`) |
| `isActive` | `boolean` | No | Defaults to `true` |

#### What Gets Created

A new `Service` document is inserted into MongoDB. The `code` field is auto-generated (uppercase) by the model.

#### Example Request Body

```json
{
  "name": "Mental Health Check-In",
  "description": "30-minute structured mental wellness session",
  "category": "mental_health",
  "defaultDuration": 30,
  "isActive": true
}
```

#### Success Response — `201 Created`

Returns the newly created service object.

```json
{
  "_id": "6650e1e2b3c4d5e6f7a8b9c4",
  "name": "Mental Health Check-In",
  "code": "MENTALHEALTHCHECK-IN",
  "description": "30-minute structured mental wellness session",
  "category": "mental_health",
  "defaultDuration": 30,
  "isActive": true,
  "availableForSelfReferral": false,
  "requiresManagerApproval": false,
  "requiresInitialQuestionnaire": false,
  "requiresFollowUpQuestionnaire": false,
  "qualifiedPractitionerIds": [],
  "createdAt": "2026-03-03T12:00:00.000Z",
  "updatedAt": "2026-03-03T12:00:00.000Z"
}
```

---

### 5.4 `PUT /api/services/:serviceId`

**What it does:** Updates a single service by its MongoDB `_id`.

> 🔐 Authentication required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceId` | `string` | Yes | MongoDB `_id` of the service |

#### Request Body

At least **one** field required. All are optional:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Update service name |
| `description` | `string` | Update description |
| `category` | `string` (enum) | Update category |
| `defaultDuration` | `number` (15–240) | Update default duration |
| `isActive` | `boolean` | Activate or deactivate the service |

#### What Gets Updated

`Service.findByIdAndUpdate(serviceId, { $set: body }, { new: true })` — updates and returns the new document.

#### Example Request Body

```json
{
  "defaultDuration": 60,
  "isActive": false
}
```

#### Success Response — `200 OK`

Returns the **updated** service object.

---

### 5.5 `DELETE /api/services/:serviceId`

**What it does:** Permanently deletes a service by its MongoDB `_id`.

> 🔐 Authentication required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceId` | `string` | Yes | MongoDB `_id` of the service |

#### Success Response — `200 OK`

```json
{
  "message": "Service deleted successfully",
  "service": { /* the deleted service object */ }
}
```

---

## 6. ⚛️ Frontend Hook Reference

All hooks are exported from `Frontend/src/store/api/index.js` and can be imported with:

```js
import { useGetUsersQuery, useCreateReferralMutation } from '@/store/api';
```

### Users

| Hook | Type | Endpoint called | Parameters |
|------|------|-----------------|------------|
| `useGetUsersQuery(params?)` | Query | `GET /api/users` | Optional params object: `{ role, isActive, clerkUserId, email }` |
| `useUpdateMeMutation()` | Mutation | `PUT /api/users/me` | Body object with fields to update |

### Referrals

| Hook | Type | Endpoint called | Parameters |
|------|------|-----------------|------------|
| `useGetReferralsQuery()` | Query | `GET /api/referrals` | None |
| `useGetReferralsByPatientIdQuery(patientId)` | Query | `GET /api/referrals/patient/:patientId` | `patientId`: string |
| `useGetReferralsByPractitionerIdQuery(practitionerId)` | Query | `GET /api/referrals/practitioner/:practitionerId` | `practitionerId`: string |
| `useCreateReferralMutation()` | Mutation | `POST /api/referrals` | Body object |
| `useUpdateReferralsByPatientIdMutation()` | Mutation | `PUT /api/referrals/patient/:patientId` | `{ patientId, body }` |
| `useAssignReferralByIdMutation()` | Mutation | `PUT /api/referrals/:referralId/assign` | `{ referralId, practitionerClerkUserId }` |
| `useDeleteReferralsByPatientIdMutation()` | Mutation | `DELETE /api/referrals/patient/:patientId` | `patientId`: string |

### Services

| Hook | Type | Endpoint called | Parameters |
|------|------|-----------------|------------|
| `useGetServicesQuery(params?)` | Query | `GET /api/services` | Optional params: `{ category, isActive, name }` |
| `useGetServiceByIdQuery(serviceId)` | Query | `GET /api/services/:serviceId` | `serviceId`: string |
| `useCreateServiceMutation()` | Mutation | `POST /api/services` | Body object |
| `useUpdateServiceByIdMutation()` | Mutation | `PUT /api/services/:serviceId` | `{ serviceId, body }` |
| `useDeleteServiceByIdMutation()` | Mutation | `DELETE /api/services/:serviceId` | `serviceId`: string |

#### Example hook usage in a component

```jsx
// Query (read)
const { data: services, isLoading, error } = useGetServicesQuery({ category: 'physiotherapy' });

// Mutation (write)
const [createReferral, { isLoading: isCreating }] = useCreateReferralMutation();

const handleSubmit = async () => {
  try {
    const result = await createReferral({
      patientClerkUserId: 'user_abc',
      serviceType: 'physiotherapy',
    }).unwrap();
    console.log('Created:', result);
  } catch (err) {
    console.error('Failed:', err);
  }
};
```

---

## 7. ➕ How to Add a New Endpoint to an Existing Entity

This section walks through adding a completely new endpoint to an entity that already exists (e.g. adding `GET /api/referrals/:referralId` to the Referrals resource).

### Step 1 — Add the DTO validation schema (if needed)

Open the relevant DTO file (e.g. `Backend/src/Dtos/referral.dto.ts`) and add a Zod schema for any new parameters or body shape:

```ts
// If you need a new params schema (referralId already exists as referralIdParamsSchema)
export const getSingleReferralParamsSchema = z.object({
  referralId: z.string().trim().min(1, 'referralId is required'),
});

// If you need a new body schema
export const someNewBodySchema = z.object({
  fieldName: z.string().trim().min(1, 'fieldName is required'),
  optionalField: z.number().optional(),
});
```

> 💡 If the params shape already exists (like `referralIdParamsSchema`), you don't need to add a new one — just re-use it.

### Step 2 — Write the controller handler function

Open the relevant controller file (e.g. `Backend/src/controllers/referralController.ts`) and add the new exported handler:

```ts
export const getReferralById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate route params
    const parsedParams = referralIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const { referralId } = parsedParams.data;

    // 2. Query the database
    const referral = await Referral.findById(referralId);

    // 3. Handle not found
    if (!referral) {
      throw new NotFoundError('Referral not found');
    }

    // 4. Return result
    res.status(200).json(referral);
  } catch (error) {
    next(error);
  }
};
```

### Step 3 — Register the route in the router file

Open `Backend/src/routes/referralRoutes.ts`, import the new handler, and add the route:

```ts
import {
  // ...existing imports
  getReferralById,         // <-- add this
} from '../controllers/referralController';

// Add this line in the router:
ReferralRouter.get('/:referralId', getReferralById);
```

> ⚠️ **Order matters.** Static routes (e.g. `/patient`) must be defined **before** dynamic routes (e.g. `/:referralId`) to avoid route shadowing.

### Step 4 — Add the RTK Query endpoint (Frontend)

Open the relevant API file (`Frontend/src/store/api/referralsApi.js`) and add the endpoint inside `endpoints`:

```js
getReferralById: builder.query({
  query: (referralId) => `/referrals/${referralId}`,
  providesTags: ['Referrals'],
}),
```

Export the generated hook at the bottom of the same file:

```js
export const {
  // ...existing exports
  useGetReferralByIdQuery,   // <-- add this
} = referralsApi;
```

### Step 5 — Re-export from the barrel file

Open `Frontend/src/store/api/index.js` and add the new hook to the existing export block:

```js
export {
  // ...existing referral hooks
  useGetReferralByIdQuery,   // <-- add this
} from './referralsApi';
```

### Step 6 — Use the hook in a component

```jsx
import { useGetReferralByIdQuery } from '@/store/api';

const { data: referral, isLoading } = useGetReferralByIdQuery(referralId);
```

---

## 8. 🏗️ How to Add a Brand-New Entity (Full End-to-End)

This section covers creating a completely new resource from scratch (e.g. `Appointment`). Follow each step in order.

---

### Backend — Step 1: Create the Mongoose Model

Create `Backend/src/models/Appointment.ts`:

```ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientClerkUserId: string;
  practitionerClerkUserId?: string;
  serviceId: mongoose.Types.ObjectId;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientClerkUserId: { type: String, required: true },
    practitionerClerkUserId: { type: String },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    scheduledDate: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

// Add indexes for common query patterns
AppointmentSchema.index({ patientClerkUserId: 1 });
AppointmentSchema.index({ practitionerClerkUserId: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
```

---

### Backend — Step 2: Create the DTO File

Create `Backend/src/Dtos/appointment.dto.ts`:

```ts
import { z } from 'zod';

export const appointmentStatusSchema = z.enum(['scheduled', 'completed', 'cancelled']);

export const appointmentIdParamsSchema = z.object({
  appointmentId: z.string().trim().min(1, 'appointmentId is required'),
});

export const createAppointmentBodySchema = z.object({
  patientClerkUserId: z.string().trim().min(1, 'patientClerkUserId is required'),
  practitionerClerkUserId: z.string().trim().optional(),
  serviceId: z.string().trim().min(1, 'serviceId is required'),
  status: appointmentStatusSchema.optional(),
  scheduledDate: z.coerce.date(),
  notes: z.string().trim().optional(),
});

export const updateAppointmentBodySchema = createAppointmentBodySchema
  .omit({ patientClerkUserId: true, serviceId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

export const getAppointmentsQuerySchema = z.object({
  status: appointmentStatusSchema.optional(),
  patientClerkUserId: z.string().trim().optional(),
  practitionerClerkUserId: z.string().trim().optional(),
});
```

---

### Backend — Step 3: Create the Controller

Create `Backend/src/controllers/appointmentController.ts`:

```ts
import { NextFunction, Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { ZodError } from 'zod';
import {
  appointmentIdParamsSchema,
  createAppointmentBodySchema,
  getAppointmentsQuerySchema,
  updateAppointmentBodySchema,
} from '../Dtos/appointment.dto';
import { ValidationError, NotFoundError } from '../errors/errors';

const formatValidationErrors = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

export const getAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedQuery = getAppointmentsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
    }
    const appointments = await Appointment.find(parsedQuery.data).sort({ scheduledDate: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedParams = appointmentIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }
    const appointment = await Appointment.findById(parsedParams.data.appointmentId);
    if (!appointment) throw new NotFoundError('Appointment not found');
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedBody = createAppointmentBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }
    const newAppointment = await Appointment.create(parsedBody.data);
    res.status(201).json(newAppointment);
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedParams = appointmentIdParamsSchema.safeParse(req.params);
    const parsedBody = updateAppointmentBodySchema.safeParse(req.body);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }
    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }
    const updated = await Appointment.findByIdAndUpdate(
      parsedParams.data.appointmentId,
      { $set: parsedBody.data },
      { new: true, runValidators: true }
    );
    if (!updated) throw new NotFoundError('Appointment not found');
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedParams = appointmentIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }
    const deleted = await Appointment.findByIdAndDelete(parsedParams.data.appointmentId);
    if (!deleted) throw new NotFoundError('Appointment not found');
    res.status(200).json({ message: 'Appointment deleted successfully', appointment: deleted });
  } catch (error) {
    next(error);
  }
};
```

---

### Backend — Step 4: Create the Router

Create `Backend/src/routes/appointmentRoutes.ts`:

```ts
import express from 'express';
import {
  createAppointment,
  deleteAppointmentById,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentById,
} from '../controllers/appointmentController';

const AppointmentRouter = express.Router();

AppointmentRouter.get('/', getAllAppointments);
AppointmentRouter.get('/:appointmentId', getAppointmentById);
AppointmentRouter.post('/', createAppointment);
AppointmentRouter.put('/:appointmentId', updateAppointmentById);
AppointmentRouter.delete('/:appointmentId', deleteAppointmentById);

export default AppointmentRouter;
```

---

### Backend — Step 5: Mount the Router in `index.ts`

Open `Backend/src/index.ts` and add two lines:

```ts
// 1. Import the router (add near the other imports)
import appointmentRoutes from './routes/appointmentRoutes';

// 2. Mount the route (add with the other server.use() calls, before the error handler)
server.use('/api/appointments', appointmentRoutes);
```

> Keep `server.use(globalErrorHandlingMiddleware)` **after** all route mounts.

---

### Frontend — Step 6: Create the RTK Query API File

Create `Frontend/src/store/api/appointmentsApi.js`:

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

---

### Frontend — Step 7: Register the New Tag Type in `baseApi.js`

Open `Frontend/src/store/api/baseApi.js` and add `'Appointments'` to `tagTypes`:

```js
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Users', 'Referrals', 'Services', 'Appointments'],  // <-- added
  endpoints: () => ({}),
});
```

---

### Frontend — Step 8: Export from the Barrel File

Open `Frontend/src/store/api/index.js` and add:

```js
export {
  useGetAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentByIdMutation,
  useDeleteAppointmentByIdMutation,
} from './appointmentsApi';
```

---

### Frontend — Step 9: Use in a Component

```jsx
import {
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
} from '@/store/api';

export default function AppointmentsPage() {
  const { data: appointments, isLoading } = useGetAppointmentsQuery({ status: 'scheduled' });
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();

  const handleCreate = async () => {
    await createAppointment({
      patientClerkUserId: 'user_abc',
      serviceId: '6650e1e2b3c4d5e6f7a8b9c3',
      scheduledDate: '2026-04-01T10:00:00.000Z',
    }).unwrap();
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {appointments?.map((a) => <div key={a._id}>{a.scheduledDate}</div>)}
      <button onClick={handleCreate} disabled={isCreating}>Book Appointment</button>
    </div>
  );
}
```

---

## 9. 🧠 How to Write a Controller Handler Function

Every controller handler in this project follows the same pattern. Here is a fully annotated template:

```ts
import { NextFunction, Request, Response } from 'express';
// Import the Mongoose model
import { MyModel } from '../models/MyModel';
// Import Zod schemas for validation
import { myParamsSchema, myBodySchema } from '../Dtos/myEntity.dto';
// Import typed errors
import { ValidationError, NotFoundError } from '../errors/errors';
import { ZodError } from 'zod';

// Helper — formats Zod errors into { field, message } pairs
const formatValidationErrors = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

export const myHandlerFunction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ── 1. VALIDATE URL PARAMS (if the route has :paramId) ──────────────
    const parsedParams = myParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    // ── 2. VALIDATE QUERY PARAMS (for GET endpoints with filters) ────────
    const parsedQuery = myQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
    }

    // ── 3. VALIDATE BODY (for POST / PUT endpoints) ──────────────────────
    const parsedBody = myBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }

    // ── 4. EXTRACT AUTHENTICATED USER (only if the endpoint needs it) ────
    // const auth = getAuth(req);
    // if (!auth.userId) throw new UnauthorizedError('Authentication required');

    // ── 5. PERFORM DATABASE OPERATION ────────────────────────────────────
    // GET all:     Model.find(filter).sort({ createdAt: -1 })
    // GET one:     Model.findById(id)
    // GET filter:  Model.findOne({ field: value })
    // CREATE:      Model.create(parsedBody.data)
    // UPDATE one:  Model.findByIdAndUpdate(id, { $set: body }, { new: true })
    // UPDATE many: Model.updateMany(filter, { $set: body })
    // DELETE one:  Model.findByIdAndDelete(id)
    // DELETE many: Model.deleteMany(filter)

    const result = await MyModel.findById(parsedParams.data.myEntityId);

    // ── 6. HANDLE NOT FOUND ───────────────────────────────────────────────
    if (!result) {
      throw new NotFoundError('MyEntity not found');
    }

    // ── 7. SEND RESPONSE ──────────────────────────────────────────────────
    // 200 for reads/updates/deletes
    // 201 for creates
    res.status(200).json(result);

  } catch (error) {
    // Always pass errors to next() — the global error handler takes care of the rest
    next(error);
  }
};
```

### Rules to always follow in handlers

| Rule | Why |
|------|-----|
| Always wrap in `try/catch` and call `next(error)` in catch | Ensures all errors flow to the global error handler |
| Always use `safeParse` (not `parse`) for Zod validation | `safeParse` does not throw — gives you a result to check |
| Always throw typed errors (`ValidationError`, `NotFoundError`, etc.) | Global middleware maps these to correct HTTP status codes |
| Always use `{ new: true }` on `findByIdAndUpdate` | Returns the updated document, not the old one |
| Always add `runValidators: true` on update operations | Ensures Mongoose schema validators run on updates |
| Never send a response after calling `next(error)` | Express treats them as separate response paths |

### Typed Error Reference

| Class | HTTP Status | When to use |
|-------|-------------|-------------|
| `ValidationError` | 400 | Zod parse failure or invalid input |
| `BadRequestError` | 400 | Logically invalid request |
| `UnauthorizedError` | 401 | No authentication |
| `ForbiddenError` | 403 | Authenticated but not permitted |
| `NotFoundError` | 404 | Resource not found in DB |

All errors are imported from `Backend/src/errors/errors.ts`.

---

*Last updated: March 2026*
