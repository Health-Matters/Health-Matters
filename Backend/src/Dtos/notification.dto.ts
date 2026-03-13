import { z } from 'zod';

export const notificationIdParamsSchema = z.object({
  notificationId: z.string().trim().min(1, 'notificationId is required'),
});

export const recipientIdParamsSchema = z.object({
  recipientId: z.string().trim().min(1, 'recipientId is required'),
});

export const getNotificationsQuerySchema = z.object({
  isRead: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  type: z.string().optional(),
});

export const createNotificationBodySchema = z.object({
  recipientClerkUserId: z.string().trim().min(1, 'recipientClerkUserId is required'),
  referralId: z.string().trim().optional(),
  type: z.enum([
    'referral_submitted',
    'referral_assigned',
    'referral_in_progress',
    'referral_completed',
    'referral_cancelled',
  ]),
  title: z.string().trim().min(1, 'title is required'),
  message: z.string().trim().min(1, 'message is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  deepLink: z.string().trim().optional(),
});