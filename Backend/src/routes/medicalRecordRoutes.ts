import express from "express";
import { getAccessLogCountByEmployeeId } from "../controllers/medicalRecordController";
import { requireClerkAuth } from "../middlewares/auth-middleware";

const router = express.Router();

router.use(requireClerkAuth);

// GET /api/medical-records/access-count/:employeeId
router.get("/access-count/:employeeId", getAccessLogCountByEmployeeId);

export default router;
