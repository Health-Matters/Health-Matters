"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsQuerySchema = exports.notificationIdParamsSchema = exports.notificationPrioritySchema = exports.notificationTypeSchema = void 0;
const zod_1 = require("zod");
exports.notificationTypeSchema = zod_1.z.enum([
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
exports.notificationPrioritySchema = zod_1.z.enum(['low', 'medium', 'high']);
exports.notificationIdParamsSchema = zod_1.z.object({
    notificationId: zod_1.z.string().trim().min(1, 'notificationId is required'),
});
exports.getNotificationsQuerySchema = zod_1.z.object({
    unread: zod_1.z.coerce.boolean().optional(),
    type: exports.notificationTypeSchema.optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(50),
});
