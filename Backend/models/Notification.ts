import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  
  type: 'referral_submitted' | 'referral_triaged' | 'referral_assigned' | 'appointment_scheduled' | 
        'appointment_reminder_24h' | 'appointment_reminder_1h' | 'appointment_cancelled' | 
        'outcome_report_ready' | 'follow_up_required';
  
  title: string;
  message: string;
  
  // Related Entity
  relatedEntityType?: 'referral' | 'appointment';
  relatedEntityId?: mongoose.Types.ObjectId;
  
  // Delivery Channels
  channels: {
    email: {
      sent: boolean;
      sentAt?: Date;
    };
    sms: {
      sent: boolean;
      sentAt?: Date;
    };
    inApp: {
      read: boolean;
      readAt?: Date;
    };
  };
  
  priority: 'low' | 'medium' | 'high';
  
  createdAt: Date;
  expiresAt?: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    type: {
      type: String,
      required: true,
      enum: [
        'referral_submitted',
        'referral_triaged',
        'referral_assigned',
        'appointment_scheduled',
        'appointment_reminder_24h',
        'appointment_reminder_1h',
        'appointment_cancelled',
        'outcome_report_ready',
        'follow_up_required'
      ]
    },
    
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    
    // Related Entity
    relatedEntityType: {
      type: String,
      enum: ['referral', 'appointment']
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId
    },
    
    // Delivery Channels
    channels: {
      email: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date }
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date }
      },
      inApp: {
        read: { type: Boolean, default: false },
        readAt: { type: Date }
      }
    },
    
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
NotificationSchema.index({ recipientId: 1, 'channels.inApp.read': 1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

// Method to mark notification as read
NotificationSchema.methods.markAsRead = function() {
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  return this.save();
};

// Method to mark email as sent
NotificationSchema.methods.markEmailSent = function() {
  this.channels.email.sent = true;
  this.channels.email.sentAt = new Date();
  return this.save();
};

// Method to mark SMS as sent
NotificationSchema.methods.markSmsSent = function() {
  this.channels.sms.sent = true;
  this.channels.sms.sentAt = new Date();
  return this.save();
};

export default mongoose.model<INotification>('Notification', NotificationSchema);
