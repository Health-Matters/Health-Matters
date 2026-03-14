import { NextFunction, Request, Response } from 'express';
import { User } from './../models/User';
import { ZodError } from 'zod';
import {
	adminUpdateUserBodySchema,
	assignManagerBodySchema,
	createUserByAdminBodySchema,
	getUsersQuerySchema,
	updateUserBodySchema,
	updateUserRoleBodySchema,
	userIdParamsSchema,
} from '../Dtos/user.dto';
import { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, BadRequestError } from '../errors/errors';
import { getAuth, clerkClient } from '@clerk/express';

const formatValidationErrors = (error: ZodError) =>
	error.issues.map((issue) => ({
		field: issue.path.join('.'),
		message: issue.message,
	}));

const normalizeRole = (value: unknown) =>
	typeof value === 'string' ? value.trim().toLowerCase() : undefined;

const requireAdmin = async (req: Request) => {
	const auth = getAuth(req);
	if (!auth.userId) {
		throw new UnauthorizedError('Authentication required');
	}

	let actor = await User.findOne({ clerkUserId: auth.userId });
	if (normalizeRole(actor?.role) === 'admin') {
		return actor;
	}

	// Fallback to Clerk as source of truth in case webhook/local sync is stale.
	const clerkUser = await clerkClient.users.getUser(auth.userId);
	const clerkRole = normalizeRole(clerkUser.publicMetadata?.role);

	if (clerkRole !== 'admin') {
		throw new ForbiddenError('Admin access required');
	}

	const email = clerkUser.emailAddresses?.[0]?.emailAddress;
	if (!email) {
		throw new UnauthorizedError('Authenticated admin user has no email in Clerk');
	}

	if (!actor) {
		const existingByEmail = await User.findOne({ email });
		if (existingByEmail) {
			existingByEmail.clerkUserId = auth.userId;
			existingByEmail.role = 'admin';
			actor = await existingByEmail.save();
		} else {
			actor = await User.create({
				clerkUserId: auth.userId,
				email,
				firstName: clerkUser.firstName ?? undefined,
				lastName: clerkUser.lastName ?? undefined,
				role: 'admin',
				isActive: true,
			});
		}
	} else {
		actor.role = 'admin';
		if (!actor.firstName && clerkUser.firstName) actor.firstName = clerkUser.firstName;
		if (!actor.lastName && clerkUser.lastName) actor.lastName = clerkUser.lastName;
		await actor.save();
	}

	if (!actor) {
		throw new UnauthorizedError('Authenticated admin user not found');
	}

	return actor;
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
		await requireAdmin(req);

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

export const createUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const actor = await requireAdmin(req);

		const parsedBody = createUserByAdminBodySchema.safeParse(req.body);
		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const { firstName, lastName, email, role, phone, department, userName } = parsedBody.data;

		const existingByEmail = await User.findOne({ email });
		if (existingByEmail) {
			throw new BadRequestError('A user with this email already exists');
		}

		const createdUser = await User.create({
			email,
			firstName,
			lastName,
			role,
			phone,
			department,
			userName,
			isActive: true,
			auditLog: [
				{
					action: 'create',
					changedByClerkUserId: actor!.clerkUserId,
					changes: { role, email, department: department ?? null },
				},
			],
		});

		res.status(201).json({
			message: 'User provisioned successfully. They will be linked on first Clerk sign-up/sign-in.',
			user: createdUser,
		});
	} catch (error) {
		next(error);
	}
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await requireAdmin(req);

		const parsedParams = userIdParamsSchema.safeParse(req.params);
		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const { userId } = parsedParams.data;

		const user = await User.findById(userId);
		if (!user) {
			throw new NotFoundError('User not found');
		}

		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};

export const updateUserByIdByAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const actor = await requireAdmin(req);

		const parsedParams = userIdParamsSchema.safeParse(req.params);
		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const parsedBody = adminUpdateUserBodySchema.safeParse(req.body);
		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const { userId } = parsedParams.data;
		const updates = parsedBody.data;

		const existingUser = await User.findById(userId);
		if (!existingUser) {
			throw new NotFoundError('User not found');
		}

		if (updates.email && updates.email !== existingUser.email) {
			const emailTaken = await User.findOne({ email: updates.email, _id: { $ne: userId } });
			if (emailTaken) {
				throw new BadRequestError('A user with this email already exists');
			}
		}

		if (updates.role && existingUser.clerkUserId) {
			await clerkClient.users.updateUser(existingUser.clerkUserId, {
				publicMetadata: { role: updates.role },
			});
		}

		if ((updates.firstName !== undefined || updates.lastName !== undefined) && existingUser.clerkUserId) {
			const clerkNameUpdate: { firstName?: string; lastName?: string } = {};
			if (updates.firstName !== undefined) clerkNameUpdate.firstName = updates.firstName;
			if (updates.lastName !== undefined) clerkNameUpdate.lastName = updates.lastName;

			await clerkClient.users.updateUser(existingUser.clerkUserId, clerkNameUpdate);
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				$set: updates,
				$push: {
					auditLog: {
						action: 'update',
						changedByClerkUserId: actor!.clerkUserId,
						changes: updates,
					},
				},
			},
			{ new: true, runValidators: true }
		);

		res.status(200).json(updatedUser);
	} catch (error) {
		next(error);
	}
};

export const updateUserRoleByAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const actor = await requireAdmin(req);

		const parsedParams = userIdParamsSchema.safeParse(req.params);
		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const parsedBody = updateUserRoleBodySchema.safeParse(req.body);
		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const { userId } = parsedParams.data;
		const { role } = parsedBody.data;

		const existingUser = await User.findById(userId);
		if (!existingUser) {
			throw new NotFoundError('User not found');
		}

		if (existingUser.clerkUserId) {
			await clerkClient.users.updateUser(existingUser.clerkUserId, {
				publicMetadata: { role },
			});
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				$set: { role },
				$push: {
					auditLog: {
						action: 'role_update',
						changedByClerkUserId: actor!.clerkUserId,
						changes: { roleFrom: existingUser.role, roleTo: role },
					},
				},
			},
			{ new: true, runValidators: true }
		);

		res.status(200).json(updatedUser);
	} catch (error) {
		next(error);
	}
};

export const deactivateUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const actor = await requireAdmin(req);

		const parsedParams = userIdParamsSchema.safeParse(req.params);
		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const { userId } = parsedParams.data;

		const existingUser = await User.findById(userId);
		if (!existingUser) {
			throw new NotFoundError('User not found');
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				$set: { isActive: false, deletedAt: new Date() },
				$push: {
					auditLog: {
						action: 'deactivate',
						changedByClerkUserId: actor!.clerkUserId,
						changes: { isActive: false },
					},
				},
			},
			{ new: true, runValidators: true }
		);

		res.status(200).json(updatedUser);
	} catch (error) {
		next(error);
	}
};

export const deleteUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await requireAdmin(req);

		const parsedParams = userIdParamsSchema.safeParse(req.params);
		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const { userId } = parsedParams.data;

		const existingUser = await User.findById(userId);
		if (!existingUser) {
			throw new NotFoundError('User not found');
		}

		if (existingUser.clerkUserId) {
			await clerkClient.users.deleteUser(existingUser.clerkUserId);
		}
		await User.findByIdAndDelete(userId);

		res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		next(error);
	}
};

export const assignUserManagerByAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const actor = await requireAdmin(req);

		const parsedParams = userIdParamsSchema.safeParse(req.params);
		if (!parsedParams.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
		}

		const parsedBody = assignManagerBodySchema.safeParse(req.body);
		if (!parsedBody.success) {
			throw new ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
		}

		const { userId } = parsedParams.data;
		const { managerClerkUserId } = parsedBody.data;

		const manager = await User.findOne({ clerkUserId: managerClerkUserId, role: 'manager', isActive: true });
		if (!manager) {
			throw new BadRequestError('Selected manager does not exist or is inactive');
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				$set: { managerClerkUserId },
				$push: {
					auditLog: {
						action: 'manager_assignment',
						changedByClerkUserId: actor!.clerkUserId,
						changes: { managerClerkUserId },
					},
				},
			},
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