"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const NotificationRouter = express_1.default.Router();
// GET /api/notifications - Get current user's notifications
NotificationRouter.get('/', notificationController_1.getNotificationsForCurrentUser);
// PATCH /api/notifications/:notificationId/read - Mark a notification as read
NotificationRouter.patch('/:notificationId/read', notificationController_1.markNotificationRead);
exports.default = NotificationRouter;
