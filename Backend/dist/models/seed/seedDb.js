"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./../User"); // Ensure this path matches your folder structure
const Referral_1 = require("./../Referral");
const Service_1 = __importDefault(require("./../Service"));
dotenv_1.default.config();
const users = [
    // --- ADMINS (System & Lead) ---
    {
        firstName: "Sarah",
        lastName: "Mitchell",
        email: "sarah.admin@healthmatters.com",
        password: "Password123!",
        role: "admin",
        clerkUserId: "user_test_001",
        department: "Executive",
        phone: "07700 900001",
        address: { line1: "1 Harley Street", city: "London", postcode: "W1G 9QD" },
        preferences: { notifications: { email: true, sms: true } },
    },
    {
        firstName: "System",
        lastName: "Admin",
        email: "sysadmin@healthmatters.com",
        password: "Password123!",
        role: "admin",
        clerkUserId: "user_test_002",
        department: "IT Support",
    },
    // --- PRACTITIONERS (Doctors & Specialists) ---
    {
        firstName: "James",
        lastName: "Wilson",
        email: "james.physio@healthmatters.com",
        password: "Password123!",
        role: "practitioner",
        clerkUserId: "user_test_003",
        department: "Physiotherapy",
        phone: "07700 900003",
        address: { city: "Manchester", postcode: "M1 1AA" },
    },
    {
        firstName: "Emily",
        lastName: "Chen",
        email: "emily.gp@healthmatters.com",
        password: "Password123!",
        role: "practitioner",
        clerkUserId: "user_test_004",
        department: "General Practice",
        phone: "07700 900004",
    },
    {
        firstName: "Michael",
        lastName: "Ross",
        email: "michael.counselling@healthmatters.com",
        password: "Password123!",
        role: "practitioner",
        clerkUserId: "user_test_005",
        department: "Mental Health",
    },
    // --- MANAGERS (Those who refer employees) ---
    {
        firstName: "Linda",
        lastName: "Green",
        email: "linda.hr@healthmatters.com",
        password: "Password123!",
        role: "manager",
        clerkUserId: "user_test_006",
        department: "Human Resources",
        phone: "07700 900006",
    },
    {
        firstName: "Robert",
        lastName: "Taylor",
        email: "robert.ops@healthmatters.com",
        password: "Password123!",
        role: "manager",
        clerkUserId: "user_test_007",
        department: "Operations",
    },
    // --- EMPLOYEES (Standard users) ---
    {
        firstName: "David",
        lastName: "Brown",
        email: "david.logistics@healthmatters.com",
        password: "Password123!",
        role: "employee",
        clerkUserId: "user_test_008",
        department: "Logistics",
        address: { city: "Leeds", postcode: "LS1 1BB" },
    },
    {
        firstName: "Lisa",
        lastName: "White",
        email: "lisa.sales@healthmatters.com",
        password: "Password123!",
        role: "employee",
        clerkUserId: "user_test_009",
        department: "Sales",
    },
    {
        firstName: "Thomas",
        lastName: "Black",
        email: "tom.dev@healthmatters.com",
        password: "Password123!",
        role: "employee",
        clerkUserId: "user_test_010",
        department: "Engineering",
    },
];
const services = [
    {
        name: "Physiotherapy Assessment",
        code: "PHYSIO-001",
        description: "Comprehensive physiotherapy assessment for musculoskeletal conditions",
        category: "physiotherapy",
        defaultDuration: 60,
        isActive: true,
    },
    {
        name: "Mental Health Counselling",
        code: "MH-001",
        description: "Professional counselling for work-related stress and mental health support",
        category: "mental_health",
        defaultDuration: 50,
        isActive: true,
    },
    {
        name: "Occupational Health Assessment",
        code: "OH-001",
        description: "Workplace health assessment and fitness-for-work evaluation",
        category: "occupational_health",
        defaultDuration: 45,
        isActive: true,
    },
    {
        name: "Health Screening",
        code: "HS-001",
        description: "General health screening and preventative care assessment",
        category: "health_screening",
        defaultDuration: 30,
        isActive: true,
    },
    {
        name: "Ergonomic Assessment",
        code: "ERGO-001",
        description: "Workplace ergonomic assessment to prevent musculoskeletal disorders",
        category: "ergonomic_assessment",
        defaultDuration: 40,
        isActive: true,
    },
];
const referrals = [
    {
        patientClerkUserId: "user_test_008",
        submittedByClerkUserId: "user_test_006",
        practitionerClerkUserId: "user_test_003",
        serviceType: "Physiotherapy Assessment",
        referralReason: "Lower back pain impacting manual handling tasks",
        referralStatus: "pending",
        notes: "Initial occupational health referral from HR manager.",
        assignedbyClerkUserId: "user_test_006",
        assignedDate: new Date("2026-02-12T10:00:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_009",
        submittedByClerkUserId: "user_test_007",
        practitionerClerkUserId: "user_test_004",
        serviceType: "Mental Health Counselling",
        referralReason: "Stress and anxiety related to workload changes",
        referralStatus: "accepted",
        notes: "Employee requested support and agreed to counselling referral.",
        assignedbyClerkUserId: "user_test_007",
        assignedDate: new Date("2026-01-28T09:30:00.000Z"),
        acceptedDate: new Date("2026-01-29T08:15:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_010",
        submittedByClerkUserId: "user_test_006",
        practitionerClerkUserId: "user_test_005",
        serviceType: "Occupational Health Assessment",
        referralReason: "Recurring migraines affecting concentration",
        referralStatus: "rejected",
        notes: "Insufficient clinical details provided; re-submit with assessment notes.",
        assignedbyClerkUserId: "user_test_006",
        assignedDate: new Date("2026-01-20T11:00:00.000Z"),
        rejectedDate: new Date("2026-01-21T14:45:00.000Z"),
    },
    {
        patientClerkUserId: "user_test_008",
        submittedByClerkUserId: "user_test_007",
        practitionerClerkUserId: "user_test_003",
        serviceType: "Physiotherapy Assessment",
        referralReason: "Follow-up physiotherapy review after 6 weeks",
        referralStatus: "accepted",
        notes: "Previous symptoms improved; reassessment needed for return-to-work plan.",
        assignedbyClerkUserId: "user_test_007",
        assignedDate: new Date("2026-02-05T15:20:00.000Z"),
        acceptedDate: new Date("2026-02-06T10:05:00.000Z"),
        completedDate: new Date("2026-02-18T12:30:00.000Z"),
    },
];
const seedDatabase = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
        console.log("🧹 Clearing existing users...");
        await User_1.User.deleteMany({});
        await Referral_1.Referral.deleteMany({});
        await Service_1.default.deleteMany({});
        console.log(`🌱 Seeding ${services.length} new services...`);
        await Service_1.default.insertMany(services);
        console.log(`🌱 Seeding ${users.length} new users...`);
        await User_1.User.insertMany(users);
        console.log(`🌱 Seeding ${referrals.length} new referrals...`);
        await Referral_1.Referral.insertMany(referrals);
        console.log("✨ Database seeded successfully!");
        await mongoose_1.default.disconnect();
        console.log("👋 Connection closed");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};
seedDatabase();
