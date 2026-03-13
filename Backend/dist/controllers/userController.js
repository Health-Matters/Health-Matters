"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserByClerkId = exports.getUserByClerkId = exports.getAllUsers = void 0;
const User_1 = require("./../models/User");
const user_dto_1 = require("../Dtos/user.dto");
const errors_1 = require("../errors/errors");
const express_1 = require("@clerk/express");
const formatValidationErrors = (error) => error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
}));
const getAllUsers = async (req, res, next) => {
    try {
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
