"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appointmentController_1 = require("../controllers/appointmentController");
const AppointmentRouter = express_1.default.Router();
AppointmentRouter.get('/', appointmentController_1.getAllAppointments);
AppointmentRouter.get('/referral/:referralId', appointmentController_1.getAppointmentByReferralId);
AppointmentRouter.get('/patient/:patientId', appointmentController_1.getAppointmentsByPatientId);
AppointmentRouter.get('/practitioner/:practitionerId', appointmentController_1.getAppointmentsByPractitionerId);
AppointmentRouter.put('/:appointmentId/respond', appointmentController_1.respondToAppointmentById);
exports.default = AppointmentRouter;
