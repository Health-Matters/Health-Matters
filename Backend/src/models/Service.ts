import mongoose, { Document, Schema } from 'mongoose';

interface IQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'yes_no' | 'scale';
  options?: string[];
  required: boolean;
}

interface IQuestionnaireTemplate {
  title: string;
  questions: IQuestion[];
}

export interface IService extends Document {
  name: string;
  code: string;
  description?: string;
  
  category: 'occupational_health' | 'mental_health' | 'physiotherapy' | 'health_screening' | 'counselling' | 'ergonomic_assessment';
  
  // Configuration
  defaultDuration: number;
  pricing?: {
    internalCost?: number;
    clientCharge?: number;
    currency: string;
  };
  
  // Questionnaires
  requiresInitialQuestionnaire: boolean;
  initialQuestionnaireTemplate?: IQuestionnaireTemplate;
  
  requiresFollowUpQuestionnaire: boolean;
  followUpQuestionnaireTemplate?: IQuestionnaireTemplate;
  
  // Access Control
  availableForSelfReferral: boolean;
  requiresManagerApproval: boolean;
  
  // Practitioners
  qualifiedPractitionerIds: mongoose.Types.ObjectId[];
  
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    
    category: {
      type: String,
      required: true,
      enum: [
        'occupational_health',
        'mental_health',
        'physiotherapy',
        'health_screening',
        'counselling',
        'ergonomic_assessment'
      ]
    },
    
    // Configuration
    defaultDuration: {
      type: Number,
      required: true,
      default: 30,
      min: 15,
      max: 240
    },
    pricing: {
      internalCost: { type: Number, min: 0 },
      clientCharge: { type: Number, min: 0 },
      currency: { type: String, default: 'GBP' }
    },
    
    // Questionnaires
    requiresInitialQuestionnaire: {
      type: Boolean,
      default: false
    },
    initialQuestionnaireTemplate: {
      title: { type: String, trim: true },
      questions: [{
        id: { type: String, required: true },
        question: { type: String, required: true },
        type: {
          type: String,
          required: true,
          enum: ['text', 'multiple_choice', 'yes_no', 'scale']
        },
        options: [{ type: String }],
        required: { type: Boolean, default: false }
      }]
    },
    
    requiresFollowUpQuestionnaire: {
      type: Boolean,
      default: false
    },
    followUpQuestionnaireTemplate: {
      title: { type: String, trim: true },
      questions: [{
        id: { type: String, required: true },
        question: { type: String, required: true },
        type: {
          type: String,
          required: true,
          enum: ['text', 'multiple_choice', 'yes_no', 'scale']
        },
        options: [{ type: String }],
        required: { type: Boolean, default: false }
      }]
    },
    
    // Access Control
    availableForSelfReferral: {
      type: Boolean,
      default: true
    },
    requiresManagerApproval: {
      type: Boolean,
      default: false
    },
    
    // Practitioners
    qualifiedPractitionerIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
ServiceSchema.index({ code: 1 }, { unique: true });
ServiceSchema.index({ category: 1, isActive: 1 });

export default mongoose.model<IService>('Service', ServiceSchema);
