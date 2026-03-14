"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersQuerySchema = exports.updateUserBodySchema = exports.createUserBodySchema = exports.userPreferencesSchema = exports.userAddressSchema = exports.userRoleSchema = void 0;
const zod_1 = require("zod");
exports.userRoleSchema = zod_1.z.enum(['admin', 'practitioner', 'manager', 'employee']);
exports.userAddressSchema = zod_1.z.object({
    line1: zod_1.z.string().trim().optional(),
    line2: zod_1.z.string().trim().optional(),
    city: zod_1.z.string().trim().optional(),
    postcode: zod_1.z.string().trim().optional(),
});
exports.userPreferencesSchema = zod_1.z.object({
    notifications: zod_1.z
        .object({
        email: zod_1.z.boolean().optional(),
        sms: zod_1.z.boolean().optional(),
    })
        .optional(),
});
exports.createUserBodySchema = zod_1.z.object({
    userName: zod_1.z.string().trim().optional(),
    firstName: zod_1.z.string().trim().optional(),
    lastName: zod_1.z.string().trim().optional(),
    phone: zod_1.z.string().trim().optional(),
    dateOfBirth: zod_1.z.coerce.date().optional(),
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(8).optional(),
    role: exports.userRoleSchema.optional(),
    address: exports.userAddressSchema.optional(),
    department: zod_1.z.string().trim().optional(),
    isActive: zod_1.z.boolean().optional(),
    preferences: exports.userPreferencesSchema.optional(),
    clerkUserId: zod_1.z.string().trim().min(1, 'clerkUserId is required'),
});
exports.updateUserBodySchema = exports.createUserBodySchema
    .omit({ clerkUserId: true, email: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
exports.getUsersQuerySchema = zod_1.z.object({
    role: exports.userRoleSchema.optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
    clerkUserId: zod_1.z.string().trim().optional(),
    email: zod_1.z.string().trim().email().optional(),
});
