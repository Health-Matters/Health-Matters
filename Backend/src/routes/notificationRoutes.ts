import express from 'express';
import { getNotificationsForCurrentUser, markNotificationRead } from '../controllers/notificationController';
import { requireClerkAuth } from '../middlewares/auth-middleware';

const NotificationRouter = express.Router();

NotificationRouter.use(requireClerkAuth);

// GET /api/notifications - Get current user's notifications
NotificationRouter.get('/', getNotificationsForCurrentUser);

// PATCH /api/notifications/:notificationId/read - Mark a notification as read
NotificationRouter.patch('/:notificationId/read', markNotificationRead);

export default NotificationRouter;
