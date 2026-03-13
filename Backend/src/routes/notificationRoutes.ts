import express from 'express';
import {
  getNotificationsByRecipientId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController';

const NotificationRouter = express.Router();

// NOTE: static route /recipient/:recipientId/read-all must come
// BEFORE dynamic /:notificationId to avoid route shadowing
NotificationRouter.patch(
  '/recipient/:recipientId/read-all',
  markAllNotificationsAsRead
);

NotificationRouter.get('/:recipientId', getNotificationsByRecipientId);
NotificationRouter.patch('/:notificationId/read', markNotificationAsRead);

export default NotificationRouter;