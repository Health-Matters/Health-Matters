# Health Matters - Database Documentation

## Project Information

**Project Name:** Health Matters  
**Database:** MongoDB  
**Stack:** MERN (MongoDB, Express.js, React.js, Node.js)  
**Architecture:** Single Organization  
**Version:** 1.0  
**Date:** January 2026

---

## 1. Overview

### 1.1 Purpose

The Health Matters application is an occupational health management system designed for a single organization. It facilitates the complete referral workflow from submission through appointment scheduling, consultation, and outcome reporting.

### 1.2 Design Principles

- **Single Organization Architecture** - Optimized for one organization without multi-tenancy complexity
- **Role-Based Access Control** - Four user roles: Admin, Practitioner, Manager, Employee
- **Direct Relationships** - Manager-to-employee relationships via direct references
- **Embedded Data** - Questionnaires and configuration stored inline to reduce joins
- **GDPR Compliance** - Comprehensive access logging for medical records
- **SLA Tracking** - Built-in service level agreement monitoring

### 1.3 User Roles

| Role | Description |
|------|-------------|
| **Admin** | System administration, triage referrals, manage users and services |
| **Practitioner** | Manage appointments, access medical records, generate outcome reports |
| **Manager** | Submit referrals for team members, view team health data and reports |
| **Employee** | Submit self-referrals, view appointments, access outcome reports |

---

## 2. Database Structure

### 2.1 Database Name

```
health_matters_db
```

### 2.2 Collections Summary

The database consists of **7 core collections**:

1. **users** - All system users with role-based access control
2. **referrals** - Central hub for referral workflow management
3. **appointments** - Practitioner schedules and appointment booking
4. **services** - Catalog of available health services
5. **medical_records** - Clinical documentation with GDPR compliance
6. **notifications** - Multi-channel notification management
7. **analytics_snapshots** - Pre-aggregated metrics for dashboards (Optional)

---

## 3. Collection Schemas

### 3.1 Users Collection

**Collection Name:** `users`

**Purpose:** Stores all system users with role-based access control.

**Schema:**

```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: ['admin', 'practitioner', 'manager', 'employee']),
  
  // Personal Information
  firstName: String,
  lastName: String,
  phone: String,
  dateOfBirth: Date,
  address: {
    line1: String,
    line2: String,
    city: String,
    postcode: String
  },
  
  // Employment Information
  employeeId: String,
  department: String,
  managerId: ObjectId (ref: 'users'),
  
  // Practitioner-specific
  specialization: String,
  qualifications: [String],
  
  // System
  isActive: Boolean,
  lastLogin: Date,
  
  // Preferences
  preferences: {
    notifications: {
      email: Boolean,
      sms: Boolean
    }
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Fields:**
- `email` - Unique identifier for login
- `role` - Determines access permissions (admin, practitioner, manager, employee)
- `managerId` - Creates manager-employee relationship
- `isActive` - Soft delete flag

---

### 3.2 Referrals Collection

**Collection Name:** `referrals`

**Purpose:** Central hub for all referral workflow management.

**Schema:**

```javascript
{
  _id: ObjectId,
  referralNumber: String (unique, auto-generated, indexed),
  
  // People Involved
  employeeId: ObjectId (ref: 'users', indexed),
  referredById: ObjectId (ref: 'users'),
  assignedPractitionerId: ObjectId (ref: 'users', nullable, indexed),
  triagedById: ObjectId (ref: 'users'),
  
  // Referral Details
  type: String (enum: ['self_referral', 'manager_referral', 'follow_up']),
  serviceId: ObjectId (ref: 'services'),
  reasonForReferral: String,
  urgencyLevel: String (enum: ['routine', 'urgent', 'emergency']),
  
  // Status Tracking
  status: String (enum: [
    'submitted',
    'triaged',
    'appointed',
    'in_progress',
    'completed',
    'withdrawn',
    'cancelled'
  ]),
  
  // Questionnaires
  initialQuestionnaire: {
    completedAt: Date,
    responses: Object
  },
  
  followUpQuestionnaire: {
    completedAt: Date,
    responses: Object
  },
  
  // Outcome & Reports
  outcome: {
    summary: String,
    recommendations: String,
    reportGeneratedAt: Date,
    reportGeneratedBy: ObjectId (ref: 'users'),
    adviceNotes: String
  },
  
  // Follow-up Management
  followUp: {
    required: Boolean,
    recallDate: Date,
    notes: String,
    followUpReferralId: ObjectId (ref: 'referrals')
  },
  
  // SLA Tracking
  sla: {
    submittedAt: Date,
    triagedAt: Date,
    appointedAt: Date,
    completedAt: Date,
    daysToTriage: Number,
    daysToAppointment: Number,
    daysToCompletion: Number,
    breached: Boolean
  },
  
  // Audit Trail
  history: [{
    action: String,
    performedBy: ObjectId (ref: 'users'),
    performedByName: String,
    timestamp: Date,
    notes: String,
    previousStatus: String,
    newStatus: String
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Fields:**
- `referralNumber` - Unique identifier (e.g., "REF-2026-00001")
- `status` - Current state in workflow
- `sla` - Service level agreement tracking
- `history` - Complete audit trail

---

### 3.3 Appointments Collection

**Collection Name:** `appointments`

**Purpose:** Manages practitioner schedules and appointment booking.

**Schema:**

```javascript
{
  _id: ObjectId,
  
  // References
  referralId: ObjectId (ref: 'referrals', indexed),
  practitionerId: ObjectId (ref: 'users', indexed),
  employeeId: ObjectId (ref: 'users', indexed),
  
  // Scheduling
  scheduledDate: Date (indexed),
  scheduledTime: String,
  duration: Number,
  endTime: Date,
  
  // Location & Format
  location: String,
  appointmentType: String (enum: ['in_person', 'video_call', 'phone_call']),
  meetingLink: String,
  roomNumber: String,
  
  // Status
  status: String (enum: [
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
    'rescheduled'
  ]),
  
  // Clinical Documentation
  clinicalNotes: String,
  privateNotes: String,
  
  // Reminders
  reminders: [{
    type: String (enum: ['email', 'sms']),
    sentAt: Date,
    sentTo: ObjectId (ref: 'users')
  }],
  
  // Cancellation/Rescheduling
  cancellationReason: String,
  cancelledBy: ObjectId (ref: 'users'),
  cancelledAt: Date,
  rescheduledToAppointmentId: ObjectId (ref: 'appointments'),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Fields:**
- `practitionerId` - Links to practitioner's diary
- `scheduledDate` - For calendar queries
- `status` - Appointment state
- `clinicalNotes` - Documentation from consultation
- `employeeId` - Links to employee receiving service

---

### 3.4 Services Collection

**Collection Name:** `services`

**Purpose:** Catalog of available health services.

**Schema:**

```javascript
{
  _id: ObjectId,
  
  name: String,
  code: String (unique),
  description: String,
  
  category: String (enum: [
    'occupational_health',
    'mental_health',
    'physiotherapy',
    'health_screening',
    'counselling',
    'ergonomic_assessment'
  ]),
  
  // Configuration
  defaultDuration: Number,
  pricing: {
    internalCost: Number,
    clientCharge: Number,
    currency: String
  },
  
  // Questionnaires
  requiresInitialQuestionnaire: Boolean,
  initialQuestionnaireTemplate: {
    title: String,
    questions: [{
      id: String,
      question: String,
      type: String (enum: ['text', 'multiple_choice', 'yes_no', 'scale']),
      options: [String],
      required: Boolean
    }]
  },
  
  requiresFollowUpQuestionnaire: Boolean,
  followUpQuestionnaireTemplate: {
    title: String,
    questions: [Object]
  },
  
  // Access Control
  availableForSelfReferral: Boolean,
  requiresManagerApproval: Boolean,
  
  // Practitioners
  qualifiedPractitionerIds: [ObjectId] (ref: 'users'),
  
  isActive: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Fields:**
- `code` - Unique service identifier
- `questionnaireTemplates` - Embedded questionnaire structures
- `qualifiedPractitionerIds` - Who can deliver this service
- `availableForSelfReferral` - Access control

---

### 3.5 Medical Records Collection

**Collection Name:** `medical_records`

**Purpose:** Clinical documentation with GDPR compliance and access logging.

**Schema:**

```javascript
{
  _id: ObjectId,
  
  employeeId: ObjectId (ref: 'users', indexed),
  referralId: ObjectId (ref: 'referrals'),
  appointmentId: ObjectId (ref: 'appointments'),
  practitionerId: ObjectId (ref: 'users'),
  
  recordType: String (enum: [
    'consultation_notes',
    'assessment',
    'diagnosis',
    'treatment_plan',
    'test_results'
  ]),
  
  title: String,
  content: String,
  
  // GDPR Compliance - Access Logging
  accessLog: [{
    accessedBy: ObjectId (ref: 'users'),
    accessedByName: String,
    accessedByRole: String,
    accessedAt: Date,
    accessPurpose: String
  }],
  
  isArchived: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Fields:**
- `employeeId` - Patient record ownership
- `content` - Clinical information (consider encryption)
- `accessLog` - GDPR compliance tracking
- `isArchived` - Soft delete for retention policies

**Security Note:** Consider implementing field-level encryption for the `content` field containing sensitive medical information.

---

### 3.6 Notifications Collection

**Collection Name:** `notifications`

**Purpose:** Multi-channel notification management (email, SMS, in-app).

**Schema:**

```javascript
{
  _id: ObjectId,
  
  recipientId: ObjectId (ref: 'users', indexed),
  
  type: String (enum: [
    'referral_submitted',
    'referral_triaged',
    'referral_assigned',
    'appointment_scheduled',
    'appointment_reminder_24h',
    'appointment_reminder_1h',
    'appointment_cancelled',
    'outcome_report_ready',
    'follow_up_required'
  ]),
  
  title: String,
  message: String,
  
  // Related Entity
  relatedEntityType: String (enum: ['referral', 'appointment']),
  relatedEntityId: ObjectId,
  
  // Delivery Channels
  channels: {
    email: {
      sent: Boolean,
      sentAt: Date
    },
    sms: {
      sent: Boolean,
      sentAt: Date
    },
    inApp: {
      read: Boolean,
      readAt: Date
    }
  },
  
  priority: String (enum: ['low', 'medium', 'high']),
  
  createdAt: Date,
  expiresAt: Date
}
```

**Key Fields:**
- `recipientId` - Who receives the notification
- `type` - Notification category
- `channels` - Multi-channel delivery tracking
- `expiresAt` - Automatic cleanup date

---

### 3.7 Analytics Snapshots Collection (Optional)

**Collection Name:** `analytics_snapshots`

**Purpose:** Pre-aggregated metrics for dashboard performance.

**Schema:**

```javascript
{
  _id: ObjectId,
  
  snapshotType: String (enum: [
    'daily_summary',
    'weekly_summary',
    'monthly_summary'
  ]),
  
  period: {
    startDate: Date,
    endDate: Date
  },
  
  metrics: {
    totalReferrals: Number,
    selfReferrals: Number,
    managerReferrals: Number,
    completedReferrals: Number,
    
    avgDaysToTriage: Number,
    avgDaysToAppointment: Number,
    avgDaysToCompletion: Number,
    slaBreaches: Number,
    
    serviceBreakdown: Object,
    departmentBreakdown: Object,
    
    totalCost: Number
  },
  
  generatedAt: Date
}
```