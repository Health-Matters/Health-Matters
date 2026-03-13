"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ⚠️  dotenv MUST be the very first thing — before any other imports —
// so that process.env values (CLERK_SECRET_KEY, MONGODB_URI, etc.)
// are available when @clerk/express and mongoose initialise.
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const referralRoutes_1 = __importDefault(require("./routes/referralRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const medicalRecordRoutes_1 = __importDefault(require("./routes/medicalRecordRoutes"));
const logger_middleware_1 = require("./middlewares/logger-middleware");
const express_2 = require("@clerk/express");
const webhooks_1 = __importDefault(require("./middlewares/webhooks/webhooks"));
const errors_1 = require("./errors/errors");
const server = (0, express_1.default)();
// CORS Configuration (must be before other middleware)
server.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Webhooks (before body parsing — svix needs raw body for signature verification)
server.use("/api/webhooks", webhooks_1.default);
// Body parsing & logging
server.use(express_1.default.json());
server.use(logger_middleware_1.loggerMiddleware);
// Clerk auth middleware — reads CLERK_SECRET_KEY from process.env
// Must be registered after dotenv.config() has run (guaranteed above)
server.use((0, express_2.clerkMiddleware)());
// Routes
server.use("/api/appointments", appointmentRoutes_1.default);
server.use('/api/users', userRoutes_1.default);
server.use('/api/referrals', referralRoutes_1.default);
server.use('/api/services', serviceRoutes_1.default);
server.use('/api/notifications', notificationRoutes_1.default);
server.use('/api/medical-records', medicalRecordRoutes_1.default);
// Global Error Handler (must be the last middleware)
server.use(errors_1.globalErrorHandlingMiddleware);
// Connect to Database & start server
(0, db_1.default)();
const Port = process.env.PORT || 3000;
server.listen(Port, () => {
    console.log(`🚀 Server is running on port ${Port}`);
    console.log(`📡 API: http://localhost:${Port}`);
});
