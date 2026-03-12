import express from 'express';
import {
  assignReferralById,
  createReferral,
  deleteReferralByPatientId,
  getAllReferrals,
  getReferralsByPatientId,
  getReferralsByPractitionerId,
  updateReferralByPatientId,
  updateReferralById,
} from '../controllers/referralController';

const ReferralRouter = express.Router();

// GET /api/referrals - Get all referrals
ReferralRouter.get('/', getAllReferrals);

// GET /api/referrals/patient/:patientId - Get referrals by patientId
ReferralRouter.get('/patient/:patientId', getReferralsByPatientId);

// GET /api/referrals/practitioner/:practitionerId - Get referrals by practitionerId
ReferralRouter.get('/practitioner/:practitionerId', getReferralsByPractitionerId);

// POST /api/referrals - Create a new referral
ReferralRouter.post('/', createReferral);

// PUT /api/referrals/patient/:patientId - Update referrals by patientId
ReferralRouter.put('/patient/:patientId', updateReferralByPatientId);

// DELETE /api/referrals/patient/:patientId - Delete referrals by patientId
ReferralRouter.delete('/patient/:patientId', deleteReferralByPatientId);

// PUT /api/referrals/:referralId - Update a single referral (accept / reject)
ReferralRouter.put('/:referralId', updateReferralById);

// PUT /api/referrals/:referralId/assign - Assign practitioner to one referral
ReferralRouter.put('/:referralId/assign', assignReferralById);

export default ReferralRouter;