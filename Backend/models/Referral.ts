import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  referralNumber: string;
  
  // People Involved
  employeeId: mongoose.Types.ObjectId;
  referredById: mongoose.Types.ObjectId;
  assignedPractitionerId?: mongoose.Types.ObjectId;
  triagedById?: mongoose.Types.ObjectId;
  
  // Referral Details
  type: 'self_referral' | 'manager_referral' | 'follow_up';
  serviceId: mongoose.Types.ObjectId;
  reasonForReferral: string;
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  
  // Status Tracking
  status: 'submitted' | 'triaged' | 'appointed' | 'in_progress' | 'completed' | 'withdrawn' | 'cancelled';
  
  // Questionnaires
  initialQuestionnaire?: {
    completedAt?: Date;
    responses?: any;
  };
  
  followUpQuestionnaire?: {
    completedAt?: Date;
    responses?: any;
  };
  
  // Outcome & Reports
  outcome?: {
    summary?: string;
    recommendations?: string;
    reportGeneratedAt?: Date;
    reportGeneratedBy?: mongoose.Types.ObjectId;
    adviceNotes?: string;
  };
  
  // Follow-up Management
  followUp?: {
    required: boolean;
    recallDate?: Date;
    notes?: string;
    followUpReferralId?: mongoose.Types.ObjectId;
  };
  
  // SLA Tracking
  sla: {
    submittedAt?: Date;
    triagedAt?: Date;
    appointedAt?: Date;
    completedAt?: Date;
    daysToTriage?: number;
    daysToAppointment?: number;
    daysToCompletion?: number;
    breached: boolean;
  };
  
  // Audit Trail
  history: Array<{
    action: string;
    performedBy: mongoose.Types.ObjectId;
    performedByName: string;
    timestamp: Date;
    notes?: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema: Schema = new Schema(
  {
    referralNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    
    // People Involved
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    referredById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedPractitionerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    triagedById: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Referral Details
    type: {
      type: String,
      required: true,
      enum: ['self_referral', 'manager_referral', 'follow_up']
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    reasonForReferral: {
      type: String,
      required: true,
      trim: true
    },
    urgencyLevel: {
      type: String,
      required: true,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine'
    },
    
    // Status Tracking
    status: {
      type: String,
      required: true,
      enum: ['submitted', 'triaged', 'appointed', 'in_progress', 'completed', 'withdrawn', 'cancelled'],
      default: 'submitted'
    },
    
    // Questionnaires
    initialQuestionnaire: {
      completedAt: { type: Date },
      responses: { type: Schema.Types.Mixed }
    },
    
    followUpQuestionnaire: {
      completedAt: { type: Date },
      responses: { type: Schema.Types.Mixed }
    },
    
    // Outcome & Reports
    outcome: {
      summary: { type: String, trim: true },
      recommendations: { type: String, trim: true },
      reportGeneratedAt: { type: Date },
      reportGeneratedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      adviceNotes: { type: String, trim: true }
    },
    
    // Follow-up Management
    followUp: {
      required: { type: Boolean, default: false },
      recallDate: { type: Date },
      notes: { type: String, trim: true },
      followUpReferralId: { type: Schema.Types.ObjectId, ref: 'Referral' }
    },
    
    // SLA Tracking
    sla: {
      submittedAt: { type: Date },
      triagedAt: { type: Date },
      appointedAt: { type: Date },
      completedAt: { type: Date },
      daysToTriage: { type: Number },
      daysToAppointment: { type: Number },
      daysToCompletion: { type: Number },
      breached: { type: Boolean, default: false }
    },
    
    // Audit Trail
    history: [{
      action: { type: String, required: true },
      performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      performedByName: { type: String, required: true },
      timestamp: { type: Date, required: true, default: Date.now },
      notes: { type: String, trim: true },
      previousStatus: { type: String },
      newStatus: { type: String }
    }]
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IReferral>('Referral', ReferralSchema);
