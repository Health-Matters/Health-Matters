import { z } from 'zod';

export const referralStatusSchema = z.enum([
  'pending',
  'accepted',
  'rejected',
  
]);

const optionalDateSchema = z.coerce.date().optional();

export const patientIdParamsSchema = z.object({
  patientId: z.string().trim().min(1, 'patientId is required'),
});

export const practitionerIdParamsSchema = z.object({
  practitionerId: z.string().trim().min(1, 'practitionerId is required'),
});

export const referralIdParamsSchema = z.object({
  referralId: z.string().trim().min(1, 'referralId is required'),
});

// managerIdParamsSchema intentionally removed —
// manager identity is derived from the Clerk token, never passed as a URL param

export const createReferralBodySchema = z.object({
  patientClerkUserId:      z.string().trim().min(1, 'patientClerkUserId is required'),
  // submittedByClerkUserId intentionally omitted — always set server-side from Clerk token
  practitionerClerkUserId: z.string().trim().optional(),
  serviceType:             z.string().trim().optional(),
  referralReason:          z.string().trim().optional(),
  referralStatus:          referralStatusSchema.optional(),
  notes:                   z.string().trim().optional(),
  assignedbyClerkUserId:   z.string().trim().optional(),
  assignedDate:            optionalDateSchema,
  acceptedDate:            optionalDateSchema,
  rejectedDate:            optionalDateSchema,
  completedDate:           optionalDateSchema,
  isConfidential:          z.boolean().optional(),
});

export const updateReferralBodySchema = createReferralBodySchema
  .omit({ patientClerkUserId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

export const assignReferralBodySchema = z.object({
  practitionerClerkUserId: z.string().trim().min(1, 'practitionerClerkUserId is required'),
});

// MGR-005: query params for filtering/pagination — no managerId field,
// identity comes from the Clerk token in the controller
export const myReferralsQuerySchema = z.object({
  status:      referralStatusSchema.optional(),
  serviceType: z.string().trim().optional(),
  search:      z.string().trim().optional(),
  dateFrom:    optionalDateSchema,
  dateTo:      optionalDateSchema,
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(20).default(20),
});