"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentsByEmployeeId = void 0;
const Appointment_1 = __importDefault(require("../models/Appointment"));
// Get appointments for an employee (patient timeline)
const getAppointmentsByEmployeeId = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const appointments = await Appointment_1.default.find({
            employeeId
        })
            .populate("practitionerId", "firstName lastName")
            .sort({ scheduledDate: -1 });
        res.status(200).json(appointments);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch appointments",
            error
        });
    }
};
exports.getAppointmentsByEmployeeId = getAppointmentsByEmployeeId;
