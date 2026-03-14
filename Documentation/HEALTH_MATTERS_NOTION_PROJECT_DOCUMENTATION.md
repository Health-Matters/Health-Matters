<h1><strong>🏥 Health Matters CRM - End-to-End Technical Documentation</strong></h1>

<h2><strong>📚 Table of Contents</strong></h2>

- [1. 🏗️ System Architecture (End-to-End)](#system-architecture)
  - [🧱 Three-Tier Architecture Model Used](#three-tier-architecture)
  - [🖥️ Frontend Architecture](#frontend-architecture)
  - [⚙️ Backend Architecture](#backend-architecture)
  - [🗄️ Database Architecture (MongoDB)](#database-architecture)
  - [🔐 Authentication and CI/CD](#authentication-cicd)
- [2. 🔗 Module & Feature Integration](#module-feature-integration)
  - [🧩 Integration Map](#integration-map)
  - [🔄 Cross-Module Communication Patterns](#cross-module-communication)
  - [🛤️ Example End-to-End Integrated Flow](#end-to-end-integrated-flow)
- [3. 📖 Comprehensive User Story Breakdown (By Team)](#user-story-breakdown)
  - [👥 Team A](#team-a)
  - [👥 Team B](#team-b)
  - [👥 Team C](#team-c)
  - [👥 Team D](#team-d)
  - [👥 Team E](#team-e)
  - [👥 Team F](#team-f)
  - [👥 Team G](#team-g)
  - [👥 Team H](#team-h)
  - [👥 Team I](#team-i)
  - [👥 Team J](#team-j)

<a id="system-architecture"></a>
<h1><strong>1. 🏗️ System Architecture (End-to-End)</strong></h1>

<a id="three-tier-architecture"></a>
<h3><strong>🧱 Three-Tier Architecture Model Used</strong></h3>

Health Matters is implemented using a classical three-tier architecture to ensure separation of concerns, scalability, and maintainability.

- Tier 1 - Presentation Tier (Client/UI)
  - Technology: React 19 + Vite + Tailwind CSS
  - Responsibilities:
    - Render role-based dashboards (Admin, Manager, Practitioner, Employee)
    - Capture and validate user input before API submission
    - Display operational data, notifications, metrics, and workflow states
  - Key implementation elements:
    - Route-level UX segmentation with React Router
    - Reusable UI component library (Radix/shadcn-style composable primitives)
    - Redux Toolkit and RTK Query integration for stateful views

- Tier 2 - Application Tier (Business/API Layer)
  - Technology: Node.js + Express.js + TypeScript
  - Responsibilities:
    - Enforce domain rules for referrals, appointments, services, users, and notifications
    - Authenticate and authorize requests via Clerk middleware and role guards
    - Validate and transform request/response contracts via DTO schemas
    - Orchestrate cross-module workflows and emit consistent JSON responses
  - Key implementation elements:
    - Feature routers and controller-based modular architecture
    - Validation with Zod DTOs
    - Global error handling middleware and request logging

- Tier 3 - Data Tier (Persistence Layer)
  - Technology: MongoDB + Mongoose
  - Responsibilities:
    - Persist user, referral, appointment, service, notification, and clinical metadata
    - Maintain role-linked and workflow-linked relationships
    - Support analytics snapshots and operational reporting datasets
  - Key implementation elements:
    - Collections: users, referrals, appointments, services, medical_records, notifications, analytics_snapshots
    - Indexed, status-driven schemas optimized for dashboard queries and lifecycle tracking

**Three-tier request lifecycle:**
1. Presentation tier sends authenticated API requests from React/RTK Query.
2. Application tier validates identity, enforces RBAC/business logic, and executes controller workflows.
3. Data tier performs read/write operations in MongoDB and returns persisted state.
4. Application tier returns normalized JSON responses.
5. Presentation tier updates UI state and cached data for real-time user feedback.

<a id="frontend-architecture"></a>
<h3><strong>🖥️ Frontend Architecture</strong></h3>

The frontend is built with React 19 and Vite, using a role-segmented dashboard architecture for Admin, Manager, Practitioner, and Employee personas.

- Core framework: React + React Router (route-level access separation by role)
- Styling system: Tailwind CSS v4 with shared design tokens and dashboard-specific theme behavior
- UI component model:
  - Shared reusable components in a central components layer
  - Radix-based primitives and shadcn-style composable UI patterns
  - Role dashboard pages organized under feature folders for modular ownership
- State management:
  - Redux Toolkit store for global app state
  - RTK Query for API data fetching, caching, request lifecycle, and cache invalidation
  - Theme slice for global light/dark mode synchronization
- API integration strategy:
  - Unified base query layer with bearer token injection
  - Feature API slices: users, referrals, appointments, services, notifications, reviews, medical-records
  - Tag-based invalidation to keep dashboards current after write operations

**Frontend flow (high level):**
1. User authenticates through Clerk UI.
2. Frontend receives session context and requests a token.
3. RTK Query sends authorized requests to backend routes.
4. Role dashboard renders data-driven UI with reusable widgets and cards.
5. Mutations trigger selective cache invalidation for near real-time UX.

<a id="backend-architecture"></a>
<h3><strong>⚙️ Backend Architecture</strong></h3>

The backend follows a layered Node.js + Express architecture with middleware-driven security and strongly typed input validation.

- Runtime and framework: Node.js + Express.js
- Language and typing: TypeScript in backend service layer
- Architectural layers:
  - Route layer: endpoint definitions and middleware chaining
  - Controller layer: business logic and orchestration
  - DTO/validation layer: Zod schemas for request contracts
  - Data layer: Mongoose models and query logic
  - Error layer: centralized global error middleware and typed domain errors
- Security layers:
  - CORS policy restrictions and allowed origins control
  - Clerk middleware integration for authentication context
  - Route guards for auth-required and admin-only operations
  - Structured validation with fail-fast request rejection
  - Webhook endpoint isolation for Clerk sync and signature-safe processing
- Observability and runtime controls:
  - Request logging middleware
  - Consistent HTTP error mapping
  - Environment-driven configuration using dotenv

**Backend flow (high level):**
1. Request enters Express middleware chain.
2. Authentication context resolved from Clerk token.
3. Route-level authorization checks are applied.
4. DTO validation confirms payload integrity.
5. Controller executes domain logic and data access.
6. Response is normalized as JSON; errors are handled centrally.

<a id="database-architecture"></a>
<h3><strong>🗄️ Database Architecture (MongoDB)</strong></h3>

MongoDB is used as the operational data store with Mongoose schemas representing business entities and workflow states.

**Core collections and purpose:**
- users: identity, profile, role, manager relationships, preferences, audit trail
- referrals: referral lifecycle, assignees, statuses, dates, cancellation context
- appointments: schedule events, participant references, status transitions
- services: service catalog, categories, pricing/duration metadata
- medical_records: clinical documentation and advice-sheet access tracking
- notifications: in-app notification events and read-state control
- analytics_snapshots: aggregated indicators for dashboard and trend analytics

**Relationship management model:**
- Clerk user IDs are used as stable cross-service identity keys for many workflows.
- Referrals connect manager/employee/practitioner contexts through role-linked references.
- Appointments are anchored to referral records and participant IDs.
- Notification records are generated from key referral and appointment status changes.
- User-to-manager mapping supports team-based workflows and filtered managerial views.

**Schema design principles:**
- Status-driven workflows (pending, assigned, in_progress, completed, cancelled, etc.)
- Audit-friendly timestamping and lifecycle date fields
- Flexible document structures for notes and mixed metadata
- Query-oriented indexing for list pages and role-focused retrieval patterns

<a id="authentication-cicd"></a>
<h3><strong>🔐 Authentication and CI/CD</strong></h3>

<h4><strong>👤 Clerk Integration and RBAC</strong></h4>

Authentication and authorization are enforced using Clerk and server-side role checks.

- Authentication:
  - Frontend obtains session token from Clerk
  - Backend validates token and resolves authenticated identity
- RBAC strategy:
  - Roles: admin, manager, practitioner, employee
  - Route guards enforce admin-only or authenticated access as required
  - Manager and practitioner endpoints derive identity from token to prevent ID spoofing
- Account lifecycle controls:
  - Role update and account activation/deactivation through protected admin APIs
  - Profile self-management via authenticated user endpoints

<h4><strong>🚀 GitHub Actions CI/CD</strong></h4>

The project delivery process is designed around GitHub-based CI/CD automation for quality gates and deployment readiness.

**Pipeline responsibilities:**
- Trigger on pull requests and branch pushes
- Install frontend and backend dependencies
- Build validation for React/Vite and backend TypeScript
- Optional lint and test stages as quality gates
- Deployment orchestration to target environments after successful checks

**Operational outcomes:**
- Early detection of integration issues
- Consistent build reproducibility
- Controlled release flow from feature branches to shared environments

---

<a id="module-feature-integration"></a>
<h1><strong>2. 🔗 Module & Feature Integration</strong></h1>

Health Matters is implemented as an integrated care-operations platform where each module publishes or consumes state changes through shared API contracts and role-aware UI behavior.

<a id="integration-map"></a>
<h3><strong>🧩 Integration Map</strong></h3>

- Smart Referrals module
  - Entry points: Manager referral submission, Employee self-referral, Practitioner referral actions
  - Integrates with Users, Services, Notifications, Scheduling, and Analytics
- Scheduling module
  - Consumes accepted/assigned referrals
  - Produces appointment states for Practitioner and Employee dashboards
- User Management module
  - Controls RBAC, profile updates, team mapping, account lifecycle
  - Feeds identity and role constraints into every other module
- Patient Records and Advice module
  - Tracks medical/advice interactions
  - Exposes summarized counts for employee dashboard engagement metrics
- Notifications module
  - Event-driven updates for referral status and appointment progress
  - Read-state management for user attention workflows
- Service Catalog module
  - Supplies referral forms and admin service operations
  - Enables filtering and categorization in decision workflows

<a id="cross-module-communication"></a>
<h3><strong>🔄 Cross-Module Communication Patterns</strong></h3>

1. Referral-centric workflow orchestration
   - Referral creation captures service intent, patient identity, and reason context.
   - Assignment and status transitions trigger practitioner and manager visibility updates.
   - Cancellation and completion statuses feed notifications and analytics indicators.

2. Identity-driven data partitioning
   - Clerk token identity determines data scope for manager, practitioner, and employee views.
   - APIs avoid trusting client-submitted role identifiers for sensitive filtering.

3. Event-to-UI consistency through RTK Query
   - Mutations invalidate relevant tags.
   - Dependent dashboard widgets refresh automatically.
   - Teams achieve synchronized multi-panel views without manual refresh logic.

4. Shared UI and composability
   - Dashboard shells, cards, tables, drawers, and forms are reused across teams.
   - Team-specific features are implemented as composable page modules over shared primitives.

<a id="end-to-end-integrated-flow"></a>
<h3><strong>🛤️ Example End-to-End Integrated Flow</strong></h3>

**Manager referral submission to practitioner action:**
1. Manager selects employee and service, enters clinical reason, submits referral.
2. Referral stored in referrals collection with pending lifecycle status.
3. Admin/practitioner assignment updates status and practitioner linkage.
4. Practitioner dashboard displays referral and related appointment actions.
5. Appointment changes update employee dashboard and notify relevant users.
6. All affected views refresh from cache invalidation and role-scoped queries.

---

<a id="user-story-breakdown"></a>
<h1><strong>3. 📖 Comprehensive User Story Breakdown (By Team)</strong></h1>

<a id="team-a"></a>
<h3><strong>👥 Team A - TMA-001</strong></h3>
**👤 User Story:** As a manager, I want to submit a referral on behalf of a team member so that they can access the right occupational health service. Done by Mahdi.

**🔧 End-to-End Implementation:**
- Backend persists manager-created referral entries with employee identity, selected service type, and submission metadata.
- Manager identity is resolved from authenticated session token and attached server-side.
- Frontend manager referral form binds team-member selector and service selector to validated request body.
- On success, referral list cache refreshes so newly created referrals appear immediately.

**🧩 APIs Used & Data Contracts:**
- POST /api/referrals
- Request payload (example):
```json
{
  "patientClerkUserId": "user_2abc...",
  "serviceType": "Mental Health",
  "referralReason": "Prolonged stress symptoms",
  "notes": "Requested early occupational assessment"
}
```
- Response JSON (example):
```json
{
  "success": true,
  "message": "Referral created successfully",
  "data": {
    "_id": "67f...",
    "patientClerkUserId": "user_2abc...",
    "submittedByClerkUserId": "user_manager...",
    "serviceType": "Mental Health",
    "referralStatus": "pending",
    "createdAt": "2026-03-14T10:11:12.000Z"
  }
}

```
**🗄️ Database Collections:**
- referrals
  - patientClerkUserId
  - submittedByClerkUserId
  - serviceType
  - referralReason
  - notes
  - referralStatus
  - createdAt
- users
  - clerkUserId
  - role
  - managerClerkUserId

**🖥️ Frontend Components:**
- Manager referral page in manager dashboard page module
- Shared form inputs, select controls, and button primitives
- RTK Query hook: create referral mutation
- Team lookup integration from users query layer

**🧪 Development Review:**
- What went well: secure token-derived manager identity reduced client-side tampering risk.
- Bottleneck: synchronizing team-member listing with referral form state.
- Handling: query invalidation and structured component state separation.

**📘 Learning Outcome:**
- Server-side identity derivation is critical for referral integrity and role-safe operations.

---

<h3><strong>👥 Team A - TMA-002</strong></h3>
**👤 User Story:** As a manager, I want to add a reason and supporting notes when submitting a referral so that practitioners have clinical context. Done by Mahdi.

**🔧 End-to-End Implementation:**
- Referral create flow enforces reason capture and allows optional/extended notes.
- Validation logic ensures text constraints before database write.
- Practitioners consume these fields in referral views for triage and preparation.

**🧩 APIs Used & Data Contracts:**
- POST /api/referrals
- Request payload (example):
```json
{
  "patientClerkUserId": "user_2abc...",
  "serviceType": "Physiotherapy",
  "referralReason": "Work-related back pain",
  "notes": "Pain has persisted for 3 weeks"
}
```
- Response JSON (example):
```json
{
  "success": true,
  "data": {
    "_id": "67f...",
    "referralReason": "Work-related back pain",
    "notes": "Pain has persisted for 3 weeks"
  }
}

```
**🗄️ Database Collections:**
- referrals
  - referralReason
  - notes
  - practitionerClerkUserId
  - referralStatus

**🖥️ Frontend Components:**
- Manager referral submission form
- Textarea and validation messages
- Practitioner referral detail cards consuming reason and notes

**🧪 Development Review:**
- What went well: context-rich referrals improved practitioner readiness.
- Bottleneck: ensuring consistent max-length validation across UI and API.
- Handling: centralized DTO constraints and aligned frontend checks.

**📘 Learning Outcome:**
- Clinical-context fields must be validated at both UI and API boundaries to preserve data quality.

---

<h3><strong>👥 Team A - TMA-003</strong></h3>
**👤 User Story:** As a manager, I want to view all referrals I have submitted so that I can track their progress. Done by Mahdi.

**🔧 End-to-End Implementation:**
- Dedicated manager submission endpoint returns token-scoped referrals.
- Backend supports filtering and search parameters.
- Frontend table renders referral ID, employee identity, service, submission date, status, and department context.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/my-submissions
- Query params supported: status, serviceType, search, dateFrom, dateTo, page, limit
- Response JSON (example):
```json
{
  "success": true,
  "data": [
    {
      "_id": "67f...",
      "patientClerkUserId": "user_emp...",
      "serviceType": "Mental Health",
      "referralStatus": "assigned",
      "createdAt": "2026-03-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24
  }
}

```
**🗄️ Database Collections:**
- referrals
  - submittedByClerkUserId
  - serviceType
  - referralStatus
  - createdAt
- users
  - department
  - firstName
  - lastName
  - email

**🖥️ Frontend Components:**
- Manager referral history table section
- Search/filter controls
- Status badge component
- Pagination component

**🧪 Development Review:**
- What went well: role-safe endpoint prevented cross-manager data leakage.
- Bottleneck: matching user display metadata with referral rows.
- Handling: joined view composition in frontend and optional enrichment strategy.

**📘 Learning Outcome:**
- A dedicated token-scoped endpoint simplifies frontend logic and strengthens privacy guarantees.

---

<h3><strong>👥 Team A - TMA-004</strong></h3>
**👤 User Story:** As a manager, I want to view the details of a specific referral of my team member so that I can see its current status and any updates. Done by Mahdi.

**🔧 End-to-End Implementation:**
- Single-referral endpoint returns lifecycle and assignment details.
- Manager detail panel shows read-only status timeline, assigned practitioner context, and manager-visible notes.
- UI prohibits post-submission edits to preserve audit consistency.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/:referralId
- Response JSON (example):
```json
{
  "success": true,
  "data": {
    "_id": "67f...",
    "patientClerkUserId": "user_emp...",
    "submittedByClerkUserId": "user_manager...",
    "practitionerClerkUserId": "user_prac...",
    "referralStatus": "in_progress",
    "referralReason": "Work stress symptoms",
    "notes": "Monitor weekly",
    "assignedDate": "2026-03-05T10:00:00.000Z",
    "updatedAt": "2026-03-07T08:25:00.000Z"
  }
}

```
**🗄️ Database Collections:**
- referrals
  - referralStatus
  - practitionerClerkUserId
  - assignedDate
  - notes
  - updatedAt
- users
  - practitioner profile fields for rendering assigned details

**🖥️ Frontend Components:**
- Manager referral detail drawer/modal
- Read-only detail panel
- Health data action button linked from referral row context

**🧪 Development Review:**
- What went well: immutable detail rendering reduced accidental workflow corruption.
- Bottleneck: ensuring only authorized manager views this referral detail.
- Handling: token-scoped authorization checks in controller layer.

**📘 Learning Outcome:**
- Read-only detail screens are essential in regulated flows where audit fidelity matters.

---

<h3><strong>👥 Team A - TMA-005</strong></h3>
**👤 User Story:** As a manager, I want to be able to interact with the backend endpoints and ensure I have up to date data on the referrals of my team. Done by Savindu.

**🔧 End-to-End Implementation:**
- Manager dashboard transitioned to live endpoint integration using RTK Query.
- Referral submission history and team-related referral updates now load from backend source of truth.
- Cache invalidation strategy keeps dashboard synchronized after create/update flows.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/my-submissions
- GET /api/users/me
- GET /api/users (role-gated where applicable)
- Response JSON shape (example for submissions):
```json
{
  "success": true,
  "data": [
    {
      "_id": "67f...",
      "serviceType": "Physiotherapy",
      "referralStatus": "pending",
      "createdAt": "2026-03-10T09:14:00.000Z"
    }
  ]
}

```
**🗄️ Database Collections:**
- referrals
- users

**🖥️ Frontend Components:**
- Manager dashboard overview panels
- Team section and referral history components
- RTK Query hooks for getMyReferrals and related user lookups

**🧪 Development Review:**
- What went well: replacing mock data improved data trust and operational relevance.
- Bottleneck: stale UI after mutations during early integration.
- Handling: tag-based invalidation on referral mutation endpoints.

**📘 Learning Outcome:**
- Reliable real-time dashboard behavior depends on disciplined cache strategy, not manual refresh patterns.

---

<h3><strong>👥 Team A - TMA-006</strong></h3>
**👤 User Story:** As a manager, I want to have a user friendly and quick referral process that is intuitive and responsive. Done by Savindu and Mahdi.

**🔧 End-to-End Implementation:**
- Sidebar-driven manager navigation reduces click depth for referral workflows.
- Team context and referral submission were consolidated to remove duplicate entry points.
- Responsive layout behavior ensures mobile and desktop referral actions remain accessible.

**🧩 APIs Used & Data Contracts:**
- GET /api/users or team-derived user set
- POST /api/referrals
- GET /api/referrals/my-submissions
- Response JSON patterns are consistent with shared referrals contract and users contract.

**🗄️ Database Collections:**
- users
  - managerClerkUserId
  - role
- referrals
  - patientClerkUserId
  - submittedByClerkUserId
  - referralStatus

**🖥️ Frontend Components:**
- Manager sidebar navigation components
- Team panel with inline referral action access
- Consolidated referral form section
- Shared UI cards, buttons, and form primitives

**🧪 Development Review:**
- What went well: workflow consolidation improved speed and reduced user confusion.
- Bottleneck: balancing discoverability with reduced navigation complexity.
- Handling: segmented icon navigation with contextual action placement.

**📘 Learning Outcome:**
- UX simplification in clinical operations is best achieved by task proximity and context-preserving design.

---

<a id="team-b"></a>
<h3><strong>👥 Team B - TMB-001</strong></h3>
**👤 User Story:** As a manager, I want to receive outcome reports for referrals I submitted where consent is given so that I can support the employee's return to work. Done by Tevin and Ovin (Frontend and Backend). Status: Not Done.

**🔧 End-to-End Implementation:**
- Planned architecture introduces consent-gated outcome report visibility tied to referral completion.
- Manager detail view should conditionally render outcome report when share_with_manager equals true.
- Notification event should inform manager when report becomes available.

**🧩 APIs Used & Data Contracts:**
- Planned GET /api/referrals/:referralId with embedded/linked outcome report
- Planned payload field:
```json
{
  "outcomeReport": {
    "shareWithManager": true,
    "summary": "Fit note and phased return recommendation",
    "recommendations": ["Remote work 2 days/week"]
  }
}
```
- Planned notify endpoint reuse:
  - GET /api/notifications

**🗄️ Database Collections:**
- referrals
  - referralStatus
  - completedDate
- medical_records or outcome report subdocument
  - shareWithManager
  - summary
  - recommendations
- notifications
  - title
  - message
  - isRead

**🖥️ Frontend Components:**
- Manager referral detail screen report section
- Notification center panel
- View-only report renderer (no download/print controls)

**🧪 Development Review:**
- What went well: consent-first data model is privacy aligned.
- Bottleneck: unresolved final schema contract for outcome report ownership and storage shape.
- Handling: feature remains backlog-blocked pending final API and schema implementation.

**📘 Learning Outcome:**
- Sensitive report sharing requires explicit consent flags and strict display constraints at both API and UI layers.

---

<h3><strong>👥 Team B - TMB-002</strong></h3>
**👤 User Story:** As a manager, I want to see workplace adjustment recommendations from outcome reports so that I can action them promptly. Done by Dulina and Esara (Frontend). Status: Not Done.

**🔧 End-to-End Implementation:**
- Planned manager report view includes highlighted recommendations and actionable status controls.
- Action confirmation should create auditable update logs and notify practitioner.

**🧩 APIs Used & Data Contracts:**
- Planned PATCH endpoint (example): /api/referrals/:referralId/recommendations/:recommendationId/actioned
- Planned request payload:
```json
{
  "actioned": true,
  "actionNote": "Adjusted workload and schedule"
}
```
- Planned response payload:
```json
{
  "success": true,
  "data": {
    "recommendationId": "rec_01",
    "actioned": true,
    "actionedAt": "2026-03-14T11:00:00.000Z"
  }
}

```
**🗄️ Database Collections:**
- medical_records or outcome report storage
  - recommendations array
  - actioned state fields
- users
  - practitioner/manager identity mapping
- notifications
  - practitioner alert records
- audit log structures
  - action metadata

**🖥️ Frontend Components:**
- Outcome report recommendations panel
- Actioned toggle/button group
- Status feedback toasts

**🧪 Development Review:**
- What went well: clear accountability model was identified early.
- Bottleneck: dependency on outcome-report feature completion and audit contract.
- Handling: deferred to later integration phase.

**📘 Learning Outcome:**
- Derived features should not be implemented before foundational report contracts stabilize.

---

<h3><strong>👥 Team B - TMB-003</strong></h3>
**👤 User Story:** As a manager, I want to receive an alert when an SLA deadline is approaching for one of my referrals so that I can escalate if needed. Done by Esara and Irusha (Frontend). Status: In Progress.

**🔧 End-to-End Implementation:**
- SLA calculation logic is intended to evaluate time-to-breach windows for referral milestones.
- Notification events should emit warning and critical states with deep links to referral details.
- Admin parallel notification path is part of escalation design.

**🧩 APIs Used & Data Contracts:**
- Existing notification retrieval:
  - GET /api/notifications
- Planned SLA scheduler/event payload (example):
```json
{
  "referralId": "67f...",
  "slaState": "warning",
  "hoursToBreach": 48,
  "recipientRole": "manager"
}
```
- Planned notification record example:
```json
{
  "title": "SLA Warning",
  "message": "Referral 67f... breaches in 48h",
  "deepLink": "/manager/dashboard/referral/67f..."
}

```
**🗄️ Database Collections:**
- referrals
  - createdAt
  - assignedDate
  - referralStatus
- notifications
  - userClerkUserId
  - title
  - message
  - isRead

**🖥️ Frontend Components:**
- Manager notifications page and badge counters
- Deep-link routing from notification item to referral details

**🧪 Development Review:**
- What went well: clear warning/critical threshold definition.
- Bottleneck: backend event scheduler and cross-role fan-out are still under implementation.
- Handling: frontend prepared for notification contract while backend pipeline progresses.

**📘 Learning Outcome:**
- Time-based alert systems require synchronized scheduler logic, notification schema, and role fan-out design.

---

<h3><strong>👥 Team B - TMB-004</strong></h3>
**👤 User Story:** As a manager, I want to configure my notification preferences so that I only receive alerts that are relevant to me. Done by Dulina and Irusha (Frontend). Status: Not Done.

**🔧 End-to-End Implementation:**
- Planned preference center should control in-app, email, and SMS channels by notification type.
- Preferences must persist at user-profile level and be honored by notification dispatch logic.

**🧩 APIs Used & Data Contracts:**
- Existing user profile update endpoint:
  - PUT /api/users/me
- Planned request payload extension:
```json
{
  "preferences": {
    "notifications": {
      "email": false,
      "sms": false,
      "inApp": true
    }
  }
}
```
- Planned response payload:
```json
{
  "success": true,
  "data": {
    "clerkUserId": "user_manager...",
    "preferences": {
      "notifications": {
        "email": false,
        "sms": false,
        "inApp": true
      }
    }
  }
}

```
**🗄️ Database Collections:**
- users
  - preferences.notifications.email
  - preferences.notifications.sms
  - planned preferences.notifications.inApp

**🖥️ Frontend Components:**
- Manager accessibility/preferences page
- Channel toggle controls and save action
- Success toast confirmation

**🧪 Development Review:**
- What went well: preference schema direction aligns with existing users model.
- Bottleneck: inApp channel field standardization is pending backend contract update.
- Handling: staged implementation approach with existing email/sms fields first.

**📘 Learning Outcome:**
- Preference-driven notifications need explicit schema ownership and dispatch-engine awareness.

---

<h3><strong>👥 Team B - TMB-005</strong></h3>
**👤 User Story:** As a manager, I want to update my personal details so that my contact information is always accurate. Done by Tevin and Ovin (Frontend and Backend).

**🔧 End-to-End Implementation:**
- Authenticated manager updates profile through self-service endpoint.
- Email remains identity-managed and protected from direct update in profile form.
- Updated data is persisted in users collection and reflected immediately in profile views.

**🧩 APIs Used & Data Contracts:**
- GET /api/users/me
- PUT /api/users/me
- Request payload (example):
```json
{
  "firstName": "Alex",
  "lastName": "Morgan",
  "phone": "07700900123",
  "department": "Operations",
  "dateOfBirth": "1993-05-18",
  "address": {
    "line1": "12 Market Street",
    "city": "Preston",
    "postcode": "PR1 2AB"
  }
}
```
- Response JSON (example):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "clerkUserId": "user_manager...",
    "firstName": "Alex",
    "department": "Operations"
  }
}

```
**🗄️ Database Collections:**
- users
  - firstName
  - lastName
  - phone
  - department
  - dateOfBirth
  - address
  - auditLog

**🖥️ Frontend Components:**
- Manager profile page
- Profile edit form controls
- Save/cancel actions and toast feedback

**🧪 Development Review:**
- What went well: clear separation of editable fields versus identity-managed fields.
- Bottleneck: field-level validation consistency across form and API.
- Handling: aligned validation and API-safe partial updates.

**📘 Learning Outcome:**
- Self-service profile modules are stronger when identity authority boundaries are explicit.

---

<h3><strong>👥 Team B - TMB-006</strong></h3>
**👤 User Story:** As a manager, I want to view health guidance documents and advice sheets so that I can proactively support my team. Done by Tevin and Ovin (Frontend and Backend).

**🔧 End-to-End Implementation:**
- Guidance and advice assets are surfaced in manager-facing support views.
- Search/filter interactions support topic and service navigation.
- Document viewing is optimized for in-browser consumption with controlled download behavior.

**🧩 APIs Used & Data Contracts:**
- Existing support data patterns are referral/service driven.
- Common retrieval routes used by related guidance context:
  - GET /api/referrals/my-submissions
  - GET /api/services
- Example response data used in guidance card rendering:
```json
{
  "serviceType": "MSK",
  "title": "Early Back-Care Guidance",
  "format": "pdf",
  "access": "view_or_download"
}

```
**🗄️ Database Collections:**
- services
  - name
  - category
  - duration
  - status
- medical_records or document metadata store (implementation dependent)
  - advice sheet metadata and access logs

**🖥️ Frontend Components:**
- Help/Advice style content panels
- Search and filter controls
- In-browser document viewer panel

**🧪 Development Review:**
- What went well: user-centered guidance discoverability improved manager support readiness.
- Bottleneck: source-of-truth decision for static versus dynamic document content.
- Handling: pragmatic rollout with filterable client rendering and backend alignment.

**📘 Learning Outcome:**
- Knowledge modules should be integrated with service taxonomy to improve relevance.

---

<a id="team-c"></a>
<h3><strong>👥 Team C - TMC-001</strong></h3>
**👤 User Story:** As a service user, I want to submit a self-referral, so that I can access services independently. Done by Vinuki and Senuthi (Frontend), Tharusha (Backend).

**🔧 End-to-End Implementation:**
- Employee-facing referral form captures service type, reason, and optional notes.
- Form validation gates submission until mandatory fields are complete.
- Backend creates referral with authenticated user context and default lifecycle status.
- GDPR disclaimer is displayed before submit to set consent expectations.

**🧩 APIs Used & Data Contracts:**
- POST /api/referrals
- Request payload (example):
```json
{
  "patientClerkUserId": "user_employee...",
  "serviceType": "Counselling",
  "referralReason": "Anxiety affecting work concentration",
  "notes": "Open to virtual sessions"
}
```
- Response JSON (example):
```json
{
  "success": true,
  "data": {
    "_id": "67f...",
    "patientClerkUserId": "user_employee...",
    "referralStatus": "pending",
    "createdAt": "2026-03-14T12:00:00.000Z"
  }
}

```
**🗄️ Database Collections:**
- referrals
  - patientClerkUserId
  - serviceType
  - referralReason
  - notes
  - referralStatus
- users
  - clerkUserId
  - role

**🖥️ Frontend Components:**
- Employee Submit Referral page
- Controlled inputs, select dropdown, validation state, submit button
- GDPR compliance disclaimer block

**🧪 Development Review:**
- What went well: strict validation reduced malformed referral creation.
- Bottleneck: ensuring referral payload excludes spoofable submitter fields.
- Handling: backend token-derived identity and DTO validation.

**📘 Learning Outcome:**
- Self-referral modules are secure when trust boundaries are enforced at API layer.

---

<h3><strong>👥 Team C - TMC-002</strong></h3>
**👤 User Story:** As a service user, I want to see my referral history, so that I can track my progress. Done by Vinuki and Senuthi (Frontend), Tharusha (Backend).

**🔧 End-to-End Implementation:**
- Employee dashboard retrieves referrals by employee identity.
- History table shows referral ID, submission date, service type, and status.
- Detail pop-up allows quick context inspection without navigating away.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/patient/:patientId
- Response JSON (example):
```json
{
  "success": true,
  "data": [
    {
      "_id": "67f...",
      "serviceType": "Counselling",
      "referralStatus": "assigned",
      "createdAt": "2026-02-22T10:10:00.000Z"
    }
  ]
}

```
**🗄️ Database Collections:**
- referrals
  - patientClerkUserId
  - serviceType
  - referralStatus
  - createdAt

**🖥️ Frontend Components:**
- Employee referral history table
- Status badge and details modal/pop-up
- Search/sort support where enabled

**🧪 Development Review:**
- What went well: history visibility improved user trust and progress awareness.
- Bottleneck: consistent status labeling across referral lifecycle states.
- Handling: centralized status badge mapping in frontend.

**📘 Learning Outcome:**
- Status transparency is a core adoption driver for self-service healthcare workflows.

---

<h3><strong>👥 Team C - TMC-003</strong></h3>
**👤 User Story:** As a service user, I want to see my past and upcoming appointments, so that I can manage my schedule. Done by Vinuki and Senuthi (Frontend), Tharusha (Backend).

**🔧 End-to-End Implementation:**
- Employee dashboard calls appointment endpoint with employee identity.
- UI separates or labels upcoming versus historical entries using scheduled date/time comparison.
- Timeline/table presentation supports quick schedule comprehension.

**🧩 APIs Used & Data Contracts:**
- GET /api/appointments/employee/:employeeId
- Response JSON (example):
```json
{
  "success": true,
  "data": [
    {
      "_id": "apt_01",
      "employeeId": "user_employee...",
      "practitionerId": "user_prac...",
      "scheduledDate": "2026-03-20T00:00:00.000Z",
      "scheduledTime": "10:30",
      "appointmentType": "video_call",
      "status": "confirmed"
    }
  ]
}

```
**🗄️ Database Collections:**
- appointments
  - employeeId
  - practitionerId
  - scheduledDate
  - scheduledTime
  - appointmentType
  - status
- referrals
  - referral linkage for appointment context

**🖥️ Frontend Components:**
- Employee overview appointments card/table
- Timeline or segmented list (past/upcoming)
- Date formatting and status chips

**🧪 Development Review:**
- What went well: live appointment feed improved scheduling clarity.
- Bottleneck: date-time normalization and timezone-safe rendering.
- Handling: standardized date utilities and consistent UI formatting.

**📘 Learning Outcome:**
- Schedule features require reliable temporal data handling to avoid trust-breaking UX issues.

---

<h3><strong>👥 Team C - TMC-004</strong></h3>
**👤 User Story:** As a service user, I want to toggle between dark and light mode, so that I can reduce eye strain depending on room lighting. Done by Vinuki and Senuthi (Frontend). Status: To Be Done.

**🔧 End-to-End Implementation:**
- Theme architecture now exists at platform level via Redux theme state and document class synchronization.
- Employee accessibility panel provides dark mode controls integrated with global store.
- For this story scope, final acceptance requires explicit employee-facing completion confirmation under Team C ownership.

**🧩 APIs Used & Data Contracts:**
- No backend API required for basic local theme persistence.
- Local persistence contract:
  - localStorage key stores theme mode string

**🗄️ Database Collections:**
- None required for local-only theme toggling.
- Optional future enhancement could store preference in users.preferences.

**🖥️ Frontend Components:**
- Employee accessibility page
- Global theme synchronization component
- Redux theme slice and selector/dispatch hooks

**🧪 Development Review:**
- What went well: centralized theme architecture supports multi-dashboard consistency.
- Bottleneck: story ownership and completion criteria alignment across teams.
- Handling: implementation-ready foundation with existing toggle and persistence behavior.

**📘 Learning Outcome:**
- Cross-team UI features benefit from centralized global state rather than per-page local state.

---

<h3><strong>👥 Team C - TMC-005</strong></h3>
**👤 User Story:** As a service user, I want to view a transparent list of service prices and durations, so that I can make an informed decision before submitting a referral. Done by Vinuki and Senuthi (Frontend).

**🔧 End-to-End Implementation:**
- Service listing table provides pre-referral decision support.
- Initial rollout used mock data, with architecture aligned to consume services API when required.
- Data presentation includes offering type, expected duration, and pricing indicators.

**🧩 APIs Used & Data Contracts:**
- Current or target live source:
  - GET /api/services
- Response JSON (example):
```json
{
  "success": true,
  "data": [
    {
      "_id": "svc_01",
      "name": "Physiotherapy Consultation",
      "category": "MSK",
      "duration": 45,
      "status": "active",
      "price": 85
    }
  ]
}

```
**🗄️ Database Collections:**
- services
  - name
  - category
  - duration
  - status
  - price

**🖥️ Frontend Components:**
- Employee services table/list component
- Filter/sort controls (where enabled)
- Submission pre-check context in referral page

**🧪 Development Review:**
- What went well: transparent service visibility improved referral decision confidence.
- Bottleneck: keeping mock and live schema fields aligned during transition.
- Handling: stable table schema and clear migration path to live endpoint.

**📘 Learning Outcome:**
- Early mock-driven UI is effective when contracts are designed for seamless API substitution.

---

<h3><strong>👥 Team C - TMC-006</strong></h3>
**👤 User Story:** As a service user, I want to see a high-level count of my total referral activity, so that I can quickly understand the volume of my engagement with clinical services. Done by Vinuki and Senuthi (Frontend), Tharusha (Backend).

**🔧 End-to-End Implementation:**
- Employee overview aggregates referral list into summary metric cards.
- Total referral count is calculated from live patient referral data.
- Metric updates as referral state changes occur.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/patient/:patientId
- Response JSON used for aggregation (example):
```json
{
  "success": true,
  "data": [
    { "_id": "r1", "referralStatus": "pending" },
    { "_id": "r2", "referralStatus": "completed" }
  ]
}
```
- Derived frontend metric:
  - totalReferrals = data.length

**🗄️ Database Collections:**
- referrals
  - patientClerkUserId
  - referralStatus

**🖥️ Frontend Components:**
- Employee overview KPI cards
- Referral data hook and memoized aggregations

**🧪 Development Review:**
- What went well: simple derived metric delivered immediate user value.
- Bottleneck: avoiding duplicate counting during async refresh states.
- Handling: single source query and guarded loading logic.

**📘 Learning Outcome:**
- KPI cards should be computed from canonical query data to remain trustworthy.

---

<h3><strong>👥 Team C - TMC-007</strong></h3>
**👤 User Story:** As a service user, I want a dedicated indicator for Pending Referrals, so that I can immediately identify how many requests are still awaiting clinical or administrative review. Done by Vinuki and Senuthi (Frontend), Tharusha (Backend).

**🔧 End-to-End Implementation:**
- Employee dashboard adds a pending-specific KPI derived from referral statuses.
- Pending count is computed using status filter logic on referral dataset.
- Indicator is displayed prominently for action awareness.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/patient/:patientId
- Response JSON (example):
```json
{
  "success": true,
  "data": [
    { "_id": "r1", "referralStatus": "pending" },
    { "_id": "r2", "referralStatus": "assigned" }
  ]
}
```
- Derived frontend metric:
  - pendingReferrals = data.filter(item => item.referralStatus === "pending").length

**🗄️ Database Collections:**
- referrals
  - patientClerkUserId
  - referralStatus
  - createdAt

**🖥️ Frontend Components:**
- Employee overview pending KPI card
- Status-aware card styling and trend display (if configured)

**🧪 Development Review:**
- What went well: dedicated pending metric improved attention to unresolved care requests.
- Bottleneck: handling expanded status enums beyond basic pending/completed labels.
- Handling: explicit mapping logic for supported states.

**📘 Learning Outcome:**
- Focused operational indicators should map directly to actionable workflow states.

---

<a id="team-d"></a>
<h3><strong>👥 Team D - TMD-001</strong></h3>
**👤 User Story:** As a manager, I want to receive a notification when the status of my referral changes so that I am kept informed. Done by Ramiru.

**🔧 End-to-End Implementation:**
- Referral status transitions generate notification events for submitting managers.
- Notifications are persisted server-side and surfaced in manager dashboard notification views.
- Frontend provides mark-as-read behavior and deep link navigation back to referral context.

**🧩 APIs Used & Data Contracts:**
- GET /api/notifications
- PATCH /api/notifications/:notificationId/read
- Example notification payload:
```json
{
  "_id": "notif_01",
  "title": "Referral Status Updated",
  "message": "Referral 67f... moved to In Progress",
  "referralId": "67f...",
  "isRead": false,
  "createdAt": "2026-03-14T12:30:00.000Z"
}

```
**🗄️ Database Collections:**
- notifications
  - title
  - message
  - isRead
  - createdAt
- referrals
  - referralStatus
  - submittedByClerkUserId

**🖥️ Frontend Components:**
- Manager notification list panel
- Notification badge/counter in dashboard shell
- Referral deep-link handling in manager pages

**🧪 Development Review:**
- What went well: event-driven update pattern increased manager visibility.
- Bottleneck: ensuring idempotent notification generation during repeated status updates.
- Handling: status-change guard logic and read-state controls.

**📘 Learning Outcome:**
- Notification quality improves when domain events are explicit and traceable.

---

<h3><strong>👥 Team D - TMD-002</strong></h3>
**👤 User Story:** As a manager, I want to cancel a referral I submitted (while pending) so that the queue is kept accurate. Done by Sajana.

**🔧 End-to-End Implementation:**
- Backend enforces cancellation only when referralStatus is pending.
- Cancellation requires reason capture and writes cancellation metadata.
- Employee/Admin visibility is updated via status and notification propagation.

**🧩 APIs Used & Data Contracts:**
- PUT /api/referrals/:referralId/cancel
- Request payload:
```json
{
  "reason": "Issue resolved through internal support"
}
```
- Response payload:
```json
{
  "success": true,
  "message": "Referral cancelled successfully",
  "data": {
    "_id": "67f...",
    "referralStatus": "cancelled",
    "cancellationReason": "Issue resolved through internal support",
    "cancelledDate": "2026-03-14T12:45:00.000Z"
  }
}

```
**🗄️ Database Collections:**
- referrals
  - referralStatus
  - cancellationReason
  - cancelledDate
  - submittedByClerkUserId
- notifications
  - recipient identity and message fields

**🖥️ Frontend Components:**
- Manager referral row action menu
- Cancellation confirmation modal with reason field
- Status badge updates in referral table/history

**🧪 Development Review:**
- What went well: guardrails prevented invalid queue manipulation.
- Bottleneck: handling race conditions when referral state changes mid-action.
- Handling: backend state revalidation before final write.

**📘 Learning Outcome:**
- Workflow cancellation should always be state-constrained and reason-audited.

---

<h3><strong>👥 Team D - TMD-003</strong></h3>
**👤 User Story:** As a manager, I want to see an aggregated health overview of my team so that I can identify trends and support wellbeing. Done by Omidu.

**🔧 End-to-End Implementation:**
- Team-level analytics aggregate referral volumes and resolution timings without exposing individual clinical data.
- Dashboard filters date ranges and summarizes anonymized trends.
- Snapshot-oriented data model supports responsive visualization.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/my-submissions (source input)
- Planned/derived analytics endpoint pattern:
  - GET /api/analytics/team-overview?range=90d
- Example response:
```json
{
  "totalReferrals": 42,
  "byServiceType": {
    "Mental Health": 18,
    "MSK": 14,
    "Other": 10
  },
  "avgResolutionDays": 9.6
}

```
**🗄️ Database Collections:**
- referrals
  - serviceType
  - referralStatus
  - createdAt
  - completedDate
- analytics_snapshots
  - pre-aggregated trend records

**🖥️ Frontend Components:**
- Manager insights dashboard charts/cards
- Date-range filter controls
- Service breakdown visualizations (Recharts)

**🧪 Development Review:**
- What went well: anonymized aggregation met privacy and operational goals.
- Bottleneck: balancing real-time calculations with dashboard performance.
- Handling: nightly refresh and snapshot strategy.

**📘 Learning Outcome:**
- Aggregate analytics must prioritize privacy-preserving design by default.

---

<h3><strong>👥 Team D - TMD-004</strong></h3>
**👤 User Story:** As a manager, I want to see SLA compliance stats for my team's referrals so that I can escalate breaches. Done by Sajana.

**🔧 End-to-End Implementation:**
- SLA calculations classify referrals into compliant and breached cohorts.
- Dashboard renders RAG indicators, breach counts, and average assignment time.
- Drilldown workflows expose breached referral subsets for action.

**🧩 APIs Used & Data Contracts:**
- Planned SLA endpoint:
  - GET /api/analytics/sla-compliance?range=30d
- Example response:
```json
{
  "withinSLA": 82,
  "breached": 18,
  "avgDaysToAssignment": 2.4,
  "rag": "amber",
  "breachList": ["67f...", "67e..."]
}

```
**🗄️ Database Collections:**
- referrals
  - createdAt
  - assignedDate
  - referralStatus
- analytics_snapshots
  - SLA summary snapshots

**🖥️ Frontend Components:**
- Manager insights SLA KPI cards
- Breach drilldown table
- Export action controls (CSV)

**🧪 Development Review:**
- What went well: business-facing KPIs made escalation routes actionable.
- Bottleneck: defining SLA windows consistently across statuses.
- Handling: centralized SLA rules and derived metric normalization.

**📘 Learning Outcome:**
- SLA dashboards are strongest when definitions are shared, versioned, and testable.

---

<h3><strong>👥 Team D - TMD-005</strong></h3>
**👤 User Story:** As a manager, I want an in-depth wellbeing analytics view so that I can spot department-level health patterns over time. Done by Ramiru.

**🔧 End-to-End Implementation:**
- Multi-window trend analytics (3/6/12 months) provide longitudinal insight.
- Comparatives against organization baseline highlight abnormal movement.
- Print/export support enables leadership reporting workflows.

**🧩 APIs Used & Data Contracts:**
- Planned analytics endpoints:
  - GET /api/analytics/wellbeing-trends?range=12m
  - GET /api/analytics/org-benchmark?range=12m
- Example response:
```json
{
  "trend": [
    { "month": "2025-10", "count": 11 },
    { "month": "2025-11", "count": 14 }
  ],
  "orgAverage": 12.3,
  "departmentAverage": 13.8
}

```
**🗄️ Database Collections:**
- referrals
  - createdAt
  - serviceType
  - referralStatus
- analytics_snapshots
  - trend datasets

**🖥️ Frontend Components:**
- Manager insights advanced chart area
- Range toggles and print/export actions
- Comparison cards against org averages

**🧪 Development Review:**
- What went well: trend-focused storytelling improved decision support.
- Bottleneck: rendering large trend datasets while retaining responsiveness.
- Handling: compact snapshots and chart-level memoization.

**📘 Learning Outcome:**
- Strategic dashboards require both temporal context and benchmark context.

---

<h3><strong>👥 Team D - TMD-006</strong></h3>
**👤 User Story:** No user story text provided in backlog for TMD-006. Status: Unspecified.

**🔧 End-to-End Implementation:**
- Placeholder entry reserved for future manager module scope.
- No database, API, or UI implementation currently linked.

**🧩 APIs Used & Data Contracts:**
- Not yet defined.

**🗄️ Database Collections:**
- Not yet defined.

**🖥️ Frontend Components:**
- Not yet defined.

**🧪 Development Review:**
- What went well: backlog ID reserved for future expansion.
- Bottleneck: missing acceptance criteria prevents engineering estimation.
- Handling: keep story parked until product definition is finalized.

**📘 Learning Outcome:**
- Backlog completeness directly affects technical planning quality.

---

<h3><strong>👥 Team D - TMD-007</strong></h3>
**👤 User Story:** No user story text provided in backlog for TMD-007. Status: Unspecified.

**🔧 End-to-End Implementation:**
- Placeholder entry reserved for future manager module scope.
- No implementation artifacts available yet.

**🧩 APIs Used & Data Contracts:**
- Not yet defined.

**🗄️ Database Collections:**
- Not yet defined.

**🖥️ Frontend Components:**
- Not yet defined.

**🧪 Development Review:**
- What went well: identifier reserved for future tracking continuity.
- Bottleneck: no acceptance criteria or owner mapping.
- Handling: defer to refinement sprint.

**📘 Learning Outcome:**
- Empty stories should be refined early to reduce delivery risk.

---

<a id="team-e"></a>
<h3><strong>👥 Team E - TME-001</strong></h3>
**👤 User Story:** As a user, I want to receive notifications about appointments and outcomes, so that I stay informed. Done by Abhiman (BackEnd) and Methmi (FrontEnd).

**🔧 End-to-End Implementation:**
- Employee receives in-app notifications for referral submissions and related workflow changes.
- Notification polling in frontend provides near real-time updates.
- Notification cards show title, reason context, service type, and timestamps.

**🧩 APIs Used & Data Contracts:**
- GET /api/notifications
- PATCH /api/notifications/:notificationId/read
- Example response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "notif_23",
      "title": "Referral Submitted",
      "serviceType": "MSK",
      "message": "Your referral has been logged",
      "isRead": false,
      "createdAt": "2026-03-14T13:00:00.000Z"
    }
  ]
}

```
**🗄️ Database Collections:**
- notifications
  - title
  - message
  - serviceType
  - isRead
  - createdAt

**🖥️ Frontend Components:**
- Employee Notifications page
- Notification polling hook and list renderer
- Mark-as-read actions and unread indicator badges

**🧪 Development Review:**
- What went well: polling cadence gave timely user feedback.
- Bottleneck: balancing polling frequency with network overhead.
- Handling: interval optimization and lightweight payload rendering.

**📘 Learning Outcome:**
- In-app notifications are most effective when freshness and performance are balanced.

---

<h3><strong>👥 Team E - TME-002</strong></h3>
**👤 User Story:** As a user, I want to update my personal details, so that my records are up to date. Done by Praneepa (BackEnd) and Methmi (FrontEnd).

**🔧 End-to-End Implementation:**
- Employee profile edit form writes validated personal details to users collection.
- Email remains read-only and identity-managed through Clerk.
- Save actions trigger confirmation UI and refreshed profile state.

**🧩 APIs Used & Data Contracts:**
- GET /api/users/me
- PUT /api/users/me
- Request payload example:
```json
{
  "firstName": "Sam",
  "lastName": "Taylor",
  "phone": "07700900888",
  "department": "Finance",
  "dateOfBirth": "1994-04-10",
  "address": {
    "line1": "18 River Road",
    "city": "Leeds",
    "postcode": "LS1 4AA"
  }
}

```
**🗄️ Database Collections:**
- users
  - firstName
  - lastName
  - phone
  - department
  - dateOfBirth
  - address

**🖥️ Frontend Components:**
- EmployeeProfile and EmployeeProfileEdit pages
- Form controls, validation messaging, and success banner/toast

**🧪 Development Review:**
- What went well: robust self-service profile maintenance reduced admin dependency.
- Bottleneck: input normalization for phone/date/address fields.
- Handling: frontend constraints plus backend DTO validation.

**📘 Learning Outcome:**
- Profile integrity requires consistent validation at multiple layers.

---

<h3><strong>👥 Team E - TME-003</strong></h3>
**👤 User Story:** As a user, I want to see my upcoming appointments and advice sheet activity on my dashboard, so that I can stay on top of my health schedule. Done by Methmi (FrontEnd and BackEnd).

**🔧 End-to-End Implementation:**
- Employee overview combines appointment and medical-record access metrics.
- Upcoming appointment card computes count of future entries and days until next session.
- Advice-sheet card displays access count from medical record interaction logs.

**🧩 APIs Used & Data Contracts:**
- GET /api/appointments/employee/:employeeId
- GET /api/medical-records/access-count/:employeeId
- Example response (access count):
```json
{
  "success": true,
  "data": {
    "employeeId": "user_emp...",
    "accessCount": 7
  }
}

```
**🗄️ Database Collections:**
- appointments
  - employeeId
  - scheduledDate
  - status
- medical_records
  - accessLogs
  - employee references

**🖥️ Frontend Components:**
- EmployeeOverview stat cards
- Appointment summary logic and date-delta helpers
- Advice-sheet access metric card

**🧪 Development Review:**
- What went well: multi-source KPI composition improved dashboard utility.
- Bottleneck: coordinating two async data sources with consistent loading states.
- Handling: independent hooks with resilient fallback UI.

**📘 Learning Outcome:**
- Composite dashboards need explicit orchestration for multi-endpoint data coherence.

---

<h3><strong>👥 Team E - TME-004</strong></h3>
**👤 User Story:** As a user, I want the dashboard to have proper colour contrast, so that it is accessible and easy to read. Done by Abhiman (frontEnd). Status: To be done.

**🔧 End-to-End Implementation:**
- Accessibility goal targets WCAG AA contrast thresholds across text and UI controls.
- Theme layers and dashboard overrides provide baseline contrast improvements.
- Final acceptance requires formal contrast validation against all major components.

**🧩 APIs Used & Data Contracts:**
- No API dependency for visual contrast compliance.

**🗄️ Database Collections:**
- None.

**🖥️ Frontend Components:**
- Employee dashboard surfaces, cards, buttons, modals, badges
- Theme and CSS tokens governing light/dark contrast behavior

**🧪 Development Review:**
- What went well: global theming foundation supports broad accessibility remediation.
- Bottleneck: auditing every component state (hover, disabled, modal overlays).
- Handling: staged visual QA and targeted CSS overrides.

**📘 Learning Outcome:**
- Accessibility compliance must include state-based contrast checks, not only static screens.

---

<h3><strong>👥 Team E - TME-005</strong></h3>
**👤 User Story:** No user story text provided in backlog for TME-005. Status: Unspecified.

**🔧 End-to-End Implementation:**
- Placeholder entry retained for employee module expansion.

**🧩 APIs Used & Data Contracts:**
- Not yet defined.

**🗄️ Database Collections:**
- Not yet defined.

**🖥️ Frontend Components:**
- Not yet defined.

**🧪 Development Review:**
- What went well: reserved backlog continuity.
- Bottleneck: missing requirements and ownership.
- Handling: pending product refinement.

**📘 Learning Outcome:**
- Placeholder stories should quickly mature into actionable tickets.

---

<h3><strong>👥 Team E - TME-006</strong></h3>
**👤 User Story:** No user story text provided in backlog for TME-006. Status: Unspecified.

**🔧 End-to-End Implementation:**
- No implementation scope available at present.

**🧩 APIs Used & Data Contracts:**
- Not yet defined.

**🗄️ Database Collections:**
- Not yet defined.

**🖥️ Frontend Components:**
- Not yet defined.

**🧪 Development Review:**
- What went well: backlog ID reserved.
- Bottleneck: cannot estimate without acceptance criteria.
- Handling: deferred to refinement cycle.

**📘 Learning Outcome:**
- Clear story definition is prerequisite for predictable delivery.

---

<a id="team-f"></a>
<h3><strong>👥 Team F - TMF-001</strong></h3>
**👤 User Story:** As an Admin, I want to log in and access the User Role Management Console so that I can manage user accounts securely. Done by Mirco (BackEnd) and Danuja (FrontEnd).

**🔧 End-to-End Implementation:**
- Admin authentication is handled by Clerk session identity and token validation.
- Protected dashboard routes restrict user-management console to admin users.
- User management pages load only after role-gated API authorization succeeds.

**🧩 APIs Used & Data Contracts:**
- GET /api/users (admin-only)
- GET /api/users/me
- Example admin guard outcome:
```json
{
  "success": false,
  "message": "Forbidden: Admin role required"
}

```
**🗄️ Database Collections:**
- users
  - role
  - clerkUserId
  - isActive

**🖥️ Frontend Components:**
- Admin dashboard layout and navigation shell
- User role management console page
- ProtectedLayout with role checks

**🧪 Development Review:**
- What went well: defense-in-depth with client and server role checks.
- Bottleneck: role metadata synchronization between auth provider and app DB.
- Handling: update role APIs and refresh user context after changes.

**📘 Learning Outcome:**
- RBAC should be enforced server-first, with frontend acting as usability layer.

---

<h3><strong>👥 Team F - TMF-002</strong></h3>
**👤 User Story:** As an Admin, I want to view a list of all users filterable by role so that I can quickly locate specific accounts. Done by Isuru (BackEnd) and Upeka (FrontEnd).

**🔧 End-to-End Implementation:**
- Admin user list endpoint supports role filters and list retrieval.
- Frontend table provides role-based filtering and account-status visibility.
- Data table patterns enable rapid account lookup and triage actions.

**🧩 APIs Used & Data Contracts:**
- GET /api/users?role=manager&page=1&limit=20
- Example response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "usr_01",
      "firstName": "Ava",
      "lastName": "Lee",
      "email": "ava@healthmatters.com",
      "role": "manager",
      "isActive": true
    }
  ]
}

```
**🗄️ Database Collections:**
- users
  - firstName
  - lastName
  - email
  - role
  - isActive

**🖥️ Frontend Components:**
- Admin users table page
- Role filter dropdown/select
- Search and pagination controls

**🧪 Development Review:**
- What went well: structured table and filtering improved admin efficiency.
- Bottleneck: handling larger datasets with responsive UI.
- Handling: server-side filter params and lazy rendering.

**📘 Learning Outcome:**
- Administrative tools should prioritize filterability and action speed.

---

<h3><strong>👥 Team F - TMF-003</strong></h3>
**👤 User Story:** As an Admin, I want to create new user accounts so that new staff members can access the system. Done by Mirco (BackEnd) and Idusha (FrontEnd).

**🔧 End-to-End Implementation:**
- Admin create-user form validates required fields and role selection.
- Backend prevents duplicate emails and persists role-assigned account records.
- Success messaging confirms creation and updates the user list.

**🧩 APIs Used & Data Contracts:**
- POST /api/users
- Request payload:
```json
{
  "firstName": "Nina",
  "lastName": "Cole",
  "email": "nina@healthmatters.com",
  "role": "practitioner"
}
```
- Response payload:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "usr_12",
    "email": "nina@healthmatters.com",
    "role": "practitioner"
  }
}

```
**🗄️ Database Collections:**
- users
  - firstName
  - lastName
  - email
  - role
  - clerkUserId (when synced)

**🖥️ Frontend Components:**
- Admin create-user modal/form
- Validation and duplicate-email feedback UI
- Success toast and table refresh behavior

**🧪 Development Review:**
- What went well: clear account onboarding flow.
- Bottleneck: syncing lifecycle across Clerk and local user store.
- Handling: role update and user refresh after successful creation.

**📘 Learning Outcome:**
- User provisioning flows require consistency between auth identity and domain profile records.

---

<h3><strong>👥 Team F - TMF-004</strong></h3>
**👤 User Story:** As an Admin, I want to edit user details so that staff information remains accurate. Done by Mirco (BackEnd) and Danuja (FrontEnd).

**🔧 End-to-End Implementation:**
- Admin can update user profile fields and role-affecting attributes from the users console.
- Backend validates and applies updates through protected route.
- Updated record is reflected immediately in user list and detail views.

**🧩 APIs Used & Data Contracts:**
- PUT /api/users/:userId
- Request payload example:
```json
{
  "firstName": "Nina",
  "department": "Occupational Health",
  "phone": "07700111222"
}
```
- Response payload:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "usr_12",
    "department": "Occupational Health"
  }
}

```
**🗄️ Database Collections:**
- users
  - firstName
  - lastName
  - phone
  - department
  - auditLog

**🖥️ Frontend Components:**
- Admin edit-user form/modal
- Inline row actions in users table
- Save confirmation and optimistic feedback state

**🧪 Development Review:**
- What went well: centralized editing reduced data drift.
- Bottleneck: preventing accidental edits to sensitive fields.
- Handling: scoped editable fields and explicit role-protected endpoints.

**📘 Learning Outcome:**
- Admin editing interfaces should separate critical fields from routine profile attributes.

---

<h3><strong>👥 Team F - TMF-005</strong></h3>
**👤 User Story:** As an Admin, I want a centralized dashboard to view all incoming referrals so that I can manage referral intake efficiently. Done by Danuja (BackEnd) and Isuru (FrontEnd).

**🔧 End-to-End Implementation:**
- Admin referrals view aggregates all incoming referrals in a triage-friendly table.
- Sorting and search help prioritize assignment and workflow control.
- Row-level actions support assignment and lifecycle transitions.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals
- PUT /api/referrals/:referralId/assign
- PUT /api/referrals/:referralId/status
- Example referral list response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "67f...",
      "serviceType": "Mental Health",
      "referralStatus": "pending",
      "createdAt": "2026-03-12T09:00:00.000Z",
      "practitionerClerkUserId": null
    }
  ]
}

```
**🗄️ Database Collections:**
- referrals
  - serviceType
  - referralStatus
  - practitionerClerkUserId
  - createdAt
- users
  - practitioner identities for assignment

**🖥️ Frontend Components:**
- Admin referrals dashboard table
- Assignment dialogs and status controls
- Search/sort controls and status chips

**🧪 Development Review:**
- What went well: centralized intake streamlined admin operations.
- Bottleneck: keeping assignments and statuses consistent under concurrent actions.
- Handling: mutation invalidation and backend validation checks.

**📘 Learning Outcome:**
- Triage dashboards need fast list operations plus safe transactional updates.

---

<h3><strong>👥 Team F - TMF-006</strong></h3>
**👤 User Story:** As a sys owner, I want the platform to be GDPR compliant and ISO 27001 certified, so that data is secure and regulatory standards are met. Done by Mirco.

**🔧 End-to-End Implementation:**
- Security baseline includes Clerk tokens, guarded middleware, request validation, and CORS controls.
- Audit-friendly structures and role-restricted access reduce unauthorized exposure risk.
- Compliance posture is reinforced through secure coding patterns and centralized error handling.

**🧩 APIs Used & Data Contracts:**
- Cross-cutting security applies to all protected routes.
- Validation contracts implemented with Zod DTO schemas for inputs.

**🗄️ Database Collections:**
- users
  - auditLog
  - role
  - isActive
- referrals, appointments, medical_records
  - lifecycle and access-related timestamps

**🖥️ Frontend Components:**
- Protected route wrapper and role-gated navigation
- Secure token-based API integration via base query headers

**🧪 Development Review:**
- What went well: security concerns embedded at architecture level, not as add-ons.
- Bottleneck: ISO certification evidence collection beyond code implementation.
- Handling: phased compliance hardening and policy/process alignment.

**📘 Learning Outcome:**
- Regulatory alignment requires both technical controls and operational governance evidence.

---

<a id="team-g"></a>
<h3><strong>👥 Team G - TMG-001</strong></h3>
**👤 User Story:** As a practitioner, I want to access my appointment list, so that I can prepare for appointments effectively. Done by Charin, Helika and Vinuli.

**🔧 End-to-End Implementation:**
- Practitioner appointment endpoint returns role-scoped list entries.
- UI displays pending/assigned/confirmed categories for fast preparation.
- Live data synchronization reflects latest schedule changes.

**🧩 APIs Used & Data Contracts:**
- GET /api/appointments/practitioner/:practitionerId
- Example response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "apt_20",
      "referralId": "67f...",
      "scheduledDate": "2026-03-18T00:00:00.000Z",
      "scheduledTime": "09:30",
      "status": "assigned"
    }
  ]
}

```
**🗄️ Database Collections:**
- appointments
  - practitionerId
  - referralId
  - scheduledDate
  - scheduledTime
  - status

**🖥️ Frontend Components:**
- Practitioner appointments live page
- Status segmented tables/cards
- Respond/cancel action controls

**🧪 Development Review:**
- What went well: practitioner-focused status segmentation improved task readiness.
- Bottleneck: handling status nomenclature differences across referral and appointment domains.
- Handling: normalized frontend view mapping.

**📘 Learning Outcome:**
- Role-tailored data views reduce cognitive load in operational dashboards.

---

<h3><strong>👥 Team G - TMG-002</strong></h3>
**👤 User Story:** As a practitioner, I want to refer users to other practitioners, so that they get right health support. Done by Vinuli.

**🔧 End-to-End Implementation:**
- Practitioner referral creation form captures reassignment referral context.
- Validation ensures mandatory data completeness before write.
- Newly created referrals enter managed intake flow for assignment lifecycle.

**🧩 APIs Used & Data Contracts:**
- POST /api/referrals
- Request payload example:
```json
{
  "patientClerkUserId": "user_emp...",
  "serviceType": "Specialist Mental Health",
  "referralReason": "Requires specialist review",
  "notes": "Escalated from general consultation"
}

```
**🗄️ Database Collections:**
- referrals
  - patientClerkUserId
  - practitionerClerkUserId
  - referralReason
  - referralStatus

**🖥️ Frontend Components:**
- Practitioner create-referral page
- Validated form controls and submission state handling

**🧪 Development Review:**
- What went well: in-context referral creation supported continuity of care.
- Bottleneck: aligning ownership between current and target practitioner pathways.
- Handling: status-based handoff rules and assignment workflow integration.

**📘 Learning Outcome:**
- Practitioner handoff flows need clear referral ownership semantics.

---

<h3><strong>👥 Team G - TMG-003</strong></h3>
**👤 User Story:** As a practitioner, I want to be able to cancel appointments if I am not able to attend them. Done by Vinuli.

**🔧 End-to-End Implementation:**
- Practitioner cancellation action updates appointment status and records cancellation metadata.
- Cancelled entries are removed or visually segregated from active diary list.
- Backend ensures practitioner ownership before allowing cancellation.

**🧩 APIs Used & Data Contracts:**
- PATCH /api/appointments/:appointmentId/cancel
- Response example:
```json
{
  "success": true,
  "message": "Appointment cancelled",
  "data": {
    "_id": "apt_20",
    "status": "cancelled",
    "cancelledAt": "2026-03-14T14:10:00.000Z"
  }
}

```
**🗄️ Database Collections:**
- appointments
  - status
  - cancellationReason
  - cancelledAt
  - practitionerId

**🖥️ Frontend Components:**
- Practitioner appointment action buttons
- Confirmation dialog and cancellation feedback toast

**🧪 Development Review:**
- What went well: cancellation flow protected schedule accuracy.
- Bottleneck: ensuring downstream users are informed after cancellation.
- Handling: status propagation and notification integration.

**📘 Learning Outcome:**
- Scheduling controls require robust ownership checks and clear status communication.

---

<h3><strong>👥 Team G - TMG-004</strong></h3>
**👤 User Story:** As a practitioner, I want to view statistics regarding my appointments so that I can track my performance. Done by Helika.

**🔧 End-to-End Implementation:**
- Dashboard counters compute assigned, pending, and confirmed totals from live data.
- Metrics refresh with API updates to maintain current operational visibility.
- Summary cards provide quick performance snapshot.

**🧩 APIs Used & Data Contracts:**
- GET /api/appointments/practitioner/:practitionerId
- Derived metrics example:
```json
{
  "pending": 5,
  "assigned": 8,
  "confirmed": 6
}

```
**🗄️ Database Collections:**
- appointments
  - practitionerId
  - status
  - scheduledDate

**🖥️ Frontend Components:**
- Practitioner overview KPI cards
- Appointment statistics computation layer

**🧪 Development Review:**
- What went well: high-signal counters improved practitioner planning.
- Bottleneck: defining which statuses belong to each KPI bucket.
- Handling: explicit status mapping in UI logic.

**📘 Learning Outcome:**
- KPI clarity depends on transparent and stable status taxonomy.

---

<h3><strong>👥 Team G - TMG-005</strong></h3>
**👤 User Story:** As a practitioner I want to be able to view and manage all referrals through a single dashboard for ease of access. Done by Charin, Helika and Vinuli.

**🔧 End-to-End Implementation:**
- Practitioner referral dashboard consolidates assigned referrals into searchable list.
- Search supports referral ID, patient ID, and service type.
- Accessibility-conscious labels and contrast patterns are included.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/practitioner/:practitionerId
- Example response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "67f...",
      "patientClerkUserId": "user_emp...",
      "serviceType": "MSK",
      "referralStatus": "assigned"
    }
  ]
}

```
**🗄️ Database Collections:**
- referrals
  - practitionerClerkUserId
  - patientClerkUserId
  - serviceType
  - referralStatus

**🖥️ Frontend Components:**
- Practitioner referral overview live table
- Search input and filter controls
- Accessible table headings and status chips

**🧪 Development Review:**
- What went well: unified referral workspace reduced navigation churn.
- Bottleneck: balancing rich filtering with simple UI controls.
- Handling: incremental filter model with clear search placeholders.

**📘 Learning Outcome:**
- Single-pane operational views improve throughput in clinician workflows.

---

<h3><strong>👥 Team G - TMG-006</strong></h3>
**👤 User Story:** As a practitioner, I want to be able to view my details in single page to ensure the details are shown are catered to me. Done by Helika.

**🔧 End-to-End Implementation:**
- Practitioner profile page retrieves authenticated user details and renders role-relevant attributes.
- Readable single-page layout centralizes identity and contact information.
- Supports trust and self-verification without navigation overhead.

**🧩 APIs Used & Data Contracts:**
- GET /api/users/me
- Example response:
```json
{
  "success": true,
  "data": {
    "firstName": "Chris",
    "lastName": "Parker",
    "role": "practitioner",
    "department": "Occupational Health",
    "email": "chris@healthmatters.com"
  }
}

```
**🗄️ Database Collections:**
- users
  - firstName
  - lastName
  - email
  - role
  - department

**🖥️ Frontend Components:**
- Practitioner profile page
- User details card and profile sections

**🧪 Development Review:**
- What went well: centralized profile display improved practitioner confidence in data correctness.
- Bottleneck: handling optional fields gracefully.
- Handling: fallback formatting and resilient rendering.

**📘 Learning Outcome:**
- Profile experiences should be complete even when optional fields are missing.

---

<a id="team-h"></a>
<h3><strong>👥 Team H - TMH-001</strong></h3>
**👤 User Story:** As an Admin, I want to view a list of all services with name, category, duration, and status so that I have a clear overview of the current service catalogue. Done by Piushan.

**🔧 End-to-End Implementation:**
- Services list endpoint supplies catalog rows for admin operations.
- Admin service table displays key fields with sorting/search capabilities.
- Fast-loading grid supports operational catalog governance.

**🧩 APIs Used & Data Contracts:**
- GET /api/services
- Example response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "svc_01",
      "name": "Physiotherapy",
      "category": "MSK",
      "duration": 45,
      "status": "active"
    }
  ]
}

```
**🗄️ Database Collections:**
- services
  - name
  - category
  - duration
  - status

**🖥️ Frontend Components:**
- Admin service management table
- Search bar and sortable column headers

**🧪 Development Review:**
- What went well: list-based view improved service catalog observability.
- Bottleneck: harmonizing status labels with booking availability semantics.
- Handling: consistent active/inactive status mapping.

**📘 Learning Outcome:**
- Catalog management requires clear status taxonomy and performant list rendering.

---

<h3><strong>👥 Team H - TMH-002</strong></h3>
**👤 User Story:** As an Admin, I want to create a new service with name, category, price, and duration so that new offerings are added to the platform. Done by Vishal.

**🔧 End-to-End Implementation:**
- Admin create-service form validates mandatory fields before submission.
- Backend rejects duplicate service names and persists valid records.
- UI confirms success and refreshes service list.

**🧩 APIs Used & Data Contracts:**
- POST /api/services
- Request payload:
```json
{
  "name": "Ergonomic Assessment",
  "category": "Workplace",
  "price": 95,
  "duration": 60,
  "status": "active"
}
```
- Response payload:
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "_id": "svc_08",
    "name": "Ergonomic Assessment"
  }
}

```
**🗄️ Database Collections:**
- services
  - name
  - category
  - price
  - duration
  - status

**🖥️ Frontend Components:**
- Add Service dialog/form
- Validation messaging and confirmation toast

**🧪 Development Review:**
- What went well: strong validation prevented duplicate catalog clutter.
- Bottleneck: ensuring price/duration type consistency from UI to DB.
- Handling: typed inputs and backend schema constraints.

**📘 Learning Outcome:**
- Data-quality checks in create flows reduce downstream administrative maintenance.

---

<h3><strong>👥 Team H - TMH-003</strong></h3>
**👤 User Story:** As an Admin, I want to edit an existing service's details, pricing, and duration so that the service catalogue remains current and accurate. Done by Tenura.

**🔧 End-to-End Implementation:**
- Admin edit workflow updates existing service documents.
- Changes are reflected immediately in table and dependent views.
- Audit-aware update logic supports governance requirements.

**🧩 APIs Used & Data Contracts:**
- PUT /api/services/:serviceId
- Request payload example:
```json
{
  "price": 105,
  "duration": 50,
  "category": "MSK"
}

```
**🗄️ Database Collections:**
- services
  - category
  - price
  - duration
  - updatedAt

**🖥️ Frontend Components:**
- Edit Service modal/form
- Row action menu in service table

**🧪 Development Review:**
- What went well: edit-in-place pattern improved admin efficiency.
- Bottleneck: protecting immutable identifiers while allowing business field updates.
- Handling: scoped editable form fields.

**📘 Learning Outcome:**
- Service governance tools benefit from precise editable boundaries.

---

<h3><strong>👥 Team H - TMH-004</strong></h3>
**👤 User Story:** As an Admin, I want to deactivate or archive a service so that discontinued offerings are no longer bookable. Done by Shamal.

**🔧 End-to-End Implementation:**
- Deactivation flow updates service status and excludes inactive entries from booking paths.
- Confirmation dialog prevents accidental archival.
- KPI widgets react to active/inactive count changes.

**🧩 APIs Used & Data Contracts:**
- PUT /api/services/:serviceId (status update)
- Request payload:
```json
{
  "status": "inactive"
}
```
- Response payload:
```json
{
  "success": true,
  "data": {
    "_id": "svc_08",
    "status": "inactive"
  }
}

```
**🗄️ Database Collections:**
- services
  - status
  - updatedAt

**🖥️ Frontend Components:**
- Service row deactivate/archive action
- Confirmation dialog
- Service status overview cards

**🧪 Development Review:**
- What went well: confirmation gate reduced accidental operational impact.
- Bottleneck: ensuring historical referrals remain interpretable with inactive services.
- Handling: status-only archival without deleting historical references.

**📘 Learning Outcome:**
- Soft-state transitions are safer than destructive deletes in operational catalogs.

---

<h3><strong>👥 Team H - TMH-005</strong></h3>
**👤 User Story:** As an Admin, I want to view a summary stats bar showing Total Services, Active Services, Average Duration, and Inactive Services. Done by Usara.

**🔧 End-to-End Implementation:**
- Service KPI bar computes totals and averages from service collection data.
- Dashboard updates in response to service create/update/deactivate mutations.
- Metric cards provide at-a-glance service health.

**🧩 APIs Used & Data Contracts:**
- GET /api/services
- Derived KPI example:
```json
{
  "totalServices": 18,
  "activeServices": 15,
  "inactiveServices": 3,
  "averageDuration": 47
}

```
**🗄️ Database Collections:**
- services
  - duration
  - status

**🖥️ Frontend Components:**
- Admin service KPI summary bar/cards
- Derived metric utility functions

**🧪 Development Review:**
- What went well: compact KPI presentation increased dashboard scan efficiency.
- Bottleneck: keeping derived metrics stable during async data refresh.
- Handling: memoized computations from canonical query results.

**📘 Learning Outcome:**
- High-signal summaries should be derived from one authoritative data source.

---

<h3><strong>👥 Team H - TMH-006</strong></h3>
**👤 User Story:** As an Admin, I want to Categorise and tag services by specialty type for easier filtering and navigation. Done by Vishal. Status: Partial.

**🔧 End-to-End Implementation:**
- Tagging model is partially implemented to support specialty classification.
- Filtering behavior is available in selected views but not fully propagated across all booking and dashboard screens.
- Remaining work includes taxonomy management and full UI contract adoption.

**🧩 APIs Used & Data Contracts:**
- GET /api/services
- PUT /api/services/:serviceId
- Planned payload extension:
```json
{
  "tags": ["MSK", "Ergonomics", "ReturnToWork"]
}

```
**🗄️ Database Collections:**
- services
  - category
  - tags (partial/target)

**🖥️ Frontend Components:**
- Service filters and tag display chips
- Admin service edit form (partial tag controls)

**🧪 Development Review:**
- What went well: taxonomy direction established.
- Bottleneck: inconsistent tag availability across modules.
- Handling: phased rollout with backward-compatible service objects.

**📘 Learning Outcome:**
- Taxonomy features should be shipped with end-to-end schema and UI parity.

---

<a id="team-i"></a>
<h3><strong>👥 Team I - TMI-001</strong></h3>
**👤 User Story:** As a service user, I want to access a Help and Advice page so that I can view guidance and information related to my referrals. Done by Sasithi and Yovinma.

**🔧 End-to-End Implementation:**
- Employee dashboard includes Help and Advice navigation entry.
- Referral-linked guidance cards render key referral metadata and open detail panels.
- Contextual guidance improves self-service understanding during referral journey.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/patient/:patientId
- Example card data:
```json
{
  "referralId": "67f...",
  "serviceType": "Counselling",
  "submissionDate": "2026-03-01",
  "referralStatus": "in_progress"
}

```
**🗄️ Database Collections:**
- referrals
  - patientClerkUserId
  - serviceType
  - referralStatus
  - createdAt

**🖥️ Frontend Components:**
- Employee HelpAndAdvice page
- Referral card list and details panel

**🧪 Development Review:**
- What went well: contextualized guidance improved user confidence.
- Bottleneck: blending educational content with referral-specific details cleanly.
- Handling: card-plus-panel interaction model.

**📘 Learning Outcome:**
- Guidance content is more actionable when tied to live case context.

---

<h3><strong>👥 Team I - TMI-002</strong></h3>
**👤 User Story:** As a service user, I want to see a list of my referrals so that I can track the status of my care requests. Done by Sasithi and Yovinma.

**🔧 End-to-End Implementation:**
- Referral list page queries employee-scoped referrals and renders status-aware rows/cards.
- UI supports continuous progress tracking without admin intervention.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/patient/:patientId
- Response example:
```json
{
  "success": true,
  "data": [
    {
      "_id": "67f...",
      "serviceType": "MSK",
      "referralStatus": "pending"
    }
  ]
}

```
**🗄️ Database Collections:**
- referrals
  - patientClerkUserId
  - referralStatus
  - serviceType

**🖥️ Frontend Components:**
- Employee referral listing panel/page
- Status badges and list grouping patterns

**🧪 Development Review:**
- What went well: straightforward list design improved referral transparency.
- Bottleneck: handling empty and loading states elegantly.
- Handling: informative empty-state components and skeleton loading.

**📘 Learning Outcome:**
- Reliable list states (loading/empty/error) are essential for trust in self-service apps.

---

<h3><strong>👥 Team I - TMI-003</strong></h3>
**👤 User Story:** As a service user, I want to see the status of my referrals so that I know whether they are pending, in progress, or completed. Done by Sasithi and Yovinma.

**🔧 End-to-End Implementation:**
- Status badge component maps referralStatus values to color and label patterns.
- Referral cards display clear progress cues at a glance.
- Re-rendering reflects lifecycle updates from live API data.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/patient/:patientId
- Key field:
```json
{
  "referralStatus": "pending | in_progress | completed | assigned | cancelled"
}

```
**🗄️ Database Collections:**
- referrals
  - referralStatus

**🖥️ Frontend Components:**
- Status badge/chip component
- Referral cards in Help and Advice / history views

**🧪 Development Review:**
- What went well: visual status language made progress instantly understandable.
- Bottleneck: harmonizing multiple backend status values into user-friendly states.
- Handling: centralized status mapping utility.

**📘 Learning Outcome:**
- Semantic status abstraction improves UX without losing operational detail.

---

<h3><strong>👥 Team I - TMI-004</strong></h3>
**👤 User Story:** As a service user, I want to view the clinical summary provided by the practitioner so that I can understand the advice related to my referral. Done by Sasithi and Yovinma.

**🔧 End-to-End Implementation:**
- Completed referrals expose clinical-summary action in detail panel.
- UI conditionally renders practitioner guidance content.
- Fallback message appears when summary is absent.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/:referralId
- Example summary payload:
```json
{
  "_id": "67f...",
  "referralStatus": "completed",
  "clinicalSummary": "Continue graded activity and weekly follow-up"
}

```
**🗄️ Database Collections:**
- referrals or medical_records linkage
  - referralStatus
  - clinical summary/advice fields

**🖥️ Frontend Components:**
- Referral details panel with conditional summary section
- Empty-summary message component

**🧪 Development Review:**
- What went well: conditionally surfaced guidance improved relevance.
- Bottleneck: ensuring summary availability aligns with completion state timing.
- Handling: status-driven UI gating and null-safe rendering.

**📘 Learning Outcome:**
- Conditional clinical content should be tightly bound to validated workflow state.

---

<h3><strong>👥 Team I - TMI-005</strong></h3>
**👤 User Story:** As a service user, I want to receive general wellbeing guidance while my referral is being processed so that I can manage my health while waiting for clinical review. Done by Sasithi and Yovinma.

**🔧 End-to-End Implementation:**
- Guidance snippets and advice links are surfaced for in-progress referrals.
- Content provides interim self-care support while clinical workflow is underway.
- Guidance display complements, rather than replaces, clinician outcome summaries.

**🧩 APIs Used & Data Contracts:**
- GET /api/referrals/patient/:patientId
- GET /api/services
- Example guidance object:
```json
{
  "serviceType": "Mental Health",
  "guidanceTitle": "Managing Stress While Awaiting Review",
  "guidanceType": "general_wellbeing"
}

```
**🗄️ Database Collections:**
- referrals
  - referralStatus
  - serviceType
- services or guidance metadata source
  - category/topic mapping

**🖥️ Frontend Components:**
- Help and Advice guidance section/cards
- Referral-state-aware guidance rendering logic

**🧪 Development Review:**
- What went well: interim support reduced user uncertainty during waiting periods.
- Bottleneck: content governance and medical appropriateness controls.
- Handling: service-type aligned, non-diagnostic guidance scope.

**📘 Learning Outcome:**
- Interim wellbeing content can improve user experience without altering clinical decision pathways.

---

<h3><strong>👥 Team I - TMI-006</strong></h3>
**👤 User Story:** No user story text provided in backlog for TMI-006. Status: Unspecified.

**🔧 End-to-End Implementation:**
- Placeholder retained for future employee guidance/referral enhancements.

**🧩 APIs Used & Data Contracts:**
- Not yet defined.

**🗄️ Database Collections:**
- Not yet defined.

**🖥️ Frontend Components:**
- Not yet defined.

**🧪 Development Review:**
- What went well: backlog continuity maintained.
- Bottleneck: no acceptance criteria or scope boundaries.
- Handling: defer until product refinement.

**📘 Learning Outcome:**
- Undefined stories should be elaborated before sprint commitment.

---

<a id="team-j"></a>
<h3><strong>👥 Team J - TMJ-001</strong></h3>
**👤 User Story:** As a practitioner, I want to view recent patient reviews so that I can understand patient feedback about healthcare services. Done by Yahanima and Senithi (Front end).

**🔧 End-to-End Implementation:**
- Practitioner reviews dashboard fetches and displays recent review cards.
- Card layout includes patient name, star rating, and message.
- Data is role-scoped to current practitioner.

**🧩 APIs Used & Data Contracts:**
- GET /api/reviews?limit=4
- Example response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "rev_01",
      "patientName": "A. Brown",
      "rating": 5,
      "message": "Very supportive consultation"
    }
  ]
}

```
**🗄️ Database Collections:**
- reviews
  - practitionerClerkUserId
  - patientName
  - rating
  - message
  - createdAt

**🖥️ Frontend Components:**
- Practitioner reviews page
- Review card components and rating display elements

**🧪 Development Review:**
- What went well: concise card UI improved feedback readability.
- Bottleneck: ensuring enough contextual data without exposing sensitive details.
- Handling: minimal but meaningful review contract.

**📘 Learning Outcome:**
- Feedback UX should optimize readability and practitioner actionability.

---

<h3><strong>👥 Team J - TMJ-002</strong></h3>
**👤 User Story:** As a practitioner, I want to add a new review so that I can record patient feedback after treatment. Done by Irindu and Dulmin (Front end).

**🔧 End-to-End Implementation:**
- Review submission form captures reviewer name, message, and rating.
- Frontend validates required fields before submit.
- Backend persists new review and list refreshes.

**🧩 APIs Used & Data Contracts:**
- POST /api/reviews
- Request payload:
```json
{
  "patientName": "A. Brown",
  "rating": 4,
  "message": "Clear treatment explanation"
}
```
- Response payload:
```json
{
  "success": true,
  "data": {
    "_id": "rev_22",
    "rating": 4,
    "message": "Clear treatment explanation"
  }
}

```
**🗄️ Database Collections:**
- reviews
  - patientName
  - rating
  - message
  - practitionerClerkUserId

**🖥️ Frontend Components:**
- Review submission form component
- Validation UI and submit button states

**🧪 Development Review:**
- What went well: quick form flow encouraged timely feedback capture.
- Bottleneck: preventing low-quality empty-text submissions.
- Handling: form validation and required field constraints.

**📘 Learning Outcome:**
- Simple submission UX still needs robust quality gates.

---

<h3><strong>👥 Team J - TMJ-003</strong></h3>
**👤 User Story:** As a practitioner, I want to rate reviews using a star rating system so that feedback can be visually summarized. Done by Akith and Yahanima (Front end).

**🔧 End-to-End Implementation:**
- Interactive 5-star component captures discrete rating values.
- Selected states are visually highlighted for clear feedback.
- Rating value is included in persisted review payload.

**🧩 APIs Used & Data Contracts:**
- POST /api/reviews
- Rating field contract:
```json
{
  "rating": 1
}
```
  through
    {
      "rating": 5
    }

**🗄️ Database Collections:**
- reviews
  - rating
  - message

**🖥️ Frontend Components:**
- Star rating selector component
- Review form integration

**🧪 Development Review:**
- What went well: visual input lowered effort for structured scoring.
- Bottleneck: keyboard accessibility and focus-state polish.
- Handling: semantic button roles and clear active styling.

**📘 Learning Outcome:**
- Rating controls must support both visual appeal and accessible interaction.

---

<h3><strong>👥 Team J - TMJ-004</strong></h3>
**👤 User Story:** As a practitioner, I want to view a list of patients so that I can manage patient records efficiently. Done by Akith and Irindu (Front end and Backend). Status: In Progress.

**🔧 End-to-End Implementation:**
- Practitioner patient table displays key demographics and visit status.
- Backend data source and filtering are being integrated for full live operation.
- Action column enables detail access and future management actions.

**🧩 APIs Used & Data Contracts:**
- Planned patient list endpoint (implementation in progress):
  - GET /api/patients?practitionerId=:id
- Current view may rely on interim/mock data in UI.
- Target response example:
```json
{
  "success": true,
  "data": [
    {
      "patientId": "pat_01",
      "name": "Jamie Fox",
      "age": 34,
      "condition": "MSK",
      "lastVisitDate": "2026-03-02",
      "status": "active"
    }
  ]
}

```
**🗄️ Database Collections:**
- users (employee profiles)
- referrals/appointments (latest condition and visit metadata)
- optional dedicated patients view-model collection (if introduced)

**🖥️ Frontend Components:**
- Practitioner patients table page
- Table actions and status badges

**🧪 Development Review:**
- What went well: practical table schema already designed.
- Bottleneck: final backend endpoint and data-shaping contract still evolving.
- Handling: in-progress integration with staged UI completion.

**📘 Learning Outcome:**
- Complex list modules should define stable contracts early to reduce rework.

---

<h3><strong>👥 Team J - TMJ-005</strong></h3>
**👤 User Story:** As a practitioner, I want to search for patients so that I can quickly find specific patient records. Done by Senithi, Yahanima and Dulmin (Frontend).

**🔧 End-to-End Implementation:**
- Patient table search input filters records dynamically by patient name.
- Real-time filtering shortens navigation time in larger datasets.
- Search behavior is integrated with patient-list rendering pipeline.

**🧩 APIs Used & Data Contracts:**
- Client-side filtering over patient list payload.
- When server-side enabled, planned query contract:
  - GET /api/patients?search=jamie

**🗄️ Database Collections:**
- users/patients view model
  - firstName
  - lastName
  - display name fields

**🖥️ Frontend Components:**
- Practitioner patient search field
- Filtered table rendering logic

**🧪 Development Review:**
- What went well: immediate feedback improved findability.
- Bottleneck: search performance for large datasets if fully client-side.
- Handling: prepared path for server-side query params.

**📘 Learning Outcome:**
- Start with client-side search, then evolve to server-side when scale demands.

---

<h3><strong>👥 Team J - TMJ-006</strong></h3>
**👤 User Story:** As a practitioner, I want to view patient details in a modal popup so that I can access detailed information without leaving the page. Done by Akith and Irindu (Back end).

**🔧 End-to-End Implementation:**
- Patient detail modal opens from table row actions.
- Modal presents extended profile including contacts, condition, history, appointments, and notes.
- Keeps practitioner in workflow context without route transitions.

**🧩 APIs Used & Data Contracts:**
- Current/target detail retrieval pattern:
  - GET /api/patients/:patientId
- Example response:
```json
{
  "success": true,
  "data": {
    "patientId": "pat_01",
    "name": "Jamie Fox",
    "age": 34,
    "phone": "07700123456",
    "email": "jamie@company.com",
    "medicalHistory": "Prior lower-back pain",
    "appointments": ["apt_20", "apt_21"],
    "treatmentNotes": "Gradual workload increase"
  }
}

```
**🗄️ Database Collections:**
- users
- appointments
- medical_records
- referrals

**🖥️ Frontend Components:**
- Practitioner patient detail modal
- Trigger action buttons in patients table

**🧪 Development Review:**
- What went well: modal approach preserved task context and speed.
- Bottleneck: managing dense information layout in constrained modal space.
- Handling: sectioned content blocks and scrollable modal body.

**📘 Learning Outcome:**
- Context-preserving detail views improve operational efficiency in clinician UIs.

---

<h3><strong>👥 Team J - TMJ-007</strong></h3>
**👤 User Story:** As a practitioner, I want to view patient statistics so that I can monitor patient activity. Done by Dulmin, Yahanima and Senithi (Front end).

**🔧 End-to-End Implementation:**
- Practitioner dashboard includes patient-stat cards (total, active, new).
- KPI values are computed from patient list or derived endpoints.
- Summary cards support quick activity monitoring.

**🧩 APIs Used & Data Contracts:**
- Current/target patient dataset source:
  - GET /api/patients?practitionerId=:id
- Derived metrics example:
```json
{
  "totalPatients": 48,
  "activePatients": 31,
  "newPatients": 6
}

```
**🗄️ Database Collections:**
- users/patients records
  - status
  - createdAt
- referrals/appointments for activity derivation

**🖥️ Frontend Components:**
- Practitioner overview statistic cards
- Metric derivation and formatting helpers

**🧪 Development Review:**
- What went well: concise activity cards improved situational awareness.
- Bottleneck: agreeing on active/new definitions across modules.
- Handling: explicit metric definitions and shared helper logic.

**📘 Learning Outcome:**
- KPI usefulness depends on stable, documented business definitions.

---

- This document now covers Team A through Team J.
- Stories marked Not Done, Partial, In Progress, or Unspecified include implementation intent and current constraints.
- API examples are representative and aligned to the current MERN + Clerk architecture and backlog-defined behavior.
