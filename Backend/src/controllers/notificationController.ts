import { NextFunction, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import Notification from '../models/Notification';
import Appointment from '../models/Appointment';
import { User } from '../models/User';

export const getNotificationsForCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find the user record so we can resolve the Mongo _id
    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let notifications = await Notification.find({ recipientId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Ensure completed appointments are surfaced as notifications (if not already created)
    const completedAppointments = await Appointment.find({
      employeeId: user._id,
      status: 'completed',
    }).populate('practitionerId', 'firstName lastName');

    for (const appointment of completedAppointments) {
      const existing = await Notification.findOne({
        recipientId: user._id,
        relatedEntityType: 'appointment',
        relatedEntityId: appointment._id,
        type: 'appointment_completed',
      });

      if (!existing) {
        const practitionerName = appointment.practitionerId
          ? `${(appointment.practitionerId as any).firstName || ''} ${(appointment.practitionerId as any).lastName || ''}`.trim()
          : 'your practitioner';

        await Notification.create({
          recipientId: user._id,
          type: 'appointment_completed',
          title: `Appointment completed with ${practitionerName}`,
          message: `Your appointment with ${practitionerName} has been completed. You can review your follow-up actions in the dashboard.`,
          relatedEntityType: 'appointment',
          relatedEntityId: appointment._id,
          channels: {
            email: { sent: false },
            sms: { sent: false },
            inApp: { read: false },
          },
          priority: 'medium',
        });
      }
    }

    notifications = await Notification.find({ recipientId: user._id })
      .sort({ createdAt: -1 })
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

    const { notificationId } = req.params;
    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = await Notification.findOne({ _id: notificationId, recipientId: user._id });
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
