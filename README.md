# Health Matters CRM System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![MERN Stack](https://img.shields.io/badge/stack-MERN-green.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0-green.svg)

> A comprehensive Customer Relationship Management system for Health Matters, built using Agile methodologies and the MERN stack.

**Module:** CO2007 - The Agile Professional  
**Institution:** University of Central Lancashire  
**Academic Year:** 2025/2026  
**Team Project:** Collaborative Software Development


## 🎯 About the Project

The Health Matters CRM is a modular, scalable system designed to streamline healthcare service management. This project is developed as part of the CO2007 module, emphasizing Agile software development practices, teamwork, and professional computing standards.

### Project Objectives

- Apply Agile techniques to deliver a team-based software project
- Develop interoperable modules that integrate seamlessly across teams
- Implement industry-standard security and compliance measures (GDPR, RBAC)
- Demonstrate professional software engineering practices

### Key Stakeholders

- **Employees:** Employees of the organization
- **Practitioners:** Healthcare professionals providing services
- **Managers:** Team leads managing referrals and staff
- **Administrators:** System administrators with full access


### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/health-matters-crm.git
cd health-matters-crm
```

2. **Install dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 🔌 API Endpoints

Base URL: `http://localhost:<PORT>/api`

All backend routes currently run behind Clerk middleware (`clerkMiddleware()`), so requests should include valid authentication when required by your environment setup.

### User Endpoints

#### 1) Get all users

- **Method:** `GET`
- **Path:** `/users`
- **Description:** Returns all users from the database.
- **Route Handler:** `getAllUsers`
- **Success Response:** `200 OK` with an array of user objects.
- **Error Response:** For server errors, request is passed to error middleware.

Example:

```bash
GET /api/users
```

#### 2) Update authenticated user

- **Method:** `PUT`
- **Path:** `/users/me`
- **Description:** Updates the authenticated user's information using Clerk ID from the authentication token.
- **Route Handler:** `updateUserByClerkId`
- **Authentication:** Required - Clerk ID extracted from auth token
- **Request Body:** Any updatable user fields (at least one required):
  - `userName` (string)
  - `firstName` (string)
  - `lastName` (string)
  - `phone` (string)
  - `dateOfBirth` (date)
  - `password` (string, min 8 chars)
  - `role` (`admin` | `practitioner` | `manager` | `employee`)
  - `address` (object with line1, line2, city, postcode)
  - `department` (string)
  - `isActive` (boolean)
  - `preferences` (object)
- **Note:** `clerkUserId` and `email` cannot be updated
- **Success Response:** `200 OK` with the updated user object.
- **Validation/Error Responses:**
  - `400 Bad Request` if validation fails or no fields provided.
  - `401 Unauthorized` if not authenticated.
  - `404 Not Found` if user doesn't exist.

Example:

```bash
PUT /api/users/me
Authorization: Bearer <clerk-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "07700 900999",
  "department": "Engineering"
}
```

---

### Referral Endpoints

#### 1) Get all referrals

- **Method:** `GET`
- **Path:** `/referrals`
- **Description:** Returns all referrals, sorted by newest first.
- **Route Handler:** `getAllReferrals`
- **Success Response:** `200 OK` with an array of referral objects.

#### 2) Get referrals by patient ID

- **Method:** `GET`
- **Path:** `/referrals/patient/:patientId`
- **Description:** Returns all referrals for the specified patient (`patientClerkUserId`).
- **Route Handler:** `getReferralsByPatientId`
- **Path Params:**
	- `patientId` (string, required)
- **Success Response:** `200 OK` with an array of referral objects.
- **Validation/Error Responses:**
	- `400 Bad Request` if `patientId` is missing.

#### 3) Get referrals by practitioner ID

- **Method:** `GET`
- **Path:** `/referrals/practitioner/:practitionerId`
- **Description:** Returns all referrals assigned to a practitioner (`practitionerClerkUserId`).
- **Route Handler:** `getReferralsByPractitionerId`
- **Path Params:**
	- `practitionerId` (string, required)
- **Success Response:** `200 OK` with an array of referral objects.
- **Validation/Error Responses:**
	- `400 Bad Request` if `practitionerId` is missing.

#### 4) Create a new referral

- **Method:** `POST`
- **Path:** `/referrals`
- **Description:** Creates a new referral record.
- **Route Handler:** `createReferral`
- **Required Body Fields:**
	- `patientClerkUserId` (string)
- **Optional Body Fields:**
	- `submittedByClerkUserId` (string)
	- `practitionerClerkUserId` (string)
	- `referralReason` (string)
	- `referralStatus` (`pending` | `accepted` | `rejected`)
	- `notes` (string)
	- `assignedbyClerkUserId` (string)
	- `assignedDate` (date)
	- `acceptedDate` (date)
	- `rejectedDate` (date)
	- `completedDate` (date)
- **Success Response:** `201 Created` with the created referral object.
- **Validation/Error Responses:**
	- `400 Bad Request` if `patientClerkUserId` is missing.

#### 5) Update referrals by patient ID

- **Method:** `PUT`
- **Path:** `/referrals/patient/:patientId`
- **Description:** Updates all referrals for the given patient.
- **Route Handler:** `updateReferralByPatientId`
- **Path Params:**
	- `patientId` (string, required)
- **Request Body:** Any updatable referral fields.
- **Success Response:** `200 OK` with:
	- confirmation message,
	- `modifiedCount`,
	- updated referrals list.
- **Validation/Error Responses:**
	- `400 Bad Request` if `patientId` is missing.
	- `404 Not Found` if no referrals exist for that patient.

#### 6) Delete referrals by patient ID

- **Method:** `DELETE`
- **Path:** `/referrals/patient/:patientId`
- **Description:** Deletes all referrals belonging to the given patient.
- **Route Handler:** `deleteReferralByPatientId`
- **Path Params:**
	- `patientId` (string, required)
- **Success Response:** `200 OK` with confirmation message and `deletedCount`.
- **Validation/Error Responses:**
	- `400 Bad Request` if `patientId` is missing.
	- `404 Not Found` if no referrals exist for that patient.

Referral examples:

```bash
# Get all referrals
GET /api/referrals

# Get by patient
GET /api/referrals/patient/patient_123

# Get by practitioner
GET /api/referrals/practitioner/practitioner_123

# Create referral
POST /api/referrals
Content-Type: application/json

{
	"patientClerkUserId": "patient_123",
	"submittedByClerkUserId": "staff_456",
	"serviceType": "Physiotherapy Assessment",
	"referralReason": "Physiotherapy assessment",
	"referralStatus": "pending",
	"notes": "Recurring lower back pain"
}
```

---

### Service Endpoints

#### 1) Get all services

- **Method:** `GET`
- **Path:** `/services`
- **Description:** Returns all services, optionally filtered by query parameters.
- **Route Handler:** `getAllServices`
- **Query Params (optional):**
  - `category` (`occupational_health` | `mental_health` | `physiotherapy` | `health_screening` | `counselling` | `ergonomic_assessment`)
  - `isActive` (boolean)
  - `name` (string)
- **Success Response:** `200 OK` with an array of service objects.
- **Validation/Error Responses:**
  - `400 Bad Request` if query params fail validation.

#### 2) Get service by ID

- **Method:** `GET`
- **Path:** `/services/:serviceId`
- **Description:** Returns a single service by its ID.
- **Route Handler:** `getServiceById`
- **Path Params:**
  - `serviceId` (string, required)
- **Success Response:** `200 OK` with the service object.
- **Validation/Error Responses:**
  - `400 Bad Request` if `serviceId` is missing.
  - `404 Not Found` if service doesn't exist.

#### 3) Create a new service

- **Method:** `POST`
- **Path:** `/services`
- **Description:** Creates a new service record.
- **Route Handler:** `createService`
- **Required Body Fields:**
  - `name` (string)
- **Optional Body Fields:**
  - `description` (string)
  - `category` (enum)
  - `defaultDuration` (number, 15-240)
  - `isActive` (boolean)
- **Success Response:** `201 Created` with the created service object.
- **Validation/Error Responses:**
  - `400 Bad Request` if validation fails.

#### 4) Update service by ID

- **Method:** `PUT`
- **Path:** `/services/:serviceId`
- **Description:** Updates an existing service.
- **Route Handler:** `updateServiceById`
- **Path Params:**
  - `serviceId` (string, required)
- **Request Body:** Any updatable service fields (at least one required).
- **Success Response:** `200 OK` with the updated service object.
- **Validation/Error Responses:**
  - `400 Bad Request` if validation fails.
  - `404 Not Found` if service doesn't exist.

#### 5) Delete service by ID

- **Method:** `DELETE`
- **Path:** `/services/:serviceId`
- **Description:** Deletes a service by its ID.
- **Route Handler:** `deleteServiceById`
- **Path Params:**
  - `serviceId` (string, required)
- **Success Response:** `200 OK` with confirmation message and deleted service.
- **Validation/Error Responses:**
  - `400 Bad Request` if `serviceId` is missing.
  - `404 Not Found` if service doesn't exist.

Service examples:

```bash
# Get all services
GET /api/services

# Get services by category
GET /api/services?category=physiotherapy&isActive=true

# Get service by ID
GET /api/services/507f1f77bcf86cd799439011

# Create service
POST /api/services
Content-Type: application/json

{
  "name": "Physiotherapy Assessment",
  "description": "Comprehensive physiotherapy assessment for musculoskeletal conditions",
  "category": "physiotherapy",
  "defaultDuration": 60,
  "isActive": true
}

# Update service
PUT /api/services/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "description": "Updated description",
  "isActive": false
}

# Delete service
DELETE /api/services/507f1f77bcf86cd799439011
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Health Matters** for providing the requirements and domain expertise
- **MSc User Experience Students** for conducting stakeholder interviews
- **CO2007 Module Team** for guidance and support
- **UCLan** for providing resources and infrastructure

## 📞 Support

For issues, questions, or contributions:

1. **GitHub Issues:** [Create an issue](https://github.com/your-org/health-matters-crm/issues)
2. **Module Leader:** Contact via Blackboard
3. **Documentation:** Check `/docs` folder

## 📝 Project Status

**Current Sprint:** Sprint 1 (Foundation & Setup)  
**Progress:** Module architecture defined, development environment setup in progress  
**Next Milestone:** Complete authentication system (Sprint 2-3)

**Built with ❤️ by the Health Matters CRM Team**  
*University of Central Lancashire | CO2007 - The Agile Professional*