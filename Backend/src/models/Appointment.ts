import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
      required: true,
      unique: true,
    },
    patientClerkUserId: {
      type: String,
      required: true,
      trim: true,
    },
    submittedByClerkUserId: {
      type: String,
      trim: true,
    },
    practitionerClerkUserId: {
      type: String,
      trim: true,
    },
    assignedByClerkUserId: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
      trim: true,
    },
    referralReason: {
      type: String,
      trim: true,
    },
    assignmentSource: {
      type: String,
      enum: ['referral', 'admin'],
      default: 'referral',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
      required: true,
    },
    scheduledDate: {
      type: Date,
    },
    scheduledTime: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      default: 30,
      min: 15,
      max: 240,
    },
    appointmentType: {
      type: String,
      enum: ['in_person', 'video_call', 'phone_call'],
      default: 'in_person',
    },
    location: {
      type: String,
      trim: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    assignedDate: {
      type: Date,
    },
    confirmedDate: {
      type: Date,
    },
    rejectedDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    cancelledDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AppointmentSchema.index({ practitionerClerkUserId: 1, status: 1 });
AppointmentSchema.index({ patientClerkUserId: 1, createdAt: -1 });

export const Appointment = mongoose.model('Appointment', AppointmentSchema);
