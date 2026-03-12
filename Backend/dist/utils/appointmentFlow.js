"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectAppointmentFromReferral = exports.confirmAppointmentFromReferral = exports.assignAppointmentToPractitioner = exports.createPendingAppointmentForReferral = void 0;
const Appointment_1 = require("../models/Appointment");
const createPendingAppointmentForReferral = async (referral) => {
    const appointmentStatus = referral.practitionerClerkUserId ? 'assigned' : 'pending';
    return Appointment_1.Appointment.findOneAndUpdate({ referralId: referral._id }, {
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
    }, {
        new: true,
        upsert: true,
        runValidators: true,
    });
};
exports.createPendingAppointmentForReferral = createPendingAppointmentForReferral;
const assignAppointmentToPractitioner = async ({ referral, practitionerClerkUserId, assignedByClerkUserId, }) => {
    return Appointment_1.Appointment.findOneAndUpdate({ referralId: referral._id }, {
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
    }, {
        new: true,
        upsert: true,
        runValidators: true,
    });
};
exports.assignAppointmentToPractitioner = assignAppointmentToPractitioner;
const confirmAppointmentFromReferral = async ({ referral, practitionerClerkUserId, }) => {
    return Appointment_1.Appointment.findOneAndUpdate({ referralId: referral._id }, {
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
    }, {
        new: true,
        upsert: true,
        runValidators: true,
    });
};
exports.confirmAppointmentFromReferral = confirmAppointmentFromReferral;
const rejectAppointmentFromReferral = async ({ referral, practitionerClerkUserId, }) => {
    return Appointment_1.Appointment.findOneAndUpdate({ referralId: referral._id }, {
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
    }, {
        new: true,
        upsert: true,
        runValidators: true,
    });
};
exports.rejectAppointmentFromReferral = rejectAppointmentFromReferral;
