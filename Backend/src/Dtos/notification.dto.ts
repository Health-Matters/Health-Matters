import { z } from 'zod';

export const notificationTypeSchema = z.enum([
  'referral_submitted',
  'referral_triaged',
  'referral_assigned',
  'appointment_scheduled',
  'appointment_completed',
  'appointment_reminder_24h',
  'appointment_reminder_1h',
  'appointment_cancelled',
  'outcome_report_ready',
  'follow_up_required',
]);

export const notificationPrioritySchema = z.enum(['low', 'medium', 'high']);

export const notificationIdParamsSchema = z.object({
  notificationId: z.string().trim().min(1, 'notificationId is required'),
});

export const getNotificationsQuerySchema = z.object({
  unread: z.coerce.boolean().optional(),
  type: notificationTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
