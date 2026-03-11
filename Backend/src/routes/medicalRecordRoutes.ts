import express from "express";
import { getAccessLogCountByEmployeeId } from "../controllers/medicalRecordController";

const router = express.Router();

// GET /api/medical-records/access-count/:employeeId
router.get("/access-count/:employeeId", getAccessLogCountByEmployeeId);

export default router;
