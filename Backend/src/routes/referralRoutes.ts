import express from 'express';
import {
  assignReferralById,
  createReferral,
  deleteReferralByPatientId,
  getAllReferrals,
  getReferralById,
  getReferralsByManagerId,
  getReferralsByPatientId,
  getReferralsByPractitionerId,
  updateReferralByPatientId,
} from '../controllers/referralController';

const ReferralRouter = express.Router();

// GET /api/referrals - Get all referrals
ReferralRouter.get('/', getAllReferrals);

// GET /api/referrals/manager/:managerId - MGR-005: Get referrals submitted by a manager
// Supports query params: status, serviceType, search, dateFrom, dateTo, page, limit
ReferralRouter.get('/manager/:managerId', getReferralsByManagerId);

// GET /api/referrals/patient/:patientId - Get referrals by patientId
ReferralRouter.get('/patient/:patientId', getReferralsByPatientId);

// GET /api/referrals/practitioner/:practitionerId - Get referrals by practitionerId
ReferralRouter.get('/practitioner/:practitionerId', getReferralsByPractitionerId);

// GET /api/referrals/:referralId - MGR-006: Get single referral detail with timeline
ReferralRouter.get('/:referralId', getReferralById);

// POST /api/referrals - Create a new referral
ReferralRouter.post('/', createReferral);

// PUT /api/referrals/patient/:patientId - Update referrals by patientId
ReferralRouter.put('/patient/:patientId', updateReferralByPatientId);

// DELETE /api/referrals/patient/:patientId - Delete referrals by patientId
ReferralRouter.delete('/patient/:patientId', deleteReferralByPatientId);

// PUT /api/referrals/:referralId/assign - Assign practitioner to one referral
ReferralRouter.put('/:referralId/assign', assignReferralById);

export default ReferralRouter;
