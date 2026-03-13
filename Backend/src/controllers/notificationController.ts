import { NextFunction, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import Notification from '../models/Notification';
import { User } from '../models/User';
import { getNotificationsQuerySchema, notificationIdParamsSchema } from '../Dtos/notification.dto';

export const getNotificationsForCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const query = getNotificationsQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ message: 'Invalid query parameters', errors: query.error.flatten() });
    }

    const { unread, type, limit } = query.data;

    const filter: Record<string, unknown> = { recipientId: user._id };
    if (unread === true) filter['channels.inApp.read'] = false;
    if (type) filter['type'] = type;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit ?? 50)
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const params = notificationIdParamsSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'Invalid notification ID', errors: params.error.flatten() });
    }

    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = await Notification.findOne({ _id: params.data.notificationId, recipientId: user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.channels.inApp.read = true;
    notification.channels.inApp.readAt = new Date();
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};
