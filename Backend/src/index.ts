import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import referralRoutes from './routes/referralRoutes';
import serviceRoutes from './routes/serviceRoutes';
import { loggerMiddleware } from './middlewares/logger-middleware';
import { clerkMiddleware } from '@clerk/express';
import webHooksRouter from './middlewares/webhooks/webhooks';
import { globalErrorHandlingMiddleware } from './errors/errors';
// 1. Import (add near other imports at the top)
import notificationRoutes from './routes/notificationRoutes';

// Load env vars before using them
console.log("HELLO THERE")

const server = express();

// CORS Configuration (must be before other middleware)
server.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Webhooks (before body parsing)
server.use("/api/webhooks", webHooksRouter);
// 2. Mount (add with other server.use() calls, before error handler)
server.use('/api/notifications', notificationRoutes);
// Middleware
server.use(express.json());
server.use(loggerMiddleware);
server.use(clerkMiddleware());
// Routes
server.use('/api/users', userRoutes);
server.use('/api/referrals', referralRoutes);
server.use('/api/services', serviceRoutes);
// Global Error Handler (must be after all routes)
server.use(globalErrorHandlingMiddleware);
// Connect to Database
connectDB();
// Start Server
    const Port = 3001;
    server.listen(Port, () => {
      console.log(`🚀 Server is running on port ${Port}`);
      console.log(`📡 API: http://localhost:3001`);
    });

console.log("Hello world");