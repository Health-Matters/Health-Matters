# Health Matters CRM - Full Project Read Document

## 1. Project Overview

Health Matters is an occupational health CRM platform built with a MERN-based architecture and role-centric workflows for Admins, Managers, Practitioners, and Employees. The system supports referral management, scheduling, notifications, service catalog administration, profile management, and role-based access control with Clerk.

Primary goals:
- Digitize end-to-end occupational health referral operations
- Provide role-specific dashboards for operational clarity
- Enforce secure, auditable, and GDPR-aware data handling
- Support team-based modular development across Teams A-J


## 2. System Architecture (End-to-End)

### 2.1 Three-Tier Architecture

The platform follows a three-tier architecture:

1. Presentation Tier (Frontend)
- Technology: React (Vite), Tailwind CSS, Redux Toolkit, RTK Query
- Responsibilities:
  - Role-based dashboard UI rendering
  - User interaction and validation
  - Data presentation (tables, cards, charts, modals)
  - Triggering API calls via RTK Query hooks

2. Application Tier (Backend API)
- Technology: Node.js, Express.js, TypeScript
- Responsibilities:
  - HTTP routing and controller orchestration
  - Business rules for referrals, appointments, users, services, notifications, reviews
  - Authentication and authorization enforcement
  - Request validation and error handling

3. Data Tier (Database)
- Technology: MongoDB with Mongoose
- Responsibilities:
  - Persist domain entities and workflow states
  - Maintain role-linked and workflow-linked records
  - Support analytics snapshots and operational metrics


### 2.2 Frontend Architecture

Frontend structure highlights:
- Entry: Frontend/src/main.jsx
- Routing: React Router role-based dashboard routes
- State management:
  - Global state via Redux Toolkit store
  - API state via RTK Query
- API layer files in Frontend/src/store/api:
  - usersApi.js
  - referralsApi.js
  - servicesApi.js
  - appointmentsApi.js
  - notificationsApi.js
  - medicalRecordsApi.js
  - reviewsApi.js
- Shared UI components and dashboard-specific page modules

Theme support:
- Centralized theme state in theme slice
- Dark mode support integrated in role dashboards


### 2.3 Backend Architecture

Backend structure highlights:
- Entry: Backend/src/index.ts
- Middleware order:
  1. dotenv
  2. CORS
  3. webhooks route
  4. JSON parser and logger
  5. Clerk middleware
  6. feature routers
  7. global error middleware
- Core routers:
  - /api/users
  - /api/referrals
  - /api/services
  - /api/appointments
  - /api/notifications
  - /api/medical-records
  - /api/reviews

Controller pattern:
- DTO validation with Zod
- controller-level business logic
- typed error propagation to global handler


### 2.4 Database Design and Relationships

Core collections:
- users
- referrals
- services
- appointments
- notifications
- medical_records
- reviews
- analytics_snapshots

Key relationship patterns:
- clerkUserId links application users to Clerk identities
- referrals link manager/employee/practitioner workflow states
- appointments reference referral context and participant IDs
- notifications capture referral/appointment operational events


### 2.5 Authentication and RBAC

Authentication:
- Clerk token-based identity resolution
- Frontend retrieves session token
- Backend validates via Clerk middleware

Authorization:
- requireClerkAuth for protected endpoints
- requireAdminRole for admin-only operations
- Identity-derived operations for secure manager/practitioner views


### 2.6 CI/CD (GitHub Actions)

Project delivery model includes GitHub Actions based CI/CD practices:
- Pull request quality gates
- Build verification for frontend and backend
- Deployment-ready automation workflow design


## 3. Module Integration

How modules work together:

- Referrals module
  - Entry points: manager submissions, employee self-referrals, practitioner referral actions
  - Feeds scheduling, notifications, and analytics

- Appointments module
  - Consumes referral context
  - Produces employee/practitioner schedule visibility

- User management module
  - Provides RBAC and profile workflows
  - Supports manager-employee relationship mapping

- Services module
  - Powers referral service selection and admin service governance

- Notifications module
  - Reflects key workflow state transitions and user alerts

- Medical records metrics module
  - Supplies access-count metrics for dashboard cards

- Reviews module
  - Supports practitioner feedback features and rating interactions


## 4. Team Contributions (A-J)

This section summarizes each team's backlog implementation contribution and current status context.

### Team A (Manager)
Implemented:
- TMA-001: Referral submission on behalf of team member
- TMA-002: Referral reason and supporting notes
- TMA-003: Manager referral history tracking
- TMA-004: Referral details view
- TMA-005: Backend endpoint integration for manager referrals
- TMA-006: User-friendly referral workflow and responsive manager UI

Key impact:
- Established core manager referral workflow from submission to tracking.


### Team B (Manager-Focused Features)
Implemented:
- TMB-005: Manager personal details update workflow
- TMB-006: Manager health guidance/advice access flow

Not completed or in progress:
- TMB-001: Outcome reports with consent-based manager visibility (Not Done)
- TMB-002: Workplace adjustment action tracking (Not Done)
- TMB-003: SLA approaching alerts (In Progress)
- TMB-004: Notification preferences center (Not Done)

Key impact:
- Delivered profile and guidance foundations; advanced report/alert preferences remain partial.


### Team C (Employee)
Implemented:
- TMC-001: Self-referral submission form with validation
- TMC-002: Referral history tracking
- TMC-003: Past and upcoming appointments visibility
- TMC-005: Service list visibility (pricing/duration context)
- TMC-006: Total referral count indicator
- TMC-007: Pending referral indicator

Not completed:
- TMC-004: Employee dark/light mode toggle marked To Be Done in backlog context

Key impact:
- Delivered the primary employee self-service referral and tracking journey.


### Team D (Manager Analytics and Alerts)
Implemented:
- TMD-001: Referral status notifications for managers
- TMD-002: Manager cancellation of pending referral with reason
- TMD-003: Team aggregated health overview
- TMD-004: SLA compliance stats view
- TMD-005: In-depth wellbeing analytics view

Backlog placeholders:
- TMD-006, TMD-007 not specified

Key impact:
- Added operational awareness, escalation intelligence, and manager analytics layers.


### Team E (Employee)
Implemented:
- TME-001: Employee notifications page and polling behavior
- TME-002: Employee profile update and persistence
- TME-003: Dashboard cards for upcoming appointments and advice access activity

Not completed:
- TME-004: WCAG AA full contrast compliance marked To Be Done
- TME-005, TME-006 placeholders

Key impact:
- Improved employee engagement and dashboard utility through actionable personal data.


### Team F (Admin and System Owner)
Implemented:
- TMF-001: Admin access to user role management console
- TMF-002: Filterable user list by role
- TMF-003: User creation flow
- TMF-004: User edit flow
- TMF-005: Centralized referral intake dashboard
- TMF-006: Security/compliance baseline implementation

Key impact:
- Established administrative control plane and foundational platform governance.


### Team G (Practitioner)
Implemented:
- TMG-001: Practitioner appointment list dashboard
- TMG-002: Practitioner referral handoff flow
- TMG-003: Practitioner appointment cancellation
- TMG-004: Appointment performance counters
- TMG-005: Unified practitioner referral management dashboard
- TMG-006: Practitioner profile details page

Key impact:
- Delivered clinician-side workflow execution and oversight capabilities.


### Team H (Admin Service Catalog)
Implemented:
- TMH-001: Service table overview and management visibility
- TMH-002: Service creation
- TMH-003: Service edit updates
- TMH-004: Service deactivate/archive behavior
- TMH-005: Service KPI summary cards

Partial:
- TMH-006: Service categorization/tag taxonomy marked Partial

Key impact:
- Delivered service catalog lifecycle management required for referral operations.


### Team I (Employee Guidance)
Implemented:
- TMI-001: Help and Advice page access and referral-linked cards
- TMI-002: Employee referral list
- TMI-003: Referral status visibility badges
- TMI-004: Clinical summary display in referral details
- TMI-005: General wellbeing guidance while referrals are in progress

Backlog placeholder:
- TMI-006 unspecified

Key impact:
- Strengthened employee informational support and transparency.


### Team J (Practitioner Reviews and Patients)
Implemented:
- TMJ-001: Recent review cards
- TMJ-002: Review submission form
- TMJ-003: Star rating interaction
- TMJ-005: Patient search behavior
- TMJ-006: Patient detail modal
- TMJ-007: Patient statistics cards

In progress:
- TMJ-004: Practitioner patient list management marked In Progress

Key impact:
- Added practitioner feedback and patient-overview utility features.


## 5. Current API Surface Summary

Implemented endpoint groups:
- Users: profile/admin user lifecycle management
- Referrals: manager/employee/practitioner referral workflows
- Services: service catalog CRUD (admin protected for writes)
- Appointments: employee/practitioner appointment views and practitioner actions
- Notifications: retrieval and read-state update
- Medical Records: access count metrics endpoint
- Reviews: practitioner review read/create
- Webhooks: Clerk synchronization route

For full endpoint details, refer to:
- Documentation/api/API_DOCUMENTATION.md


## 6. How to Run the Application

### 6.1 Prerequisites

Install:
- Node.js 18+
- npm 9+
- MongoDB (local or cloud URI)

Accounts/services:
- Clerk project (publishable key, secret key, webhook signing secret)


### 6.2 Environment Variables

Backend .env (Backend/.env):
- PORT=3000
- MONGODB_URI=<your_mongodb_connection_string>
- CLERK_SECRET_KEY=<your_clerk_secret_key>
- CLERK_WEBHOOK_SIGNING_SECRET=<your_clerk_webhook_signing_secret>

Frontend .env (Frontend/.env):
- VITE_API_BASE_URL=http://localhost:3000/api
- VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>


### 6.3 Install Dependencies

From repository root:

Backend:
- cd Backend
- npm install

Frontend:
- cd ../Frontend
- npm install


### 6.4 Run in Development

Start backend:
- cd Backend
- npm run dev

Start frontend:
- cd Frontend
- npm run dev

Open:
- Frontend app: http://localhost:5173
- Backend API: http://localhost:3000/api


### 6.5 Build for Production

Backend build:
- cd Backend
- npm run build
- npm start

Frontend build:
- cd Frontend
- npm run build
- npm run preview


### 6.6 Optional Utilities

Database seed:
- cd Backend
- npm run seed

Ngrok for webhook/dev tunnel:
- cd Backend
- npm run dev:ngrok


## 7. Recommended Project Usage Notes

- Keep backend and frontend running in separate terminals
- Ensure Clerk keys are valid in both backend and frontend env files
- Keep middleware order intact in backend entry to avoid auth/webhook issues
- Validate DTO and API docs whenever new endpoints are added


## 8. Acknowledgements and Thank You

Thank you to every contributor across Teams A-J for building Health Matters collaboratively.

Your combined frontend, backend, integration, QA, and architecture effort delivered a comprehensive occupational health CRM with meaningful real-world workflows.

Special thanks to:
- Team leads and contributors for modular feature ownership
- Everyone who validated integration points across teams
- All members who helped refine UX, security, and operational reliability

Thank you for your dedication, teamwork, and professionalism.
