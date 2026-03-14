"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const referralRoutes_1 = __importDefault(require("./routes/referralRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const logger_middleware_1 = require("./middlewares/logger-middleware");
const express_2 = require("@clerk/express");
const webhooks_1 = __importDefault(require("./middlewares/webhooks/webhooks"));
const errors_1 = require("./errors/errors");
// Load env vars before using them
dotenv_1.default.config();
const server = (0, express_1.default)();
// CORS Configuration (must be before other middleware)
server.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Webhooks (before body parsing)
server.use("/api/webhooks", webhooks_1.default);
// Middleware
server.use(express_1.default.json());
server.use(logger_middleware_1.loggerMiddleware);
server.use((0, express_2.clerkMiddleware)());
// Routes
server.use('/api/users', userRoutes_1.default);
server.use('/api/referrals', referralRoutes_1.default);
server.use('/api/services', serviceRoutes_1.default);
// Global Error Handler (must be after all routes)
server.use(errors_1.globalErrorHandlingMiddleware);
// Connect to Database
(0, db_1.default)();
// Start Server
const Port = process.env.PORT || 3000;
server.listen(Port, () => {
    console.log(`🚀 Server is running on port ${Port}`);
    console.log(`📡 API: http://localhost:${Port}`);
});
console.log("Hello world");
