export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

import { Request, Response, NextFunction } from "express";

export const globalErrorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
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