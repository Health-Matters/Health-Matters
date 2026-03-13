import React, { useState } from "react";
import {
  Mail, Building2, Phone, ClipboardList,
  AlertCircle, Loader2, X, Send, CircleCheck,
  Activity, CheckCircle2, Clock,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useGetUsersQuery } from "../../../store/api/usersApi";
import {
  useGetReferralsQuery,
  useCreateReferralMutation,
} from "../../../store/api/referralsApi";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:     { label: "Pending",     style: "bg-amber-100 text-amber-700"  },
  accepted:    { label: "Accepted",    style: "bg-blue-100 text-blue-700"    },
  rejected:    { label: "Rejected",    style: "bg-red-100 text-red-700"      },
};

const ACTIVE_STATUSES = ["pending", "accepted", "in_progress"];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, style: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.style}`}>
      {cfg.label}
    </span>
  );
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const REFERRAL_TYPES = [
  "Occupational Health", "Mental Health & Wellbeing", "Physiotherapy",
  "Counselling", "Ergonomic Assessment", "Fitness for Work Assessment", "Other",
];

const URGENCY_LEVELS = [
  { value: "routine", label: "Routine", description: "Non-urgent, within 4 weeks" },
  { value: "soon",    label: "Soon",    description: "Within 2 weeks"             },
  { value: "urgent",  label: "Urgent",  description: "Within 48 hours"            },
];

// ─────────────────────────────────────────────────────────────────────────────
// REFERRAL DRAWER — slides in from the right for a specific employee
// ─────────────────────────────────────────────────────────────────────────────

const ReferralDrawer = ({ employee, onClose, onSubmitted }) => {
  const [createReferral, { isLoading: submitting }] = useCreateReferralMutation();
  const [form, setForm] = useState({
    serviceType: "", referralReason: "", urgency: "routine",
    workImpact: "", additionalInfo: "", consentConfirmed: false,
  });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);

  const fullName = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.serviceType)           e.serviceType      = "Required";
    if (!form.referralReason.trim()) e.referralReason   = "Required";
    if (!form.workImpact.trim())     e.workImpact       = "Required";
    if (!form.consentConfirmed)      e.consentConfirmed = "You must confirm consent";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const combinedNotes = [
      form.workImpact            ? `Work Impact: ${form.workImpact}`         : null,
      form.urgency !== "routine" ? `Urgency: ${form.urgency}`                : null,
      form.additionalInfo        ? `Additional Info: ${form.additionalInfo}` : null,
    ].filter(Boolean).join("\n\n");

    try {
      // SECURITY: submittedByClerkUserId is NOT sent — set server-side from Clerk token
      const result = await createReferral({
        patientClerkUserId: employee.clerkUserId,
        serviceType:        form.serviceType,
        referralReason:     form.referralReason,
        notes:              combinedNotes || undefined,
      }).unwrap();
      setSubmittedRef(result);
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      setErrors({ _server: err?.data?.message ?? "Submission failed. Please try again." });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Submit Referral</h2>
            <p className="text-xs text-slate-500">for <span className="font-medium text-slate-700">{fullName}</span></p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success state */}
        {done ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CircleCheck className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Referral Submitted</h3>
            <p className="mt-1 text-sm text-slate-500">
              Referral for <span className="font-medium text-slate-700">{fullName}</span> has been submitted.
            </p>
            {submittedRef?._id && (
              <p className="mt-2 font-mono text-xs text-slate-400">Ref: {submittedRef._id}</p>
            )}
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden" noValidate>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {errors._server && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {errors._server}
                </div>
              )}

              {/* Employee summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white overflow-hidden">
                    {employee.profileImageUrl
                      ? <img src={employee.profileImageUrl} alt={fullName} className="h-10 w-10 rounded-full object-cover" />
                      : [employee.firstName?.[0], employee.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{fullName}</p>
                    <p className="text-xs text-slate-500">{employee.jobTitle ?? employee.role ?? "Employee"}{employee.department ? ` · ${employee.department}` : ""}</p>
                  </div>
                </div>
              </div>

              {/* Service Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Type of Referral <span className="text-red-500">*</span></label>
                <select name="serviceType" value={form.serviceType} onChange={handleChange}
                  className={`rounded-lg border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.serviceType ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}>
                  <option value="">Select referral type…</option>
                  {REFERRAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.serviceType && <p className="text-xs text-red-500">{errors.serviceType}</p>}
              </div>

              {/* Urgency */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {URGENCY_LEVELS.map((u) => (
                    <label key={u.value} className={`flex cursor-pointer flex-col rounded-lg border-2 p-2.5 transition ${
                      form.urgency === u.value ? "border-slate-800 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                      <input type="radio" name="urgency" value={u.value} checked={form.urgency === u.value} onChange={handleChange} className="sr-only" />
                      <span className="text-xs font-semibold text-slate-700">{u.label}</span>
                      <span className="mt-0.5 text-xs text-slate-400">{u.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Referral Reason */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Symptoms / Health Concerns <span className="text-red-500">*</span></label>
                <textarea name="referralReason" rows={3} value={form.referralReason} onChange={handleChange}
                  placeholder="Describe the employee's symptoms or reasons for referral…"
                  className={`resize-none rounded-lg border px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.referralReason ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`} />
                {errors.referralReason && <p className="text-xs text-red-500">{errors.referralReason}</p>}
              </div>

              {/* Work Impact */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Impact on Work Performance <span className="text-red-500">*</span></label>
                <textarea name="workImpact" rows={2} value={form.workImpact} onChange={handleChange}
                  placeholder="How is this affecting their role or attendance…"
                  className={`resize-none rounded-lg border px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.workImpact ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`} />
                {errors.workImpact && <p className="text-xs text-red-500">{errors.workImpact}</p>}
              </div>

              {/* Additional Info */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Additional Information <span className="text-xs font-normal text-slate-400">(optional)</span></label>
                <textarea name="additionalInfo" rows={2} value={form.additionalInfo} onChange={handleChange}
                  placeholder="Any other relevant context…"
                  className="resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>

              {/* Consent */}
              <div className={`rounded-lg border p-3 ${errors.consentConfirmed ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" name="consentConfirmed" checked={form.consentConfirmed} onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-800" />
                  <span className="text-xs leading-relaxed text-slate-600">
                    I confirm that <span className="font-medium">{fullName}</span> has been informed of and consented to this referral.
                  </span>
                </label>
                {errors.consentConfirmed && <p className="mt-1.5 text-xs text-red-500">{errors.consentConfirmed}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button type="button" onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" /> Submit Referral</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH SUMMARY PILL ROW — shows at a glance referral stats per employee
// ─────────────────────────────────────────────────────────────────────────────

const HealthSummary = ({ referrals }) => {
  const active    = referrals.filter((r) => ACTIVE_STATUSES.includes(r.referralStatus)).length;
  const completed = referrals.filter((r) => r.referralStatus === "completed").length;
  const total     = referrals.length;

  if (total === 0) {
    return <p className="mt-3 text-xs text-slate-400">No referrals on record</p>;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {active > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          <Activity className="h-3 w-3" /> {active} active
        </span>
      )}
      {completed > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3 w-3" /> {completed} completed
        </span>
      )}
      {total > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          <Clock className="h-3 w-3" /> {total} total
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE DETAIL MODAL — shows full referral history for one employee
// ─────────────────────────────────────────────────────────────────────────────

const EmployeeDetailModal = ({ employee, referrals, onClose, onReferral }) => {
  const fullName = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
  const sorted   = [...referrals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white overflow-hidden">
              {employee.profileImageUrl
                ? <img src={employee.profileImageUrl} alt={fullName} className="h-10 w-10 rounded-full object-cover" />
                : [employee.firstName?.[0], employee.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{fullName}</p>
              <p className="text-xs text-slate-500">{employee.jobTitle ?? employee.role}{employee.department ? ` · ${employee.department}` : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contact info */}
        <div className="border-b border-slate-100 px-6 py-3 flex flex-wrap gap-4">
          {employee.email && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Mail className="h-3 w-3 text-slate-400" /> {employee.email}
            </div>
          )}
          {employee.phone && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Phone className="h-3 w-3 text-slate-400" /> {employee.phone}
            </div>
          )}
          {employee.department && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Building2 className="h-3 w-3 text-slate-400" /> {employee.department}
            </div>
          )}
        </div>

        {/* Referral history */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Referral History</h3>
            <span className="text-xs text-slate-400">{referrals.length} total</span>
          </div>

          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No referrals on record for this employee.</p>
          ) : (
            <div className="space-y-3">
              {sorted.map((ref) => (
                <div key={ref._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{ref.serviceType ?? "—"}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">{ref._id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <StatusBadge status={ref.referralStatus} />
                  </div>
                  {ref.referralReason && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">{ref.referralReason}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">Submitted {formatDate(ref.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            Close
          </button>
          <button onClick={() => { onClose(); onReferral(employee); }}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
            <ClipboardList className="h-4 w-4" /> Submit Referral
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEAM PAGE
// ─────────────────────────────────────────────────────────────────────────────

export const ManagerTestTeam = () => {
  const [search, setSearch]                 = useState("");
  const [referralTarget, setReferralTarget] = useState(null);
  const [detailTarget, setDetailTarget]     = useState(null);

  const { data: employees = [], isLoading: empLoading, error: empError } = useGetUsersQuery({ role: "employee" });
  const { data: allReferrals = [], refetch } = useGetReferralsQuery();

  // Build a map: clerkUserId → referrals[]
  const referralsByEmployee = allReferrals.reduce((acc, ref) => {
    const id = ref.patientClerkUserId;
    if (!acc[id]) acc[id] = [];
    acc[id].push(ref);
    return acc;
  }, {});

  const filtered = employees.filter((u) => {
    const text = `${u.firstName ?? ""} ${u.lastName ?? ""} ${u.email ?? ""} ${u.department ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const activeCount = employees.filter((u) =>
    (referralsByEmployee[u.clerkUserId] ?? []).some((r) => ACTIVE_STATUSES.includes(r.referralStatus))
  ).length;

  return (
    <div className="space-y-6">
      {referralTarget && (
        <ReferralDrawer
          employee={referralTarget}
          onClose={() => setReferralTarget(null)}
          onSubmitted={() => { refetch(); setReferralTarget(null); }}
        />
      )}
      {detailTarget && (
        <EmployeeDetailModal
          employee={detailTarget}
          referrals={referralsByEmployee[detailTarget.clerkUserId] ?? []}
          onClose={() => setDetailTarget(null)}
          onReferral={(emp) => setReferralTarget(emp)}
        />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Team</h1>
          <p className="mt-1 text-sm text-slate-500">
            {empLoading ? "Loading…" : `${employees.length} employees · ${activeCount} with active referrals`}
          </p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name, email or department…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-4 text-sm text-slate-700 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
      />

      {empLoading && (
        <div className="flex items-center gap-2 py-12 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading team members…
        </div>
      )}
      {empError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> Failed to load team members.
        </div>
      )}
      {!empLoading && !empError && filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-400">No team members found.</div>
      )}

      {!empLoading && !empError && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((member) => {
            const fullName     = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || "Unknown";
            const initials     = [member.firstName?.[0], member.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
            const empReferrals = referralsByEmployee[member.clerkUserId] ?? [];
            const hasActive    = empReferrals.some((r) => ACTIVE_STATUSES.includes(r.referralStatus));

            return (
              <div key={member._id ?? member.clerkUserId}
                className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${hasActive ? "border-amber-200" : "border-slate-200"}`}>

                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white overflow-hidden">
                    {member.profileImageUrl
                      ? <img src={member.profileImageUrl} alt={fullName} className="h-11 w-11 rounded-full object-cover" />
                      : initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{fullName}</p>
                    <p className="truncate text-xs text-slate-500">{member.jobTitle ?? member.role ?? "Employee"}</p>
                  </div>
                  {hasActive && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Active</span>
                  )}
                </div>

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

                <HealthSummary referrals={empReferrals} />

                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setDetailTarget(member)}
                    className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    View Health Data
                  </button>
                  <button
                    onClick={() => setReferralTarget(member)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                  >
                    <ClipboardList className="h-3.5 w-3.5" /> Submit Referral
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};