# Health Matters API Documentation

## 1) Overview
This document reflects the current implemented API surface for the Health Matters backend and the matching frontend RTK Query integration.

Implemented backend modules:
- Users
- Referrals
- Services
- Appointments
- Notifications
- Medical Records
- Reviews
- Webhooks

Base API URL:
- http://localhost:3000/api

---

## 2) Server Architecture

### 2.1 Server Entry and Middleware Order
Backend server setup in Backend/src/index.ts:
1. dotenv configuration
2. CORS middleware
3. Webhooks route (/api/webhooks)
4. JSON body parser
5. request logger middleware
6. Clerk middleware (authentication context)
7. feature routers
8. global error handling middleware
9. DB connection and server startup

### 2.2 Mounted Routes
- /api/users
- /api/referrals
- /api/services
- /api/appointments
- /api/notifications
- /api/medical-records
- /api/reviews
- /api/webhooks

### 2.3 Security and Validation
- Authentication middleware: requireClerkAuth (route-level)
- Authorization middleware: requireAdminRole (admin-only endpoints)
- Validation: Zod DTO schemas in Backend/src/Dtos
- Error handling: typed app errors mapped by globalErrorHandlingMiddleware

---

## 3) Implemented Endpoint Reference

## 3.1 Users API
Router: Backend/src/routes/userRoutes.ts

- GET /api/users
  - Admin only
  - Query filters include role, isActive, clerkUserId, email

- GET /api/users/me
  - Authenticated user profile by Clerk token identity

- PUT /api/users/me
  - Authenticated self-profile update

- POST /api/users
  - Admin only, create user

- GET /api/users/:userId
  - Admin only, fetch single user

- PUT /api/users/:userId
  - Admin only, update user details

- PUT /api/users/:userId/role
  - Admin only, update role (and Clerk metadata sync)

- PATCH /api/users/:userId/deactivate
  - Admin only, soft deactivate

- DELETE /api/users/:userId
  - Admin only, delete user

- POST /api/users/:userId/manager
  - Admin only, assign manager relationship

Example response (GET /api/users/me):
```json
{
  "_id": "67f...",
  "clerkUserId": "user_...",
  "email": "person@company.com",
  "role": "employee",
  "firstName": "Alex",
  "lastName": "Taylor",
  "department": "Finance"
}
```

---

## 3.2 Referrals API
Router: Backend/src/routes/referralRoutes.ts

- GET /api/referrals
  - Get all referrals

- GET /api/referrals/my-submissions
  - Authenticated manager submissions
  - Optional query params: status, serviceType, search, dateFrom, dateTo, page, limit

- GET /api/referrals/patient/:patientId
  - Get referrals by patient Clerk user ID

- GET /api/referrals/practitioner/:practitionerId
  - Get referrals by practitioner Clerk user ID

- GET /api/referrals/:referralId
  - Get one referral by ID

- POST /api/referrals
  - Create referral

- PUT /api/referrals/patient/:patientId
  - Update referrals by patient

- DELETE /api/referrals/patient/:patientId
  - Delete referrals by patient

- PUT /api/referrals/:referralId/assign
  - Assign practitioner to referral

- PUT /api/referrals/:referralId/status
  - Update referral status

- PUT /api/referrals/:referralId/cancel
  - Manager cancel referral with reason

Example request (PUT /api/referrals/:referralId/cancel):
```json
{
  "reason": "Issue resolved internally"
}
```

Example response:
```json
{
  "message": "Referral cancelled successfully",
  "referral": {
    "_id": "67f...",
    "referralStatus": "cancelled",
    "cancellationReason": "Issue resolved internally"
  }
}
```

---

## 3.3 Services API
Router: Backend/src/routes/serviceRoutes.ts

- GET /api/services
- GET /api/services/:serviceId
- POST /api/services
  - Admin only
- PUT /api/services/:serviceId
  - Admin only
- DELETE /api/services/:serviceId
  - Admin only

Example create request:
```json
{
  "name": "Physiotherapy",
  "code": "PHYSIO_001",
  "category": "physiotherapy",
  "defaultDuration": 45,
  "isActive": true
}
```

---

## 3.4 Appointments API
Router: Backend/src/routes/appointmentRoutes.ts

- GET /api/appointments/employee/:employeeId
  - Employee timeline data

- GET /api/appointments/practitioner/:practitionerId
  - Practitioner appointments view

- PATCH /api/appointments/:appointmentId/respond
  - Practitioner response action
  - Status accepted by implementation: confirmed or rejected

- PATCH /api/appointments/:appointmentId/cancel
  - Practitioner cancellation action

Example response action request:
```json
{
  "status": "confirmed"
}
```

---

## 3.5 Notifications API
Router: Backend/src/routes/notificationRoutes.ts

- GET /api/notifications
  - Current authenticated user notifications
  - Optional filters supported by DTO: unread, type, limit

- PATCH /api/notifications/:notificationId/read
  - Mark one notification as read

Example read response:
```json
{
  "_id": "notif_...",
  "title": "Referral Status Updated",
  "channels": {
    "inApp": {
      "read": true,
      "readAt": "2026-03-14T12:00:00.000Z"
    }
  }
}
```

---

## 3.6 Medical Records API
Router: Backend/src/routes/medicalRecordRoutes.ts

- GET /api/medical-records/access-count/:employeeId
  - Returns advice-sheet/record access count for employee dashboard metrics

Example response:
```json
{
  "accessCount": 7
}
```

---

## 3.7 Reviews API
Router: Backend/src/routes/reviewRoutes.ts

- GET /api/reviews
  - Current practitioner reviews
  - Optional query: limit

- POST /api/reviews
  - Create review for current practitioner

Example create request:
```json
{
  "patientName": "A. Brown",
  "message": "Very supportive consultation",
  "rating": 5
}
```

---

## 3.8 Webhooks API
Router mount: /api/webhooks

- Endpoint(s) in Backend/src/middlewares/webhooks/webhooks.ts
- Mounted before express.json() because raw body is required for signature verification

---

## 4) Current Data Model Summary

Core implemented collections:
- users
- referrals
- services
- appointments
- notifications
- medical_records
- reviews
- analytics_snapshots (for analytics snapshots/trends where used)

Important identity relationships:
- clerkUserId links app users to Clerk identities
- referral submittedBy/patient/practitioner fields connect role workflows
- appointments connect referrals and participant users

---

## 5) Frontend RTK Query Mapping (Current)

Base API setup:
- File: Frontend/src/store/api/baseApi.js
- Tag types: Users, Referrals, Services, Notifications, MedicalRecords, Reviews, Appointments
- Token injection from Clerk session in prepareHeaders

Central hook exports:
- File: Frontend/src/store/api/index.js

Users hooks:
- useGetUsersQuery
- useGetMeQuery
- useUpdateMeMutation
- useCreateUserMutation
- useUpdateUserMutation
- useUpdateUserRoleMutation
- useDeactivateUserMutation
- useDeleteUserMutation
- useAssignUserManagerMutation

Referrals hooks:
- useGetReferralsQuery
- useGetMyReferralsQuery
- useGetReferralsByPatientIdQuery
- useGetReferralsByPractitionerIdQuery
- useGetReferralByIdQuery
- useCreateReferralMutation
- useUpdateReferralsByPatientIdMutation
- useAssignReferralByIdMutation
- useDeleteReferralsByPatientIdMutation
- useUpdateReferralStatusMutation
- useCancelReferralByIdMutation

Services hooks:
- useGetServicesQuery
- useGetServiceByIdQuery
- useCreateServiceMutation
- useUpdateServiceByIdMutation
- useDeleteServiceByIdMutation

Notifications hooks:
- useGetNotificationsQuery
- useMarkNotificationReadMutation

Appointments hooks:
- useGetAppointmentsByEmployeeIdQuery
- useGetAppointmentsByPractitionerIdQuery
- useRespondToAppointmentMutation
- useCancelAppointmentMutation

Reviews hooks:
- useGetReviewsQuery
- useCreateReviewMutation

Note:
- medicalRecordsApi exists with useGetAdviceSheetAccessCountByEmployeeIdQuery, but it is not currently re-exported from Frontend/src/store/api/index.js.

---

## 6) Response and Error Conventions

Success responses:
- 200 for successful reads/updates/deletes
- 201 for successful creates

Common error statuses:
- 400 validation or bad request
- 401 unauthenticated
- 403 unauthorized
- 404 not found
- 500 server error

Typical error payload:
```json
{
  "message": "Validation failed"
}
```

---

## 7) Contributor Update Checklist

When adding or changing an API:
1. Update DTO schema (params/query/body)
2. Update controller logic
3. Update router endpoint mapping
4. Mount router in Backend/src/index.ts (if new module)
5. Add or update RTK Query endpoints and tags
6. Export hooks from Frontend/src/store/api/index.js
7. Update this API_DOCUMENTATION.md file
