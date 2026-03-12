"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const User_1 = require("./../models/User");
const user_dto_1 = require("../Dtos/user.dto");
const formatValidationErrors = (error) => error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
}));
const getAllUsers = async (req, res, next) => {
    try {
        const parsedQuery = user_dto_1.getUsersQuerySchema.safeParse(req.query);
        if (!parsedQuery.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: formatValidationErrors(parsedQuery.error),
            });
            return;
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
