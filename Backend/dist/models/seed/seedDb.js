"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./../User");
const Referral_1 = require("./../Referral");
const Service_1 = __importDefault(require("./../Service"));
const Notification_1 = __importDefault(require("./../Notification"));
const Appointment_1 = __importDefault(require("./../Appointment"));
const MedicalRecord_1 = __importDefault(require("./../MedicalRecord"));
dotenv_1.default.config();
const buildHistory = (entries) => entries.map((entry) => ({
    ...entry,
    changedAt: new Date(entry.changedAt),
}));
const users = [
    {
        firstName: "Sarah",
        lastName: "Mitchell",
        email: "sarah.admin@healthmatters.com",
        password: "Password123!",
        role: "admin",
        clerkUserId: "user_test_001",
        department: "Executive",
        phone: "07700 900001",
        preferences: { notifications: { email: true, sms: true } },
    },
    {
        firstName: "James",
        lastName: "Wilson",
        email: "james.physio@healthmatters.com",
        password: "Password123!",
        role: "practitioner",
        clerkUserId: "user_test_003",
        department: "Physiotherapy",
        phone: "07700 900003",
    },
    {
        firstName: "Emily",
        lastName: "Chen",
        email: "emily.oh@healthmatters.com",
        password: "Password123!",
        role: "practitioner",
        clerkUserId: "user_test_004",
        department: "Occupational Health",
        phone: "07700 900004",
    },
    {
        firstName: "Michael",
        lastName: "Ross",
        email: "michael.wellbeing@healthmatters.com",
        password: "Password123!",
        role: "practitioner",
        clerkUserId: "user_test_005",
        department: "Mental Health",
        phone: "07700 900005",
    },
    {
        firstName: "Linda",
        lastName: "Green",
        email: "linda.hr@healthmatters.com",
        password: "Password123!",
        role: "manager",
        clerkUserId: "user_test_006",
        department: "People Operations",
        phone: "07700 900006",
        preferences: { notifications: { email: true, sms: false } },
    },
    {
        firstName: "Robert",
        lastName: "Taylor",
        email: "robert.ops@healthmatters.com",
        password: "Password123!",
        role: "manager",
        clerkUserId: "user_test_007",
        department: "Operations",
        phone: "07700 900007",
        preferences: { notifications: { email: true, sms: false } },
    },
    {
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@healthmatters.com",
        password: "Password123!",
        role: "employee",
        clerkUserId: "user_test_008",
        department: "Logistics",
        managerClerkUserId: "user_test_006",
        phone: "07700 900008",
    },
    {
        firstName: "Lisa",
        lastName: "White",
        email: "lisa.white@healthmatters.com",
        password: "Password123!",
        role: "employee",
        clerkUserId: "user_test_009",
        department: "Sales",
        managerClerkUserId: "user_test_006",
        phone: "07700 900009",
    },
    {
        firstName: "Thomas",
        lastName: "Black",
        email: "thomas.black@healthmatters.com",
        password: "Password123!",
        role: "employee",
        clerkUserId: "user_test_010",
        department: "Engineering",
        managerClerkUserId: "user_test_006",
        phone: "07700 900010",
    },
    {
        firstName: "Amina",
        lastName: "Hassan",
        email: "amina.hassan@healthmatters.com",
        password: "Password123!",
        role: "employee",
        clerkUserId: "user_test_011",
        department: "Customer Support",
        managerClerkUserId: "user_test_007",
        phone: "07700 900011",
    },
    {
        firstName: "Noah",
        lastName: "Patel",
        email: "noah.patel@healthmatters.com",
        password: "Password123!",
        role: "employee",
        clerkUserId: "user_test_012",
        department: "Warehouse",
        managerClerkUserId: "user_test_007",
        phone: "07700 900012",
    },
    {
        firstName: "Grace",
        lastName: "Morris",
        email: "grace.morris@healthmatters.com",
        password: "Password123!",
        role: "employee",
        clerkUserId: "user_test_013",
        department: "Field Services",
        managerClerkUserId: "user_test_007",
        phone: "07700 900013",
    },
];
const services = [
    {
        name: "Occupational Health",
        code: "OH-001",
        description: "Occupational health assessment and case management.",
        category: "occupational_health",
        defaultDuration: 45,
        requiresInitialQuestionnaire: false,
        requiresFollowUpQuestionnaire: false,
        availableForSelfReferral: true,
        requiresManagerApproval: false,
        qualifiedPractitionerIds: [],
        isActive: true,
    },
    {
        name: "Mental Health & Wellbeing",
        code: "MHW-001",
        description: "Wellbeing triage and mental health support.",
        category: "mental_health",
        defaultDuration: 50,
        requiresInitialQuestionnaire: false,
        requiresFollowUpQuestionnaire: false,
        availableForSelfReferral: true,
        requiresManagerApproval: false,
        qualifiedPractitionerIds: [],
        isActive: true,
    },
    {
        name: "Physiotherapy",
        code: "PHY-001",
        description: "Physiotherapy support for musculoskeletal issues.",
        category: "physiotherapy",
        defaultDuration: 60,
        requiresInitialQuestionnaire: false,
        requiresFollowUpQuestionnaire: false,
        availableForSelfReferral: true,
        requiresManagerApproval: false,
        qualifiedPractitionerIds: [],
        isActive: true,
    },
    {
        name: "Counselling",
        code: "COU-001",
        description: "Short-term counselling support.",
        category: "counselling",
        defaultDuration: 50,
        requiresInitialQuestionnaire: false,
        requiresFollowUpQuestionnaire: false,
        availableForSelfReferral: true,
        requiresManagerApproval: false,
        qualifiedPractitionerIds: [],
        isActive: true,
    },
    {
        name: "Ergonomic Assessment",
        code: "ERG-001",
        description: "Workstation and ergonomic assessment.",
        category: "ergonomic_assessment",
        defaultDuration: 40,
        requiresInitialQuestionnaire: false,
        requiresFollowUpQuestionnaire: false,
        availableForSelfReferral: true,
        requiresManagerApproval: false,
        qualifiedPractitionerIds: [],
        isActive: true,
    },
];
const referrals = [
    {
        patientClerkUserId: "user_test_008",
        submittedByClerkUserId: "user_test_006",
        practitionerClerkUserId: "user_test_003",
        serviceType: "Physiotherapy",
        referralReason: "Manual handling discomfort affecting day-to-day work.",
        referralStatus: "pending",
        notes: "Urgency: soon\n\nWork impact: reduced lifting confidence.",
        statusHistory: buildHistory([
            {
                status: "pending",
                changedByClerkUserId: "user_test_006",
                note: "Referral submitted",
                changedAt: "2026-03-03T09:00:00.000Z",
            },
        ]),
        createdAt: new Date("2026-03-03T09:00:00.000Z"),
        updatedAt: new Date("2026-03-03T09:00:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_009",
        submittedByClerkUserId: "user_test_006",
        practitionerClerkUserId: "user_test_004",
        serviceType: "Occupational Health",
        referralReason: "Workplace adjustments needed following extended absence.",
        referralStatus: "completed",
        assignedbyClerkUserId: "user_test_001",
        assignedDate: new Date("2026-02-14T10:00:00.000Z"),
        acceptedDate: new Date("2026-02-15T12:00:00.000Z"),
        completedDate: new Date("2026-02-27T15:00:00.000Z"),
        notes: "Urgency: routine\n\nWork impact: phased return requested.",
        statusHistory: buildHistory([
            {
                status: "pending",
                changedByClerkUserId: "user_test_006",
                note: "Referral submitted",
                changedAt: "2026-02-12T08:30:00.000Z",
            },
            {
                status: "accepted",
                changedByClerkUserId: "user_test_001",
                note: "Practitioner assigned within SLA",
                changedAt: "2026-02-15T12:00:00.000Z",
            },
            {
                status: "completed",
                changedByClerkUserId: "user_test_004",
                note: "Case closed with workplace recommendations",
                changedAt: "2026-02-27T15:00:00.000Z",
            },
        ]),
        createdAt: new Date("2026-02-12T08:30:00.000Z"),
        updatedAt: new Date("2026-02-27T15:00:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_010",
        submittedByClerkUserId: "user_test_006",
        practitionerClerkUserId: "user_test_005",
        serviceType: "Mental Health & Wellbeing",
        referralReason: "Sustained stress requiring support pathway.",
        referralStatus: "in_progress",
        assignedbyClerkUserId: "user_test_001",
        assignedDate: new Date("2026-01-13T11:00:00.000Z"),
        acceptedDate: new Date("2026-01-14T09:30:00.000Z"),
        notes: "Urgency: soon\n\nWork impact: concentration impacted during peak delivery periods.",
        statusHistory: buildHistory([
            {
                status: "pending",
                changedByClerkUserId: "user_test_006",
                note: "Referral submitted",
                changedAt: "2026-01-08T09:15:00.000Z",
            },
            {
                status: "accepted",
                changedByClerkUserId: "user_test_001",
                note: "Assigned after SLA threshold",
                changedAt: "2026-01-14T09:30:00.000Z",
            },
            {
                status: "in_progress",
                changedByClerkUserId: "user_test_005",
                note: "Support plan in progress",
                changedAt: "2026-01-20T10:00:00.000Z",
            },
        ]),
        createdAt: new Date("2026-01-08T09:15:00.000Z"),
        updatedAt: new Date("2026-01-20T10:00:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_008",
        submittedByClerkUserId: "user_test_006",
        practitionerClerkUserId: "user_test_003",
        serviceType: "Physiotherapy",
        referralReason: "Historic musculoskeletal concern requiring follow-up.",
        referralStatus: "completed",
        assignedbyClerkUserId: "user_test_001",
        assignedDate: new Date("2025-12-11T09:00:00.000Z"),
        acceptedDate: new Date("2025-12-12T09:00:00.000Z"),
        completedDate: new Date("2025-12-28T14:00:00.000Z"),
        notes: "Urgency: routine\n\nWork impact: reduced movement in repetitive tasks.",
        statusHistory: buildHistory([
            {
                status: "pending",
                changedByClerkUserId: "user_test_006",
                note: "Referral submitted",
                changedAt: "2025-12-10T09:00:00.000Z",
            },
            {
                status: "completed",
                changedByClerkUserId: "user_test_003",
                note: "Case completed with return-to-work guidance",
                changedAt: "2025-12-28T14:00:00.000Z",
            },
        ]),
        createdAt: new Date("2025-12-10T09:00:00.000Z"),
        updatedAt: new Date("2025-12-28T14:00:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_009",
        submittedByClerkUserId: "user_test_006",
        practitionerClerkUserId: "user_test_004",
        serviceType: "Ergonomic Assessment",
        referralReason: "Desk setup concerns impacting comfort and productivity.",
        referralStatus: "rejected",
        assignedbyClerkUserId: "user_test_001",
        assignedDate: new Date("2025-10-18T09:00:00.000Z"),
        rejectedDate: new Date("2025-10-20T13:00:00.000Z"),
        notes: "Urgency: routine\n\nWork impact: workstation discomfort.",
        statusHistory: buildHistory([
            {
                status: "pending",
                changedByClerkUserId: "user_test_006",
                note: "Referral submitted",
                changedAt: "2025-10-14T09:45:00.000Z",
            },
            {
                status: "rejected",
                changedByClerkUserId: "user_test_001",
                note: "Additional detail requested",
                changedAt: "2025-10-20T13:00:00.000Z",
            },
        ]),
        createdAt: new Date("2025-10-14T09:45:00.000Z"),
        updatedAt: new Date("2025-10-20T13:00:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_010",
        submittedByClerkUserId: "user_test_006",
        serviceType: "Counselling",
        referralReason: "Support requested during restructuring period.",
        referralStatus: "cancelled",
        cancelledAt: new Date("2025-07-21T10:00:00.000Z"),
        cancelledByClerkUserId: "user_test_006",
        cancellationReason: "Employee opted for a local EAP route instead.",
        notes: "Urgency: routine\n\nWork impact: low morale during team change.",
        statusHistory: buildHistory([
            {
                status: "pending",
                changedByClerkUserId: "user_test_006",
                note: "Referral submitted",
                changedAt: "2025-07-20T10:00:00.000Z",
            },
            {
                status: "cancelled",
                changedByClerkUserId: "user_test_006",
                note: "Employee opted for a local EAP route instead.",
                changedAt: "2025-07-21T10:00:00.000Z",
            },
        ]),
        createdAt: new Date("2025-07-20T10:00:00.000Z"),
        updatedAt: new Date("2025-07-21T10:00:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_011",
        submittedByClerkUserId: "user_test_007",
        practitionerClerkUserId: "user_test_004",
        serviceType: "Occupational Health",
        referralReason: "Role adjustments requested after recurring absence.",
        referralStatus: "accepted",
        assignedbyClerkUserId: "user_test_001",
        assignedDate: new Date("2026-02-04T09:00:00.000Z"),
        acceptedDate: new Date("2026-02-04T12:00:00.000Z"),
        notes: "Urgency: soon\n\nWork impact: difficulty sustaining shifts.",
        statusHistory: buildHistory([
            {
                status: "pending",
                changedByClerkUserId: "user_test_007",
                note: "Referral submitted",
                changedAt: "2026-02-02T09:00:00.000Z",
            },
            {
                status: "accepted",
                changedByClerkUserId: "user_test_001",
                note: "Accepted within SLA",
                changedAt: "2026-02-04T12:00:00.000Z",
            },
        ]),
        createdAt: new Date("2026-02-02T09:00:00.000Z"),
        updatedAt: new Date("2026-02-04T12:00:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_012",
        submittedByClerkUserId: "user_test_007",
        practitionerClerkUserId: "user_test_003",
        serviceType: "Physiotherapy",
        referralReason: "Physical strain from site movements.",
        referralStatus: "completed",
        assignedbyClerkUserId: "user_test_001",
        assignedDate: new Date("2025-11-08T08:30:00.000Z"),
        acceptedDate: new Date("2025-11-08T11:00:00.000Z"),
        completedDate: new Date("2025-11-24T14:00:00.000Z"),
        notes: "Urgency: routine\n\nWork impact: lifting restrictions discussed.",
        statusHistory: buildHistory([
            {
                status: "pending",
                changedByClerkUserId: "user_test_007",
                note: "Referral submitted",
                changedAt: "2025-11-06T08:30:00.000Z",
            },
            {
                status: "completed",
                changedByClerkUserId: "user_test_003",
                note: "Programme completed",
                changedAt: "2025-11-24T14:00:00.000Z",
            },
        ]),
        createdAt: new Date("2025-11-06T08:30:00.000Z"),
        updatedAt: new Date("2025-11-24T14:00:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_013",
        submittedByClerkUserId: "user_test_007",
        serviceType: "Mental Health & Wellbeing",
        referralReason: "Manager requested wellbeing support following workload surge.",
        referralStatus: "pending",
        notes: "Urgency: soon\n\nWork impact: reduced resilience during extended travel.",
        statusHistory: buildHistory([
            {
                status: "pending",
                changedByClerkUserId: "user_test_007",
                note: "Referral submitted",
                changedAt: "2026-03-01T08:00:00.000Z",
            },
        ]),
        createdAt: new Date("2026-03-01T08:00:00.000Z"),
        updatedAt: new Date("2026-03-01T08:00:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_011",
        submittedByClerkUserId: "user_test_007",
        practitionerClerkUserId: "user_test_005",
        serviceType: "Counselling",
        referralReason: "Historic support request during department change.",
        referralStatus: "completed",
        assignedbyClerkUserId: "user_test_001",
        assignedDate: new Date("2025-05-13T09:00:00.000Z"),
        acceptedDate: new Date("2025-05-14T09:00:00.000Z"),
        completedDate: new Date("2025-05-30T15:00:00.000Z"),
        notes: "Urgency: routine\n\nWork impact: emotional strain during change programme.",
        statusHistory: buildHistory([
            {
                status: "pending",
                changedByClerkUserId: "user_test_007",
                note: "Referral submitted",
                changedAt: "2025-05-10T09:00:00.000Z",
            },
            {
                status: "completed",
                changedByClerkUserId: "user_test_005",
                note: "Support plan completed",
                changedAt: "2025-05-30T15:00:00.000Z",
            },
        ]),
        createdAt: new Date("2025-05-10T09:00:00.000Z"),
        updatedAt: new Date("2025-05-30T15:00:00.000Z"),
    },
];
const seedDatabase = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
        await Promise.all([
            Notification_1.default.deleteMany({}),
            Appointment_1.default.deleteMany({}),
            MedicalRecord_1.default.deleteMany({}),
            Referral_1.Referral.deleteMany({}),
            Service_1.default.deleteMany({}),
            User_1.User.deleteMany({}),
        ]);
        const createdUsers = await User_1.User.insertMany(users);
        await Service_1.default.insertMany(services);
        const createdReferrals = await Referral_1.Referral.insertMany(referrals);
        const userByClerkId = createdUsers.reduce((accumulator, user) => {
            accumulator[user.clerkUserId] = user;
            return accumulator;
        }, {});
        const referralByPatientAndCreatedAt = createdReferrals.reduce((accumulator, referral) => {
            accumulator[`${referral.patientClerkUserId}-${new Date(referral.createdAt).toISOString()}`] = referral;
            return accumulator;
        }, {});
        const notifications = [
            {
                recipientId: userByClerkId.user_test_006._id,
                type: "referral_status_changed",
                title: "Referral status updated",
                message: "Referral for Lisa White moved from Pending to Accepted.",
                relatedEntityType: "referral",
                relatedEntityId: referralByPatientAndCreatedAt["user_test_009-2026-02-12T08:30:00.000Z"]._id,
                channels: { email: { sent: false }, sms: { sent: false }, inApp: { read: false } },
                priority: "medium",
                createdAt: new Date("2026-02-15T12:00:00.000Z"),
                updatedAt: new Date("2026-02-15T12:00:00.000Z"),
            },
            {
                recipientId: userByClerkId.user_test_006._id,
                type: "referral_status_changed",
                title: "Referral entered active treatment",
                message: "Referral for Thomas Black is now In Progress.",
                relatedEntityType: "referral",
                relatedEntityId: referralByPatientAndCreatedAt["user_test_010-2026-01-08T09:15:00.000Z"]._id,
                channels: { email: { sent: false }, sms: { sent: false }, inApp: { read: false } },
                priority: "medium",
                createdAt: new Date("2026-01-20T10:00:00.000Z"),
                updatedAt: new Date("2026-01-20T10:00:00.000Z"),
            },
            {
                recipientId: userByClerkId.user_test_010._id,
                type: "referral_cancelled",
                title: "Referral cancelled by your manager",
                message: "Your counselling referral was cancelled. Reason: Employee opted for a local EAP route instead.",
                relatedEntityType: "referral",
                relatedEntityId: referralByPatientAndCreatedAt["user_test_010-2025-07-20T10:00:00.000Z"]._id,
                channels: { email: { sent: false }, sms: { sent: false }, inApp: { read: false } },
                priority: "high",
                createdAt: new Date("2025-07-21T10:05:00.000Z"),
                updatedAt: new Date("2025-07-21T10:05:00.000Z"),
            },
            {
                recipientId: userByClerkId.user_test_001._id,
                type: "referral_cancelled",
                title: "Manager referral cancelled",
                message: "Linda Green cancelled a counselling referral. Reason: Employee opted for a local EAP route instead.",
                relatedEntityType: "referral",
                relatedEntityId: referralByPatientAndCreatedAt["user_test_010-2025-07-20T10:00:00.000Z"]._id,
                channels: { email: { sent: false }, sms: { sent: false }, inApp: { read: false } },
                priority: "high",
                createdAt: new Date("2025-07-21T10:06:00.000Z"),
                updatedAt: new Date("2025-07-21T10:06:00.000Z"),
            },
            {
                recipientId: userByClerkId.user_test_007._id,
                type: "referral_status_changed",
                title: "Referral status updated",
                message: "Referral for Amina Hassan moved to Accepted within SLA.",
                relatedEntityType: "referral",
                relatedEntityId: referralByPatientAndCreatedAt["user_test_011-2026-02-02T09:00:00.000Z"]._id,
                channels: { email: { sent: false }, sms: { sent: false }, inApp: { read: true, readAt: new Date("2026-02-05T09:00:00.000Z") } },
                priority: "medium",
                createdAt: new Date("2026-02-04T12:00:00.000Z"),
                updatedAt: new Date("2026-02-05T09:00:00.000Z"),
            },
        ];
        await Notification_1.default.insertMany(notifications);
        console.log(`🌱 Seeded ${createdUsers.length} users`);
        console.log(`🌱 Seeded ${services.length} services`);
        console.log(`🌱 Seeded ${createdReferrals.length} referrals`);
        console.log(`🌱 Seeded ${notifications.length} notifications`);
        await mongoose_1.default.disconnect();
        console.log("✨ Database seeded successfully");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};
seedDatabase();
