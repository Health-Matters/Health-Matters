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
const AnalyticsSnapshotSchema = new mongoose_1.Schema({
    snapshotType: {
        type: String,
        required: true,
        enum: ['daily_summary', 'weekly_summary', 'monthly_summary']
    },
    period: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    metrics: {
        totalReferrals: {
            type: Number,
            default: 0,
            min: 0
        },
        selfReferrals: {
            type: Number,
            default: 0,
            min: 0
        },
        managerReferrals: {
            type: Number,
            default: 0,
            min: 0
        },
        completedReferrals: {
            type: Number,
            default: 0,
            min: 0
        },
        avgDaysToTriage: {
            type: Number,
            default: 0,
            min: 0
        },
        avgDaysToAppointment: {
            type: Number,
            default: 0,
            min: 0
        },
        avgDaysToCompletion: {
            type: Number,
            default: 0,
            min: 0
        },
        slaBreaches: {
            type: Number,
            default: 0,
            min: 0
        },
        serviceBreakdown: {
            type: mongoose_1.Schema.Types.Mixed,
            default: {}
        },
        departmentBreakdown: {
            type: mongoose_1.Schema.Types.Mixed,
            default: {}
        },
        totalCost: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    generatedAt: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: false
});
// Indexes
AnalyticsSnapshotSchema.index({ snapshotType: 1, 'period.startDate': 1 });
AnalyticsSnapshotSchema.index({ generatedAt: -1 });
exports.default = mongoose_1.default.model('AnalyticsSnapshot', AnalyticsSnapshotSchema);
