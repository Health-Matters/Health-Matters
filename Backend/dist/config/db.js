"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB");
        const MONGODB_URI = process.env.MONGODB_URL;
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URL is not defined");
        }
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.log("Error while connecting to MongoDB", error);
    }
};
exports.connectDB = connectDB;
exports.default = exports.connectDB;
