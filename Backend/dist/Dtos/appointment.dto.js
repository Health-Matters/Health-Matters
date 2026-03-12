"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToAppointmentBodySchema = exports.appointmentPatientIdParamsSchema = exports.appointmentPractitionerIdParamsSchema = exports.appointmentReferralIdParamsSchema = exports.appointmentIdParamsSchema = exports.appointmentStatusSchema = void 0;
const zod_1 = require("zod");
exports.appointmentStatusSchema = zod_1.z.enum([
    'pending',
    'assigned',
    'confirmed',
    'rejected',
    'cancelled',
    'completed',
]);
exports.appointmentIdParamsSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().trim().min(1, 'appointmentId is required'),
});
exports.appointmentReferralIdParamsSchema = zod_1.z.object({
    referralId: zod_1.z.string().trim().min(1, 'referralId is required'),
});
exports.appointmentPractitionerIdParamsSchema = zod_1.z.object({
    practitionerId: zod_1.z.string().trim().min(1, 'practitionerId is required'),
});
exports.appointmentPatientIdParamsSchema = zod_1.z.object({
    patientId: zod_1.z.string().trim().min(1, 'patientId is required'),
});
exports.respondToAppointmentBodySchema = zod_1.z.object({
    status: zod_1.z.enum(['confirmed', 'rejected']),
});
