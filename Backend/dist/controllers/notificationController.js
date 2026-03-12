"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getMyNotifications = void 0;
const express_1 = require("@clerk/express");
const notification_dto_1 = require("../Dtos/notification.dto");
const errors_1 = require("../errors/errors");
const Notification_1 = require("../models/Notification");
const formatValidationErrors = (error) => error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
}));
const getMyNotifications = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const notifications = await Notification_1.Notification.find({ recipientClerkUserId: auth.userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
exports.getMyNotifications = getMyNotifications;
const markNotificationAsRead = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const parsedParams = notification_dto_1.notificationIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const notification = await Notification_1.Notification.findOneAndUpdate({
            _id: parsedParams.data.notificationId,
            recipientClerkUserId: auth.userId,
        }, {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        }, { new: true });
        if (!notification) {
            throw new errors_1.NotFoundError('Notification not found');
        }
        res.status(200).json(notification);
    }
    catch (error) {
        next(error);
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const result = await Notification_1.Notification.updateMany({
            recipientClerkUserId: auth.userId,
            isRead: false,
        }, {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        });
        res.status(200).json({ modifiedCount: result.modifiedCount });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
