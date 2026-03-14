"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServicesQuerySchema = exports.serviceIdParamsSchema = exports.updateServiceBodySchema = exports.createServiceBodySchema = exports.serviceCategorySchema = void 0;
const zod_1 = require("zod");
exports.serviceCategorySchema = zod_1.z.enum([
    'occupational_health',
    'mental_health',
    'physiotherapy',
    'health_screening',
    'counselling',
    'ergonomic_assessment',
]);
exports.createServiceBodySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, 'Service name is required'),
    description: zod_1.z.string().trim().optional(),
    category: exports.serviceCategorySchema.optional(),
    defaultDuration: zod_1.z.number().min(15).max(240).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateServiceBodySchema = exports.createServiceBodySchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
exports.serviceIdParamsSchema = zod_1.z.object({
    serviceId: zod_1.z.string().trim().min(1, 'serviceId is required'),
});
exports.getServicesQuerySchema = zod_1.z.object({
    category: exports.serviceCategorySchema.optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
    name: zod_1.z.string().trim().optional(),
});
