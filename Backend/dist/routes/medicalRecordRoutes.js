"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const medicalRecordController_1 = require("../controllers/medicalRecordController");
const auth_middleware_1 = require("../middlewares/auth-middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.requireClerkAuth);
// GET /api/medical-records/access-count/:employeeId
router.get("/access-count/:employeeId", medicalRecordController_1.getAccessLogCountByEmployeeId);
exports.default = router;
