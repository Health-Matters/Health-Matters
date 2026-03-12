"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToAppointmentById = exports.getAppointmentByReferralId = exports.getAppointmentsByPatientId = exports.getAppointmentsByPractitionerId = exports.getAllAppointments = void 0;
const express_1 = require("@clerk/express");
const appointment_dto_1 = require("../Dtos/appointment.dto");
const Appointment_1 = require("../models/Appointment");
const Referral_1 = require("../models/Referral");
const errors_1 = require("../errors/errors");
const appointmentFlow_1 = require("../utils/appointmentFlow");
const formatValidationErrors = (error) => error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
}));
const getAllAppointments = async (_req, res, next) => {
    try {
        const appointments = await Appointment_1.Appointment.find().sort({ createdAt: -1 });
        res.status(200).json(appointments);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllAppointments = getAllAppointments;
const getAppointmentsByPractitionerId = async (req, res, next) => {
    try {
        const parsedParams = appointment_dto_1.appointmentPractitionerIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const appointments = await Appointment_1.Appointment.find({
            practitionerClerkUserId: parsedParams.data.practitionerId,
        }).sort({ createdAt: -1 });
        res.status(200).json(appointments);
    }
    catch (error) {
        next(error);
    }
};
exports.getAppointmentsByPractitionerId = getAppointmentsByPractitionerId;
const getAppointmentsByPatientId = async (req, res, next) => {
    try {
        const parsedParams = appointment_dto_1.appointmentPatientIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const appointments = await Appointment_1.Appointment.find({
            patientClerkUserId: parsedParams.data.patientId,
        }).sort({ createdAt: -1 });
        res.status(200).json(appointments);
    }
    catch (error) {
        next(error);
    }
};
exports.getAppointmentsByPatientId = getAppointmentsByPatientId;
const getAppointmentByReferralId = async (req, res, next) => {
    try {
        const parsedParams = appointment_dto_1.appointmentReferralIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const appointment = await Appointment_1.Appointment.findOne({ referralId: parsedParams.data.referralId });
        if (!appointment) {
            throw new errors_1.NotFoundError('Appointment not found for this referral');
        }
        res.status(200).json(appointment);
    }
    catch (error) {
        next(error);
    }
};
exports.getAppointmentByReferralId = getAppointmentByReferralId;
const respondToAppointmentById = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const parsedParams = appointment_dto_1.appointmentIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const parsedBody = appointment_dto_1.respondToAppointmentBodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const appointment = await Appointment_1.Appointment.findById(parsedParams.data.appointmentId);
        if (!appointment) {
            throw new errors_1.NotFoundError('Appointment not found');
        }
        if (appointment.practitionerClerkUserId && appointment.practitionerClerkUserId !== auth.userId) {
            throw new errors_1.UnauthorizedError('You are not allowed to respond to this appointment');
        }
        const referral = await Referral_1.Referral.findById(appointment.referralId);
        if (!referral) {
            throw new errors_1.NotFoundError('Referral not found for appointment');
        }
        let updatedAppointment;
        if (parsedBody.data.status === 'confirmed') {
            referral.referralStatus = 'accepted';
            referral.practitionerClerkUserId = auth.userId;
            referral.acceptedDate = new Date();
            updatedAppointment = await (0, appointmentFlow_1.confirmAppointmentFromReferral)({
                referral,
                practitionerClerkUserId: auth.userId,
            });
        }
        else {
            referral.referralStatus = 'rejected';
            referral.practitionerClerkUserId = appointment.practitionerClerkUserId || auth.userId;
            referral.rejectedDate = new Date();
            updatedAppointment = await (0, appointmentFlow_1.rejectAppointmentFromReferral)({
                referral,
                practitionerClerkUserId: appointment.practitionerClerkUserId || auth.userId,
            });
        }
        await referral.save();
        res.status(200).json(updatedAppointment);
    }
    catch (error) {
        next(error);
    }
};
exports.respondToAppointmentById = respondToAppointmentById;
