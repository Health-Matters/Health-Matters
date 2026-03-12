import mongoose, { Schema } from 'mongoose';

const NotificationSchema: Schema = new Schema(
  {
    recipientClerkUserId: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'referral_submitted',
        'referral_assigned',
        'appointment_assigned',
        'appointment_confirmed',
        'appointment_rejected',
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedEntityType: {
      type: String,
      enum: ['referral', 'appointment'],
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipientClerkUserId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', NotificationSchema);
