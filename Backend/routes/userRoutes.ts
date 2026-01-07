import express from 'express';
import { getAllUsers } from '../controllers/userController';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', getAllUsers);

export default router;
