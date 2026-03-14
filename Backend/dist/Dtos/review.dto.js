"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewBodySchema = exports.getReviewsQuerySchema = void 0;
const zod_1 = require("zod");
exports.getReviewsQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
});
exports.createReviewBodySchema = zod_1.z.object({
    patientName: zod_1.z.string().trim().min(1, 'patientName is required').max(120),
    message: zod_1.z.string().trim().min(1, 'message is required').max(1000),
    rating: zod_1.z.coerce.number().int().min(1).max(5),
});
