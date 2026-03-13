"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessLogCountByEmployeeId = void 0;
const MedicalRecord_1 = __importDefault(require("../models/MedicalRecord"));
// Get count of medical record access log entries for an employee
const getAccessLogCountByEmployeeId = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const records = await MedicalRecord_1.default.find({ employeeId }).select("accessLog");
        const accessCount = records.reduce((sum, record) => {
            const log = Array.isArray(record.accessLog) ? record.accessLog : [];
            return sum + log.length;
        }, 0);
        res.status(200).json({ accessCount });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch medical record access count",
            error,
        });
    }
};
exports.getAccessLogCountByEmployeeId = getAccessLogCountByEmployeeId;
