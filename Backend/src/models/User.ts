import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
    deletedAt: { type: Date },

    auditLog: [
      {
        action: { type: String, required: true },
        changedByClerkUserId: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        changes: { type: mongoose.Schema.Types.Mixed },
      },
    ],

    // Preferences
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      accessibility: {
        highContrast: { type: Boolean, default: false },
        fontSize: { type: Number, default: 14 },
      },
    },
    clerkUserId: { type: String, unique: true, sparse: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
