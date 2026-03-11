import express from "express";

import {
  getAllReferrals,
  createReferral,
  assignReferralById,
  updateReferralStatusById,
} from "../controllers/referralController";

const router = express.Router();

router.get("/", getAllReferrals);
router.post("/", createReferral);
router.put("/:referralId/assign", assignReferralById);
router.put("/:referralId/status", updateReferralStatusById);

export default router;