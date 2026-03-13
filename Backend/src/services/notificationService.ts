import { Notification } from '../models/Notification';

type NotificationType =
  | 'referral_submitted'
  | 'referral_assigned'
  | 'referral_in_progress'
  | 'referral_completed'
  | 'referral_cancelled';

type PriorityType = 'low' | 'normal' | 'high' | 'urgent';

interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  priority: PriorityType;
}

const STATUS_MAP: Record<string, NotificationConfig> = {
  pending: {
    type: 'referral_submitted',
    title: 'Referral Submitted',
    message: 'Your referral has been submitted and is awaiting review.',
    priority: 'normal',
  },
  accepted: {
    type: 'referral_assigned',
    title: 'Referral Assigned',
    message: 'Your referral has been assigned to a practitioner.',
    priority: 'normal',
  },
  in_progress: {
    type: 'referral_in_progress',
    title: 'Referral In Progress',
    message: 'Your referral is now in progress.',
    priority: 'normal',
  },
  completed: {
    type: 'referral_completed',
    title: 'Referral Completed',
    message: 'Your referral has been completed.',
    priority: 'normal',
  },
  cancelled: {
    type: 'referral_cancelled',
    title: 'Referral Cancelled',
    message: 'Your referral has been cancelled.',
    priority: 'high',
  },
};

export async function createReferralNotification(
  recipientClerkUserId: string,
  referralId: string,
  status: string
): Promise<void> {
  const config = STATUS_MAP[status];
  if (!config) return;

  await Notification.create({
    recipientClerkUserId,
    referralId,
    type: config.type,
    title: config.title,
    message: config.message,
    priority: config.priority,
    deepLink: `/referrals/${referralId}`,
  });
}