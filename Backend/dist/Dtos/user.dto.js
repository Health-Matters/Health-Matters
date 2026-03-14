"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignManagerBodySchema = exports.adminUpdateUserBodySchema = exports.createUserByAdminBodySchema = exports.updateUserRoleBodySchema = exports.userIdParamsSchema = exports.getUsersQuerySchema = exports.updateUserBodySchema = exports.createUserBodySchema = exports.userPreferencesSchema = exports.userAddressSchema = exports.userRoleSchema = void 0;
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
    clerkUserId: zod_1.z.string().trim().min(1, 'clerkUserId is required').optional(),
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
exports.userIdParamsSchema = zod_1.z.object({
    userId: zod_1.z.string().trim().min(1, 'userId is required'),
});
exports.updateUserRoleBodySchema = zod_1.z.object({
    role: exports.userRoleSchema,
});
exports.createUserByAdminBodySchema = zod_1.z.object({
    firstName: zod_1.z.string().trim().min(1, 'firstName is required'),
    lastName: zod_1.z.string().trim().min(1, 'lastName is required'),
    email: zod_1.z.string().trim().email(),
    role: exports.userRoleSchema,
    phone: zod_1.z.string().trim().optional(),
    department: zod_1.z.string().trim().optional(),
    userName: zod_1.z.string().trim().optional(),
});
exports.adminUpdateUserBodySchema = zod_1.z.object({
    firstName: zod_1.z.string().trim().optional(),
    lastName: zod_1.z.string().trim().optional(),
    email: zod_1.z.string().trim().email().optional(),
    role: exports.userRoleSchema.optional(),
    phone: zod_1.z.string().trim().optional(),
    department: zod_1.z.string().trim().optional(),
    userName: zod_1.z.string().trim().optional(),
    managerClerkUserId: zod_1.z.string().trim().optional(),
    isActive: zod_1.z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
exports.assignManagerBodySchema = zod_1.z.object({
    managerClerkUserId: zod_1.z.string().trim().min(1, 'managerClerkUserId is required'),
});
