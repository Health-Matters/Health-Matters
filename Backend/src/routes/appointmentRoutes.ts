import express from 'express';
import {
  cancelAppointmentById,
  getAllAppointments,
  getAppointmentByReferralId,
  getAppointmentsByPatientId,
  getAppointmentsByPractitionerId,
  respondToAppointmentById,
} from '../controllers/appointmentController';

const AppointmentRouter = express.Router();

AppointmentRouter.get('/', getAllAppointments);
AppointmentRouter.get('/referral/:referralId', getAppointmentByReferralId);
AppointmentRouter.get('/patient/:patientId', getAppointmentsByPatientId);
AppointmentRouter.get('/practitioner/:practitionerId', getAppointmentsByPractitionerId);
AppointmentRouter.put('/:appointmentId/respond', respondToAppointmentById);
AppointmentRouter.put('/:appointmentId/cancel', cancelAppointmentById);

export default AppointmentRouter;