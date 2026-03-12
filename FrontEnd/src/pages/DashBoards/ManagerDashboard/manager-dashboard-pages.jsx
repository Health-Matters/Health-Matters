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
  Settings,
  Eye,
  Type,
  Monitor,
  Bell,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:  { label: "Pending",     style: "bg-amber-100 text-amber-700"  },
  accepted: { label: "In Progress", style: "bg-blue-100 text-blue-700"    },
  rejected: { label: "Rejected",    style: "bg-red-100 text-red-700"      },
  completed:{ label: "Completed",   style: "bg-green-100 text-green-700"  },
  // Legacy keys from static data (capitalised)
  Pending:    { label: "Pending",     style: "bg-amber-100 text-amber-700" },
  "In Progress": { label: "In Progress", style: "bg-blue-100 text-blue-700" },
  Completed:  { label: "Completed",   style: "bg-green-100 text-green-700" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? { label: status, style: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.style}`}>
      {config.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW PAGE
// ─────────────────────────────────────────────────────────────────────────────

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

// Static referral data using correct Referral schema field names.
// patientClerkUserId maps to the employee, serviceType to type, referralStatus to status.
const recentReferrals = [
  { _id: "REF-001", patientName: "Jordan Blake",  serviceType: "Occupational Health",    referralStatus: "pending",     createdAt: "2026-02-28" },
  { _id: "REF-002", patientName: "Sam Okonkwo",   serviceType: "Mental Health & Wellbeing", referralStatus: "accepted",  createdAt: "2026-02-24" },
  { _id: "REF-003", patientName: "Priya Sharma",  serviceType: "Physiotherapy",           referralStatus: "completed",   createdAt: "2026-02-18" },
  { _id: "REF-004", patientName: "Chris Murphy",  serviceType: "Occupational Health",    referralStatus: "pending",     createdAt: "2026-02-15" },
  { _id: "REF-005", patientName: "Alex Chen",     serviceType: "Counselling",            referralStatus: "accepted",    createdAt: "2026-02-10" },
  { _id: "REF-006", patientName: "Taylor Webb",   serviceType: "Ergonomic Assessment",   referralStatus: "pending",     createdAt: "2026-02-08" },
  { _id: "REF-007", patientName: "Morgan Davies", serviceType: "Physiotherapy",          referralStatus: "rejected",    createdAt: "2026-02-05" },
  { _id: "REF-008", patientName: "Riley Patel",   serviceType: "Mental Health & Wellbeing", referralStatus: "pending",  createdAt: "2026-02-01" },
  { _id: "REF-009", patientName: "Jordan Blake",  serviceType: "Counselling",            referralStatus: "completed",   createdAt: "2026-01-28" },
  { _id: "REF-010", patientName: "Sam Okonkwo",   serviceType: "Occupational Health",    referralStatus: "accepted",    createdAt: "2026-01-22" },
];

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

export const ManagerOverview = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          A summary of your team's health and referral activity.
        </p>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <span className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-800">{stat.value}</p>
            <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${
              stat.trendUp === true ? "text-green-600"
              : stat.trendUp === false ? "text-red-500"
              : "text-slate-400"
            }`}>
              {stat.trendUp === true && <TrendingUp className="h-3 w-3" />}
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Referral History Dashboard — fixed height with scroll */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Referral History</h2>
          <a
            href="/manager/dashboard/referral"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            New referral <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        {/* Scrollable table body — shows ~5 rows then scrolls */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Service Type</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
          </table>
          {/* Scrollable tbody in its own div so the header stays fixed */}
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {recentReferrals.map((ref) => (
                  <tr key={ref._id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 w-24">{ref._id}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{ref.patientName}</td>
                    <td className="px-6 py-4 text-slate-500">{ref.serviceType}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(ref.createdAt)}</td>
                    <td className="px-6 py-4"><StatusBadge status={ref.referralStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row count footer */}
        <div className="border-t border-slate-100 px-6 py-2.5">
          <p className="text-xs text-slate-400">{recentReferrals.length} referrals total</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/manager/dashboard/referral"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <ClipboardList className="h-4 w-4" />
            Submit Referral
          </a>
          <a
            href="/manager/dashboard/team"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Users className="h-4 w-4" />
            View Team
          </a>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REFERRAL SUBMISSION PAGE
// Fields aligned to the Referral schema:
//   patientClerkUserId (required) → employee selector
//   serviceType                   → type of referral dropdown
//   referralReason                → symptoms / health concerns textarea
//   notes                         → combines workImpact + urgency + additionalInfo
//   submittedByClerkUserId        → NOT a form field, set server-side
// ─────────────────────────────────────────────────────────────────────────────

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
  { value: "routine", label: "Routine",  description: "Non-urgent, within 4 weeks" },
  { value: "soon",    label: "Soon",     description: "Within 2 weeks"             },
  { value: "urgent",  label: "Urgent",   description: "Within 48 hours"            },
];

// Static team members list — replace with API call when backend is ready
const TEAM_MEMBERS = [
  { id: "user_jordan",  name: "Jordan Blake",  department: "Operations"  },
  { id: "user_sam",     name: "Sam Okonkwo",   department: "Engineering" },
  { id: "user_priya",   name: "Priya Sharma",  department: "HR"          },
  { id: "user_chris",   name: "Chris Murphy",  department: "Operations"  },
  { id: "user_alex",    name: "Alex Chen",     department: "Engineering" },
  { id: "user_taylor",  name: "Taylor Webb",   department: "Marketing"   },
  { id: "user_morgan",  name: "Morgan Davies", department: "Finance"     },
  { id: "user_riley",   name: "Riley Patel",   department: "HR"          },
];

// Form state keys map to Referral schema field names where possible
const initialForm = {
  patientClerkUserId: "",   // → Referral.patientClerkUserId (required)
  serviceType:        "",   // → Referral.serviceType
  referralReason:     "",   // → Referral.referralReason (symptoms field)
  urgency:            "routine", // UI only — merged into notes
  workImpact:         "",   // UI only — merged into notes
  additionalInfo:     "",   // UI only — merged into notes
  absenceDays:        "",   // UI only — merged into notes
  consentConfirmed:   false,
};

export const ManagerReferralSubmission = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedMember = TEAM_MEMBERS.find((m) => m.id === form.patientClerkUserId);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.patientClerkUserId) errs.patientClerkUserId = "Please select an employee.";
    if (!form.serviceType)        errs.serviceType        = "Please select a referral type.";
    if (!form.referralReason.trim()) errs.referralReason  = "Please describe the symptoms or concerns.";
    if (!form.workImpact.trim())  errs.workImpact         = "Please describe the impact on work.";
    if (!form.consentConfirmed)   errs.consentConfirmed   = "You must confirm employee consent.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // Build the payload matching the Referral schema.
    // workImpact, urgency, absenceDays have no dedicated schema columns
    // so they're combined into the `notes` field.
    const combinedNotes = [
      form.workImpact    ? `Work Impact: ${form.workImpact}`                       : null,
      form.urgency !== "routine" ? `Urgency: ${form.urgency}`                      : null,
      form.absenceDays   ? `Days Absent: ${form.absenceDays}`                      : null,
      form.additionalInfo ? `Additional Info: ${form.additionalInfo}`              : null,
    ].filter(Boolean).join("\n\n");

    // This is what will be sent to POST /api/manager/referrals (or /api/referrals)
    const _payload = {
      patientClerkUserId: form.patientClerkUserId,  // required
      serviceType:        form.serviceType,
      referralReason:     form.referralReason,
      notes:              combinedNotes || undefined,
      // submittedByClerkUserId is injected server-side from the Clerk token
    };

    setSubmitting(true);
    // Simulated submission — swap for createManagerReferral(_payload).unwrap() when ready
    await new Promise((res) => setTimeout(res, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CircleCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Referral Submitted</h2>
          <p className="mt-2 text-slate-500">
            Your referral for{" "}
            <span className="font-semibold text-slate-700">{selectedMember?.name ?? "the employee"}</span>{" "}
            has been submitted successfully. The admin team will review and assign it to an
            appropriate practitioner.
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

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Submit a Referral</h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete this form to refer a team member to occupational health services.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* ── Employee Details ──────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-slate-800">Employee Details</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Employee — value is clerkUserId, label is name */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="patientClerkUserId">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                id="patientClerkUserId"
                name="patientClerkUserId"
                value={form.patientClerkUserId}
                onChange={handleChange}
                className={`rounded-lg border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                  errors.patientClerkUserId ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
                }`}
              >
                <option value="">Select team member…</option>
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.department ? ` — ${m.department}` : ""}
                  </option>
                ))}
              </select>
              {errors.patientClerkUserId && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" /> {errors.patientClerkUserId}
                </p>
              )}
            </div>

            {/* Department — auto-filled from selected member, read-only */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Department</label>
              <input
                type="text"
                value={selectedMember?.department ?? ""}
                readOnly
                placeholder="Auto-filled on selection"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 focus:outline-none"
              />
            </div>

            {/* Days absent — UI only, merged into notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="absenceDays">
                Days Absent{" "}
                <span className="text-xs font-normal text-slate-400">(if applicable)</span>
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

        {/* ── Referral Details ──────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-slate-800">Referral Details</h2>

          {/* serviceType — maps directly to Referral.serviceType */}
          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="serviceType">
              Type of Referral <span className="text-red-500">*</span>
            </label>
            <select
              id="serviceType"
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              className={`rounded-lg border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                errors.serviceType ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
              }`}
            >
              <option value="">Select referral type…</option>
              {REFERRAL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.serviceType && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> {errors.serviceType}
              </p>
            )}
          </div>

          {/* Urgency — UI only, merged into notes on submit */}
          <div className="mb-5 flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Urgency Level</label>
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

          {/* referralReason — maps directly to Referral.referralReason */}
          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="referralReason">
              Symptoms / Health Concerns <span className="text-red-500">*</span>
            </label>
            <textarea
              id="referralReason"
              name="referralReason"
              rows={3}
              value={form.referralReason}
              onChange={handleChange}
              placeholder="Describe the employee's symptoms, health issues, or reasons for referral…"
              className={`resize-none rounded-lg border px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                errors.referralReason ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
              }`}
            />
            {errors.referralReason && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> {errors.referralReason}
              </p>
            )}
          </div>

          {/* workImpact — UI only, merged into Referral.notes */}
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
              className={`resize-none rounded-lg border px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                errors.workImpact ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
              }`}
            />
            {errors.workImpact && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> {errors.workImpact}
              </p>
            )}
          </div>

          {/* additionalInfo — UI only, merged into Referral.notes */}
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
              className="resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* ── Consent ───────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Consent & Declaration</h2>
          <div className={`rounded-lg border p-4 ${
            errors.consentConfirmed ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
          }`}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="consentConfirmed"
                checked={form.consentConfirmed}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-800"
              />
              <span className="text-sm leading-relaxed text-slate-600">
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

        {/* ── Submit bar ─────────────────────────────────────────────────── */}
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
              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
            ) : (
              <><Send className="h-4 w-4" /> Submit Referral</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY / SETTINGS PAGE
// ─────────────────────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange, id }) => (
  <button
    role="switch"
    aria-checked={checked}
    id={id}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
      checked ? "bg-slate-900" : "bg-slate-200"
    }`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
      checked ? "translate-x-6" : "translate-x-1"
    }`} />
  </button>
);

export const ManagerAccessibility = () => {
  const [settings, setSettings] = useState({
    highContrast:      false,
    largeText:         false,
    reduceMotion:      false,
    screenReader:      false,
    emailNotifications: true,
    smsNotifications:  false,
    darkMode:          false,
  });

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const [fontSize, setFontSize] = useState("medium");

  const Section = ({ icon: Icon, title, children }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="rounded-lg bg-slate-100 p-2">
          <Icon className="h-4 w-4 text-slate-600" />
        </span>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const SettingRow = ({ id, label, description, checked, onChange }) => (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-slate-700">
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        )}
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Accessibility & Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Customise your experience to suit your preferences and accessibility needs.
        </p>
      </div>

      {/* Visual */}
      <Section icon={Eye} title="Visual">
        <SettingRow
          id="highContrast"
          label="High Contrast Mode"
          description="Increases colour contrast for better readability"
          checked={settings.highContrast}
          onChange={() => toggle("highContrast")}
        />
        <div className="border-t border-slate-100 pt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Text Size
          </label>
          <div className="flex gap-2">
            {["small", "medium", "large"].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition ${
                  fontSize === size
                    ? "border-slate-800 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <SettingRow
            id="darkMode"
            label="Dark Mode"
            description="Switch to a darker colour scheme"
            checked={settings.darkMode}
            onChange={() => toggle("darkMode")}
          />
        </div>
      </Section>

      {/* Motion & Screen readers */}
      <Section icon={Monitor} title="Display & Motion">
        <SettingRow
          id="reduceMotion"
          label="Reduce Motion"
          description="Minimises animations and transitions throughout the app"
          checked={settings.reduceMotion}
          onChange={() => toggle("reduceMotion")}
        />
        <div className="border-t border-slate-100 pt-4">
          <SettingRow
            id="screenReader"
            label="Screen Reader Optimisation"
            description="Adds additional ARIA labels and improves focus management"
            checked={settings.screenReader}
            onChange={() => toggle("screenReader")}
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <SettingRow
          id="emailNotifications"
          label="Email Notifications"
          description="Receive referral updates and status changes by email"
          checked={settings.emailNotifications}
          onChange={() => toggle("emailNotifications")}
        />
        <div className="border-t border-slate-100 pt-4">
          <SettingRow
            id="smsNotifications"
            label="SMS Notifications"
            description="Receive urgent referral alerts by text message"
            checked={settings.smsNotifications}
            onChange={() => toggle("smsNotifications")}
          />
        </div>
      </Section>

      {/* Save button */}
      <div className="flex justify-end pb-4">
        <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700">
          <Settings className="h-4 w-4" />
          Save Preferences
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER PAGES
// ─────────────────────────────────────────────────────────────────────────────

export const ManagerTestBudget   = () => <div className="p-8 max-w-4xl mx-auto"><h1 className="text-2xl font-bold text-slate-800">Budget</h1></div>;
export const ManagerTestInsights = () => <div className="p-8 max-w-4xl mx-auto"><h1 className="text-2xl font-bold text-slate-800">Insights</h1></div>;
export const ManagerTestProfile  = () => <div className="p-8 max-w-4xl mx-auto"><h1 className="text-2xl font-bold text-slate-800">Profile</h1></div>;
export const ManagerTestTeam     = () => <div className="p-8 max-w-4xl mx-auto"><h1 className="text-2xl font-bold text-slate-800">Team</h1></div>;