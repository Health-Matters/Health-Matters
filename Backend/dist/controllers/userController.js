"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserByClerkId = exports.getAllUsers = void 0;
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
        console.log("Users: ", users);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
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
