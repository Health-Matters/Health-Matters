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
const NotificationSchema = new mongoose_1.Schema({
    recipientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'referral_submitted',
            'referral_triaged',
            'referral_assigned',
            'appointment_scheduled',
            'appointment_reminder_24h',
            'appointment_reminder_1h',
            'appointment_cancelled',
            'outcome_report_ready',
            'follow_up_required'
        ]
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    // Related Entity
    relatedEntityType: {
        type: String,
        enum: ['referral', 'appointment']
    },
    relatedEntityId: {
        type: mongoose_1.Schema.Types.ObjectId
    },
    // Delivery Channels
    channels: {
        email: {
            sent: { type: Boolean, default: false },
            sentAt: { type: Date }
        },
        sms: {
            sent: { type: Boolean, default: false },
            sentAt: { type: Date }
        },
        inApp: {
            read: { type: Boolean, default: false },
            readAt: { type: Date }
        }
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Indexes
NotificationSchema.index({ recipientId: 1, 'channels.inApp.read': 1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
// Method to mark notification as read
NotificationSchema.methods.markAsRead = function () {
    this.channels.inApp.read = true;
    this.channels.inApp.readAt = new Date();
    return this.save();
};
// Method to mark email as sent
NotificationSchema.methods.markEmailSent = function () {
    this.channels.email.sent = true;
    this.channels.email.sentAt = new Date();
    return this.save();
};
// Method to mark SMS as sent
NotificationSchema.methods.markSmsSent = function () {
    this.channels.sms.sent = true;
    this.channels.sms.sentAt = new Date();
    return this.save();
};
exports.default = mongoose_1.default.model('Notification', NotificationSchema);
