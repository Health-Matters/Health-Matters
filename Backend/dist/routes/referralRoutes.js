"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const referralController_1 = require("../controllers/referralController");
const auth_middleware_1 = require("../middlewares/auth-middleware");
const ReferralRouter = express_1.default.Router();
ReferralRouter.use(auth_middleware_1.requireClerkAuth);
// GET /api/referrals
ReferralRouter.get('/', referralController_1.getAllReferrals);
// GET /api/referrals/my-submissions — MGR-005
// Returns referrals submitted by the authenticated user, derived from Clerk token.
// No manager ID in the URL — identity is read server-side from the token.
// Optional query params: status, serviceType, search, dateFrom, dateTo, page, limit
ReferralRouter.get('/my-submissions', referralController_1.getMySubmittedReferrals);
// GET /api/referrals/patient/:patientId
ReferralRouter.get('/patient/:patientId', referralController_1.getReferralsByPatientId);
// GET /api/referrals/practitioner/:practitionerId
ReferralRouter.get('/practitioner/:practitionerId', referralController_1.getReferralsByPractitionerId);
// GET /api/referrals/:referralId — MGR-006
ReferralRouter.get('/:referralId', referralController_1.getReferralById);
// POST /api/referrals
ReferralRouter.post('/', referralController_1.createReferral);
// PUT /api/referrals/patient/:patientId
ReferralRouter.put('/patient/:patientId', referralController_1.updateReferralByPatientId);
// DELETE /api/referrals/patient/:patientId
ReferralRouter.delete('/patient/:patientId', referralController_1.deleteReferralByPatientId);
// PUT /api/referrals/:referralId/assign
ReferralRouter.put('/:referralId/assign', referralController_1.assignReferralById);
// PUT /api/referrals/:referralId/status
ReferralRouter.put('/:referralId/status', referralController_1.updateReferralStatus);
// PUT /api/referrals/:referralId/cancel
ReferralRouter.put('/:referralId/cancel', referralController_1.cancelReferralByManager);
exports.default = ReferralRouter;
