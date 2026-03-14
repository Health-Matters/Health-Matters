import express from 'express';
import {
	assignUserManagerByAdmin,
	createUserByAdmin,
	deactivateUserByAdmin,
	deleteUserByAdmin,
	getAllUsers,
	getUserByClerkId,
	getUserById,
	updateUserByClerkId,
	updateUserByIdByAdmin,
	updateUserRoleByAdmin,
} from '../controllers/userController';
import { requireAdminRole, requireClerkAuth } from '../middlewares/auth-middleware';

const UserRouter = express.Router();

UserRouter.use(requireClerkAuth);

// GET /api/users - Get all users
UserRouter.get('/', requireAdminRole, getAllUsers);

// GET /api/users/me - Get authenticated user by Clerk ID from token
UserRouter.get('/me', getUserByClerkId);

// PUT /api/users/me - Update authenticated user by Clerk ID from token
UserRouter.put('/me', updateUserByClerkId);

// POST /api/users - Create a user (admin only)
UserRouter.post('/', requireAdminRole, createUserByAdmin);

// GET /api/users/:userId - Get one user (admin only)
UserRouter.get('/:userId', requireAdminRole, getUserById);

// PUT /api/users/:userId - Update user details (admin only)
UserRouter.put('/:userId', requireAdminRole, updateUserByIdByAdmin);

// PUT /api/users/:userId/role - Update user role and Clerk metadata (admin only)
UserRouter.put('/:userId/role', requireAdminRole, updateUserRoleByAdmin);

// PATCH /api/users/:userId/deactivate - Soft deactivate user (admin only)
UserRouter.patch('/:userId/deactivate', requireAdminRole, deactivateUserByAdmin);

// DELETE /api/users/:userId - Delete user (admin only)
UserRouter.delete('/:userId', requireAdminRole, deleteUserByAdmin);

// POST /api/users/:userId/manager - Assign manager relationship (admin only)
UserRouter.post('/:userId/manager', requireAdminRole, assignUserManagerByAdmin);

export default UserRouter;
