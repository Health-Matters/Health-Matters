import { NextFunction, Request, Response } from 'express';
import { Referral } from '../models/Referral';
import Notification from '../models/Notification';
import { User } from '../models/User';
import { ZodError } from 'zod';
import {
	assignReferralBodySchema,
	createReferralBodySchema,
	myReferralsQuerySchema,
	patientIdParamsSchema,
	practitionerIdParamsSchema,
	referralIdParamsSchema,
	updateReferralBodySchema,
	updateReferralStatusBodySchema,
} from '../Dtos/referral.dto';
import { ValidationError, NotFoundError, UnauthorizedError } from '../errors/errors';
import { getAuth } from '@clerk/express';

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
		const auth = getAuth(req);

		if (!auth.userId) {
			throw new UnauthorizedError('Authentication required');
		}

		const parsedBody = createReferralBodySchema.safeParse(req.body);

		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const newReferral = await Referral.create({
			...parsedBody.data,
			submittedByClerkUserId: auth.userId,
		});

		// Create an in-app notification confirming the referral submission
		try {
			const patient = await User.findOne({ clerkUserId: newReferral.patientClerkUserId });

			if (patient) {
				const service = newReferral.serviceType ?? 'a service';
				const referralId = `#${String(newReferral._id).slice(-6).toUpperCase()}`;

				await Notification.create({
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
		} catch (notificationError) {
			// Non-fatal — log but don't block the referral response
			console.error('Failed to create referral submission notification:', notificationError);
		}

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

		// if referralStatus is being changed, we need to know the previous statuses
		let oldStatusMap: Record<string, string> = {};
		const newStatus = parsedBody.data.referralStatus as string | undefined;
		if (newStatus !== undefined) {
			const existing = await Referral.find({ patientClerkUserId: patientId });
			existing.forEach((r) => {
				oldStatusMap[String(r._id)] = r.referralStatus;
			});
		}

		const updateResult = await Referral.updateMany(
			{ patientClerkUserId: patientId },
			{ $set: parsedBody.data },
			{ runValidators: true }
		);

		if (updateResult.matchedCount === 0) {
			throw new NotFoundError('No referrals found for this patientId');
		}

		const updatedReferrals = await Referral.find({ patientClerkUserId: patientId }).sort({ createdAt: -1 });

		// create notifications for any referrals whose status changed
		if (newStatus !== undefined) {
			for (const r of updatedReferrals) {
				const oldStatus = oldStatusMap[String(r._id)];
				if (oldStatus && oldStatus !== r.referralStatus) {
					try {
						const patient = await User.findOne({ clerkUserId: r.patientClerkUserId });
						if (patient) {
							let title = '';
							let message = '';
							if (r.referralStatus === 'accepted') {
								title = 'Referral Accepted';
								message = `Your referral has been accepted and is now in progress. Our team will be in touch with you shortly.`;
							} else if (r.referralStatus === 'rejected') {
								title = 'Referral Update';
								message = `Your referral status has been updated. Please contact our team for more information.`;
							}
							await Notification.create({
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
					} catch (notificationError) {
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

		// Create an in-app notification for the patient when a practitioner is assigned
		try {
			const patient = await User.findOne({ clerkUserId: updatedReferral.patientClerkUserId });
			const practitioner = await User.findOne({ clerkUserId: practitionerClerkUserId });

			if (patient) {
				const practitionerName = practitioner
					? `${practitioner.firstName || ''} ${practitioner.lastName || ''}`.trim()
					: 'your practitioner';

				await Notification.create({
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
		} catch (notificationError) {
			console.error('Failed to create referral assignment notification:', notificationError);
		}

		res.status(200).json(updatedReferral);
	} catch (error) {
		next(error);
	}
};

// MGR-005: Get referrals submitted by the currently authenticated manager.
// SECURITY: Manager identity is derived from the Clerk token — no ID in the URL.
export const getMySubmittedReferrals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const parsedQuery = myReferralsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
    }

    const { status, serviceType, search, dateFrom, dateTo, page, limit } = parsedQuery.data;

    // Identity comes from the token — never from a URL param
    const filter: Record<string, unknown> = { submittedByClerkUserId: auth.userId };

    if (status) filter.referralStatus = status;
    if (serviceType) filter.serviceType = serviceType;

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = dateFrom;
      if (dateTo) dateFilter.$lte = dateTo;
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
      Referral.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Referral.countDocuments(filter),
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
  } catch (error) {
    next(error);
  }
};

// MGR-006: Get a single referral by ID — hides confidential self-referrals from managers
export const getReferralById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedParams = referralIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const { referralId } = parsedParams.data;
    const auth = getAuth(req);

    const referral = await Referral.findById(referralId);

    if (!referral) {
      throw new NotFoundError('Referral not found');
    }

    // Block manager from viewing confidential self-referrals
		if (
			(referral as any).isConfidential &&
      referral.submittedByClerkUserId !== auth.userId &&
      referral.patientClerkUserId !== auth.userId
    ) {
      throw new NotFoundError('Referral not found');
    }

    res.status(200).json(referral);
  } catch (error) {
    next(error);
  }
};

export const updateReferralStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedParams = referralIdParamsSchema.safeParse(req.params);
		const parsedBody = updateReferralStatusBodySchema.safeParse(req.body);
		const auth = getAuth(req);

		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const { referralId } = parsedParams.data;
		const { referralStatus } = parsedBody.data;

		const dateUpdate: Record<string, Date | undefined> = {
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

		const updatedReferral = await Referral.findByIdAndUpdate(
			referralId,
			{
				$set: {
					referralStatus,
					changedByClerkUserId: auth.userId || undefined,
					...dateUpdate,
				},
			},
			{ new: true, runValidators: true }
		);

		if (!updatedReferral) {
			throw new NotFoundError('Referral not found');
		}

		res.status(200).json(updatedReferral);
	} catch (error) {
		next(error);
	}
};
