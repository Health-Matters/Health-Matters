import { NextFunction, Request, Response } from 'express';
import { User } from './../models/User';
import { ZodError } from 'zod';
import { getUsersQuerySchema, updateUserBodySchema } from '../Dtos/user.dto';
import { ValidationError, NotFoundError, UnauthorizedError } from '../errors/errors';
import { getAuth } from '@clerk/express';

const formatValidationErrors = (error: ZodError) =>
	error.issues.map((issue) => ({
		field: issue.path.join('.'),
		message: issue.message,
	}));

export const getAllUsers = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const parsedQuery = getUsersQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
    }

    const users = await User.find(parsedQuery.data);
    res.status(200).json(users);
    console.log("Users: ", users);
    
  } catch (error) {
    next(error);
  }
}

export const updateUserByClerkId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    
    if (!auth.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const parsedBody = updateUserBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkUserId: auth.userId },
      { $set: parsedBody.data },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};