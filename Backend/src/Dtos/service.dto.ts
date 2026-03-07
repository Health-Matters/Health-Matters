import { z } from 'zod';

export const serviceCategorySchema = z.enum([
  'occupational_health',
  'mental_health',
  'physiotherapy',
  'health_screening',
  'counselling',
  'ergonomic_assessment',
]);

export const createServiceBodySchema = z.object({
  name: z.string().trim().min(1, 'Service name is required'),
  description: z.string().trim().optional(),
  category: serviceCategorySchema.optional(),
  defaultDuration: z.number().min(15).max(240).optional(),
  isActive: z.boolean().optional(),
});

export const updateServiceBodySchema = createServiceBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field is required for update',
  }
);

export const serviceIdParamsSchema = z.object({
  serviceId: z.string().trim().min(1, 'serviceId is required'),
});

export const getServicesQuerySchema = z.object({
  category: serviceCategorySchema.optional(),
  isActive: z.coerce.boolean().optional(),
  name: z.string().trim().optional(),
});
