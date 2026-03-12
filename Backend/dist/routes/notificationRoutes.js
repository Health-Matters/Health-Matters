"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const NotificationRouter = express_1.default.Router();
NotificationRouter.get('/me', notificationController_1.getMyNotifications);
NotificationRouter.put('/me/read-all', notificationController_1.markAllNotificationsAsRead);
NotificationRouter.put('/:notificationId/read', notificationController_1.markNotificationAsRead);
exports.default = NotificationRouter;
