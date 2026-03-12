import { NextFunction, Request, Response } from 'express';
import { Referral } from '../models/Referral';
import { ZodError } from 'zod';
import {
  assignReferralBodySchema,
  createReferralBodySchema,
  myReferralsQuerySchema,
  patientIdParamsSchema,
  practitionerIdParamsSchema,
  referralIdParamsSchema,
  updateReferralBodySchema,
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
    const referrals = await Referral.find().sort({ createdAt: -1 });
    res.status(200).json(referrals);
  } catch (error) {
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

    const referrals = await Referral.find({ practitionerClerkUserId: practitionerId }).sort({
      createdAt: -1,
    });
    res.status(200).json(referrals);
  } catch (error) {
    next(error);
  }
};

// SECURITY: submittedByClerkUserId is never accepted from the client body.
// It is always derived from the Clerk token server-side.
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

    const updatedReferrals = await Referral.find({ patientClerkUserId: patientId }).sort({
      createdAt: -1,
    });
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
      referral.isConfidential &&
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
