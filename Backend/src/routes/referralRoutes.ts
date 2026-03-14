import express from 'express';
import {
  assignReferralById,
  cancelReferralById,
  createReferral,
  deleteReferralByPatientId,
  getAllReferrals,
  getManagerDashboard,
  getManagerInsights,
  getManagerTeam,
  getReferralById,
  getMySubmittedReferrals,
  getReferralsByPatientId,
  getReferralsByPractitionerId,
  updateReferralByPatientId,
} from '../controllers/referralController';

const ReferralRouter = express.Router();

// GET /api/referrals
ReferralRouter.get('/', getAllReferrals);

// GET /api/referrals/my-submissions — MGR-005
// Returns referrals submitted by the authenticated user, derived from Clerk token.
// No manager ID in the URL — identity is read server-side from the token.
// Optional query params: status, serviceType, search, dateFrom, dateTo, page, limit
ReferralRouter.get('/my-submissions', getMySubmittedReferrals);

// GET /api/referrals/manager/dashboard
ReferralRouter.get('/manager/dashboard', getManagerDashboard);

// GET /api/referrals/manager/team
ReferralRouter.get('/manager/team', getManagerTeam);

// GET /api/referrals/manager/insights
ReferralRouter.get('/manager/insights', getManagerInsights);

// GET /api/referrals/patient/:patientId
ReferralRouter.get('/patient/:patientId', getReferralsByPatientId);

// GET /api/referrals/practitioner/:practitionerId
ReferralRouter.get('/practitioner/:practitionerId', getReferralsByPractitionerId);

// GET /api/referrals/:referralId — MGR-006
ReferralRouter.get('/:referralId', getReferralById);

// POST /api/referrals
ReferralRouter.post('/', createReferral);

// POST /api/referrals/:referralId/cancel
ReferralRouter.post('/:referralId/cancel', cancelReferralById);

// PUT /api/referrals/patient/:patientId
ReferralRouter.put('/patient/:patientId', updateReferralByPatientId);

// DELETE /api/referrals/patient/:patientId
ReferralRouter.delete('/patient/:patientId', deleteReferralByPatientId);

// PUT /api/referrals/:referralId/assign
ReferralRouter.put('/:referralId/assign', assignReferralById);

export default ReferralRouter;