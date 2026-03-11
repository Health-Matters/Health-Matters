import { z } from "zod";

export const referralIdParamsSchema = z.object({
  referralId: z.string().trim().min(1, "referralId is required"),
});

export const createReferralBodySchema = z.object({
  employeeId: z.string().trim().min(1),
  referredById: z.string().trim().min(1),
  serviceId: z.string().trim().min(1),
  type: z.enum(["self_referral", "manager_referral", "follow_up"]),
  reasonForReferral: z.string().trim().min(1),
  urgencyLevel: z.enum(["routine", "urgent", "emergency"]).optional(),
});

export const assignReferralBodySchema = z.object({
  assignedPractitionerId: z.string().trim().min(1),
});

export const updateReferralStatusBodySchema = z.object({
  status: z.enum([
    "submitted",
    "triaged",
    "appointed",
    "in_progress",
    "completed",
    "withdrawn",
    "cancelled",
  ]),
});