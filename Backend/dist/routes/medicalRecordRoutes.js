"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const medicalRecordController_1 = require("../controllers/medicalRecordController");
const router = express_1.default.Router();
// GET /api/medical-records/access-count/:employeeId
router.get("/access-count/:employeeId", medicalRecordController_1.getAccessLogCountByEmployeeId);
exports.default = router;
