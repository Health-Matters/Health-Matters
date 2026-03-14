import { NextFunction, Request, Response } from 'express';
import { Referral } from '../models/Referral';
import { ZodError } from 'zod';
import {
  assignReferralBodySchema,
  cancelReferralBodySchema,
  createReferralBodySchema,
  managerDashboardQuerySchema,
  managerInsightsQuerySchema,
  myReferralsQuerySchema,
  patientIdParamsSchema,
  practitionerIdParamsSchema,
  referralIdParamsSchema,
  updateReferralBodySchema,
} from '../Dtos/referral.dto';
import { BadRequestError, ValidationError, NotFoundError, UnauthorizedError } from '../errors/errors';
import { getAuth } from '@clerk/express';
import { User } from '../models/User';
import Notification from '../models/Notification';

const ACTIVE_STATUSES = ['pending', 'accepted', 'in_progress'];
const RESOLVED_STATUSES = ['completed', 'rejected', 'cancelled'];
const SLA_TARGET_DAYS = 3;

type ReferralRecord = {
  _id: { toString(): string };
  patientClerkUserId: string;
  submittedByClerkUserId?: string;
  practitionerClerkUserId?: string;
  serviceType?: string;
  referralReason?: string;
  referralStatus: string;
  notes?: string;
  assignedbyClerkUserId?: string;
  assignedDate?: Date;
  acceptedDate?: Date;
  rejectedDate?: Date;
  completedDate?: Date;
  cancelledAt?: Date;
  cancelledByClerkUserId?: string;
  cancellationReason?: string;
  isConfidential?: boolean;
  statusHistory?: Array<{
    status: string;
    changedByClerkUserId?: string;
    note?: string;
    changedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

const formatValidationErrors = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

const getCurrentUserId = (req: Request) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new UnauthorizedError('Authentication required');
  }

  return auth.userId;
};

const getManagerUser = async (clerkUserId: string) => {
  const manager = await User.findOne({ clerkUserId });

  if (!manager) {
    throw new NotFoundError('User not found');
  }

  return manager;
};

const buildDateFilter = (dateFrom?: Date, dateTo?: Date) => {
  if (!dateFrom && !dateTo) {
    return undefined;
  }

  const createdAt: Record<string, Date> = {};

  if (dateFrom) {
    createdAt.$gte = dateFrom;
  }

  if (dateTo) {
    const inclusiveEnd = new Date(dateTo);
    inclusiveEnd.setHours(23, 59, 59, 999);
    createdAt.$lte = inclusiveEnd;
  }

  return { createdAt };
};

const getResolutionDate = (referral: ReferralRecord) =>
  referral.completedDate || referral.rejectedDate || referral.cancelledAt;

const getWholeDayDifference = (startDate: Date, endDate: Date) => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return (endDate.getTime() - startDate.getTime()) / millisecondsPerDay;
};

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Pending';
  }
};

const getRagStatus = (daysToAssignment: number) => {
  if (daysToAssignment > SLA_TARGET_DAYS) {
    return 'red';
  }

  if (daysToAssignment >= SLA_TARGET_DAYS - 1) {
    return 'amber';
  }

  return 'green';
};

const getOverallSlaRag = (withinSlaPercentage: number) => {
  if (withinSlaPercentage >= 90) {
    return 'green';
  }

  if (withinSlaPercentage >= 75) {
    return 'amber';
  }

  return 'red';
};

const getServiceType = (referral: ReferralRecord) => referral.serviceType || 'Unspecified';

const buildServiceTypeBreakdown = (referrals: ReferralRecord[]) => {
  const counts = referrals.reduce<Record<string, number>>((accumulator, referral) => {
    const serviceType = getServiceType(referral);
    accumulator[serviceType] = (accumulator[serviceType] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .map(([serviceType, count]) => ({ serviceType, count }))
    .sort((left, right) => right.count - left.count);
};

const buildStatusBreakdown = (referrals: ReferralRecord[]) => {
  const counts = referrals.reduce<Record<string, number>>((accumulator, referral) => {
    accumulator[referral.referralStatus] = (accumulator[referral.referralStatus] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .map(([status, count]) => ({ status, label: getStatusLabel(status), count }))
    .sort((left, right) => right.count - left.count);
};

const buildSlaMetrics = (
  referrals: ReferralRecord[],
  employeeNameByClerkId: Record<string, string>
) => {
  const now = new Date();

  const evaluated = referrals.filter((referral) => ACTIVE_STATUSES.includes(referral.referralStatus) || referral.assignedDate);

  const breachedReferrals = evaluated
    .map((referral) => {
      const effectiveAssignmentDate = referral.assignedDate || now;
      const daysToAssignment = roundToOneDecimal(
        getWholeDayDifference(new Date(referral.createdAt), new Date(effectiveAssignmentDate))
      );
      const breached = !referral.assignedDate
        ? daysToAssignment > SLA_TARGET_DAYS
        : daysToAssignment > SLA_TARGET_DAYS;

      return {
        referralId: referral._id.toString(),
        employeeName: employeeNameByClerkId[referral.patientClerkUserId] || referral.patientClerkUserId,
        serviceType: getServiceType(referral),
        submittedAt: referral.createdAt,
        status: referral.referralStatus,
        daysToAssignment,
        ragStatus: getRagStatus(daysToAssignment),
        breached,
      };
    })
    .filter((item) => item.breached)
    .sort((left, right) => right.daysToAssignment - left.daysToAssignment);

  const assignedReferrals = evaluated.filter((referral) => referral.assignedDate);
  const withinSlaCount = assignedReferrals.filter((referral) => {
    const daysToAssignment = getWholeDayDifference(new Date(referral.createdAt), new Date(referral.assignedDate as Date));
    return daysToAssignment <= SLA_TARGET_DAYS;
  }).length;

  const avgDaysToAssignment = roundToOneDecimal(
    average(
      assignedReferrals.map((referral) =>
        getWholeDayDifference(new Date(referral.createdAt), new Date(referral.assignedDate as Date))
      )
    )
  );

  const withinSlaPercentage = assignedReferrals.length
    ? Math.round((withinSlaCount / assignedReferrals.length) * 100)
    : 100;

  return {
    targetDays: SLA_TARGET_DAYS,
    withinSlaPercentage,
    breachedCount: breachedReferrals.length,
    avgDaysToAssignment,
    ragStatus: getOverallSlaRag(withinSlaPercentage),
    breachedReferrals,
  };
};

const getMonthKey = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const buildMonthlyBuckets = (months: number) => {
  const currentMonth = new Date();
  currentMonth.setUTCDate(1);
  currentMonth.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(currentMonth);
    date.setUTCMonth(currentMonth.getUTCMonth() - (months - index - 1));

    return {
      key: getMonthKey(date),
      label: date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
      date,
    };
  });
};

const buildTrend = (teamReferrals: ReferralRecord[], organisationReferrals: ReferralRecord[], managerCount: number, months: number) => {
  const buckets = buildMonthlyBuckets(months);

  return buckets.map((bucket) => {
    const teamCount = teamReferrals.filter((referral) => getMonthKey(new Date(referral.createdAt)) === bucket.key).length;
    const organisationCount = organisationReferrals.filter(
      (referral) => getMonthKey(new Date(referral.createdAt)) === bucket.key
    ).length;
    const organisationAverage = managerCount > 0 ? roundToOneDecimal(organisationCount / managerCount) : 0;

    return {
      month: bucket.label,
      referrals: teamCount,
      organisationAverage,
    };
  });
};

const getEmployeeNameMap = (
  teamMembers: Array<{ clerkUserId: string; firstName?: string | null; lastName?: string | null }>
) =>
  teamMembers.reduce<Record<string, string>>((accumulator, member) => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
    accumulator[member.clerkUserId] = fullName || member.clerkUserId;
    return accumulator;
  }, {});

const buildNotificationDocuments = async ({
  clerkUserIds,
  type,
  title,
  message,
  priority = 'medium',
  relatedEntityId,
}: {
  clerkUserIds: string[];
  type: 'referral_assigned' | 'referral_status_changed' | 'referral_cancelled';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  relatedEntityId?: unknown;
}) => {
  const uniqueIds = [...new Set(clerkUserIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return;
  }

  const recipients = await User.find({ clerkUserId: { $in: uniqueIds } }, '_id');

  if (recipients.length === 0) {
    return;
  }

  await Notification.insertMany(
    recipients.map((recipient) => ({
      recipientId: recipient._id,
      type,
      title,
      message,
      relatedEntityType: 'referral',
      relatedEntityId,
      channels: {
        email: { sent: false },
        sms: { sent: false },
        inApp: { read: false },
      },
      priority,
    }))
  );
};

const buildStatusChangeUpdate = (status: string, actorClerkUserId?: string, note?: string) => {
  const updatePayload: Record<string, unknown> = {
    referralStatus: status,
    $push: {
      statusHistory: {
        status,
        changedByClerkUserId: actorClerkUserId,
        note,
        changedAt: new Date(),
      },
    },
  };

  if (status === 'accepted') {
    updatePayload.acceptedDate = new Date();
  }

  if (status === 'rejected') {
    updatePayload.rejectedDate = new Date();
  }

  if (status === 'completed') {
    updatePayload.completedDate = new Date();
  }

  if (status === 'cancelled') {
    updatePayload.cancelledAt = new Date();
    updatePayload.cancelledByClerkUserId = actorClerkUserId;
    updatePayload.cancellationReason = note;
  }

  return updatePayload;
};

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
    const userId = getCurrentUserId(req);

    const parsedBody = createReferralBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }

    const newReferral = await Referral.create({
      ...parsedBody.data,
      submittedByClerkUserId: userId,
      statusHistory: [
        {
          status: parsedBody.data.referralStatus || 'pending',
          changedByClerkUserId: userId,
          note: 'Referral submitted',
          changedAt: new Date(),
        },
      ],
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
    const actorClerkUserId = getCurrentUserId(req);
    const parsedParams = patientIdParamsSchema.safeParse(req.params);
    const parsedBody = updateReferralBodySchema.safeParse(req.body);

    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }

    const { patientId } = parsedParams.data;

    const referrals = (await Referral.find({ patientClerkUserId: patientId }).sort({
      createdAt: -1,
    })) as unknown as ReferralRecord[];

    if (referrals.length === 0) {
      throw new NotFoundError('No referrals found for this patientId');
    }

    const updatedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const updatePayload: Record<string, unknown> = { ...parsedBody.data };

        if (
          parsedBody.data.referralStatus &&
          parsedBody.data.referralStatus !== referral.referralStatus
        ) {
          Object.assign(
            updatePayload,
            buildStatusChangeUpdate(
              parsedBody.data.referralStatus,
              actorClerkUserId,
              `Status changed from ${getStatusLabel(referral.referralStatus)} to ${getStatusLabel(parsedBody.data.referralStatus)}`
            )
          );
        }

        const updatedReferral = await Referral.findByIdAndUpdate(
          referral._id,
          updatePayload,
          { new: true, runValidators: true }
        );

        if (
          updatedReferral &&
          parsedBody.data.referralStatus &&
          parsedBody.data.referralStatus !== referral.referralStatus &&
          updatedReferral.submittedByClerkUserId
        ) {
          const employeeName = referral.patientClerkUserId;

          await buildNotificationDocuments({
            clerkUserIds: [updatedReferral.submittedByClerkUserId],
            type: 'referral_status_changed',
            title: 'Referral status updated',
            message: `Referral ${updatedReferral._id.toString().slice(-6).toUpperCase()} for ${employeeName} changed from ${getStatusLabel(referral.referralStatus)} to ${getStatusLabel(parsedBody.data.referralStatus)}.`,
            relatedEntityId: updatedReferral._id,
          });
        }

        return updatedReferral;
      })
    );

    res.status(200).json({
      message: 'Referrals updated successfully',
      modifiedCount: updatedReferrals.filter(Boolean).length,
      referrals: updatedReferrals.filter(Boolean),
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
    const actorClerkUserId = getCurrentUserId(req);

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
          assignedbyClerkUserId: actorClerkUserId,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedReferral) {
      throw new NotFoundError('Referral not found');
    }

    if (updatedReferral.submittedByClerkUserId) {
      await buildNotificationDocuments({
        clerkUserIds: [updatedReferral.submittedByClerkUserId],
        type: 'referral_assigned',
        title: 'Referral assigned for review',
        message: `Referral ${updatedReferral._id.toString().slice(-6).toUpperCase()} has been assigned to a practitioner.`,
        relatedEntityId: updatedReferral._id,
      });
    }

    res.status(200).json(updatedReferral);
  } catch (error) {
    next(error);
  }
};

export const cancelReferralById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorClerkUserId = getCurrentUserId(req);
    const parsedParams = referralIdParamsSchema.safeParse(req.params);
    const parsedBody = cancelReferralBodySchema.safeParse(req.body);

    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }

    const referral = (await Referral.findById(parsedParams.data.referralId)) as unknown as ReferralRecord | null;

    if (!referral) {
      throw new NotFoundError('Referral not found');
    }

    if (referral.submittedByClerkUserId !== actorClerkUserId) {
      throw new UnauthorizedError('You can only cancel referrals you submitted');
    }

    if (referral.referralStatus !== 'pending') {
      throw new BadRequestError('Only pending referrals can be cancelled');
    }

    const updatedReferral = await Referral.findByIdAndUpdate(
      referral._id,
      buildStatusChangeUpdate('cancelled', actorClerkUserId, parsedBody.data.cancellationReason),
      { new: true, runValidators: true }
    );

    if (!updatedReferral) {
      throw new NotFoundError('Referral not found');
    }

    const adminUsers = await User.find({ role: 'admin' }, 'clerkUserId');
    const adminClerkUserIds = adminUsers.map((user) => user.clerkUserId).filter(Boolean);
    const referralReference = updatedReferral._id.toString().slice(-6).toUpperCase();

    await buildNotificationDocuments({
      clerkUserIds: [updatedReferral.patientClerkUserId],
      type: 'referral_cancelled',
      title: 'Referral cancelled by your manager',
      message: `Referral ${referralReference} has been cancelled. Reason: ${parsedBody.data.cancellationReason}`,
      relatedEntityId: updatedReferral._id,
      priority: 'high',
    });

    await buildNotificationDocuments({
      clerkUserIds: adminClerkUserIds,
      type: 'referral_cancelled',
      title: 'Manager referral cancelled',
      message: `Referral ${referralReference} was cancelled by the submitting manager. Reason: ${parsedBody.data.cancellationReason}`,
      relatedEntityId: updatedReferral._id,
      priority: 'high',
    });

    res.status(200).json(updatedReferral);
  } catch (error) {
    next(error);
  }
};

// MGR-005: Get referrals submitted by the currently authenticated manager.
// SECURITY: Manager identity is derived from the Clerk token — no ID in the URL.
export const getMySubmittedReferrals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getCurrentUserId(req);

    const parsedQuery = myReferralsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
    }

    const { status, serviceType, search, dateFrom, dateTo, page, limit } = parsedQuery.data;

    // Identity comes from the token — never from a URL param
    const filter: Record<string, unknown> = { submittedByClerkUserId: userId };

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

export const getManagerTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerClerkUserId = getCurrentUserId(req);

    const teamMembers = await User.find({
      role: 'employee',
      managerClerkUserId,
      isActive: true,
    }).sort({ firstName: 1, lastName: 1 });

    const teamClerkUserIds = teamMembers.map((member) => member.clerkUserId);

    if (teamClerkUserIds.length === 0) {
      return res.status(200).json([]);
    }

    const referrals = (await Referral.find({
      patientClerkUserId: { $in: teamClerkUserIds },
    }).sort({ createdAt: -1 })) as unknown as ReferralRecord[];

    const team = teamMembers.map((member) => {
      const employeeReferrals = referrals.filter(
        (referral) => referral.patientClerkUserId === member.clerkUserId
      );
      const activeReferrals = employeeReferrals.filter((referral) =>
        ACTIVE_STATUSES.includes(referral.referralStatus)
      ).length;

      return {
        _id: member._id,
        clerkUserId: member.clerkUserId,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        department: member.department,
        role: member.role,
        activeReferrals,
        totalReferrals: employeeReferrals.length,
        lastReferralAt: employeeReferrals[0]?.createdAt || null,
        latestStatus: employeeReferrals[0]?.referralStatus || null,
      };
    });

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
};

export const getManagerDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerClerkUserId = getCurrentUserId(req);
    const parsedQuery = managerDashboardQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
    }

    const manager = await getManagerUser(managerClerkUserId);
    const teamMembers = await User.find({
      role: 'employee',
      managerClerkUserId,
      isActive: true,
    }).sort({ firstName: 1, lastName: 1 });

    const teamClerkUserIds = teamMembers.map((member) => member.clerkUserId);
    const dateFilter = buildDateFilter(parsedQuery.data.dateFrom, parsedQuery.data.dateTo);
    const referralFilter: Record<string, unknown> = dateFilter
      ? { patientClerkUserId: { $in: teamClerkUserIds }, ...dateFilter }
      : { patientClerkUserId: { $in: teamClerkUserIds } };
    const myReferralFilter: Record<string, unknown> = dateFilter
      ? { submittedByClerkUserId: managerClerkUserId, ...dateFilter }
      : { submittedByClerkUserId: managerClerkUserId };

    const [teamReferrals, myReferrals, notifications] = await Promise.all([
      teamClerkUserIds.length ? Referral.find(referralFilter).sort({ createdAt: -1 }) : Promise.resolve([]),
      Referral.find(myReferralFilter).sort({ createdAt: -1 }).limit(8),
      Notification.find({ recipientId: manager._id }).sort({ createdAt: -1 }).limit(8),
    ]);

    const employeeNameByClerkId = getEmployeeNameMap(teamMembers);
    const typedTeamReferrals = teamReferrals as unknown as ReferralRecord[];
    const typedMyReferrals = myReferrals as unknown as ReferralRecord[];
    const resolvedReferrals = typedTeamReferrals.filter((referral) =>
      RESOLVED_STATUSES.includes(referral.referralStatus) && getResolutionDate(referral)
    );
    const avgResolutionDays = roundToOneDecimal(
      average(
        resolvedReferrals.map((referral) =>
          getWholeDayDifference(new Date(referral.createdAt), new Date(getResolutionDate(referral) as Date))
        )
      )
    );
    const activeReferrals = typedTeamReferrals.filter((referral) =>
      ACTIVE_STATUSES.includes(referral.referralStatus)
    ).length;
    const sla = buildSlaMetrics(typedTeamReferrals, employeeNameByClerkId);

    res.status(200).json({
      refreshedAt: new Date(new Date().setHours(0, 0, 0, 0)),
      summary: {
        teamMembers: teamMembers.length,
        activeReferrals,
        avgResolutionDays,
        submittedByManager: typedMyReferrals.length,
        withinSlaPercentage: sla.withinSlaPercentage,
        breachedCount: sla.breachedCount,
      },
      serviceTypeBreakdown: buildServiceTypeBreakdown(typedTeamReferrals),
      statusBreakdown: buildStatusBreakdown(typedTeamReferrals),
      recentReferrals: typedMyReferrals.map((referral) => ({
        _id: referral._id,
        patientClerkUserId: referral.patientClerkUserId,
        patientName: employeeNameByClerkId[referral.patientClerkUserId] || referral.patientClerkUserId,
        serviceType: referral.serviceType,
        referralStatus: referral.referralStatus,
        createdAt: referral.createdAt,
        cancellationReason: referral.cancellationReason,
      })),
      notifications: notifications.map((notification) => ({
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
        priority: notification.priority,
        read: notification.channels?.inApp?.read || false,
      })),
      sla,
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerClerkUserId = getCurrentUserId(req);
    const parsedQuery = managerInsightsQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
    }

    const teamMembers = await User.find({
      role: 'employee',
      managerClerkUserId,
      isActive: true,
    }).sort({ firstName: 1, lastName: 1 });
    const teamClerkUserIds = teamMembers.map((member) => member.clerkUserId);
    let baseDateFilter = buildDateFilter(parsedQuery.data.dateFrom, parsedQuery.data.dateTo);

    if (!baseDateFilter) {
      const rollingStart = new Date();
      rollingStart.setUTCDate(1);
      rollingStart.setUTCHours(0, 0, 0, 0);
      rollingStart.setUTCMonth(rollingStart.getUTCMonth() - (parsedQuery.data.months - 1));
      baseDateFilter = { createdAt: { $gte: rollingStart } };
    }

    const referralFilter: Record<string, unknown> = teamClerkUserIds.length
      ? { patientClerkUserId: { $in: teamClerkUserIds }, ...baseDateFilter }
      : { patientClerkUserId: { $in: [] }, ...baseDateFilter };

    const [teamReferrals, organisationReferrals, managerCount] = await Promise.all([
      Referral.find(referralFilter).sort({ createdAt: -1 }),
      Referral.find(baseDateFilter).sort({ createdAt: -1 }),
      User.countDocuments({ role: 'manager', isActive: true }),
    ]);

    const employeeNameByClerkId = getEmployeeNameMap(teamMembers);
    const typedTeamReferrals = teamReferrals as unknown as ReferralRecord[];
    const typedOrganisationReferrals = organisationReferrals as unknown as ReferralRecord[];
    const resolvedReferrals = typedTeamReferrals.filter((referral) =>
      RESOLVED_STATUSES.includes(referral.referralStatus) && getResolutionDate(referral)
    );
    const avgResolutionDays = roundToOneDecimal(
      average(
        resolvedReferrals.map((referral) =>
          getWholeDayDifference(new Date(referral.createdAt), new Date(getResolutionDate(referral) as Date))
        )
      )
    );
    const teamAverageMonthlyReferrals = roundToOneDecimal(
      typedTeamReferrals.length / parsedQuery.data.months
    );
    const organisationAverageMonthlyReferrals = roundToOneDecimal(
      managerCount > 0 ? typedOrganisationReferrals.length / managerCount / parsedQuery.data.months : 0
    );
    const comparisonPercentage = organisationAverageMonthlyReferrals === 0
      ? 0
      : Math.round(
          ((teamAverageMonthlyReferrals - organisationAverageMonthlyReferrals) /
            organisationAverageMonthlyReferrals) *
            100
        );
    const sla = buildSlaMetrics(typedTeamReferrals, employeeNameByClerkId);

    res.status(200).json({
      refreshedAt: new Date(new Date().setHours(0, 0, 0, 0)),
      overview: {
        totalReferrals: typedTeamReferrals.length,
        totalResolved: resolvedReferrals.length,
        avgResolutionDays,
      },
      trend: buildTrend(
        typedTeamReferrals,
        typedOrganisationReferrals,
        managerCount,
        parsedQuery.data.months
      ),
      serviceTypeBreakdown: buildServiceTypeBreakdown(typedTeamReferrals),
      organisationComparison: {
        teamAverageMonthlyReferrals,
        organisationAverageMonthlyReferrals,
        comparisonPercentage,
      },
      sla,
    });
  } catch (error) {
    next(error);
  }
};
