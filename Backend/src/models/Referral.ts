import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    patientClerkUserId: { type: String, required: true },
    submittedByClerkUserId: { type: String},
    practitionerClerkUserId: { type: String},
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
  },
  {
    timestamps: true,
  }
);

export const Referral = mongoose.model('Referral', referralSchema);

