import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Referral from "../models/Referral";

import {
  createReferralBodySchema,
  referralIdParamsSchema,
  assignReferralBodySchema,
  updateReferralStatusBodySchema,
} from "../Dtos/referral.dto";

export const getAllReferrals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const referrals = await Referral.find()
      .populate("employeeId")
      .populate("referredById")
      .populate("assignedPractitionerId")
      .sort({ createdAt: -1 });

    res.status(200).json(referrals);
  } catch (error) {
    next(error);
  }
};

export const createReferral = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = createReferralBodySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const referralNumber = `REF-${Date.now()}`;

    const referral = await Referral.create({
      ...parsed.data,
      referralNumber,
      sla: {
        submittedAt: new Date(),
        breached: false,
      },
    });

    res.status(201).json(referral);
  } catch (error) {
    next(error);
  }
};

export const assignReferralById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = referralIdParamsSchema.safeParse(req.params);
    const body = assignReferralBodySchema.safeParse(req.body);

    if (!params.success || !body.success) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const referral = await Referral.findByIdAndUpdate(
      params.data.referralId,
      {
        assignedPractitionerId: new mongoose.Types.ObjectId(
          body.data.assignedPractitionerId
        ),
        status: "appointed",
        "sla.appointedAt": new Date(),
      },
      { new: true }
    );

    res.status(200).json(referral);
  } catch (error) {
    next(error);
  }
};

export const updateReferralStatusById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = referralIdParamsSchema.safeParse(req.params);
    const body = updateReferralStatusBodySchema.safeParse(req.body);

    if (!params.success || !body.success) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const referral = await Referral.findByIdAndUpdate(
      params.data.referralId,
      {
        status: body.data.status,
      },
      { new: true }
    );

    res.status(200).json(referral);
  } catch (error) {
    next(error);
  }
};