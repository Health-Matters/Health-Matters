import express from 'express';
import { getAllUsers } from '../controllers/userController';

const UserRouter = express.Router();

// GET /api/users - Get all users
UserRouter.get('/', getAllUsers);

export default UserRouter;
