import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsSnapshot extends Document {
  snapshotType: 'daily_summary' | 'weekly_summary' | 'monthly_summary';
  
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  metrics: {
    totalReferrals: number;
    selfReferrals: number;
    managerReferrals: number;
    completedReferrals: number;
    
    avgDaysToTriage: number;
    avgDaysToAppointment: number;
    avgDaysToCompletion: number;
    slaBreaches: number;
    
    serviceBreakdown: any;
    departmentBreakdown: any;
    
    totalCost: number;
  };
  
  generatedAt: Date;
}

const AnalyticsSnapshotSchema: Schema = new Schema(
  {
    snapshotType: {
      type: String,
      required: true,
      enum: ['daily_summary', 'weekly_summary', 'monthly_summary']
    },
    
    period: {
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      }
    },
    
    metrics: {
      totalReferrals: {
        type: Number,
        default: 0,
        min: 0
      },
      selfReferrals: {
        type: Number,
        default: 0,
        min: 0
      },
      managerReferrals: {
        type: Number,
        default: 0,
        min: 0
      },
      completedReferrals: {
        type: Number,
        default: 0,
        min: 0
      },
      
      avgDaysToTriage: {
        type: Number,
        default: 0,
        min: 0
      },
      avgDaysToAppointment: {
        type: Number,
        default: 0,
        min: 0
      },
      avgDaysToCompletion: {
        type: Number,
        default: 0,
        min: 0
      },
      slaBreaches: {
        type: Number,
        default: 0,
        min: 0
      },
      
      serviceBreakdown: {
        type: Schema.Types.Mixed,
        default: {}
      },
      departmentBreakdown: {
        type: Schema.Types.Mixed,
        default: {}
      },
      
      totalCost: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Indexes
AnalyticsSnapshotSchema.index({ snapshotType: 1, 'period.startDate': 1 });
AnalyticsSnapshotSchema.index({ generatedAt: -1 });

export default mongoose.model<IAnalyticsSnapshot>('AnalyticsSnapshot', AnalyticsSnapshotSchema);
