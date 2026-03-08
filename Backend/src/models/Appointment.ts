import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    // References
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
      required: true
    },
    practitionerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: {
      type: Date
    },
    rescheduledToAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  },
  {
    timestamps: true
  }
);

export const Appointment = mongoose.model("Appointments", AppointmentSchema);
