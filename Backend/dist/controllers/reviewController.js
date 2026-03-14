"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewForCurrentPractitioner = exports.getReviewsForCurrentPractitioner = void 0;
const express_1 = require("@clerk/express");
const Review_1 = __importDefault(require("../models/Review"));
const review_dto_1 = require("../Dtos/review.dto");
const getReviewsForCurrentPractitioner = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const query = review_dto_1.getReviewsQuerySchema.safeParse(req.query);
        if (!query.success) {
            return res.status(400).json({ message: 'Invalid query parameters', errors: query.error.flatten() });
        }
        const limit = query.data.limit ?? 4;
        const reviews = await Review_1.default.find({ practitionerClerkUserId: auth.userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return res.status(200).json(reviews);
    }
    catch (error) {
        return next(error);
    }
};
exports.getReviewsForCurrentPractitioner = getReviewsForCurrentPractitioner;
const createReviewForCurrentPractitioner = async (req, res, next) => {
    try {
        const auth = (0, express_1.getAuth)(req);
        if (!auth.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const body = review_dto_1.createReviewBodySchema.safeParse(req.body);
        if (!body.success) {
            return res.status(400).json({ message: 'Invalid request body', errors: body.error.flatten() });
        }
        const review = await Review_1.default.create({
            practitionerClerkUserId: auth.userId,
            patientName: body.data.patientName,
            message: body.data.message,
            rating: body.data.rating,
        });
        return res.status(201).json(review);
    }
    catch (error) {
        return next(error);
    }
};
exports.createReviewForCurrentPractitioner = createReviewForCurrentPractitioner;
