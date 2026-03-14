"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminRole = exports.requireClerkAuth = void 0;
const express_1 = require("@clerk/express");
const User_1 = require("../models/User");
const normalizeRole = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';
const getAuthenticatedClerkUserId = (req) => {
    const auth = (0, express_1.getAuth)(req);
    return auth.userId;
};
const ensureClerkMember = async (userId) => {
    const clerkUser = await express_1.clerkClient.users.getUser(userId);
    if (!clerkUser) {
        return null;
    }
    if (clerkUser.banned || clerkUser.locked) {
        return null;
    }
    return clerkUser;
};
const requireClerkAuth = async (req, res, next) => {
    try {
        const userId = getAuthenticatedClerkUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const clerkUser = await ensureClerkMember(userId);
        if (!clerkUser) {
            return res.status(401).json({ message: 'Authenticated Clerk membership required' });
        }
        return next();
    }
    catch (error) {
        return next(error);
    }
};
exports.requireClerkAuth = requireClerkAuth;
const requireAdminRole = async (req, res, next) => {
    try {
        const userId = getAuthenticatedClerkUserId(req);
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const clerkUser = await ensureClerkMember(userId);
        if (!clerkUser) {
            return res.status(401).json({ message: 'Authenticated Clerk membership required' });
        }
        const user = await User_1.User.findOne({ clerkUserId: userId });
        if (normalizeRole(user?.role) === 'admin') {
            return next();
        }
        // Fallback to Clerk metadata in case local DB sync is stale.
        const clerkRole = normalizeRole(clerkUser.publicMetadata?.role);
        if (clerkRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        return next();
    }
    catch (error) {
        return next(error);
    }
};
exports.requireAdminRole = requireAdminRole;
