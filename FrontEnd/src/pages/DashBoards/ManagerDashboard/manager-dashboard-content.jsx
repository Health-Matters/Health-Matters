import React, { useDeferredValue, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  Filter,
  Loader2,
  Phone,
  PieChart as PieChartIcon,
  Printer,
  Search,
  Send,
  TrendingUp,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useCancelReferralByIdMutation,
  useCreateReferralMutation,
  useGetManagerDashboardQuery,
  useGetManagerInsightsQuery,
  useGetManagerTeamQuery,
  useGetMyReferralsQuery,
} from "../../../store/api/referralsApi";

const STATUS_CONFIG = {
  pending: { label: "Pending", style: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", style: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", style: "bg-cyan-100 text-cyan-700" },
  rejected: { label: "Rejected", style: "bg-rose-100 text-rose-700" },
  completed: { label: "Completed", style: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", style: "bg-slate-100 text-slate-500" },
};

const RAG_STYLES = {
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-rose-100 text-rose-700",
};

const CHART_COLORS = ["#0f766e", "#2563eb", "#d97706", "#be123c", "#7c3aed", "#0891b2"];

const REFERRAL_TYPES = [
  "Occupational Health",
  "Mental Health & Wellbeing",
  "Physiotherapy",
  "Counselling",
  "Ergonomic Assessment",
  "Fitness for Work Assessment",
  "Other",
];

const INITIAL_FORM = {
  patientClerkUserId: "",
  serviceType: "",
  referralReason: "",
  urgency: "routine",
  workImpact: "",
  additionalInfo: "",
  absenceDays: "",
  consentConfirmed: false,
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    style: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${config.style}`}>
      {config.label}
    </span>
  );
};

const RagBadge = ({ value }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${RAG_STYLES[value] || "bg-slate-100 text-slate-600"}`}>
    {value || "n/a"}
  </span>
);

const MetricCard = ({ icon: Icon, label, value, hint, tone = "slate" }) => {
  const toneStyles = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-xl p-2 ${toneStyles[tone] || toneStyles.slate}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-800">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
};

const DateFilters = ({ filters, onChange }) => (
  <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="min-w-40 flex-1">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">From</label>
      <input
        type="date"
        value={filters.dateFrom}
        onChange={(event) => onChange("dateFrom", event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
      />
    </div>
    <div className="min-w-40 flex-1">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">To</label>
      <input
        type="date"
        value={filters.dateTo}
        onChange={(event) => onChange("dateTo", event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
      />
    </div>
    <button
      type="button"
      onClick={() => onChange("reset")}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
    >
      <Filter className="h-4 w-4" /> Reset
    </button>
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
    <p className="font-semibold text-slate-700">{title}</p>
    <p className="mt-2">{description}</p>
  </div>
);

const LoadingPanel = ({ label }) => (
  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-10 text-sm text-slate-500 shadow-sm">
    <Loader2 className="h-4 w-4 animate-spin" /> {label}
  </div>
);

const downloadCsv = (rows, fileName) => {
  if (!rows.length) {
    return;
  }

  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

const CancelReferralModal = ({ referral, onClose }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [cancelReferral, { isLoading }] = useCancelReferralByIdMutation();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Cancellation reason is required.");
      return;
    }

    try {
      await cancelReferral({
        referralId: referral._id,
        cancellationReason: reason.trim(),
      }).unwrap();
      onClose();
    } catch (requestError) {
      setError(requestError?.data?.message || "Unable to cancel referral.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Cancel Referral</h2>
            <p className="mt-1 text-sm text-slate-500">
              Only pending referrals can be cancelled. The employee and admin team will be notified.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">{referral.patientName}</p>
            <p className="mt-1">{referral.serviceType || "Service type not set"}</p>
            <p className="mt-1 text-xs text-slate-500">Submitted {formatDate(referral.createdAt)}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Cancellation reason</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) {
                  setError("");
                }
              }}
              placeholder="Explain why this referral is being withdrawn."
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            Keep Referral
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TriangleAlert className="h-4 w-4" />}
            Cancel Referral
          </button>
        </div>
      </div>
    </div>
  );
};

export const ManagerOverview = () => {
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });
  const [cancelTarget, setCancelTarget] = useState(null);

  const params = {
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  };

  const { data: dashboard, isLoading, error } = useGetManagerDashboardQuery(params);
  const { data: myReferralsResponse, isLoading: referralsLoading } = useGetMyReferralsQuery(params);
  const { data: team = [] } = useGetManagerTeamQuery();

  const nameByClerkId = team.reduce((accumulator, member) => {
    accumulator[member.clerkUserId] = `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.email;
    return accumulator;
  }, {});

  const myReferrals = myReferralsResponse?.data || [];

  const handleFilterChange = (field, value) => {
    if (field === "reset") {
      setFilters({ dateFrom: "", dateTo: "" });
      return;
    }

    setFilters((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {cancelTarget && <CancelReferralModal referral={cancelTarget} onClose={() => setCancelTarget(null)} />}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Team-wide referral activity, anonymised health patterns, and status alerts for your submitted referrals.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          Refreshed nightly: <span className="font-medium text-slate-700">{formatDateTime(dashboard?.refreshedAt)}</span>
        </div>
      </div>

      <DateFilters filters={filters} onChange={handleFilterChange} />

      {isLoading ? (
        <LoadingPanel label="Loading manager overview..." />
      ) : error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> Unable to load the manager overview.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Users}
              label="Team Members"
              value={dashboard?.summary?.teamMembers ?? 0}
              hint="Employees currently mapped to your team"
              tone="blue"
            />
            <MetricCard
              icon={ClipboardList}
              label="Active Referrals"
              value={dashboard?.summary?.activeReferrals ?? 0}
              hint="Pending, accepted, or in progress"
              tone="amber"
            />
            <MetricCard
              icon={Clock3}
              label="Avg Resolution"
              value={`${dashboard?.summary?.avgResolutionDays ?? 0}d`}
              hint="Average time to close a team referral"
              tone="teal"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Within SLA"
              value={`${dashboard?.summary?.withinSlaPercentage ?? 0}%`}
              hint={`${dashboard?.summary?.breachedCount ?? 0} referrals currently breached`}
              tone="green"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">My Referral Tracking</h2>
                  <p className="mt-1 text-sm text-slate-500">Status updates and pending-only cancellation for referrals you submitted.</p>
                </div>
                <a href="/manager/dashboard/referral" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800">
                  New referral <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              {referralsLoading ? (
                <div className="flex items-center gap-2 px-6 py-10 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading your referrals...
                </div>
              ) : myReferrals.length === 0 ? (
                <div className="px-6 py-10">
                  <EmptyState
                    title="No referrals in this period"
                    description="Adjust the date filter or submit a new referral to start tracking status changes."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-6 py-3">Ref</th>
                        <th className="px-6 py-3">Employee</th>
                        <th className="px-6 py-3">Service</th>
                        <th className="px-6 py-3">Submitted</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myReferrals.map((referral) => {
                        const patientName = nameByClerkId[referral.patientClerkUserId] || referral.patientClerkUserId;
                        const canCancel = referral.referralStatus === "pending";

                        return (
                          <tr key={referral._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{referral._id.slice(-6).toUpperCase()}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">{patientName}</td>
                            <td className="px-6 py-4 text-slate-500">{referral.serviceType || "—"}</td>
                            <td className="px-6 py-4 text-slate-500">{formatDate(referral.createdAt)}</td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                <StatusBadge status={referral.referralStatus} />
                                {referral.cancellationReason && (
                                  <p className="max-w-xs text-xs text-slate-500">Reason: {referral.cancellationReason}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {canCancel ? (
                                <button
                                  onClick={() =>
                                    setCancelTarget({
                                      ...referral,
                                      patientName,
                                    })
                                  }
                                  className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                >
                                  Cancel referral
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400">No action available</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">Notification Feed</h2>
                    <p className="mt-1 text-sm text-slate-500">Status updates for referrals you submitted.</p>
                  </div>
                  <Bell className="h-4 w-4 text-slate-400" />
                </div>
                <div className="max-h-96 space-y-3 overflow-y-auto px-6 py-4">
                  {(dashboard?.notifications || []).length === 0 ? (
                    <p className="text-sm text-slate-500">No notifications in this period.</p>
                  ) : (
                    dashboard.notifications.map((notification) => (
                      <div key={notification._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                            <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                          </div>
                          {!notification.read && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-500" />}
                        </div>
                        <p className="mt-3 text-xs text-slate-400">{formatDateTime(notification.createdAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <PieChartIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">Team Service Mix</h2>
                    <p className="mt-1 text-sm text-slate-500">Anonymised aggregate referrals by service type.</p>
                  </div>
                </div>
                <div className="mt-5 h-64">
                  {(dashboard?.serviceTypeBreakdown || []).length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No service activity for this filter.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={dashboard.serviceTypeBreakdown} dataKey="count" nameKey="serviceType" innerRadius={55} outerRadius={88} paddingAngle={3}>
                          {dashboard.serviceTypeBreakdown.map((entry, index) => (
                            <Cell key={entry.serviceType} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const ManagerReferralSubmission = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submittedRef, setSubmittedRef] = useState(null);
  const { data: team = [], isLoading: teamLoading } = useGetManagerTeamQuery();
  const [createReferral, { isLoading: isSubmitting }] = useCreateReferralMutation();

  const selectedMember = team.find((member) => member.clerkUserId === form.patientClerkUserId);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmittedRef(null);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.patientClerkUserId) nextErrors.patientClerkUserId = "Please select a team member.";
    if (!form.serviceType) nextErrors.serviceType = "Please choose a service type.";
    if (!form.referralReason.trim()) nextErrors.referralReason = "Referral reason is required.";
    if (!form.workImpact.trim()) nextErrors.workImpact = "Describe the impact on work.";
    if (!form.consentConfirmed) nextErrors.consentConfirmed = "Employee consent is required.";

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const notes = [
      form.workImpact ? `Work impact: ${form.workImpact}` : null,
      form.urgency ? `Urgency: ${form.urgency}` : null,
      form.absenceDays ? `Days absent: ${form.absenceDays}` : null,
      form.additionalInfo ? `Additional info: ${form.additionalInfo}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const createdReferral = await createReferral({
        patientClerkUserId: form.patientClerkUserId,
        serviceType: form.serviceType,
        referralReason: form.referralReason,
        notes,
      }).unwrap();
      setSubmittedRef(createdReferral);
    } catch (requestError) {
      setErrors({
        _server: requestError?.data?.message || "Unable to submit referral.",
      });
    }
  };

  if (submittedRef) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-800">Referral submitted</h1>
          <p className="mt-2 text-sm text-slate-500">
            The referral is now pending and future status changes will appear in your manager notifications.
          </p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-600">
            <div className="flex items-center justify-between py-1">
              <span>Reference</span>
              <span className="font-mono text-xs font-semibold text-slate-700">{submittedRef._id}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Employee</span>
              <span className="font-semibold text-slate-700">{selectedMember ? `${selectedMember.firstName || ""} ${selectedMember.lastName || ""}`.trim() : "Selected team member"}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Status</span>
              <StatusBadge status={submittedRef.referralStatus || "pending"} />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={resetForm} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700">
              Submit another
            </button>
            <a href="/manager/dashboard" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Return to overview
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Submit Referral</h1>
        <p className="mt-1 text-sm text-slate-500">Create a referral for someone on your team using the current manager workflow.</p>
      </div>

      {errors._server && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {errors._server}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Employee</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Team member</label>
              <select
                name="patientClerkUserId"
                value={form.patientClerkUserId}
                onChange={handleChange}
                disabled={teamLoading}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50"
              >
                <option value="">{teamLoading ? "Loading team..." : "Select team member..."}</option>
                {team.map((member) => (
                  <option key={member.clerkUserId} value={member.clerkUserId}>
                    {member.firstName} {member.lastName} {member.department ? `- ${member.department}` : ""}
                  </option>
                ))}
              </select>
              {errors.patientClerkUserId && <p className="mt-1.5 text-xs text-rose-600">{errors.patientClerkUserId}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
              <input value={selectedMember?.department || ""} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Days absent</label>
              <input name="absenceDays" type="number" min="0" value={form.absenceDays} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Referral details</h2>
          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Service type</label>
              <select name="serviceType" value={form.serviceType} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300">
                <option value="">Select service type...</option>
                {REFERRAL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.serviceType && <p className="mt-1.5 text-xs text-rose-600">{errors.serviceType}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Referral reason</label>
              <textarea name="referralReason" rows={4} value={form.referralReason} onChange={handleChange} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300" />
              {errors.referralReason && <p className="mt-1.5 text-xs text-rose-600">{errors.referralReason}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Impact on work</label>
              <textarea name="workImpact" rows={3} value={form.workImpact} onChange={handleChange} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300" />
              {errors.workImpact && <p className="mt-1.5 text-xs text-rose-600">{errors.workImpact}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Additional information</label>
              <textarea name="additionalInfo" rows={3} value={form.additionalInfo} onChange={handleChange} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input name="consentConfirmed" type="checkbox" checked={form.consentConfirmed} onChange={handleChange} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-800" />
            <span>
              I confirm the employee has been informed and has consented to this referral.
              Their submission may generate status notifications for me as the manager.
            </span>
          </label>
          {errors.consentConfirmed && <p className="mt-2 text-xs text-rose-600">{errors.consentConfirmed}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            Clear
          </button>
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit referral
          </button>
        </div>
      </form>
    </div>
  );
};

export const ManagerTeam = () => {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const { data: team = [], isLoading, error } = useGetManagerTeamQuery();

  const filteredTeam = team.filter((member) => {
    const text = `${member.firstName || ""} ${member.lastName || ""} ${member.email || ""} ${member.department || ""}`.toLowerCase();
    return text.includes(deferredSearch.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Team</h1>
          <p className="mt-1 text-sm text-slate-500">Your mapped employees with live referral counts, without exposing health details.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
          {filteredTeam.length} team member{filteredTeam.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search team by name, email or department..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      {isLoading ? (
        <LoadingPanel label="Loading team view..." />
      ) : error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> Unable to load your team.
        </div>
      ) : filteredTeam.length === 0 ? (
        <EmptyState title="No team members found" description="Adjust your search or seed data to view mapped employees here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredTeam.map((member) => (
            <div key={member.clerkUserId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{`${member.firstName || ""} ${member.lastName || ""}`.trim()}</h2>
                  <p className="mt-1 text-sm text-slate-500">{member.department || "Department not set"}</p>
                </div>
                {member.latestStatus ? <StatusBadge status={member.latestStatus} /> : <span className="text-xs text-slate-400">No referrals yet</span>}
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" /> {member.phone || "No phone number"}
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-400" /> {member.email}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Active referrals</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">{member.activeReferrals}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Total referrals</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">{member.totalReferrals}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400">Last referral: {formatDate(member.lastReferralAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ManagerInsights = () => {
  const [months, setMonths] = useState(12);
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });
  const params = {
    months,
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  };

  const { data, isLoading, error } = useGetManagerInsightsQuery(params);

  const handleExport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total referrals", data?.overview?.totalReferrals ?? 0],
      ["Resolved referrals", data?.overview?.totalResolved ?? 0],
      ["Average resolution days", data?.overview?.avgResolutionDays ?? 0],
      ["Within SLA %", data?.sla?.withinSlaPercentage ?? 0],
      ["Breached referrals", data?.sla?.breachedCount ?? 0],
      [],
      ["Breached referral ID", "Employee", "Service type", "Days to assignment", "Status", "RAG"],
      ...((data?.sla?.breachedReferrals || []).map((item) => [
        item.referralId,
        item.employeeName,
        item.serviceType,
        item.daysToAssignment,
        item.status,
        item.ragStatus,
      ])),
    ];
    downloadCsv(rows, `manager-insights-${months}m.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Insights</h1>
          <p className="mt-1 text-sm text-slate-500">
            Department-level wellbeing trends, SLA performance, and organisation comparison without exposing personal health details.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {[3, 6, 12].map((option) => (
            <button
              key={option}
              onClick={() => setMonths(option)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${months === option ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              {option} months
            </button>
          ))}
          <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Printer className="h-4 w-4" /> Print report
          </button>
        </div>
      </div>

      <DateFilters
        filters={filters}
        onChange={(field, value) => {
          if (field === "reset") {
            setFilters({ dateFrom: "", dateTo: "" });
            return;
          }
          setFilters((current) => ({ ...current, [field]: value }));
        }}
      />

      {isLoading ? (
        <LoadingPanel label="Loading manager insights..." />
      ) : error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> Unable to load the insights view.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={ClipboardList} label="Total Referrals" value={data?.overview?.totalReferrals ?? 0} hint={`Rolling ${months}-month team total`} tone="blue" />
            <MetricCard icon={CheckCircle2} label="Resolved" value={data?.overview?.totalResolved ?? 0} hint="Completed, rejected, or cancelled" tone="green" />
            <MetricCard icon={Clock3} label="Avg Resolution" value={`${data?.overview?.avgResolutionDays ?? 0}d`} hint="Average time to closure" tone="teal" />
            <MetricCard icon={TrendingUp} label="Org Comparison" value={`${data?.organisationComparison?.comparisonPercentage ?? 0}%`} hint="Vs organisation average referrals per manager" tone="amber" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.85fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Referral Volume Trend</h2>
                  <p className="mt-1 text-sm text-slate-500">Team referral volume against the organisation average.</p>
                </div>
                <p className="text-xs text-slate-400">Refreshed {formatDateTime(data?.refreshedAt)}</p>
              </div>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.trend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="referrals" stroke="#0f766e" strokeWidth={3} name="My team" />
                    <Line type="monotone" dataKey="organisationAverage" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 4" name="Organisation avg" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Service Type Breakdown</h2>
                  <p className="mt-1 text-sm text-slate-500">Anonymised breakdown by referral type.</p>
                </div>
              </div>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.serviceTypeBreakdown || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="serviceType" width={130} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">SLA Compliance</h2>
                  <p className="mt-1 text-sm text-slate-500">Days to assignment against a {data?.sla?.targetDays ?? 3}-day SLA.</p>
                </div>
                <RagBadge value={data?.sla?.ragStatus} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Within SLA</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">{data?.sla?.withinSlaPercentage ?? 0}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Avg Days To Assignment</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">{data?.sla?.avgDaysToAssignment ?? 0}d</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 col-span-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Breached Referrals</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">{data?.sla?.breachedCount ?? 0}</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                  Organisation average: <span className="font-semibold text-slate-800">{data?.organisationComparison?.organisationAverageMonthlyReferrals ?? 0}</span> referrals per manager per month.
                </p>
                <p className="mt-2">
                  Your team average: <span className="font-semibold text-slate-800">{data?.organisationComparison?.teamAverageMonthlyReferrals ?? 0}</span> referrals per month.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">SLA Breach Drilldown</h2>
                  <p className="mt-1 text-sm text-slate-500">Referral list only, with no diagnosis or health-condition detail.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                {(data?.sla?.breachedReferrals || []).length === 0 ? (
                  <div className="px-6 py-10">
                    <EmptyState title="No breached referrals" description="All currently assigned referrals are within the configured SLA." />
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-6 py-3">Ref</th>
                        <th className="px-6 py-3">Employee</th>
                        <th className="px-6 py-3">Service</th>
                        <th className="px-6 py-3">Days</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">RAG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.sla.breachedReferrals.map((item) => (
                        <tr key={item.referralId} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.referralId.slice(-6).toUpperCase()}</td>
                          <td className="px-6 py-4 font-medium text-slate-700">{item.employeeName}</td>
                          <td className="px-6 py-4 text-slate-500">{item.serviceType}</td>
                          <td className="px-6 py-4 text-slate-500">{item.daysToAssignment}d</td>
                          <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                          <td className="px-6 py-4"><RagBadge value={item.ragStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const ManagerAccessibility = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Accessibility & Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Current manager preferences for dashboard readability and notification delivery.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Notifications</h2>
        <div className="mt-5 space-y-4 text-sm text-slate-600">
          <label className="flex items-center justify-between gap-4">
            <span>Email status updates</span>
            <input type="checkbox" checked={emailNotifications} onChange={() => setEmailNotifications((value) => !value)} className="h-4 w-4 rounded border-slate-300 accent-slate-800" />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>SMS for urgent referral events</span>
            <input type="checkbox" checked={smsNotifications} onChange={() => setSmsNotifications((value) => !value)} className="h-4 w-4 rounded border-slate-300 accent-slate-800" />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>Reduce motion</span>
            <input type="checkbox" checked={reduceMotion} onChange={() => setReduceMotion((value) => !value)} className="h-4 w-4 rounded border-slate-300 accent-slate-800" />
          </label>
        </div>
      </div>
    </div>
  );
};