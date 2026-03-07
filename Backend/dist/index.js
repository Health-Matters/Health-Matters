"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const referralRoutes_1 = __importDefault(require("./routes/referralRoutes"));
const logger_middleware_1 = require("./middlewares/logger-middleware");
const express_2 = require("@clerk/express");
const webhooks_1 = __importDefault(require("./middlewares/webhooks/webhooks"));
// Load env vars before using them
dotenv_1.default.config();
const server = (0, express_1.default)();
// Webhooks
server.use("/api/webhooks", webhooks_1.default);
// Middleware
server.use((0, express_2.clerkMiddleware)());
server.use(express_1.default.json());
server.use(logger_middleware_1.loggerMiddleware);
// Routes
server.use('/api/users', userRoutes_1.default);
server.use('/api/referrals', referralRoutes_1.default);
// Connect to Database
(0, db_1.default)();
// Start Server
const Port = process.env.PORT || 3000;
server.listen(Port, () => {
    console.log(`🚀 Server is running on port ${Port}`);
    console.log(`📡 API: http://localhost:${Port}`);
});
console.log("Hello world");
