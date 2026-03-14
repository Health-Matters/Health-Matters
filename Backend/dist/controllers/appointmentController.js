"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointment = exports.respondToAppointment = exports.getAppointmentsByPractitionerId = exports.getAppointmentsByEmployeeId = void 0;
const Appointment_1 = __importDefault(require("../models/Appointment"));
const express_1 = require("@clerk/express");
const toPractitionerView = (appointment) => {
    const referral = appointment.referralId && typeof appointment.referralId === "object" ? appointment.referralId : null;
    const normalizedStatus = appointment.status === "scheduled" ? "assigned" : appointment.status;
    return {
        ...appointment,
        status: normalizedStatus,
        patientClerkUserId: appointment.employeeId,
        assignedByClerkUserId: appointment.assignedByClerkUserId || null,
        assignmentSource: appointment.assignmentSource || "admin",
        serviceType: appointment.serviceType || referral?.serviceType || null,
        referralReason: appointment.referralReason || referral?.referralReason || null,
    };
};
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
const getAppointmentsByPractitionerId = async (req, res) => {
    try {
        const { practitionerId } = req.params;
        const appointments = await Appointment_1.default.find({ practitionerId })
            .populate("referralId", "serviceType referralReason")
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json(appointments.map(toPractitionerView));
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch practitioner appointments",
            error,
        });
    }
};
exports.getAppointmentsByPractitionerId = getAppointmentsByPractitionerId;
const respondToAppointment = async (req, res) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { appointmentId } = req.params;
        const { status } = req.body;
        if (!status || !["confirmed", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Status must be confirmed or rejected" });
        }
        const appointment = await Appointment_1.default.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        if (String(appointment.practitionerId) !== auth.userId) {
            return res.status(403).json({ message: "You can only update your own appointments" });
        }
        if (status === "confirmed") {
            appointment.status = "confirmed";
        }
        else {
            appointment.status = "cancelled";
            appointment.cancellationReason = "Rejected by practitioner";
            appointment.cancelledAt = new Date();
        }
        await appointment.save();
        const updated = await Appointment_1.default.findById(appointmentId)
            .populate("referralId", "serviceType referralReason")
            .lean();
        res.status(200).json(toPractitionerView(updated));
    }
    catch (error) {
        res.status(500).json({ message: "Failed to respond to appointment", error });
    }
};
exports.respondToAppointment = respondToAppointment;
const cancelAppointment = async (req, res) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { appointmentId } = req.params;
        const appointment = await Appointment_1.default.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        if (String(appointment.practitionerId) !== auth.userId) {
            return res.status(403).json({ message: "You can only cancel your own appointments" });
        }
        appointment.status = "cancelled";
        appointment.cancellationReason = "Cancelled by practitioner";
        appointment.cancelledAt = new Date();
        await appointment.save();
        const updated = await Appointment_1.default.findById(appointmentId)
            .populate("referralId", "serviceType referralReason")
            .lean();
        res.status(200).json(toPractitionerView(updated));
    }
    catch (error) {
        res.status(500).json({ message: "Failed to cancel appointment", error });
    }
};
exports.cancelAppointment = cancelAppointment;
