import express from "express";
import {
	cancelAppointment,
	getAppointmentsByEmployeeId,
	getAppointmentsByPractitionerId,
	respondToAppointment,
} from "../controllers/appointmentController";
import { requireClerkAuth } from "../middlewares/auth-middleware";

const router = express.Router();

router.use(requireClerkAuth);

router.get("/employee/:employeeId", getAppointmentsByEmployeeId);
router.get("/practitioner/:practitionerId", getAppointmentsByPractitionerId);
router.patch("/:appointmentId/respond", respondToAppointment);
router.patch("/:appointmentId/cancel", cancelAppointment);

export default router;