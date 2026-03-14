import express from 'express';
import { createReviewForCurrentPractitioner, getReviewsForCurrentPractitioner } from '../controllers/reviewController';
import { requireClerkAuth } from '../middlewares/auth-middleware';

const ReviewRouter = express.Router();

ReviewRouter.use(requireClerkAuth);

// GET /api/reviews?limit=4 - Get current practitioner's reviews
ReviewRouter.get('/', getReviewsForCurrentPractitioner);

// POST /api/reviews - Create a new review for current practitioner
ReviewRouter.post('/', createReviewForCurrentPractitioner);

export default ReviewRouter;
