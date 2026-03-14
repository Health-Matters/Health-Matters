// ⚠️  dotenv MUST be the very first thing — before any other imports —
// so that process.env values (CLERK_SECRET_KEY, MONGODB_URI, etc.)
// are available when @clerk/express and mongoose initialise.
import dotenv from "dotenv";
dotenv.config();

/*
 Backlog Traceability (Done Stories)
 Team A - Submit referral on behalf of a team member (TMA-001) . Done by Mahdi
 Team A - Add referral reason and supporting notes (TMA-002) . Done by Mahdi
 Team A - View submitted referrals with progress tracking (TMA-003) . Done by Mahdi
 Team A - View referral details and status updates (TMA-004) . Done by Mahdi
 Team A - Integrate manager referral backend endpoints (TMA-005) . Done by Savindu
 Team A - Deliver user-friendly and responsive referral workflow (TMA-006) . Done by Savindu and Mahdi

 Team B - Update manager personal details (TMB-005) . Done by Tevin and Ovin
 Team B - View health guidance documents and advice sheets (TMB-006) . Done by Tevin and Ovin

 Team C - Submit self-referral with validation (TMC-001) . Done by Vinuki and Senuthi, and Tharusha
 Team C - View referral history (TMC-002) . Done by Vinuki and Senuthi, and Tharusha
 Team C - View past and upcoming appointments (TMC-003) . Done by Vinuki and Senuthi, and Tharusha
 Team C - View service prices and durations (TMC-005) . Done by Vinuki and Senuthi
 Team C - View total referral activity count (TMC-006) . Done by Vinuki and Senuthi, and Tharusha
 Team C - View pending referrals indicator (TMC-007) . Done by Vinuki and Senuthi, and Tharusha

 Team D - Referral status change notifications for managers (TMD-001) . Done by Ramiru
 Team D - Cancel pending manager referrals (TMD-002) . Done by Sajana
 Team D - Aggregated team health overview analytics (TMD-003) . Done by Omidu
 Team D - SLA compliance statistics and escalation view (TMD-004) . Done by Sajana
 Team D - In-depth wellbeing analytics trends (TMD-005) . Done by Ramiru

 Team E - In-app notifications for appointments and outcomes (TME-001) . Done by Abhiman and Methmi
 Team E - Update user personal details (TME-002) . Done by Praneepa and Methmi
 Team E - Dashboard cards for upcoming appointments and advice activity (TME-003) . Done by Methmi

 Team F - Admin login and role management console access (TMF-001) . Done by Mirco and Danuja
 Team F - Filterable user list by role (TMF-002) . Done by Isuru and Upeka
 Team F - Create new user accounts (TMF-003) . Done by Mirco and Idusha
 Team F - Edit user details (TMF-004) . Done by Mirco and Danuja
 Team F - Centralized referral intake dashboard (TMF-005) . Done by Danuja and Isuru
 Team F - GDPR and ISO 27001 security compliance baseline (TMF-006) . Done by Mirco

 Team G - Practitioner appointment list access (TMG-001) . Done by Charin, Helika and Vinuli
 Team G - Practitioner-to-practitioner referral workflow (TMG-002) . Done by Vinuli
 Team G - Practitioner appointment cancellation workflow (TMG-003) . Done by Vinuli
 Team G - Practitioner appointment performance counters (TMG-004) . Done by Helika
 Team G - Unified practitioner referral management dashboard (TMG-005) . Done by Charin, Helika and Vinuli
 Team G - Practitioner profile details page (TMG-006) . Done by Helika

 Team H - View services table with operational filters (TMH-001) . Done by Piushan
 Team H - Create new service entries (TMH-002) . Done by Vishal
 Team H - Edit existing service details (TMH-003) . Done by Tenura
 Team H - Deactivate or archive services (TMH-004) . Done by Shamal
 Team H - Service summary KPI stats bar (TMH-005) . Done by Usara

 Team I - Help and advice page for referral guidance (TMI-001) . Done by Sasithi and Yovinma
 Team I - Employee referral list tracking view (TMI-002) . Done by Sasithi and Yovinma
 Team I - Referral status visibility badges (TMI-003) . Done by Sasithi and Yovinma
 Team I - Clinical summary view in referral details (TMI-004) . Done by Sasithi and Yovinma
 Team I - General wellbeing guidance while referrals are in progress (TMI-005) . Done by Sasithi and Yovinma

 Team J - View recent patient reviews dashboard cards (TMJ-001) . Done by Yahanima and Senithi
 Team J - Submit new patient reviews (TMJ-002) . Done by Irindu and Dulmin
 Team J - Star rating component for review scoring (TMJ-003) . Done by Akith and Yahanima
 Team J - Search patient records in practitioner view (TMJ-005) . Done by Senithi, Yahanima and Dulmin
 Team J - View patient details in modal popup (TMJ-006) . Done by Akith and Irindu
 Team J - Practitioner patient statistics cards (TMJ-007) . Done by Dulmin, Yahanima and Senithi
*/

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import appointmentRoutes from "./routes/appointmentRoutes";
import referralRoutes from './routes/referralRoutes';
import serviceRoutes from './routes/serviceRoutes';
import notificationRoutes from './routes/notificationRoutes';
import medicalRecordRoutes from './routes/medicalRecordRoutes';
import reviewRoutes from './routes/reviewRoutes';
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
server.use('/api/reviews', reviewRoutes);

// Global Error Handler (must be the last middleware)
server.use(globalErrorHandlingMiddleware);

// Connect to Database & start server
connectDB();

const Port = process.env.PORT || 3000;
server.listen(Port, () => {
  console.log(`🚀 Server is running on port ${Port}`);
  console.log(`📡 API: http://localhost:${Port}`);
});