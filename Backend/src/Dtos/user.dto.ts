import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'practitioner', 'manager', 'employee']);

export const userAddressSchema = z.object({
  line1: z.string().trim().optional(),
  line2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  postcode: z.string().trim().optional(),
});

export const userPreferencesSchema = z.object({
  notifications: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
    })
    .optional(),
});

export const createUserBodySchema = z.object({
  userName: z.string().trim().optional(),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  dateOfBirth: z.coerce.date().optional(),
  email: z.string().trim().email(),
  password: z.string().min(8).optional(),
  role: userRoleSchema.optional(),
  address: userAddressSchema.optional(),
  department: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  preferences: userPreferencesSchema.optional(),
  clerkUserId: z.string().trim().min(1, 'clerkUserId is required'),
});

export const updateUserBodySchema = createUserBodySchema
  .omit({ clerkUserId: true, email: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

export const getUsersQuerySchema = z.object({
  role: userRoleSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  clerkUserId: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
});
