import { z } from 'zod';

export const getReviewsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const createReviewBodySchema = z.object({
  patientName: z.string().trim().min(1, 'patientName is required').max(120),
  message: z.string().trim().min(1, 'message is required').max(1000),
  rating: z.coerce.number().int().min(1).max(5),
});
