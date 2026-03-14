import { NextFunction, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import Review from '../models/Review';
import { createReviewBodySchema, getReviewsQuerySchema } from '../Dtos/review.dto';

/*
 Team J - Practitioner review listing, creation, and star-rating persistence APIs (TMJ-001, TMJ-002, TMJ-003) . Done by Yahanima, Senithi, Irindu, Dulmin, and Akith
*/

export const getReviewsForCurrentPractitioner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const query = getReviewsQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ message: 'Invalid query parameters', errors: query.error.flatten() });
    }

    const limit = query.data.limit ?? 4;

    const reviews = await Review.find({ practitionerClerkUserId: auth.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json(reviews);
  } catch (error) {
    return next(error);
  }
};

export const createReviewForCurrentPractitioner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const body = createReviewBodySchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ message: 'Invalid request body', errors: body.error.flatten() });
    }

    const review = await Review.create({
      practitionerClerkUserId: auth.userId,
      patientName: body.data.patientName,
      message: body.data.message,
      rating: body.data.rating,
    });

    return res.status(201).json(review);
  } catch (error) {
    return next(error);
  }
};
