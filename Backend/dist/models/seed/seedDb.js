"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./../User"); // Ensure this path matches your folder structure
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
const seedDatabase = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
        console.log("🧹 Clearing existing users...");
        await User_1.User.deleteMany({});
        console.log(`🌱 Seeding ${users.length} new users...`);
        await User_1.User.insertMany(users);
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
