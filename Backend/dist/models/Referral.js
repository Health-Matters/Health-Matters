"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Referral = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const statusHistorySchema = new mongoose_1.default.Schema({
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        required: true,
    },
    changedByClerkUserId: { type: String },
    note: { type: String, trim: true },
    changedAt: { type: Date, default: Date.now },
}, { _id: false });
const referralSchema = new mongoose_1.default.Schema({
    patientClerkUserId: { type: String, required: true },
    submittedByClerkUserId: { type: String },
    practitionerClerkUserId: { type: String },
    serviceType: { type: String, trim: true },
    referralReason: { type: String, trim: true },
    referralStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    notes: { type: String, trim: true },
    assignedbyClerkUserId: { type: String },
    assignedDate: { type: Date },
    acceptedDate: { type: Date },
    rejectedDate: { type: Date },
    completedDate: { type: Date },
}, {
    timestamps: true,
});
exports.Referral = mongoose_1.default.model('Referral', referralSchema);
