"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignUserManagerByAdmin = exports.deleteUserByAdmin = exports.deactivateUserByAdmin = exports.updateUserRoleByAdmin = exports.updateUserByIdByAdmin = exports.getUserById = exports.createUserByAdmin = exports.updateUserByClerkId = exports.getUserByClerkId = exports.getAllUsers = void 0;
const User_1 = require("./../models/User");
const user_dto_1 = require("../Dtos/user.dto");
const errors_1 = require("../errors/errors");
const express_1 = require("@clerk/express");
const formatValidationErrors = (error) => error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
}));
const normalizeRole = (value) => typeof value === 'string' ? value.trim().toLowerCase() : undefined;
const requireAdmin = async (req) => {
    const auth = (0, express_1.getAuth)(req);
    if (!auth.userId) {
        throw new errors_1.UnauthorizedError('Authentication required');
    }
    let actor = await User_1.User.findOne({ clerkUserId: auth.userId });
    if (normalizeRole(actor?.role) === 'admin') {
        return actor;
    }
    // Fallback to Clerk as source of truth in case webhook/local sync is stale.
    const clerkUser = await express_1.clerkClient.users.getUser(auth.userId);
    const clerkRole = normalizeRole(clerkUser.publicMetadata?.role);
    if (clerkRole !== 'admin') {
        throw new errors_1.ForbiddenError('Admin access required');
    }
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    if (!email) {
        throw new errors_1.UnauthorizedError('Authenticated admin user has no email in Clerk');
    }
    if (!actor) {
        const existingByEmail = await User_1.User.findOne({ email });
        if (existingByEmail) {
            existingByEmail.clerkUserId = auth.userId;
            existingByEmail.role = 'admin';
            actor = await existingByEmail.save();
        }
        else {
            actor = await User_1.User.create({
                clerkUserId: auth.userId,
                email,
                firstName: clerkUser.firstName ?? undefined,
                lastName: clerkUser.lastName ?? undefined,
                role: 'admin',
                isActive: true,
            });
        }
    }
    else {
        actor.role = 'admin';
        if (!actor.firstName && clerkUser.firstName)
            actor.firstName = clerkUser.firstName;
        if (!actor.lastName && clerkUser.lastName)
            actor.lastName = clerkUser.lastName;
        await actor.save();
    }
    if (!actor) {
        throw new errors_1.UnauthorizedError('Authenticated admin user not found');
    }
    return actor;
};
const getAllUsers = async (req, res, next) => {
    try {
        await requireAdmin(req);
        const parsedQuery = user_dto_1.getUsersQuerySchema.safeParse(req.query);
        if (!parsedQuery.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedQuery.error)));
        }
        const users = await User_1.User.find(parsedQuery.data);
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const getUserByClerkId = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        let user = await User_1.User.findOne({ clerkUserId: auth.userId });
        // ── Upsert fallback ────────────────────────────────────────────────────
        // If the Clerk webhook hasn't run yet (common in local dev without ngrok),
        // the user exists in Clerk but not in MongoDB. We auto-create them here
        // so the app works without requiring the webhook to have fired first.
        if (!user) {
            try {
                const clerkUser = await express_1.clerkClient.users.getUser(auth.userId);
                const email = clerkUser.emailAddresses?.[0]?.emailAddress;
                if (!email) {
                    throw new errors_1.NotFoundError('User not found and could not be auto-created (no email in Clerk)');
                }
                // Check for duplicate email (edge case: race condition)
                const existing = await User_1.User.findOne({ email });
                if (existing) {
                    // Link the existing record to this Clerk ID
                    existing.clerkUserId = auth.userId;
                    user = await existing.save();
                }
                else {
                    user = await User_1.User.create({
                        clerkUserId: auth.userId,
                        email,
                        firstName: clerkUser.firstName ?? undefined,
                        lastName: clerkUser.lastName ?? undefined,
                        role: clerkUser.publicMetadata?.role ?? 'employee',
                    });
                }
                console.log(`✅ getUserByClerkId: auto-created user for clerkUserId ${auth.userId}`);
            }
            catch (clerkErr) {
                // If Clerk API call fails, fall back to a plain NotFoundError
                console.error('Failed to auto-create user from Clerk:', clerkErr);
                throw new errors_1.NotFoundError('User not found');
            }
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserByClerkId = getUserByClerkId;
const updateUserByClerkId = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const parsedBody = user_dto_1.updateUserBodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const updatedUser = await User_1.User.findOneAndUpdate({ clerkUserId: auth.userId }, { $set: parsedBody.data }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        res.status(200).json(updatedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserByClerkId = updateUserByClerkId;
const createUserByAdmin = async (req, res, next) => {
    try {
        const actor = await requireAdmin(req);
        const parsedBody = user_dto_1.createUserByAdminBodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const { firstName, lastName, email, role, phone, department, userName } = parsedBody.data;
        const existingByEmail = await User_1.User.findOne({ email });
        if (existingByEmail) {
            throw new errors_1.BadRequestError('A user with this email already exists');
        }
        const createdUser = await User_1.User.create({
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
                    changedByClerkUserId: actor.clerkUserId,
                    changes: { role, email, department: department ?? null },
                },
            ],
        });
        res.status(201).json({
            message: 'User provisioned successfully. They will be linked on first Clerk sign-up/sign-in.',
            user: createdUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createUserByAdmin = createUserByAdmin;
const getUserById = async (req, res, next) => {
    try {
        await requireAdmin(req);
        const parsedParams = user_dto_1.userIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const { userId } = parsedParams.data;
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const updateUserByIdByAdmin = async (req, res, next) => {
    try {
        const actor = await requireAdmin(req);
        const parsedParams = user_dto_1.userIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const parsedBody = user_dto_1.adminUpdateUserBodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const { userId } = parsedParams.data;
        const updates = parsedBody.data;
        const existingUser = await User_1.User.findById(userId);
        if (!existingUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (updates.email && updates.email !== existingUser.email) {
            const emailTaken = await User_1.User.findOne({ email: updates.email, _id: { $ne: userId } });
            if (emailTaken) {
                throw new errors_1.BadRequestError('A user with this email already exists');
            }
        }
        if (updates.role && existingUser.clerkUserId) {
            await express_1.clerkClient.users.updateUser(existingUser.clerkUserId, {
                publicMetadata: { role: updates.role },
            });
        }
        if ((updates.firstName !== undefined || updates.lastName !== undefined) && existingUser.clerkUserId) {
            const clerkNameUpdate = {};
            if (updates.firstName !== undefined)
                clerkNameUpdate.firstName = updates.firstName;
            if (updates.lastName !== undefined)
                clerkNameUpdate.lastName = updates.lastName;
            await express_1.clerkClient.users.updateUser(existingUser.clerkUserId, clerkNameUpdate);
        }
        const updatedUser = await User_1.User.findByIdAndUpdate(userId, {
            $set: updates,
            $push: {
                auditLog: {
                    action: 'update',
                    changedByClerkUserId: actor.clerkUserId,
                    changes: updates,
                },
            },
        }, { new: true, runValidators: true });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserByIdByAdmin = updateUserByIdByAdmin;
const updateUserRoleByAdmin = async (req, res, next) => {
    try {
        const actor = await requireAdmin(req);
        const parsedParams = user_dto_1.userIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const parsedBody = user_dto_1.updateUserRoleBodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const { userId } = parsedParams.data;
        const { role } = parsedBody.data;
        const existingUser = await User_1.User.findById(userId);
        if (!existingUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (existingUser.clerkUserId) {
            await express_1.clerkClient.users.updateUser(existingUser.clerkUserId, {
                publicMetadata: { role },
            });
        }
        const updatedUser = await User_1.User.findByIdAndUpdate(userId, {
            $set: { role },
            $push: {
                auditLog: {
                    action: 'role_update',
                    changedByClerkUserId: actor.clerkUserId,
                    changes: { roleFrom: existingUser.role, roleTo: role },
                },
            },
        }, { new: true, runValidators: true });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRoleByAdmin = updateUserRoleByAdmin;
const deactivateUserByAdmin = async (req, res, next) => {
    try {
        const actor = await requireAdmin(req);
        const parsedParams = user_dto_1.userIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const { userId } = parsedParams.data;
        const existingUser = await User_1.User.findById(userId);
        if (!existingUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        const updatedUser = await User_1.User.findByIdAndUpdate(userId, {
            $set: { isActive: false, deletedAt: new Date() },
            $push: {
                auditLog: {
                    action: 'deactivate',
                    changedByClerkUserId: actor.clerkUserId,
                    changes: { isActive: false },
                },
            },
        }, { new: true, runValidators: true });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.deactivateUserByAdmin = deactivateUserByAdmin;
const deleteUserByAdmin = async (req, res, next) => {
    try {
        await requireAdmin(req);
        const parsedParams = user_dto_1.userIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const { userId } = parsedParams.data;
        const existingUser = await User_1.User.findById(userId);
        if (!existingUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (existingUser.clerkUserId) {
            await express_1.clerkClient.users.deleteUser(existingUser.clerkUserId);
        }
        await User_1.User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUserByAdmin = deleteUserByAdmin;
const assignUserManagerByAdmin = async (req, res, next) => {
    try {
        const actor = await requireAdmin(req);
        const parsedParams = user_dto_1.userIdParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedParams.error)));
        }
        const parsedBody = user_dto_1.assignManagerBodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new errors_1.ValidationError(JSON.stringify(formatValidationErrors(parsedBody.error)));
        }
        const { userId } = parsedParams.data;
        const { managerClerkUserId } = parsedBody.data;
        const manager = await User_1.User.findOne({ clerkUserId: managerClerkUserId, role: 'manager', isActive: true });
        if (!manager) {
            throw new errors_1.BadRequestError('Selected manager does not exist or is inactive');
        }
        const updatedUser = await User_1.User.findByIdAndUpdate(userId, {
            $set: { managerClerkUserId },
            $push: {
                auditLog: {
                    action: 'manager_assignment',
                    changedByClerkUserId: actor.clerkUserId,
                    changes: { managerClerkUserId },
                },
            },
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        res.status(200).json(updatedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.assignUserManagerByAdmin = assignUserManagerByAdmin;
