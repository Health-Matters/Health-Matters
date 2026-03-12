import { z } from 'zod';

export const appointmentStatusSchema = z.enum([
  'pending',
  'assigned',
  'confirmed',
  'rejected',
  'cancelled',
  'completed',
]);

export const appointmentIdParamsSchema = z.object({
  appointmentId: z.string().trim().min(1, 'appointmentId is required'),
});

export const appointmentReferralIdParamsSchema = z.object({
  referralId: z.string().trim().min(1, 'referralId is required'),
});

export const appointmentPractitionerIdParamsSchema = z.object({
  practitionerId: z.string().trim().min(1, 'practitionerId is required'),
});

export const appointmentPatientIdParamsSchema = z.object({
  patientId: z.string().trim().min(1, 'patientId is required'),
});

export const respondToAppointmentBodySchema = z.object({
  status: z.enum(['confirmed', 'rejected']),
});