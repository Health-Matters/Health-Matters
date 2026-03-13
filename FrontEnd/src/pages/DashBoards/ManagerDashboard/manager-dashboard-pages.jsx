import React, { useState } from "react";
import {
  Users, ClipboardList, Clock, CheckCircle2, AlertCircle,
  TrendingUp, ChevronRight, Send, Loader2, CircleCheck,
  Settings, Eye, Monitor, Bell, Pencil, Trash2, X, Save,
  Mail, Phone, Building2,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import {
  useGetReferralsQuery,
  useCreateReferralMutation,
  useUpdateReferralsByPatientIdMutation,
  useDeleteReferralsByPatientIdMutation,
} from "../../../store/api/referralsApi";
import { useGetUsersQuery } from "../../../store/api/usersApi";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:     { label: "Pending",     style: "bg-amber-100 text-amber-700"  },
  accepted:    { label: "Accepted",    style: "bg-blue-100 text-blue-700"    },
  rejected:    { label: "Rejected",    style: "bg-red-100 text-red-700"      },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, style: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.style}`}>
      {cfg.label}
    </span>
  );
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const resolvePatientName = (clerkUserId, users) => {
  const u = users.find((m) => m.clerkUserId === clerkUserId);
  if (!u) return clerkUserId;
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || clerkUserId;
};

const REFERRAL_TYPES = [
  "Occupational Health", "Mental Health & Wellbeing", "Physiotherapy",
  "Counselling", "Ergonomic Assessment", "Fitness for Work Assessment", "Other",
];

// ─────────────────────────────────────────────────────────────────────────────
// EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

const EditReferralModal = ({ referral, users, onClose, onSaved }) => {
  const [form, setForm] = useState({
    serviceType:    referral.serviceType    ?? "",
    referralReason: referral.referralReason ?? "",
    referralStatus: referral.referralStatus ?? "pending",
  });
  const [updateReferrals, { isLoading }] = useUpdateReferralsByPatientIdMutation();
  const [error, setError] = useState(null);

  const handleSave = async () => {
    try {
      await updateReferrals({
        patientId: referral.patientClerkUserId,
        body: {
          serviceType:    form.serviceType,
          referralReason: form.referralReason,
          referralStatus: form.referralStatus,
        },
      }).unwrap();
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.data?.message ?? "Failed to update referral.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Edit Referral</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Patient</p>
            <p className="text-sm font-medium text-slate-700">{resolvePatientName(referral.patientClerkUserId, users)}</p>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Service Type</label>
            <select
              value={form.serviceType}
              onChange={(e) => setForm((p) => ({ ...p, serviceType: e.target.value }))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">Select…</option>
              {REFERRAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              value={form.referralStatus}
              onChange={(e) => setForm((p) => ({ ...p, referralStatus: e.target.value }))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Referral Reason</label>
            <textarea
              rows={3}
              value={form.referralReason}
              onChange={(e) => setForm((p) => ({ ...p, referralReason: e.target.value }))}
              className="resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE MODAL
// ─────────────────────────────────────────────────────────────────────────────

const DeleteConfirmModal = ({ referral, users, onClose, onDeleted }) => {
  const [deleteReferrals, { isLoading }] = useDeleteReferralsByPatientIdMutation();
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      await deleteReferrals(referral.patientClerkUserId).unwrap();
      onDeleted();
      onClose();
    } catch (err) {
      setError(err?.data?.message ?? "Failed to delete referral.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Delete Referral</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <p className="text-sm text-slate-600">
            Are you sure you want to delete the referral for{" "}
            <span className="font-semibold text-slate-800">{resolvePatientName(referral.patientClerkUserId, users)}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button>
          <button onClick={handleDelete} disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW PAGE
// ─────────────────────────────────────────────────────────────────────────────

const KPI_STATS = [
  { label: "Team Members",       value: "12",   icon: Users,         color: "bg-blue-50 text-blue-600",    trend: "+2 this month",       trendUp: true  },
  { label: "Active Referrals",   value: "5",    icon: ClipboardList, color: "bg-amber-50 text-amber-600",  trend: "3 pending review",    trendUp: null  },
  { label: "Avg. Response Time", value: "2.4d", icon: Clock,         color: "bg-purple-50 text-purple-600",trend: "-0.3d vs last month", trendUp: true  },
  { label: "Resolved Cases",     value: "28",   icon: CheckCircle2,  color: "bg-green-50 text-green-600",  trend: "+6 this quarter",     trendUp: true  },
];

export const ManagerOverview = () => {
  const { user } = useUser();
  const [editingRef, setEditingRef]   = useState(null);
  const [deletingRef, setDeletingRef] = useState(null);

  const { data: allReferrals = [], isLoading, error, refetch } = useGetReferralsQuery();
  const { data: allUsers = [] } = useGetUsersQuery();

  const referrals = allReferrals.filter((ref) => ref.submittedByClerkUserId === user?.id);

  return (
    <div className="space-y-6">
      {editingRef && (
        <EditReferralModal referral={editingRef} users={allUsers} onClose={() => setEditingRef(null)} onSaved={refetch} />
      )}
      {deletingRef && (
        <DeleteConfirmModal referral={deletingRef} users={allUsers} onClose={() => setDeletingRef(null)} onDeleted={refetch} />
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">A summary of your team's health and referral activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <span className={`rounded-lg p-2 ${s.color}`}><s.icon className="h-4 w-4" /></span>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-800">{s.value}</p>
            <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${
              s.trendUp === true ? "text-green-600" : s.trendUp === false ? "text-red-500" : "text-slate-400"
            }`}>
              {s.trendUp === true && <TrendingUp className="h-3 w-3" />}
              {s.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Referral History */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Referral History</h2>
          <a href="/manager/dashboard/referral" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            New referral <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3">Ref ID</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Service Type</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
          </table>

          <div className="max-h-72 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center gap-2 px-6 py-8 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading referrals…
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 px-6 py-8 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" /> Failed to load referrals. Please try again.
              </div>
            )}
            {!isLoading && !error && (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {referrals.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">No referrals submitted yet.</td></tr>
                  ) : (
                    referrals.map((ref) => (
                      <tr key={ref._id} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{ref._id?.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{resolvePatientName(ref.patientClerkUserId, allUsers)}</td>
                        <td className="px-6 py-4 text-slate-500">{ref.serviceType ?? "—"}</td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(ref.createdAt)}</td>
                        <td className="px-6 py-4"><StatusBadge status={ref.referralStatus} /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditingRef(ref)}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeletingRef(ref)}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-2.5">
          <p className="text-xs text-slate-400">{isLoading ? "…" : `${referrals.length} referrals total`}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/manager/dashboard/referral"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
            <ClipboardList className="h-4 w-4" /> Submit Referral
          </a>
          <a href="/manager/dashboard/team"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Users className="h-4 w-4" /> View Team
          </a>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REFERRAL SUBMISSION PAGE
// ─────────────────────────────────────────────────────────────────────────────

const URGENCY_LEVELS = [
  { value: "routine", label: "Routine", description: "Non-urgent, within 4 weeks" },
  { value: "soon",    label: "Soon",    description: "Within 2 weeks"             },
  { value: "urgent",  label: "Urgent",  description: "Within 48 hours"            },
];

const INITIAL_FORM = {
  patientClerkUserId: "", serviceType: "", referralReason: "",
  urgency: "routine", workImpact: "", additionalInfo: "", absenceDays: "",
  consentConfirmed: false,
};

export const ManagerReferralSubmission = () => {
  const [form, setForm]                 = useState(INITIAL_FORM);
  const [errors, setErrors]             = useState({});
  const [submitted, setSubmitted]       = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);

  const [createReferral, { isLoading: submitting }] = useCreateReferralMutation();
  const { data: teamMembers = [], isLoading: teamLoading } = useGetUsersQuery({ role: "employee" });
  const selectedMember = teamMembers.find((m) => m.clerkUserId === form.patientClerkUserId);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.patientClerkUserId)    e.patientClerkUserId = "Please select an employee.";
    if (!form.serviceType)           e.serviceType        = "Please select a referral type.";
    if (!form.referralReason.trim()) e.referralReason     = "Please describe the symptoms or concerns.";
    if (!form.workImpact.trim())     e.workImpact         = "Please describe the impact on work.";
    if (!form.consentConfirmed)      e.consentConfirmed   = "You must confirm employee consent.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const combinedNotes = [
      form.workImpact            ? `Work Impact: ${form.workImpact}`         : null,
      form.urgency !== "routine" ? `Urgency: ${form.urgency}`                : null,
      form.absenceDays           ? `Days Absent: ${form.absenceDays}`        : null,
      form.additionalInfo        ? `Additional Info: ${form.additionalInfo}` : null,
    ].filter(Boolean).join("\n\n");
    try {
      // SECURITY: submittedByClerkUserId is NOT sent — set server-side from Clerk token
      const result = await createReferral({
        patientClerkUserId: form.patientClerkUserId,
        serviceType:        form.serviceType,
        referralReason:     form.referralReason,
        notes:              combinedNotes || undefined,
      }).unwrap();
      setSubmittedRef(result);
      setSubmitted(true);
    } catch (err) {
      setErrors({ _server: err?.data?.message ?? "Submission failed. Please try again." });
    }
  };

  const handleReset = () => { setForm(INITIAL_FORM); setErrors({}); setSubmitted(false); setSubmittedRef(null); };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CircleCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Referral Submitted</h2>
          <p className="mt-2 text-slate-500">
            Your referral for <span className="font-semibold text-slate-700">
              {selectedMember ? `${selectedMember.firstName ?? ""} ${selectedMember.lastName ?? ""}`.trim() : "the employee"}
            </span> has been submitted.
          </p>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Referral Summary</p>
            <div className="space-y-1.5 divide-y divide-slate-100">
              {submittedRef?._id && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Reference ID</span>
                  <span className="font-mono text-xs font-medium text-slate-700">{submittedRef._id}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Employee</span>
                <span className="font-medium text-slate-700">
                  {selectedMember ? `${selectedMember.firstName ?? ""} ${selectedMember.lastName ?? ""}`.trim() : form.patientClerkUserId}
                </span>
              </div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Service Type</span><span className="font-medium text-slate-700">{form.serviceType}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Urgency</span><span className="font-medium capitalize text-slate-700">{form.urgency}</span></div>
              <div className="flex items-center justify-between py-1"><span className="text-slate-500">Status</span><StatusBadge status={submittedRef?.referralStatus ?? "pending"} /></div>
              {submittedRef?.createdAt && (
                <div className="flex justify-between py-1"><span className="text-slate-500">Submitted</span><span className="text-slate-700">{formatDate(submittedRef.createdAt)}</span></div>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={handleReset} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700">Submit Another Referral</button>
            <a href="/manager/dashboard" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Back to Overview</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Submit a Referral</h1>
        <p className="mt-1 text-sm text-slate-500">Complete this form to refer a team member to occupational health services.</p>
      </div>
      {errors._server && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {errors._server}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-slate-800">Employee Details</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="patientClerkUserId">Employee <span className="text-red-500">*</span></label>
              <select id="patientClerkUserId" name="patientClerkUserId" value={form.patientClerkUserId} onChange={handleChange} disabled={teamLoading}
                className={`rounded-lg border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400 ${errors.patientClerkUserId ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}>
                <option value="">{teamLoading ? "Loading team…" : "Select team member…"}</option>
                {teamMembers.map((m) => (
                  <option key={m.clerkUserId} value={m.clerkUserId}>
                    {m.firstName} {m.lastName ?? ""}{m.department ? ` — ${m.department}` : ""}
                  </option>
                ))}
              </select>
              {errors.patientClerkUserId && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" /> {errors.patientClerkUserId}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Department</label>
              <input type="text" value={selectedMember?.department ?? ""} readOnly placeholder="Auto-filled on selection"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="absenceDays">Days Absent <span className="text-xs font-normal text-slate-400">(if applicable)</span></label>
              <input id="absenceDays" name="absenceDays" type="number" min="0" value={form.absenceDays} onChange={handleChange} placeholder="0"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-slate-800">Referral Details</h2>
          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="serviceType">Type of Referral <span className="text-red-500">*</span></label>
            <select id="serviceType" name="serviceType" value={form.serviceType} onChange={handleChange}
              className={`rounded-lg border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.serviceType ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}>
              <option value="">Select referral type…</option>
              {REFERRAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.serviceType && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" /> {errors.serviceType}</p>}
          </div>
          <div className="mb-5 flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Urgency Level</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {URGENCY_LEVELS.map((u) => (
                <label key={u.value} className={`flex cursor-pointer flex-col rounded-lg border-2 p-3 transition ${form.urgency === u.value ? "border-slate-800 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <input type="radio" name="urgency" value={u.value} checked={form.urgency === u.value} onChange={handleChange} className="sr-only" />
                  <span className="text-sm font-semibold text-slate-700">{u.label}</span>
                  <span className="mt-0.5 text-xs text-slate-400">{u.description}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="referralReason">Symptoms / Health Concerns <span className="text-red-500">*</span></label>
            <textarea id="referralReason" name="referralReason" rows={3} value={form.referralReason} onChange={handleChange}
              placeholder="Describe the employee's symptoms, health issues, or reasons for referral…"
              className={`resize-none rounded-lg border px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.referralReason ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`} />
            {errors.referralReason && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" /> {errors.referralReason}</p>}
          </div>
          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="workImpact">Impact on Work Performance <span className="text-red-500">*</span></label>
            <textarea id="workImpact" name="workImpact" rows={3} value={form.workImpact} onChange={handleChange}
              placeholder="Describe how the health concern is affecting the employee's role or attendance…"
              className={`resize-none rounded-lg border px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.workImpact ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`} />
            {errors.workImpact && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" /> {errors.workImpact}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="additionalInfo">Additional Information <span className="text-xs font-normal text-slate-400">(optional)</span></label>
            <textarea id="additionalInfo" name="additionalInfo" rows={2} value={form.additionalInfo} onChange={handleChange}
              placeholder="Any other relevant information for the practitioner…"
              className="resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Consent & Declaration</h2>
          <div className={`rounded-lg border p-4 ${errors.consentConfirmed ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" name="consentConfirmed" checked={form.consentConfirmed} onChange={handleChange} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-800" />
              <span className="text-sm leading-relaxed text-slate-600">
                I confirm that the employee named above has been informed of and has consented to this referral being submitted.
                I understand that the information provided will be shared with the occupational health practitioner.
              </span>
            </label>
            {errors.consentConfirmed && <p className="mt-2 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" /> {errors.consentConfirmed}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-4">
          <button type="button" onClick={handleReset} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Clear Form</button>
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" /> Submit Referral</>}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TEAM PAGE (simple card view — full health data version is in test-team.jsx)
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  employee:     "bg-blue-100 text-blue-700",
  manager:      "bg-purple-100 text-purple-700",
  practitioner: "bg-green-100 text-green-700",
  admin:        "bg-amber-100 text-amber-700",
};

export const ManagerTestTeam = () => {
  const [search, setSearch] = useState("");
  const { data: users = [], isLoading, error } = useGetUsersQuery({ role: "employee" });

  const filtered = users.filter((u) => {
    const text = `${u.firstName ?? ""} ${u.lastName ?? ""} ${u.email ?? ""} ${u.department ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Team</h1>
          <p className="mt-1 text-sm text-slate-500">All employees in your organisation.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {isLoading ? "…" : `${filtered.length} member${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      <input
        type="text"
        placeholder="Search by name, email or department…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
      />

      {isLoading && (
        <div className="flex items-center gap-2 py-12 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading team members…
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> Failed to load team members.
        </div>
      )}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-400">No team members found.</div>
      )}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((member) => {
            const fullName = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || "Unknown";
            const initials = [member.firstName?.[0], member.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
            const roleStyle = ROLE_COLORS[member.role] ?? "bg-slate-100 text-slate-600";
            return (
              <div key={member._id ?? member.clerkUserId}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white overflow-hidden">
                    {member.profileImageUrl
                      ? <img src={member.profileImageUrl} alt={fullName} className="h-11 w-11 rounded-full object-cover" />
                      : initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">{fullName}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleStyle}`}>
                        {member.role ?? "employee"}
                      </span>
                    </div>
                    {member.jobTitle && <p className="mt-0.5 truncate text-xs text-slate-500">{member.jobTitle}</p>}
                    <div className="mt-3 space-y-1.5">
                      {member.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.department && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{member.department}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY PAGE
// ─────────────────────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange, id }) => (
  <button role="switch" aria-checked={checked} id={id} onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${checked ? "bg-slate-900" : "bg-slate-200"}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

export const ManagerAccessibility = () => {
  const [settings, setSettings] = useState({
    highContrast: false, largeText: false, reduceMotion: false,
    screenReader: false, emailNotifications: true, smsNotifications: false, darkMode: false,
  });
  const [fontSize, setFontSize] = useState("medium");
  const toggle = (k) => setSettings((p) => ({ ...p, [k]: !p[k] }));

  const Section = ({ icon: Icon, title, children }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="rounded-lg bg-slate-100 p-2"><Icon className="h-4 w-4 text-slate-600" /></span>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Row = ({ id, label, desc, checked, onToggle }) => (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-slate-700">{label}</label>
        {desc && <p className="mt-0.5 text-xs text-slate-400">{desc}</p>}
      </div>
      <Toggle id={id} checked={checked} onChange={onToggle} />
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Accessibility & Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Customise your experience to suit your preferences.</p>
      </div>
      <Section icon={Eye} title="Visual">
        <Row id="highContrast" label="High Contrast Mode" desc="Increases colour contrast for better readability" checked={settings.highContrast} onToggle={() => toggle("highContrast")} />
        <div className="border-t border-slate-100 pt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Text Size</label>
          <div className="flex gap-2">
            {["small", "medium", "large"].map((s) => (
              <button key={s} onClick={() => setFontSize(s)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition ${fontSize === s ? "border-slate-800 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <Row id="darkMode" label="Dark Mode" desc="Switch to a darker colour scheme" checked={settings.darkMode} onToggle={() => toggle("darkMode")} />
        </div>
      </Section>
      <Section icon={Monitor} title="Display & Motion">
        <Row id="reduceMotion" label="Reduce Motion" desc="Minimises animations and transitions" checked={settings.reduceMotion} onToggle={() => toggle("reduceMotion")} />
        <div className="border-t border-slate-100 pt-4">
          <Row id="screenReader" label="Screen Reader Optimisation" desc="Adds additional ARIA labels and improves focus management" checked={settings.screenReader} onToggle={() => toggle("screenReader")} />
        </div>
      </Section>
      <Section icon={Bell} title="Notifications">
        <Row id="emailNotifications" label="Email Notifications" desc="Receive referral updates and status changes by email" checked={settings.emailNotifications} onToggle={() => toggle("emailNotifications")} />
        <div className="border-t border-slate-100 pt-4">
          <Row id="smsNotifications" label="SMS Notifications" desc="Receive urgent referral alerts by text message" checked={settings.smsNotifications} onToggle={() => toggle("smsNotifications")} />
        </div>
      </Section>
      <div className="flex justify-end pb-4">
        <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700">
          <Settings className="h-4 w-4" /> Save Preferences
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