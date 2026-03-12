"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignReferralById = exports.updateReferralById = exports.deleteReferralByPatientId = exports.updateReferralByPatientId = exports.createReferral = exports.getReferralsByPractitionerId = exports.getReferralsByPatientId = exports.getAllReferrals = void 0;
const Referral_1 = require("../models/Referral");
const referral_dto_1 = require("../Dtos/referral.dto");
const errors_1 = require("../errors/errors");
const express_1 = require("@clerk/express");
const appointmentFlow_1 = require("../utils/appointmentFlow");
const formatValidationErrors = (error) => error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
}));
const getAllReferrals = async (req, res, next) => {
    try {
        console.log('🔵 GET /api/referrals - Fetching all referrals');
        const referrals = await Referral_1.Referral.find().sort({ createdAt: -1 });
        console.log(`✅ Found ${referrals.length} referrals`);
        res.status(200).json(referrals);
    }
    catch (error) {
        console.error('❌ Error in getAllReferrals:', error);
        next(error);
    }
};
exports.getAllReferrals = getAllReferrals;
const getReferralsByPatientId = async (req, res, next) => {
    try {
        const parsedParams = referral_dto_1.patientIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const { patientId } = parsedParams.data;
        const referrals = await Referral_1.Referral.find({ patientClerkUserId: patientId }).sort({ createdAt: -1 });
        res.status(200).json(referrals);
    }
    catch (error) {
        next(error);
    }
};
exports.getReferralsByPatientId = getReferralsByPatientId;
const getReferralsByPractitionerId = async (req, res, next) => {
    try {
        const parsedParams = referral_dto_1.practitionerIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const { practitionerId } = parsedParams.data;
        const referrals = await Referral_1.Referral.find({ practitionerClerkUserId: practitionerId }).sort({ createdAt: -1 });
        res.status(200).json(referrals);
    }
    catch (error) {
        next(error);
    }
};
exports.getReferralsByPractitionerId = getReferralsByPractitionerId;
const createReferral = async (req, res, next) => {
    try {
        const parsedBody = referral_dto_1.createReferralBodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const newReferral = await Referral_1.Referral.create(parsedBody.data);
        await (0, appointmentFlow_1.createPendingAppointmentForReferral)(newReferral);
        res.status(201).json(newReferral);
    }
    catch (error) {
        next(error);
    }
};
exports.createReferral = createReferral;
const updateReferralByPatientId = async (req, res, next) => {
    try {
        const parsedParams = referral_dto_1.patientIdParamsSchema.safeParse(req.params);
        const parsedBody = referral_dto_1.updateReferralBodySchema.safeParse(req.body);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const { patientId } = parsedParams.data;
        const updateResult = await Referral_1.Referral.updateMany({ patientClerkUserId: patientId }, { $set: parsedBody.data }, { runValidators: true });
        if (updateResult.matchedCount === 0) {
            throw new errors_1.NotFoundError('No referrals found for this patientId');
        }
        const updatedReferrals = await Referral_1.Referral.find({ patientClerkUserId: patientId }).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Referrals updated successfully',
            modifiedCount: updateResult.modifiedCount,
            referrals: updatedReferrals,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateReferralByPatientId = updateReferralByPatientId;
const deleteReferralByPatientId = async (req, res, next) => {
    try {
        const parsedParams = referral_dto_1.patientIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const { patientId } = parsedParams.data;
        const deleteResult = await Referral_1.Referral.deleteMany({ patientClerkUserId: patientId });
        if (deleteResult.deletedCount === 0) {
            throw new errors_1.NotFoundError('No referrals found for this patientId');
        }
        res.status(200).json({
            message: 'Referrals deleted successfully',
            deletedCount: deleteResult.deletedCount,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteReferralByPatientId = deleteReferralByPatientId;
const updateReferralById = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const parsedParams = referral_dto_1.referralIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const parsedBody = referral_dto_1.updateReferralBodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const { referralId } = parsedParams.data;
        const existingReferral = await Referral_1.Referral.findById(referralId);
        if (!existingReferral) {
            throw new errors_1.NotFoundError('Referral not found');
        }
        const updateFields = { ...parsedBody.data };
        // When a practitioner accepts, record their ID from the token (never trust the client for this)
        if (parsedBody.data.referralStatus === 'accepted') {
            updateFields.practitionerClerkUserId = auth.userId;
            updateFields.acceptedDate = new Date();
        }
        if (parsedBody.data.referralStatus === 'rejected') {
            updateFields.rejectedDate = new Date();
        }
        const updatedReferral = await Referral_1.Referral.findByIdAndUpdate(referralId, { $set: updateFields }, { new: true, runValidators: true });
        if (!updatedReferral) {
            throw new errors_1.NotFoundError('Referral not found');
        }
        if (parsedBody.data.referralStatus === 'accepted') {
            await (0, appointmentFlow_1.confirmAppointmentFromReferral)({
                referral: updatedReferral,
                practitionerClerkUserId: auth.userId,
            });
        }
        if (parsedBody.data.referralStatus === 'rejected') {
            await (0, appointmentFlow_1.rejectAppointmentFromReferral)({
                referral: updatedReferral,
                practitionerClerkUserId: existingReferral.practitionerClerkUserId,
            });
        }
        res.status(200).json(updatedReferral);
    }
    catch (error) {
        next(error);
    }
};
exports.updateReferralById = updateReferralById;
const assignReferralById = async (req, res, next) => {
    try {
        const parsedParams = referral_dto_1.referralIdParamsSchema.safeParse(req.params);
        const parsedBody = referral_dto_1.assignReferralBodySchema.safeParse(req.body);
        const auth = (0, express_1.getAuth)(req);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const { referralId } = parsedParams.data;
        const { practitionerClerkUserId } = parsedBody.data;
        const updatedReferral = await Referral_1.Referral.findByIdAndUpdate(referralId, {
            $set: {
                practitionerClerkUserId,
                assignedDate: new Date(),
                assignedbyClerkUserId: auth.userId || undefined,
            },
        }, { new: true, runValidators: true });
        if (!updatedReferral) {
            throw new errors_1.NotFoundError('Referral not found');
        }
        await (0, appointmentFlow_1.assignAppointmentToPractitioner)({
            referral: updatedReferral,
            practitionerClerkUserId,
            assignedByClerkUserId: auth.userId || undefined,
        });
        res.status(200).json(updatedReferral);
    }
    catch (error) {
        next(error);
    }
};
exports.assignReferralById = assignReferralById;
