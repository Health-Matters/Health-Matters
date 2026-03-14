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
const MedicalRecordSchema = new mongoose_1.Schema({
    employeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referralId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Referral'
    },
    appointmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    practitionerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recordType: {
        type: String,
        required: true,
        enum: ['consultation_notes', 'assessment', 'diagnosis', 'treatment_plan', 'test_results']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
        // Note: Consider implementing field-level encryption for this field
    },
    // GDPR Compliance - Access Logging
    accessLog: [{
            accessedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            accessedByName: {
                type: String,
                required: true
            },
            accessedByRole: {
                type: String,
                required: true
            },
            accessedAt: {
                type: Date,
                required: true,
                default: Date.now
            },
            accessPurpose: {
                type: String,
                trim: true
            }
        }],
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Indexes
MedicalRecordSchema.index({ employeeId: 1, createdAt: -1 });
MedicalRecordSchema.index({ referralId: 1 });
MedicalRecordSchema.index({ practitionerId: 1 });
// Method to log access to medical record
MedicalRecordSchema.methods.logAccess = function (accessedBy, accessedByName, accessedByRole, accessPurpose) {
    this.accessLog.push({
        accessedBy,
        accessedByName,
        accessedByRole,
        accessedAt: new Date(),
        accessPurpose
    });
    return this.save();
};
exports.default = mongoose_1.default.model('MedicalRecord', MedicalRecordSchema);
