import express from 'express';
import { getAllUsers, getUserByClerkId, updateUserByClerkId } from '../controllers/userController';

const UserRouter = express.Router();

// GET /api/users - Get all users
UserRouter.get('/', getAllUsers);

// GET /api/users/me - Get authenticated user by Clerk ID from token
UserRouter.get('/me', getUserByClerkId);

// PUT /api/users/me - Update authenticated user by Clerk ID from token
UserRouter.put('/me', updateUserByClerkId);

export default UserRouter;
