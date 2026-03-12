import { Types } from 'mongoose';
import { Appointment } from '../models/Appointment';

type ReferralLike = {
  _id: Types.ObjectId | string;
  patientClerkUserId: string;
  submittedByClerkUserId?: string | null;
  practitionerClerkUserId?: string | null;
  assignedbyClerkUserId?: string | null;
  serviceType?: string | null;
  referralReason?: string | null;
  notes?: string | null;
};

export const createPendingAppointmentForReferral = async (referral: ReferralLike) => {
  const appointmentStatus = referral.practitionerClerkUserId ? 'assigned' : 'pending';

  return Appointment.findOneAndUpdate(
    { referralId: referral._id },
    {
      $set: {
        patientClerkUserId: referral.patientClerkUserId,
        submittedByClerkUserId: referral.submittedByClerkUserId,
        practitionerClerkUserId: referral.practitionerClerkUserId,
        assignedByClerkUserId: referral.assignedbyClerkUserId,
        serviceType: referral.serviceType,
        referralReason: referral.referralReason,
        notes: referral.notes,
        status: appointmentStatus,
        assignmentSource: referral.assignedbyClerkUserId ? 'admin' : 'referral',
      },
      $setOnInsert: {
        assignedDate: referral.practitionerClerkUserId ? new Date() : undefined,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

export const assignAppointmentToPractitioner = async ({
  referral,
  practitionerClerkUserId,
  assignedByClerkUserId,
}: {
  referral: ReferralLike;
  practitionerClerkUserId: string;
  assignedByClerkUserId?: string;
}) => {
  return Appointment.findOneAndUpdate(
    { referralId: referral._id },
    {
      $set: {
        patientClerkUserId: referral.patientClerkUserId,
        submittedByClerkUserId: referral.submittedByClerkUserId,
        practitionerClerkUserId,
        assignedByClerkUserId,
        serviceType: referral.serviceType,
        referralReason: referral.referralReason,
        notes: referral.notes,
        assignmentSource: 'admin',
        status: 'assigned',
        assignedDate: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

export const confirmAppointmentFromReferral = async ({
  referral,
  practitionerClerkUserId,
}: {
  referral: ReferralLike;
  practitionerClerkUserId: string;
}) => {
  return Appointment.findOneAndUpdate(
    { referralId: referral._id },
    {
      $set: {
        patientClerkUserId: referral.patientClerkUserId,
        submittedByClerkUserId: referral.submittedByClerkUserId,
        practitionerClerkUserId,
        serviceType: referral.serviceType,
        referralReason: referral.referralReason,
        notes: referral.notes,
        status: 'confirmed',
        confirmedDate: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

export const rejectAppointmentFromReferral = async ({
  referral,
  practitionerClerkUserId,
}: {
  referral: ReferralLike;
  practitionerClerkUserId?: string | null;
}) => {
  return Appointment.findOneAndUpdate(
    { referralId: referral._id },
    {
      $set: {
        patientClerkUserId: referral.patientClerkUserId,
        submittedByClerkUserId: referral.submittedByClerkUserId,
        practitionerClerkUserId,
        serviceType: referral.serviceType,
        referralReason: referral.referralReason,
        notes: referral.notes,
        status: 'rejected',
        rejectedDate: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

