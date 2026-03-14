"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_middleware_1 = require("../middlewares/auth-middleware");
const UserRouter = express_1.default.Router();
UserRouter.use(auth_middleware_1.requireClerkAuth);
// GET /api/users - Get all users
UserRouter.get('/', auth_middleware_1.requireAdminRole, userController_1.getAllUsers);
// GET /api/users/me - Get authenticated user by Clerk ID from token
UserRouter.get('/me', userController_1.getUserByClerkId);
// PUT /api/users/me - Update authenticated user by Clerk ID from token
UserRouter.put('/me', userController_1.updateUserByClerkId);
// POST /api/users - Create a user (admin only)
UserRouter.post('/', auth_middleware_1.requireAdminRole, userController_1.createUserByAdmin);
// GET /api/users/:userId - Get one user (admin only)
UserRouter.get('/:userId', auth_middleware_1.requireAdminRole, userController_1.getUserById);
// PUT /api/users/:userId - Update user details (admin only)
UserRouter.put('/:userId', auth_middleware_1.requireAdminRole, userController_1.updateUserByIdByAdmin);
// PUT /api/users/:userId/role - Update user role and Clerk metadata (admin only)
UserRouter.put('/:userId/role', auth_middleware_1.requireAdminRole, userController_1.updateUserRoleByAdmin);
// PATCH /api/users/:userId/deactivate - Soft deactivate user (admin only)
UserRouter.patch('/:userId/deactivate', auth_middleware_1.requireAdminRole, userController_1.deactivateUserByAdmin);
// DELETE /api/users/:userId - Delete user (admin only)
UserRouter.delete('/:userId', auth_middleware_1.requireAdminRole, userController_1.deleteUserByAdmin);
// POST /api/users/:userId/manager - Assign manager relationship (admin only)
UserRouter.post('/:userId/manager', auth_middleware_1.requireAdminRole, userController_1.assignUserManagerByAdmin);
exports.default = UserRouter;
