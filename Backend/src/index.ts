// ⚠️  dotenv MUST be the very first thing — before any other imports —
// so that process.env values (CLERK_SECRET_KEY, MONGODB_URI, etc.)
// are available when @clerk/express and mongoose initialise.
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import appointmentRoutes from "./routes/appointmentRoutes";
import referralRoutes from './routes/referralRoutes';
import serviceRoutes from './routes/serviceRoutes';
import notificationRoutes from './routes/notificationRoutes';
import medicalRecordRoutes from './routes/medicalRecordRoutes';
import { loggerMiddleware } from './middlewares/logger-middleware';
import { clerkMiddleware } from '@clerk/express';
import webHooksRouter from './middlewares/webhooks/webhooks';
import { globalErrorHandlingMiddleware } from './errors/errors';

const server = express();

// CORS Configuration (must be before other middleware)
server.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Webhooks (before body parsing — svix needs raw body for signature verification)
server.use("/api/webhooks", webHooksRouter);

// Body parsing & logging
server.use(express.json());
server.use(loggerMiddleware);

// Clerk auth middleware — reads CLERK_SECRET_KEY from process.env
// Must be registered after dotenv.config() has run (guaranteed above)
server.use(clerkMiddleware());

// Routes
server.use("/api/appointments", appointmentRoutes);
server.use('/api/users', userRoutes);
server.use('/api/referrals', referralRoutes);
server.use('/api/services', serviceRoutes);
server.use('/api/notifications', notificationRoutes);
server.use('/api/medical-records', medicalRecordRoutes);

// Global Error Handler (must be the last middleware)
server.use(globalErrorHandlingMiddleware);

// Connect to Database & start server
connectDB();

const Port = process.env.PORT || 3000;
server.listen(Port, () => {
  console.log(`🚀 Server is running on port ${Port}`);
  console.log(`📡 API: http://localhost:${Port}`);
});