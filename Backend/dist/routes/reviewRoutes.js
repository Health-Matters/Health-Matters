"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const auth_middleware_1 = require("../middlewares/auth-middleware");
const ReviewRouter = express_1.default.Router();
ReviewRouter.use(auth_middleware_1.requireClerkAuth);
// GET /api/reviews?limit=4 - Get current practitioner's reviews
ReviewRouter.get('/', reviewController_1.getReviewsForCurrentPractitioner);
// POST /api/reviews - Create a new review for current practitioner
ReviewRouter.post('/', reviewController_1.createReviewForCurrentPractitioner);
exports.default = ReviewRouter;
