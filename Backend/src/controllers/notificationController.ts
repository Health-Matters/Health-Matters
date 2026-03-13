import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Notification } from '../models/Notification';
import {
  notificationIdParamsSchema,
  recipientIdParamsSchema,
  getNotificationsQuerySchema,
} from '../Dtos/notification.dto';
import { ValidationError, NotFoundError } from '../errors/errors';

const formatValidationErrors = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

// GET /api/notifications/:recipientId
export const getNotificationsByRecipientId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedParams = recipientIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const parsedQuery = getNotificationsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
    }

    const filter: Record<string, unknown> = {
      recipientClerkUserId: parsedParams.data.recipientId,
    };

    if (parsedQuery.data.isRead !== undefined) {
      filter.isRead = parsedQuery.data.isRead;
    }
    if (parsedQuery.data.type) {
      filter.type = parsedQuery.data.type;
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:notificationId/read
export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedParams = notificationIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    const updated = await Notification.findByIdAndUpdate(
      parsedParams.data.notificationId,
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!updated) throw new NotFoundError('Notification not found');

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/recipient/:recipientId/read-all
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedParams = recipientIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
    }

    await Notification.updateMany(
      { recipientClerkUserId: parsedParams.data.recipientId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};