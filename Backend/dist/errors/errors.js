"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandlingMiddleware = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.ValidationError = exports.NotFoundError = void 0;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = "BadRequestError";
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = "UnauthorizedError";
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = "ForbiddenError";
    }
}
exports.ForbiddenError = ForbiddenError;
const globalErrorHandlingMiddleware = (err, req, res, next) => {
    console.error(err); // Log the error for debugging
    if (err.name === "NotFoundError") {
        return res.status(404).json({ message: err.message });
    }
    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
    }
    if (err.name === "BadRequestError") {
        return res.status(400).json({ message: err.message });
    }
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ message: err.message });
    }
    if (err.name === "ForbiddenError") {
        return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal Server Error" });
};
exports.globalErrorHandlingMiddleware = globalErrorHandlingMiddleware;
