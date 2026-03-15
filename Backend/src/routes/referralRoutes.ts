import express from 'express';
import {
  assignReferralById,
  cancelReferralByManager,
  createReferral,
  deleteMySubmittedReferralById,
  deleteReferralByPatientId,
  getAllReferrals,
  getMyPatientReferrals,
  getReferralById,
  getMySubmittedReferrals,
  getReferralsByPatientId,
  getReferralsByPractitionerId,
  updateReferralByPatientId,
  updateReferralStatus,
} from '../controllers/referralController';
import { requireClerkAuth } from '../middlewares/auth-middleware';

const ReferralRouter = express.Router();

ReferralRouter.use(requireClerkAuth);

// GET /api/referrals
ReferralRouter.get('/', getAllReferrals);

// GET /api/referrals/my-submissions — MGR-005
// Returns referrals submitted by the authenticated user, derived from Clerk token.
// No manager ID in the URL — identity is read server-side from the token.
// Optional query params: status, serviceType, search, dateFrom, dateTo, page, limit
ReferralRouter.get('/my-submissions', getMySubmittedReferrals);

// GET /api/referrals/my-patient-referrals
// Returns referrals where the authenticated user is the patient.
ReferralRouter.get('/my-patient-referrals', getMyPatientReferrals);

// GET /api/referrals/patient/:patientId
ReferralRouter.get('/patient/:patientId', getReferralsByPatientId);

// GET /api/referrals/practitioner/:practitionerId
ReferralRouter.get('/practitioner/:practitionerId', getReferralsByPractitionerId);

// GET /api/referrals/:referralId — MGR-006
ReferralRouter.get('/:referralId', getReferralById);

// POST /api/referrals
ReferralRouter.post('/', createReferral);

// PUT /api/referrals/patient/:patientId
ReferralRouter.put('/patient/:patientId', updateReferralByPatientId);

// DELETE /api/referrals/patient/:patientId
ReferralRouter.delete('/patient/:patientId', deleteReferralByPatientId);

// DELETE /api/referrals/:referralId - manager can delete own unprocessed referral
ReferralRouter.delete('/:referralId', deleteMySubmittedReferralById);

// PUT /api/referrals/:referralId/assign
ReferralRouter.put('/:referralId/assign', assignReferralById);

// PUT /api/referrals/:referralId/status
ReferralRouter.put('/:referralId/status', updateReferralStatus);

// PUT /api/referrals/:referralId/cancel
ReferralRouter.put('/:referralId/cancel', cancelReferralByManager);

export default ReferralRouter;