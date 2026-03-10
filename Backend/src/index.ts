import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import appointmentRoutes from "./routes/appointmentRoutes";
import referralRoutes from './routes/referralRoutes';
import serviceRoutes from './routes/serviceRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { loggerMiddleware } from './middlewares/logger-middleware';
import { clerkMiddleware } from '@clerk/express';
import webHooksRouter from './middlewares/webhooks/webhooks';
import { globalErrorHandlingMiddleware } from './errors/errors';
// Load env vars before using them
dotenv.config(); 

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

// Middleware
server.use(express.json());
server.use(loggerMiddleware);
server.use(clerkMiddleware());
// Routes
server.use("/api/appointments", appointmentRoutes);
server.use('/api/users', userRoutes);
server.use('/api/referrals', referralRoutes);
server.use('/api/services', serviceRoutes);
server.use('/api/notifications', notificationRoutes);
// Global Error Handler (must be after all routes)
server.use(globalErrorHandlingMiddleware);
// Connect to Database
connectDB();
// Start Server
    const Port = process.env.PORT || 3000;
    server.listen(Port, () => {
      console.log(`🚀 Server is running on port ${Port}`);
      console.log(`📡 API: http://localhost:${Port}`);
    });

console.log("Hello world");

