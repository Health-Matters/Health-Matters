"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReferralStatus = exports.getReferralById = exports.getMySubmittedReferrals = exports.assignReferralById = exports.deleteReferralByPatientId = exports.updateReferralByPatientId = exports.createReferral = exports.getReferralsByPractitionerId = exports.getReferralsByPatientId = exports.getAllReferrals = void 0;
const Referral_1 = require("../models/Referral");
const Notification_1 = __importDefault(require("../models/Notification"));
const User_1 = require("../models/User");
const referral_dto_1 = require("../Dtos/referral.dto");
const errors_1 = require("../errors/errors");
const express_1 = require("@clerk/express");
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
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const parsedBody = referral_dto_1.createReferralBodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const newReferral = await Referral_1.Referral.create({
            ...parsedBody.data,
            submittedByClerkUserId: auth.userId,
        });
        // Create an in-app notification confirming the referral submission
        try {
            const patient = await User_1.User.findOne({ clerkUserId: newReferral.patientClerkUserId });
            if (patient) {
                const service = newReferral.serviceType ?? 'a service';
                const referralId = `#${String(newReferral._id).slice(-6).toUpperCase()}`;
                await Notification_1.default.create({
                    recipientId: patient._id,
                    type: 'referral_submitted',
                    title: `Referral Submitted — ${newReferral.serviceType ?? 'Service'}`,
                    message: `You have successfully submitted a referral ${referralId} for ${service}. It is currently pending review by our team.\n\nReason for referral: ${newReferral.referralReason ?? 'Not provided'}.`,
                    relatedEntityType: 'referral',
                    relatedEntityId: newReferral._id,
                    channels: {
                        email: { sent: false },
                        sms: { sent: false },
                        inApp: { read: false },
                    },
                    priority: 'medium',
                });
            }
        }
        catch (notificationError) {
            // Non-fatal — log but don't block the referral response
            console.error('Failed to create referral submission notification:', notificationError);
        }
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
        // if referralStatus is being changed, we need to know the previous statuses
        let oldStatusMap = {};
        const newStatus = parsedBody.data.referralStatus;
        if (newStatus !== undefined) {
            const existing = await Referral_1.Referral.find({ patientClerkUserId: patientId });
            existing.forEach((r) => {
                oldStatusMap[String(r._id)] = r.referralStatus;
            });
        }
        const updateResult = await Referral_1.Referral.updateMany({ patientClerkUserId: patientId }, { $set: parsedBody.data }, { runValidators: true });
        if (updateResult.matchedCount === 0) {
            throw new errors_1.NotFoundError('No referrals found for this patientId');
        }
        const updatedReferrals = await Referral_1.Referral.find({ patientClerkUserId: patientId }).sort({ createdAt: -1 });
        // create notifications for any referrals whose status changed
        if (newStatus !== undefined) {
            for (const r of updatedReferrals) {
                const oldStatus = oldStatusMap[String(r._id)];
                if (oldStatus && oldStatus !== r.referralStatus) {
                    try {
                        const patient = await User_1.User.findOne({ clerkUserId: r.patientClerkUserId });
                        if (patient) {
                            let title = '';
                            let message = '';
                            if (r.referralStatus === 'accepted') {
                                title = 'Referral Accepted';
                                message = `Your referral has been accepted and is now in progress. Our team will be in touch with you shortly.`;
                            }
                            else if (r.referralStatus === 'rejected') {
                                title = 'Referral Update';
                                message = `Your referral status has been updated. Please contact our team for more information.`;
                            }
                            await Notification_1.default.create({
                                recipientId: patient._id,
                                type: 'referral_triaged',
                                title,
                                message,
                                relatedEntityType: 'referral',
                                relatedEntityId: r._id,
                                channels: {
                                    email: { sent: false },
                                    sms: { sent: false },
                                    inApp: { read: false },
                                },
                                priority: 'high',
                            });
                        }
                    }
                    catch (notificationError) {
                        console.error('Failed to create bulk referral status notification:', notificationError);
                    }
                }
            }
        }
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
        // Create an in-app notification for the patient when a practitioner is assigned
        try {
            const patient = await User_1.User.findOne({ clerkUserId: updatedReferral.patientClerkUserId });
            const practitioner = await User_1.User.findOne({ clerkUserId: practitionerClerkUserId });
            if (patient) {
                const practitionerName = practitioner
                    ? `${practitioner.firstName || ''} ${practitioner.lastName || ''}`.trim()
                    : 'your practitioner';
                await Notification_1.default.create({
                    recipientId: patient._id,
                    type: 'referral_assigned',
                    title: 'Your referral has been appointed',
                    message: `Your referral has been assigned to ${practitionerName}.`,
                    relatedEntityType: 'referral',
                    relatedEntityId: updatedReferral._id,
                    channels: {
                        email: { sent: false },
                        sms: { sent: false },
                        inApp: { read: false },
                    },
                    priority: 'medium',
                });
            }
        }
        catch (notificationError) {
            console.error('Failed to create referral assignment notification:', notificationError);
        }
        res.status(200).json(updatedReferral);
    }
    catch (error) {
        next(error);
    }
};
exports.assignReferralById = assignReferralById;
// MGR-005: Get referrals submitted by the currently authenticated manager.
// SECURITY: Manager identity is derived from the Clerk token — no ID in the URL.
const getMySubmittedReferrals = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const parsedQuery = referral_dto_1.myReferralsQuerySchema.safeParse(req.query);
        if (!parsedQuery.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
        }
        const { status, serviceType, search, dateFrom, dateTo, page, limit } = parsedQuery.data;
        // Identity comes from the token — never from a URL param
        const filter = { submittedByClerkUserId: auth.userId };
        if (status)
            filter.referralStatus = status;
        if (serviceType)
            filter.serviceType = serviceType;
        if (dateFrom || dateTo) {
            const dateFilter = {};
            if (dateFrom)
                dateFilter.$gte = dateFrom;
            if (dateTo)
                dateFilter.$lte = dateTo;
            filter.createdAt = dateFilter;
        }
        if (search) {
            filter.$or = [
                { patientClerkUserId: { $regex: search, $options: 'i' } },
                ...(search.match(/^[a-f\d]{24}$/i) ? [{ _id: search }] : []),
            ];
        }
        const skip = (page - 1) * limit;
        const [referrals, total] = await Promise.all([
            Referral_1.Referral.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Referral_1.Referral.countDocuments(filter),
        ]);
        res.status(200).json({
            data: referrals,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMySubmittedReferrals = getMySubmittedReferrals;
// MGR-006: Get a single referral by ID — hides confidential self-referrals from managers
const getReferralById = async (req, res, next) => {
    try {
        const parsedParams = referral_dto_1.referralIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const { referralId } = parsedParams.data;
        const auth = (0, express_1.getAuth)(req);
        const referral = await Referral_1.Referral.findById(referralId);
        if (!referral) {
            throw new errors_1.NotFoundError('Referral not found');
        }
        // Block manager from viewing confidential self-referrals
        if (referral.isConfidential &&
            referral.submittedByClerkUserId !== auth.userId &&
            referral.patientClerkUserId !== auth.userId) {
            throw new errors_1.NotFoundError('Referral not found');
        }
        res.status(200).json(referral);
    }
    catch (error) {
        next(error);
    }
};
exports.getReferralById = getReferralById;
const updateReferralStatus = async (req, res, next) => {
    try {
        const parsedParams = referral_dto_1.referralIdParamsSchema.safeParse(req.params);
        const parsedBody = referral_dto_1.updateReferralStatusBodySchema.safeParse(req.body);
        const auth = (0, express_1.getAuth)(req);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const { referralId } = parsedParams.data;
        const { referralStatus } = parsedBody.data;
        const dateUpdate = {
            acceptedDate: undefined,
            rejectedDate: undefined,
            completedDate: undefined,
        };
        if (referralStatus === 'accepted') {
            dateUpdate.acceptedDate = new Date();
        }
        if (referralStatus === 'rejected') {
            dateUpdate.rejectedDate = new Date();
        }
        const updatedReferral = await Referral_1.Referral.findByIdAndUpdate(referralId, {
            $set: {
                referralStatus,
                changedByClerkUserId: auth.userId || undefined,
                ...dateUpdate,
            },
        }, { new: true, runValidators: true });
        if (!updatedReferral) {
            throw new errors_1.NotFoundError('Referral not found');
        }
        res.status(200).json(updatedReferral);
    }
    catch (error) {
        next(error);
    }
};
exports.updateReferralStatus = updateReferralStatus;
