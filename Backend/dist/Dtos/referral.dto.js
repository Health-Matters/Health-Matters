"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignReferralBodySchema = exports.updateReferralBodySchema = exports.createReferralBodySchema = exports.referralIdParamsSchema = exports.practitionerIdParamsSchema = exports.patientIdParamsSchema = exports.referralStatusSchema = void 0;
const zod_1 = require("zod");
exports.referralStatusSchema = zod_1.z.enum(['pending', 'accepted', 'rejected']);
const optionalDateSchema = zod_1.z.coerce.date().optional();
exports.patientIdParamsSchema = zod_1.z.object({
    patientId: zod_1.z.string().trim().min(1, 'patientId is required'),
});
exports.practitionerIdParamsSchema = zod_1.z.object({
    practitionerId: zod_1.z.string().trim().min(1, 'practitionerId is required'),
});
exports.referralIdParamsSchema = zod_1.z.object({
    referralId: zod_1.z.string().trim().min(1, 'referralId is required'),
});
exports.createReferralBodySchema = zod_1.z.object({
    patientClerkUserId: zod_1.z.string().trim().min(1, 'patientClerkUserId is required'),
    submittedByClerkUserId: zod_1.z.string().trim().optional(),
    practitionerClerkUserId: zod_1.z.string().trim().optional(),
    serviceType: zod_1.z.string().trim().optional(),
    referralReason: zod_1.z.string().trim().optional(),
    referralStatus: exports.referralStatusSchema.optional(),
    notes: zod_1.z.string().trim().optional(),
    assignedbyClerkUserId: zod_1.z.string().trim().optional(),
    assignedDate: optionalDateSchema,
    acceptedDate: optionalDateSchema,
    rejectedDate: optionalDateSchema,
    completedDate: optionalDateSchema,
});
exports.updateReferralBodySchema = exports.createReferralBodySchema
    .omit({ patientClerkUserId: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
exports.assignReferralBodySchema = zod_1.z.object({
    practitionerClerkUserId: zod_1.z.string().trim().min(1, 'practitionerClerkUserId is required'),
});
