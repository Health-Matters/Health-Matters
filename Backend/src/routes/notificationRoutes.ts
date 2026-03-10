import express from 'express';
import { getNotificationsForCurrentUser, markNotificationRead } from '../controllers/notificationController';

const NotificationRouter = express.Router();

// GET /api/notifications - Get current user's notifications
NotificationRouter.get('/', getNotificationsForCurrentUser);

// PATCH /api/notifications/:notificationId/read - Mark a notification as read
NotificationRouter.patch('/:notificationId/read', markNotificationRead);

export default NotificationRouter;
