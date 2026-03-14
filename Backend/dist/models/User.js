"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    // Account Information
    userName: { type: String, unique: true, sparse: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        minlength: 8,
    },
    role: {
        type: String,
        enum: ["admin", "practitioner", "manager", "employee"],
        default: "employee",
    },
    address: {
        line1: { type: String, trim: true },
        line2: { type: String, trim: true },
        city: { type: String, trim: true },
        postcode: { type: String, trim: true },
    },
    // Employment Information
    department: { type: String, trim: true },
    managerClerkUserId: { type: String, trim: true },
    // System
    isActive: { type: Boolean, default: true },
    // Preferences
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
        },
    },
    clerkUserId: { type: String, required: true, unique: true },
}, {
    timestamps: true,
});
exports.User = mongoose_1.default.model("User", userSchema);
