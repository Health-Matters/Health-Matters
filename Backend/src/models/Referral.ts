import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'accepted', 'rejected'],
      required: true,
    },
    changedByClerkUserId: { type: String },
    note: { type: String, trim: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const referralSchema = new mongoose.Schema(
  {
    patientClerkUserId: { type: String, required: true },
    submittedByClerkUserId: { type: String},
    practitionerClerkUserId: { type: String},
    serviceType: { type: String, trim: true },
    referralReason: { type: String, trim: true },
    referralStatus: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'accepted', 'rejected'],
      default: 'pending',
    },
    notes: { type: String, trim: true },
    assignedbyClerkUserId: { type: String },
    assignedDate: { type: Date },
    acceptedDate: { type: Date },
    rejectedDate: { type: Date },
    completedDate: { type: Date },
    cancelledDate: { type: Date },
    cancellationReason: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Referral = mongoose.model('Referral', referralSchema);

