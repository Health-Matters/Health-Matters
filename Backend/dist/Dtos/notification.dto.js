"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.notificationIdParamsSchema = zod_1.z.object({
    notificationId: zod_1.z.string().trim().min(1, 'notificationId is required'),
});
