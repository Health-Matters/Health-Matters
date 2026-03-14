import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { getAuth } from '@clerk/express';
import {
  appointmentIdParamsSchema,
  appointmentPatientIdParamsSchema,
  appointmentPractitionerIdParamsSchema,
  appointmentReferralIdParamsSchema,
  respondToAppointmentBodySchema,
} from '../Dtos/appointment.dto';
import { Appointment } from '../models/Appointment';
import { Referral } from '../models/Referral';
import { BadRequestError, NotFoundError, UnauthorizedError, ValidationError } from '../errors/errors';
import {
  confirmAppointmentFromReferral,
  rejectAppointmentFromReferral,
} from '../utils/appointmentFlow';

const formatValidationErrors = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

export const getAllAppointments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByPractitionerId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedParams = appointmentPractitionerIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const appointments = await Appointment.find({
      practitionerClerkUserId: parsedParams.data.practitionerId,
    }).sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByPatientId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedParams = appointmentPatientIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const appointments = await Appointment.find({
      patientClerkUserId: parsedParams.data.patientId,
    }).sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentByReferralId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedParams = appointmentReferralIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const appointment = await Appointment.findOne({ referralId: parsedParams.data.referralId });

    if (!appointment) {
      throw new NotFoundError('Appointment not found for this referral');
    }

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

export const respondToAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const parsedParams = appointmentIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const parsedBody = respondToAppointmentBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }

    const appointment = await Appointment.findById(parsedParams.data.appointmentId);

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (appointment.practitionerClerkUserId && appointment.practitionerClerkUserId !== auth.userId) {
      throw new UnauthorizedError('You are not allowed to respond to this appointment');
    }

    const referral = await Referral.findById(appointment.referralId);
    if (!referral) {
      throw new NotFoundError('Referral not found for appointment');
    }

    let updatedAppointment;

    if (parsedBody.data.status === 'confirmed') {
      referral.referralStatus = 'accepted';
      referral.practitionerClerkUserId = auth.userId;
      referral.acceptedDate = new Date();
      updatedAppointment = await confirmAppointmentFromReferral({
        referral,
        practitionerClerkUserId: auth.userId,
      });
    } else {
      referral.referralStatus = 'rejected';
      referral.practitionerClerkUserId = appointment.practitionerClerkUserId || auth.userId;
      referral.rejectedDate = new Date();
      updatedAppointment = await rejectAppointmentFromReferral({
        referral,
        practitionerClerkUserId: appointment.practitionerClerkUserId || auth.userId,
      });
    }

    await referral.save();

    res.status(200).json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};

export const cancelAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const parsedParams = appointmentIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const appointment = await Appointment.findById(parsedParams.data.appointmentId);

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    const allowedUsers = new Set([
      appointment.patientClerkUserId,
      appointment.practitionerClerkUserId,
      appointment.submittedByClerkUserId,
      appointment.assignedByClerkUserId,
    ]);

    if (!allowedUsers.has(auth.userId)) {
      throw new UnauthorizedError('You are not allowed to cancel this appointment');
    }

    if (appointment.status === 'cancelled') {
      throw new BadRequestError('Appointment is already cancelled');
    }

    if (appointment.status === 'completed') {
      throw new BadRequestError('Completed appointments cannot be cancelled');
    }

    appointment.status = 'cancelled';
    appointment.cancelledDate = new Date();
    await appointment.save();

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};