"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReferralByPatientId = exports.updateReferralByPatientId = exports.createReferral = exports.getReferralsByPractitionerId = exports.getReferralsByPatientId = exports.getAllReferrals = void 0;
const Referral_1 = require("../models/Referral");
const referral_dto_1 = require("../Dtos/referral.dto");
const formatValidationErrors = (error) => error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
}));
const getAllReferrals = async (req, res, next) => {
    try {
        const referrals = await Referral_1.Referral.find().sort({ createdAt: -1 });
        res.status(200).json(referrals);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllReferrals = getAllReferrals;
const getReferralsByPatientId = async (req, res, next) => {
    try {
        const parsedParams = referral_dto_1.patientIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: formatValidationErrors(parsedParams.error),
            });
            return;
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
            res.status(400).json({
                message: 'Validation failed',
                errors: formatValidationErrors(parsedParams.error),
            });
            return;
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
            res.status(400).json({
                message: 'Validation failed',
                errors: formatValidationErrors(parsedBody.error),
            });
            return;
        }
        const newReferral = await Referral_1.Referral.create(parsedBody.data);
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
            res.status(400).json({
                message: 'Validation failed',
                errors: formatValidationErrors(parsedParams.error),
            });
            return;
        }
        if (!parsedBody.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: formatValidationErrors(parsedBody.error),
            });
            return;
        }
        const { patientId } = parsedParams.data;
        const updateResult = await Referral_1.Referral.updateMany({ patientClerkUserId: patientId }, { $set: parsedBody.data }, { runValidators: true });
        if (updateResult.matchedCount === 0) {
            res.status(404).json({ message: 'No referrals found for this patientId' });
            return;
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
            res.status(400).json({
                message: 'Validation failed',
                errors: formatValidationErrors(parsedParams.error),
            });
            return;
        }
        const { patientId } = parsedParams.data;
        const deleteResult = await Referral_1.Referral.deleteMany({ patientClerkUserId: patientId });
        if (deleteResult.deletedCount === 0) {
            res.status(404).json({ message: 'No referrals found for this patientId' });
            return;
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
