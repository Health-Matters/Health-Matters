import { NextFunction, Request, Response } from 'express';
import { Referral } from '../models/Referral';
import { ZodError } from 'zod';
import {
	assignReferralBodySchema,
	createReferralBodySchema,
	patientIdParamsSchema,
	practitionerIdParamsSchema,
	referralIdParamsSchema,
	updateReferralBodySchema,
} from '../Dtos/referral.dto';
import { ValidationError, NotFoundError, UnauthorizedError } from '../errors/errors';
import { getAuth } from '@clerk/express';
import {
	assignAppointmentToPractitioner,
	confirmAppointmentFromReferral,
	createPendingAppointmentForReferral,
	rejectAppointmentFromReferral,
} from '../utils/appointmentFlow';

const formatValidationErrors = (error: ZodError) =>
	error.issues.map((issue) => ({
		field: issue.path.join('.'),
		message: issue.message,
	}));

export const getAllReferrals = async (req: Request, res: Response, next: NextFunction) => {
	try {
		console.log('🔵 GET /api/referrals - Fetching all referrals');
		const referrals = await Referral.find().sort({ createdAt: -1 });
		console.log(`✅ Found ${referrals.length} referrals`);
		res.status(200).json(referrals);
	} catch (error) {
		console.error('❌ Error in getAllReferrals:', error);
		next(error);
	}
};

export const getReferralsByPatientId = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedParams = patientIdParamsSchema.safeParse(req.params);

		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const { patientId } = parsedParams.data;

		const referrals = await Referral.find({ patientClerkUserId: patientId }).sort({ createdAt: -1 });
		res.status(200).json(referrals);
	} catch (error) {
		next(error);
	}
};

export const getReferralsByPractitionerId = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsedParams = practitionerIdParamsSchema.safeParse(req.params);

		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const { practitionerId } = parsedParams.data;

		const referrals = await Referral.find({ practitionerClerkUserId: practitionerId }).sort({ createdAt: -1 });
		res.status(200).json(referrals);
	} catch (error) {
		next(error);
	}
};

export const createReferral = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedBody = createReferralBodySchema.safeParse(req.body);

		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const newReferral = await Referral.create(parsedBody.data);
		await createPendingAppointmentForReferral(newReferral);

		res.status(201).json(newReferral);
	} catch (error) {
		next(error);
	}
};

export const updateReferralByPatientId = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsedParams = patientIdParamsSchema.safeParse(req.params);
		const parsedBody = updateReferralBodySchema.safeParse(req.body);

		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const { patientId } = parsedParams.data;

		const updateResult = await Referral.updateMany(
			{ patientClerkUserId: patientId },
			{ $set: parsedBody.data },
			{ runValidators: true }
		);

		if (updateResult.matchedCount === 0) {
			throw new NotFoundError('No referrals found for this patientId');
		}

		const updatedReferrals = await Referral.find({ patientClerkUserId: patientId }).sort({ createdAt: -1 });
		res.status(200).json({
			message: 'Referrals updated successfully',
			modifiedCount: updateResult.modifiedCount,
			referrals: updatedReferrals,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteReferralByPatientId = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsedParams = patientIdParamsSchema.safeParse(req.params);

		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const { patientId } = parsedParams.data;

		const deleteResult = await Referral.deleteMany({ patientClerkUserId: patientId });

		if (deleteResult.deletedCount === 0) {
			throw new NotFoundError('No referrals found for this patientId');
		}

		res.status(200).json({
			message: 'Referrals deleted successfully',
			deletedCount: deleteResult.deletedCount,
		});
	} catch (error) {
		next(error);
	}
};

export const updateReferralById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const auth = getAuth(req);

		if (!auth.userId) {
			throw new UnauthorizedError('Authentication required');
		}

		const parsedParams = referralIdParamsSchema.safeParse(req.params);
		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const parsedBody = updateReferralBodySchema.safeParse(req.body);
		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const { referralId } = parsedParams.data;
		const existingReferral = await Referral.findById(referralId);

		if (!existingReferral) {
			throw new NotFoundError('Referral not found');
		}

		const updateFields: Record<string, unknown> = { ...parsedBody.data };

		// When a practitioner accepts, record their ID from the token (never trust the client for this)
		if (parsedBody.data.referralStatus === 'accepted') {
			updateFields.practitionerClerkUserId = auth.userId;
			updateFields.acceptedDate = new Date();
		}

		if (parsedBody.data.referralStatus === 'rejected') {
			updateFields.rejectedDate = new Date();
		}

		const updatedReferral = await Referral.findByIdAndUpdate(
			referralId,
			{ $set: updateFields },
			{ new: true, runValidators: true }
		);

		if (!updatedReferral) {
			throw new NotFoundError('Referral not found');
		}

		if (parsedBody.data.referralStatus === 'accepted') {
			await confirmAppointmentFromReferral({
				referral: updatedReferral,
				practitionerClerkUserId: auth.userId,
			});
		}

		if (parsedBody.data.referralStatus === 'rejected') {
			await rejectAppointmentFromReferral({
				referral: updatedReferral,
				practitionerClerkUserId: existingReferral.practitionerClerkUserId,
			});
		}

		res.status(200).json(updatedReferral);
	} catch (error) {
		next(error);
	}
};

export const assignReferralById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedParams = referralIdParamsSchema.safeParse(req.params);
		const parsedBody = assignReferralBodySchema.safeParse(req.body);
		const auth = getAuth(req);

		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const { referralId } = parsedParams.data;
		const { practitionerClerkUserId } = parsedBody.data;

		const updatedReferral = await Referral.findByIdAndUpdate(
			referralId,
			{
				$set: {
					practitionerClerkUserId,
					assignedDate: new Date(),
					assignedbyClerkUserId: auth.userId || undefined,
				},
			},
			{ new: true, runValidators: true }
		);

		if (!updatedReferral) {
			throw new NotFoundError('Referral not found');
		}

		await assignAppointmentToPractitioner({
			referral: updatedReferral,
			practitionerClerkUserId,
			assignedByClerkUserId: auth.userId || undefined,
		});

		res.status(200).json(updatedReferral);
	} catch (error) {
		next(error);
	}
};
