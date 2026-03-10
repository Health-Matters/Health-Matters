import { NextFunction, Request, Response } from 'express';
import { User } from './../models/User';
import { ZodError } from 'zod';
import { getUsersQuerySchema, updateUserBodySchema } from '../Dtos/user.dto';
import { ValidationError, NotFoundError, UnauthorizedError } from '../errors/errors';
import { getAuth, clerkClient } from '@clerk/express';

const formatValidationErrors = (error: ZodError) =>
	error.issues.map((issue) => ({
		field: issue.path.join('.'),
		message: issue.message,
	}));

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedQuery = getUsersQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
    }

    const users = await User.find(parsedQuery.data);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserByClerkId = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const auth = getAuth(req);

		if (!auth.userId) {
			throw new UnauthorizedError('Authentication required');
		}

		let user = await User.findOne({ clerkUserId: auth.userId });

		// ── Upsert fallback ────────────────────────────────────────────────────
		// If the Clerk webhook hasn't run yet (common in local dev without ngrok),
		// the user exists in Clerk but not in MongoDB. We auto-create them here
		// so the app works without requiring the webhook to have fired first.
		if (!user) {
			try {
				const clerkUser = await clerkClient.users.getUser(auth.userId);
				const email = clerkUser.emailAddresses?.[0]?.emailAddress;

				if (!email) {
					throw new NotFoundError('User not found and could not be auto-created (no email in Clerk)');
				}

				// Check for duplicate email (edge case: race condition)
				const existing = await User.findOne({ email });
				if (existing) {
					// Link the existing record to this Clerk ID
					existing.clerkUserId = auth.userId;
					user = await existing.save();
				} else {
					user = await User.create({
						clerkUserId: auth.userId,
						email,
						firstName: clerkUser.firstName ?? undefined,
						lastName: clerkUser.lastName ?? undefined,
						role: (clerkUser.publicMetadata?.role as string) ?? 'employee',
					});
				}

				console.log(`✅ getUserByClerkId: auto-created user for clerkUserId ${auth.userId}`);
			} catch (clerkErr) {
				// If Clerk API call fails, fall back to a plain NotFoundError
				console.error('Failed to auto-create user from Clerk:', clerkErr);
				throw new NotFoundError('User not found');
			}
		}

		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};

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