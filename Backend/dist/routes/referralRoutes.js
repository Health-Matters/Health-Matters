"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const referralController_1 = require("../controllers/referralController");
const ReferralRouter = express_1.default.Router();
// GET /api/referrals - Get all referrals
ReferralRouter.get('/', referralController_1.getAllReferrals);
// GET /api/referrals/patient/:patientId - Get referrals by patientId
ReferralRouter.get('/patient/:patientId', referralController_1.getReferralsByPatientId);
// GET /api/referrals/practitioner/:practitionerId - Get referrals by practitionerId
ReferralRouter.get('/practitioner/:practitionerId', referralController_1.getReferralsByPractitionerId);
// POST /api/referrals - Create a new referral
ReferralRouter.post('/', referralController_1.createReferral);
// PUT /api/referrals/patient/:patientId - Update referrals by patientId
ReferralRouter.put('/patient/:patientId', referralController_1.updateReferralByPatientId);
// DELETE /api/referrals/patient/:patientId - Delete referrals by patientId
ReferralRouter.delete('/patient/:patientId', referralController_1.deleteReferralByPatientId);
exports.default = ReferralRouter;
