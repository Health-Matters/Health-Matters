"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.getNotificationsForCurrentUser = void 0;
const express_1 = require("@clerk/express");
const Notification_1 = __importDefault(require("../models/Notification"));
const User_1 = require("../models/User");
const notification_dto_1 = require("../Dtos/notification.dto");
const getNotificationsForCurrentUser = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const user = await User_1.User.findOne({ clerkUserId: auth.userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const query = notification_dto_1.getNotificationsQuerySchema.safeParse(req.query);
        if (!query.success) {
            return res.status(400).json({ message: 'Invalid query parameters', errors: query.error.flatten() });
        }
        const { unread, type, limit } = query.data;
        const filter = { recipientId: user._id };
        if (unread === true)
            filter['channels.inApp.read'] = false;
        if (type)
            filter['type'] = type;
        const notifications = await Notification_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit ?? 50)
            .lean();
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
exports.getNotificationsForCurrentUser = getNotificationsForCurrentUser;
const markNotificationRead = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const params = notification_dto_1.notificationIdParamsSchema.safeParse(req.params);
        if (!params.success) {
            return res.status(400).json({ message: 'Invalid notification ID', errors: params.error.flatten() });
        }
        const user = await User_1.User.findOne({ clerkUserId: auth.userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const notification = await Notification_1.default.findOne({ _id: params.data.notificationId, recipientId: user._id });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.channels.inApp.read = true;
        notification.channels.inApp.readAt = new Date();
        await notification.save();
        res.status(200).json(notification);
    }
    catch (error) {
        next(error);
    }
};
exports.markNotificationRead = markNotificationRead;
