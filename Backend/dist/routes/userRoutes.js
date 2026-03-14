"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const UserRouter = express_1.default.Router();
// GET /api/users - Get all users
UserRouter.get('/', userController_1.getAllUsers);
// PUT /api/users/me - Update authenticated user by Clerk ID from token
UserRouter.put('/me', userController_1.updateUserByClerkId);
exports.default = UserRouter;
