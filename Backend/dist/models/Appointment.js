"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AppointmentSchema = new mongoose_1.Schema({
    // References
    referralId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Referral',
        required: true
    },
    practitionerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Scheduling
    scheduledDate: {
        type: Date,
        required: true
    },
    scheduledTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        default: 30,
        min: 15,
        max: 240
    },
    endTime: {
        type: Date,
        required: true
    },
    // Location & Format
    location: {
        type: String,
        trim: true
    },
    appointmentType: {
        type: String,
        required: true,
        enum: ['in_person', 'video_call', 'phone_call'],
        default: 'in_person'
    },
    meetingLink: {
        type: String,
        trim: true
    },
    roomNumber: {
        type: String,
        trim: true
    },
    // Status
    status: {
        type: String,
        required: true,
        enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
        default: 'scheduled'
    },
    // Clinical Documentation
    clinicalNotes: {
        type: String,
        trim: true
    },
    privateNotes: {
        type: String,
        trim: true
    },
    // Reminders
    reminders: [{
            type: {
                type: String,
                enum: ['email', 'sms'],
                required: true
            },
            sentAt: {
                type: Date,
                required: true,
                default: Date.now
            },
            sentTo: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        }],
    // Cancellation/Rescheduling
    cancellationReason: {
        type: String,
        trim: true
    },
    cancelledBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledAt: {
        type: Date
    },
    rescheduledToAppointmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Appointment'
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Appointment', AppointmentSchema);
