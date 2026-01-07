import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  // References
  referralId: mongoose.Types.ObjectId;
  practitionerId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  
  // Scheduling
  scheduledDate: Date;
  scheduledTime: string;
  duration: number;
  endTime: Date;
  
  // Location & Format
  location?: string;
  appointmentType: 'in_person' | 'video_call' | 'phone_call';
  meetingLink?: string;
  roomNumber?: string;
  
  // Status
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  
  // Clinical Documentation
  clinicalNotes?: string;
  privateNotes?: string;
  
  // Reminders
  reminders: Array<{
    type: 'email' | 'sms';
    sentAt: Date;
    sentTo: mongoose.Types.ObjectId;
  }>;
  
  // Cancellation/Rescheduling
  cancellationReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  rescheduledToAppointmentId?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    // References
    referralId: {
      type: Schema.Types.ObjectId,
      ref: 'Referral',
      required: true
    },
    practitionerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employeeId: {
      type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: {
      type: Date
    },
    rescheduledToAppointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
