import express from "express";
import { getAppointmentsByEmployeeId } from "../controllers/appointmentController";

const router = express.Router();

router.get("/employee/:employeeId", getAppointmentsByEmployeeId);

export default router;