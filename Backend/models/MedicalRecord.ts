import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicalRecord extends Document {
  employeeId: mongoose.Types.ObjectId;
  referralId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  practitionerId: mongoose.Types.ObjectId;
  
  recordType: 'consultation_notes' | 'assessment' | 'diagnosis' | 'treatment_plan' | 'test_results';
  
  title: string;
  content: string;
  
  // GDPR Compliance - Access Logging
  accessLog: Array<{
    accessedBy: mongoose.Types.ObjectId;
    accessedByName: string;
    accessedByRole: string;
    accessedAt: Date;
    accessPurpose?: string;
  }>;
  
  isArchived: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema: Schema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    referralId: {
      type: Schema.Types.ObjectId,
      ref: 'Referral'
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    practitionerId: {
      type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true
  }
);

// Indexes
MedicalRecordSchema.index({ employeeId: 1, createdAt: -1 });
MedicalRecordSchema.index({ referralId: 1 });
MedicalRecordSchema.index({ practitionerId: 1 });

// Method to log access to medical record
MedicalRecordSchema.methods.logAccess = function(
  accessedBy: mongoose.Types.ObjectId,
  accessedByName: string,
  accessedByRole: string,
  accessPurpose?: string
) {
  this.accessLog.push({
    accessedBy,
    accessedByName,
    accessedByRole,
    accessedAt: new Date(),
    accessPurpose
  });
  return this.save();
};

export default mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
