import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientClerkUserId: { type: String, required: true },
    referralId: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral' },
    type: {
      type: String,
      enum: [
        'referral_submitted',
        'referral_assigned',
        'referral_in_progress',
        'referral_completed',
        'referral_cancelled',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    deepLink: { type: String }, // e.g. "/referrals/abc123"
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Index for fast lookups by recipient
notificationSchema.index({ recipientClerkUserId: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);