import { NextFunction, Request, Response } from 'express';
import { clerkClient, getAuth } from '@clerk/express';
import { User } from '../models/User';

const normalizeRole = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const getAuthenticatedClerkUserId = (req: Request) => {
  const auth = getAuth(req);
  return auth.userId;
};

const ensureClerkMember = async (userId: string) => {
  const clerkUser = await clerkClient.users.getUser(userId);

  if (!clerkUser) {
    return null;
  }

  if (clerkUser.banned || clerkUser.locked) {
    return null;
  }

  return clerkUser;
};

export const requireClerkAuth = async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (error) {
    return next(error);
  }
};

export const requireAdminRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthenticatedClerkUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const clerkUser = await ensureClerkMember(userId);
    if (!clerkUser) {
      return res.status(401).json({ message: 'Authenticated Clerk membership required' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (normalizeRole(user?.role) === 'admin') {
      return next();
    }

    // Fallback to Clerk metadata in case local DB sync is stale.
    const clerkRole = normalizeRole(clerkUser.publicMetadata?.role);
    if (clerkRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
