import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useGetReferralsByPatientIdQuery } from "../../../store/api/referralsApi";
import { useGetAppointmentsByEmployeeIdQuery } from "../../../store/api/appointmentsApi";

import {
  Clock,
  FileText,
  PlusCircle,
  User,
  ClipboardList,
  Calendar as CalendarIcon
} from "lucide-react";

import { Link } from "react-router";

export const EmployeeOverview = () => {

  const { user } = useUser();
  const patientId = user?.id;

  const [selectedReferral, setSelectedReferral] = useState(null);

  /* REFERRALS (AUTO REFRESH EVERY 5s) */

  const {
    data: referrals = [],
    isLoading,
    isError
  } = useGetReferralsByPatientIdQuery(patientId, {
    skip: !patientId,
    pollingInterval: 5000
  });

  /* APPOINTMENTS */

  const {
    data: appointments = []
  } = useGetAppointmentsByEmployeeIdQuery(patientId, {
    skip: !patientId
  });

  const totalReferrals = referrals.length;

  const pendingReferrals = referrals.filter(
    r => r.referralStatus === "pending"
  ).length;

  const formatStatus = (status) => {
    if (status === "pending") return "Pending";
    if (status === "accepted") return "In Progress";
    if (status === "rejected") return "Completed";
    return status;
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : "—";

  if (isLoading) return <div className="p-10">Loading dashboard...</div>;

  if (isError)
    return (
      <div className="p-10 text-red-500">
        Failed to load dashboard
      </div>
    );

  return (

    <div className="max-w-7xl mx-auto space-y-8 relative">

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Overview
        </h1>
        <p className="text-slate-500 mt-1">
          A summary of your health journey and referral activity.
        </p>
      </div>

      {/* METRIC CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Total Referrals"
          value={totalReferrals}
          subtext={`${pendingReferrals} pending review`}
          icon={FileText}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />

        <StatCard
          title="Pending Referrals"
          value={pendingReferrals}
          subtext="Awaiting review"
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

      </div>

      {/* REFERRAL HISTORY */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">

        <div className="p-6 border-b border-slate-100 flex justify-between items-center">

          <h3 className="font-bold text-lg text-slate-800">
            Referral History
          </h3>

          <Link
            to="/employee/dashboard/submit-referral"
            className="text-emerald-700 font-medium flex items-center gap-1 hover:text-emerald-800 transition-colors text-sm"
          >
            New referral <PlusCircle size={16}/>
          </Link>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">

              <tr>
                <th className="px-6 py-4 font-semibold">Referral ID</th>
                <th className="px-6 py-4 font-semibold">Date Submitted</th>
                <th className="px-6 py-4 font-semibold">Service Type</th>
                <th className="px-6 py-4 font-semibold text-left">Status</th>
                <th className="px-6 py-4 font-semibold text-right"></th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {referrals.length === 0 ? (

                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    No referrals found
                  </td>
                </tr>

              ) : (

                referrals.map((ref) => (

                  <ReferralRow
                    key={ref._id}
                    id={ref._id?.slice(-6)}
                    date={formatDate(ref.createdAt)}
                    type={ref.serviceType}
                    status={formatStatus(ref.referralStatus)}
                    onView={() =>
                      setSelectedReferral({
                        id: ref._id,
                        date: formatDate(ref.createdAt),
                        type: ref.serviceType,
                        status: formatStatus(ref.referralStatus),
                        reason: ref.referralReason
                      })
                    }
                  />

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* PATIENT HISTORY TIMELINE */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">

        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">
            Patient History Timeline
          </h3>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">

              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Appointment Type</th>
                <th className="px-6 py-4 font-semibold">Doctor Name</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {appointments.length === 0 ? (

                <tr>
                  <td colSpan="3" className="text-center py-8 text-slate-400">
                    No appointments yet
                  </td>
                </tr>

              ) : (

                appointments.map((app) => {

                  const doctor =
                    app?.practitionerId
                      ? `${app.practitionerId.firstName || ""} ${app.practitionerId.lastName || ""}`
                      : "Unknown Practitioner";

                  return (
                    <HistoryRow
                      key={app._id}
                      date={formatDate(app.scheduledDate)}
                      type={app.appointmentType || "Consultation"}
                      doctor={doctor}
                    />
                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}

      {selectedReferral && (

        <ReferralModal
          referral={selectedReferral}
          onClose={() => setSelectedReferral(null)}
        />

      )}

    </div>

  );

};


/* SUB COMPONENTS */

const StatCard = ({ title, value, subtext, icon: Icon, iconBg, iconColor }) => (

  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">

    <div className="flex justify-between items-start mb-4">

      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>

      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>

    </div>

    <span className="text-xs text-slate-400">
      {subtext}
    </span>

  </div>

);

const ReferralRow = ({ id, date, type, status, onView }) => {

  const statusStyles = {
    Pending: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700"
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors">

      <td className="px-6 py-4 text-sm text-slate-400 font-mono">
        {id}
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {date}
      </td>

      <td className="px-6 py-4 font-semibold text-slate-800">
        {type}
      </td>

      <td className="px-6 py-4 text-left">

        <span
          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyles[status]}`}
        >
          {status}
        </span>

      </td>

      <td className="px-6 py-4 text-right">

        <button
          onClick={onView}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
        >
          View Details
        </button>

      </td>

    </tr>
  );

};

const HistoryRow = ({ date, type, doctor }) => (

  <tr className="hover:bg-slate-50 transition-colors">

    <td className="px-6 py-4 font-medium w-1/4 text-slate-500">
      {date}
    </td>

    <td className="px-6 py-4 font-semibold text-slate-800 w-1/3">
      {type}
    </td>

    <td className="px-6 py-4 text-slate-600">

      <div className="flex items-center gap-2">
        <User size={14} className="text-slate-300" />
        {doctor}
      </div>

    </td>

  </tr>

);

const ReferralModal = ({ referral, onClose }) => (

  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">

    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">

      <div className="p-6 border-b border-slate-100 bg-emerald-50/30">

        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
          Referral Details
        </p>

        <h3 className="font-bold text-xl text-slate-800">
          {referral.id}
        </h3>

      </div>

      <div className="p-8 space-y-6">

        <ModalInfo
          label="Date Submitted"
          value={referral.date}
          icon={<CalendarIcon size={14} />}
        />

        <ModalInfo
          label="Current Status"
          value={referral.status}
          icon={<Clock size={14} />}
        />

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Service Type
          </p>

          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <ClipboardList size={16} className="text-emerald-600" />
            {referral.type}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Reason for Referral
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
            "{referral.reason}"
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
        >
          Close
        </button>

      </div>

    </div>

  </div>

);

const ModalInfo = ({ label, value, icon }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
      {label}
    </p>
    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
      <span className="text-emerald-600">{icon}</span>
      {value}
    </div>
  </div>
);