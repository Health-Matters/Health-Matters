import React, { useState } from "react";
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  Send,
  Loader2,
  CircleCheck,
} from "lucide-react";

// ─────────────────────────────────────────────
// OVERVIEW PAGE
// ─────────────────────────────────────────────

const stats = [
  {
    label: "Team Members",
    value: "12",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
    trend: "+2 this month",
    trendUp: true,
  },
  {
    label: "Active Referrals",
    value: "5",
    icon: ClipboardList,
    color: "bg-amber-50 text-amber-600",
    trend: "3 pending review",
    trendUp: null,
  },
  {
    label: "Avg. Response Time",
    value: "2.4d",
    icon: Clock,
    color: "bg-purple-50 text-purple-600",
    trend: "-0.3d vs last month",
    trendUp: true,
  },
  {
    label: "Resolved Cases",
    value: "28",
    icon: CheckCircle2,
    color: "bg-green-50 text-green-600",
    trend: "+6 this quarter",
    trendUp: true,
  },
];

const initialReferrals = [
  {
    id: "REF-001",
    employee: "Jordan Blake",
    type: "Occupational Health",
    status: "Pending",
    date: "28 Feb 2026",
  },
  {
    id: "REF-002",
    employee: "Sam Okonkwo",
    type: "Mental Health",
    status: "In Progress",
    date: "24 Feb 2026",
  },
  {
    id: "REF-003",
    employee: "Priya Sharma",
    type: "Physiotherapy",
    status: "Completed",
    date: "18 Feb 2026",
  },
  {
    id: "REF-004",
    employee: "Chris Murphy",
    type: "Occupational Health",
    status: "Pending",
    date: "15 Feb 2026",
  },
];

const statusBadge = (status) => {
const styles = {
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
};

export const ManagerOverview = () => {

  const [referrals, setReferrals] = useState(initialReferrals);
  const [cancelId, setCancelId] = useState(null);
  const [reason, setReason] = useState("");

  const cancelReferral = (id) => {

    if (!reason.trim()) {
      alert("Please enter cancellation reason");
      return;
    }

    const updated = referrals.map((ref) => {

      if (ref.id === id && ref.status === "Pending") {
        return {
          ...ref,
          status: "Cancelled",
          cancelled_reason: reason
        };
      }

      return ref;

    });

    setReferrals(updated);
    setCancelId(null);
    setReason("");
  };

  return (

    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          A summary of your team's health and referral activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => (

          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>

              <span className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-800">
              {stat.value}
            </p>

            <p
              className={`mt-1 flex items-center gap-1 text-xs font-medium
              ${
                stat.trendUp === true
                  ? "text-green-600"
                  : stat.trendUp === false
                  ? "text-red-500"
                  : "text-slate-400"
              }`}
            >
              {stat.trendUp === true && <TrendingUp className="h-3 w-3" />}
              {stat.trend}
            </p>

          </div>

        ))}

      </div>

      {/* Recent referrals table */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">
            Recent Referrals
          </h2>

          <a
            href="/manager/dashboard/referral"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            New referral <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">

                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {referrals.map((ref) => (

                <tr
                  key={ref.id}
                  className="transition-colors hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {ref.id}
                  </td>

                  <td className="px-6 py-4 font-medium text-slate-700">
                    {ref.employee}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {ref.type}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {ref.date}
                  </td>

                  <td className="px-6 py-4">
                    {statusBadge(ref.status)}
                  </td>

                  <td className="px-6 py-4">

                    {/* Cancel button */}

                    {ref.status === "Pending" && cancelId !== ref.id && (

                      <button
                        className="text-red-600 font-medium"
                        onClick={() => setCancelId(ref.id)}
                      >
                        Cancel
                      </button>

                    )}

                    {/* Reason input */}

                    {cancelId === ref.id && (

                      <div className="flex gap-2">

                        <input
                          className="border px-2 py-1 text-sm"
                          placeholder="Reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />

                        <button
                          className="text-red-600 font-medium"
                          onClick={() => cancelReferral(ref.id)}
                        >
                          Confirm
                        </button>

                      </div>

                    )}

                    {ref.status !== "Pending" && "-"}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Quick actions */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="mb-4 text-base font-semibold text-slate-800">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-3">

          <a
            href="/manager/dashboard/referral"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <ClipboardList className="h-4 w-4" />
            Submit Referral
          </a>

          <a
            href="/manager/dashboard/team"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Users className="h-4 w-4" />
            View Team
          </a>

        </div>

      </div>

    </div>

  );

};

// ─────────────────────────────────────────────
// REFERRAL SUBMISSION PAGE
// ─────────────────────────────────────────────

const REFERRAL_TYPES = [
  "Occupational Health",
  "Mental Health & Wellbeing",
  "Physiotherapy",
  "Counselling",
  "Ergonomic Assessment",
  "Fitness for Work Assessment",
  "Other",
];

const URGENCY_LEVELS = [
  { value: "routine", label: "Routine", description: "Non-urgent, within 4 weeks" },
  { value: "soon", label: "Soon", description: "Within 2 weeks" },
  { value: "urgent", label: "Urgent", description: "Within 48 hours" },
];

const TEAM_MEMBERS = [
  "Jordan Blake",
  "Sam Okonkwo",
  "Priya Sharma",
  "Chris Murphy",
  "Alex Chen",
  "Taylor Webb",
  "Morgan Davies",
  "Riley Patel",
];

const initialForm = {
  employee: "",
  referralType: "",
  urgency: "routine",
  jobTitle: "",
  department: "",
  absenceDays: "",
  symptoms: "",
  workImpact: "",
  additionalInfo: "",
  consentConfirmed: false,
};

export const ManagerReferralSubmission = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.employee) newErrors.employee = "Please select an employee.";
    if (!form.referralType) newErrors.referralType = "Please select a referral type.";
    if (!form.symptoms.trim()) newErrors.symptoms = "Please describe the symptoms or concerns.";
    if (!form.workImpact.trim()) newErrors.workImpact = "Please describe the impact on work.";
    if (!form.consentConfirmed) newErrors.consentConfirmed = "You must confirm employee consent.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CircleCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Referral Submitted</h2>
          <p className="mt-2 text-slate-500">
            Your referral for <span className="font-semibold text-slate-700">{form.employee}</span> has
            been submitted successfully. The admin team will review and assign it to an appropriate
            practitioner.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleReset}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Submit Another Referral
            </button>
            <a
              href="/manager/dashboard"
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to Overview
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Submit a Referral</h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete this form to refer a team member to occupational health services.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* Section: Employee Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-slate-800">
            Employee Details
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Employee name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="employee">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                id="employee"
                name="employee"
                value={form.employee}
                onChange={handleChange}
                className={`rounded-lg border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                  errors.employee ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
                }`}
              >
                <option value="">Select team member…</option>
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.employee && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" /> {errors.employee}
                </p>
              )}
            </div>

            {/* Job title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="jobTitle">
                Job Title
              </label>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                value={form.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="department">
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Engineering"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Days absent */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="absenceDays">
                Days Absent (if applicable)
              </label>
              <input
                id="absenceDays"
                name="absenceDays"
                type="number"
                min="0"
                value={form.absenceDays}
                onChange={handleChange}
                placeholder="0"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Section: Referral Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-slate-800">
            Referral Details
          </h2>

          {/* Referral type */}
          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="referralType">
              Type of Referral <span className="text-red-500">*</span>
            </label>
            <select
              id="referralType"
              name="referralType"
              value={form.referralType}
              onChange={handleChange}
              className={`rounded-lg border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                errors.referralType ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
              }`}
            >
              <option value="">Select referral type…</option>
              {REFERRAL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.referralType && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> {errors.referralType}
              </p>
            )}
          </div>

          {/* Urgency */}
          <div className="mb-5 flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Urgency Level
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {URGENCY_LEVELS.map((u) => (
                <label
                  key={u.value}
                  className={`flex cursor-pointer flex-col rounded-lg border-2 p-3 transition ${
                    form.urgency === u.value
                      ? "border-slate-800 bg-slate-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={u.value}
                    checked={form.urgency === u.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold text-slate-700">{u.label}</span>
                  <span className="mt-0.5 text-xs text-slate-400">{u.description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="symptoms">
              Symptoms / Health Concerns <span className="text-red-500">*</span>
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              rows={3}
              value={form.symptoms}
              onChange={handleChange}
              placeholder="Describe the employee's symptoms, health issues, or reasons for referral…"
              className={`rounded-lg border px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none ${
                errors.symptoms ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
              }`}
            />
            {errors.symptoms && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> {errors.symptoms}
              </p>
            )}
          </div>

          {/* Work impact */}
          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="workImpact">
              Impact on Work Performance <span className="text-red-500">*</span>
            </label>
            <textarea
              id="workImpact"
              name="workImpact"
              rows={3}
              value={form.workImpact}
              onChange={handleChange}
              placeholder="Describe how the health concern is affecting the employee's role or attendance…"
              className={`rounded-lg border px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none ${
                errors.workImpact ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
              }`}
            />
            {errors.workImpact && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> {errors.workImpact}
              </p>
            )}
          </div>

          {/* Additional info */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="additionalInfo">
              Additional Information{" "}
              <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={2}
              value={form.additionalInfo}
              onChange={handleChange}
              placeholder="Any other relevant information for the practitioner…"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Section: Consent */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Consent & Declaration</h2>
          <div
            className={`rounded-lg border p-4 ${
              errors.consentConfirmed ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="consentConfirmed"
                checked={form.consentConfirmed}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-800"
              />
              <span className="text-sm text-slate-600 leading-relaxed">
                I confirm that the employee named above has been informed of and has consented to this
                referral being submitted. I understand that the information provided will be shared with
                the occupational health practitioner for the purpose of delivering appropriate support.
              </span>
            </label>
            {errors.consentConfirmed && (
              <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> {errors.consentConfirmed}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Referral
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────
// PLACEHOLDER PAGES (unchanged stubs)
// ─────────────────────────────────────────────

export const ManagerTestBudget = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1>Manager Dashboard Test Budget</h1>
  </div>
);

export const ManagerTestInsights = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1>Manager Dashboard Test Insights</h1>
  </div>
);

export const ManagerTestProfile = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1>Manager Dashboard Test Profile</h1>
  </div>
);

export const ManagerTestTeam = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1>Manager Dashboard Test Team</h1>
  </div>
);