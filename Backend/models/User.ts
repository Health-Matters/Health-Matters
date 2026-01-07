import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'practitioner' | 'manager' | 'employee';
  
  // Personal Information
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postcode?: string;
  };
  
  // Employment Information
  employeeId?: string;
  department?: string;
  managerId?: mongoose.Types.ObjectId;
  
  // Practitioner-specific
  specialization?: string;
  qualifications?: string[];
  
  // System
  isActive: boolean;
  lastLogin?: Date;
  
  // Preferences
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'practitioner', 'manager', 'employee'],
      default: 'employee'
    },
    
    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      postcode: { type: String, trim: true }
    },
    
    // Employment Information
    employeeId: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Practitioner-specific
    specialization: {
      type: String,
      trim: true
    },
    qualifications: [{
      type: String,
      trim: true
    }],
    
    // System
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    
    // Preferences
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ managerId: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser>('User', UserSchema);
