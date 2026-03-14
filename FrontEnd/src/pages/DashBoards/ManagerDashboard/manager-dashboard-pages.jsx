import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, ClipboardList, Loader2, Send, Users, XCircle } from "lucide-react";
import {
  useCancelReferralByIdMutation,
  useCreateReferralMutation,
  useGetMyReferralsQuery,
  useGetNotificationsQuery,
  useGetUsersQuery,
  useMarkNotificationReadMutation,
} from "../../../store/api";

/*
 Team A - Manager referral submission, tracking, details, endpoint wiring, and responsive workflow UI (TMA-001, TMA-002, TMA-003, TMA-004, TMA-005, TMA-006) . Done by Mahdi and Savindu
 Team D - Manager notifications, cancellation, and team analytics dashboard surfaces (TMD-001, TMD-002, TMD-003, TMD-004, TMD-005) . Done by Ramiru, Sajana, and Omidu
 Team B - Manager profile-side operational data context for personal details and guidance views (TMB-005, TMB-006) . Done by Tevin and Ovin
*/

const STATUS_CONFIG = {
  pending: { label: "Pending", style: "bg-amber-100 text-amber-700" },
  assigned: { label: "Assigned", style: "bg-sky-100 text-sky-700" },
  in_progress: { label: "In Progress", style: "bg-indigo-100 text-indigo-700" },
  completed: { label: "Completed", style: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", style: "bg-rose-100 text-rose-700" },
  accepted: { label: "Accepted", style: "bg-blue-100 text-blue-700" },
  rejected: { label: "Rejected", style: "bg-red-100 text-red-700" },
};

const DUMMY_NOTIFICATIONS = [
  {
    _id: "note-demo-1",
    title: "Referral Assigned",
    message: "Referral #DEMO01 has been assigned.",
    relatedEntityType: "referral",
    relatedEntityId: "demo-1",
    channels: { inApp: { read: false } },
    createdAt: "2026-03-02T10:00:00.000Z",
  },
  {
    _id: "note-demo-2",
    title: "Referral Completed",
    message: "Referral #DEMO03 has been completed.",
    relatedEntityType: "referral",
    relatedEntityId: "demo-3",
    channels: { inApp: { read: true } },
    createdAt: "2026-02-18T10:00:00.000Z",
  },
];

const FALLBACK_TEAM = [
  { clerkUserId: "employee-demo-1", firstName: "Alex", lastName: "Shaw", department: "Operations" },
  { clerkUserId: "employee-demo-2", firstName: "Mina", lastName: "Khan", department: "Engineering" },
  { clerkUserId: "employee-demo-3", firstName: "Dylan", lastName: "Reid", department: "Finance" },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? { label: status, style: "bg-slate-100 text-slate-600" };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${config.style}`}>{config.label}</span>;
};

const getReferralsArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const ManagerOverview = () => {
  const { data: myReferralsResponse, isLoading: referralsLoading } = useGetMyReferralsQuery({ limit: 50 });
  const { data: notificationsResponse, isLoading: notificationsLoading } = useGetNotificationsQuery({ limit: 8 });
  const [markRead] = useMarkNotificationReadMutation();

  const referrals = getReferralsArray(myReferralsResponse);
  const notifications = Array.isArray(notificationsResponse) ? notificationsResponse : [];

  const safeNotifications = notifications.length > 0 ? notifications : DUMMY_NOTIFICATIONS;

  const summary = useMemo(() => {
    const active = referrals.filter((r) => ["pending", "assigned", "in_progress", "accepted"].includes(r.referralStatus)).length;
    const completed = referrals.filter((r) => r.referralStatus === "completed").length;
    const cancelled = referrals.filter((r) => r.referralStatus === "cancelled").length;

    return {
      total: referrals.length,
      active,
      completed,
      cancelled,
    };
  }, [referrals]);

  const openNotificationReferral = async (notification) => {
    if (!notification?.relatedEntityId) return;

    if (notification?._id && !notification?.channels?.inApp?.read) {
      try {
        await markRead(notification._id).unwrap();
      } catch {
        // Non-blocking for navigation
      }
    }

    window.location.href = `/manager/dashboard/referral?referralId=${notification.relatedEntityId}&notificationId=${notification._id}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Track referral progress and notifications for your team.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Referrals</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-2 text-3xl font-bold text-sky-700">{summary.active}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{summary.completed}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Cancelled</p>
          <p className="mt-2 text-3xl font-bold text-rose-700">{summary.cancelled}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-800">My Referrals</h2>
            <a href="/manager/dashboard/referral" className="text-sm font-medium text-blue-700 hover:text-blue-800">Manage referrals</a>
          </div>
          <div className="max-h-84 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map((ref) => (
                  <tr key={ref._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{String(ref._id).slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-slate-700">{ref.serviceType || "-"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(ref.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={ref.referralStatus} /></td>
                  </tr>
                ))}
                {!referralsLoading && referrals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                      you have not submitted any refferals
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {(referralsLoading || notificationsLoading) && (
            <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading live dashboard data...
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <Bell className="h-4 w-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">Status Notifications</h2>
          </div>
          <div className="max-h-84 overflow-auto px-4 py-3">
            {safeNotifications.length === 0 ? (
              <p className="text-sm text-slate-500">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {safeNotifications.map((note) => {
                  const unread = !note?.channels?.inApp?.read;
                  return (
                    <button
                      key={note._id}
                      type="button"
                      onClick={() => openNotificationReferral(note)}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        unread
                          ? "border-blue-200 bg-blue-50/60 hover:bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800">{note.title}</p>
                        {unread && <span className="rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-semibold text-white">New</span>}
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{note.message}</p>
                      <p className="mt-2 text-[11px] text-slate-500">{formatDate(note.createdAt)} · View referral</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CancelModal = ({ referralId, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Cancellation reason is required.");
      return;
    }
    onSubmit(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-slate-800">Cancel Referral</h3>
        <p className="mt-1 text-sm text-slate-500">Provide a reason for cancelling referral {String(referralId).slice(-8).toUpperCase()}.</p>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
          className={`mt-3 w-full resize-none rounded-lg border px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 ${
            error ? "border-red-300 bg-red-50" : "border-slate-300 bg-white"
          }`}
          placeholder="Reason for cancellation..."
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Keep Referral
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancel Referral
          </button>
        </div>
      </div>
    </div>
  );
};

export const ManagerReferralSubmission = () => {
  const [form, setForm] = useState({ patientClerkUserId: "", serviceType: "", referralReason: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  const [createReferral, { isLoading: submitting }] = useCreateReferralMutation();
  const [cancelReferralById, { isLoading: cancelling }] = useCancelReferralByIdMutation();
  const { data: users = [] } = useGetUsersQuery({ role: "employee" });
  const { data: myReferralsResponse, refetch } = useGetMyReferralsQuery({ limit: 50 });
  const [markRead] = useMarkNotificationReadMutation();

  const searchParams = new URLSearchParams(window.location.search);
  const highlightedReferralId = searchParams.get("referralId");
  const linkedNotificationId = searchParams.get("notificationId");

  const teamMembers = users.length > 0 ? users : FALLBACK_TEAM;
  const myReferrals = getReferralsArray(myReferralsResponse);

  useEffect(() => {
    if (!linkedNotificationId) return;

    markRead(linkedNotificationId)
      .unwrap()
      .catch(() => undefined)
      .finally(() => {
        const params = new URLSearchParams(window.location.search);
        params.delete("notificationId");
        const next = params.toString();
        window.history.replaceState({}, "", next ? `${window.location.pathname}?${next}` : window.location.pathname);
      });
  }, [linkedNotificationId, markRead]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.patientClerkUserId) nextErrors.patientClerkUserId = "Please select an employee.";
    if (!form.serviceType) nextErrors.serviceType = "Please select a service type.";
    if (!form.referralReason.trim()) nextErrors.referralReason = "Please enter referral reason.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await createReferral({
        patientClerkUserId: form.patientClerkUserId,
        serviceType: form.serviceType,
        referralReason: form.referralReason.trim(),
      }).unwrap();

      setSubmitted(true);
      setForm({ patientClerkUserId: "", serviceType: "", referralReason: "" });
      setErrors({});
      refetch();
    } catch (err) {
      setErrors({ server: err?.data?.message || "Failed to submit referral." });
    }
  };

  const submitCancellation = async (reason) => {
    if (!cancelTarget) return;

    try {
      await cancelReferralById({ referralId: cancelTarget._id, reason }).unwrap();
      setCancelTarget(null);
      refetch();
    } catch (err) {
      setErrors({ server: err?.data?.message || "Unable to cancel referral." });
    }
  };

  return (
    <div className="space-y-6">
      {cancelTarget && (
        <CancelModal
          referralId={cancelTarget._id}
          onClose={() => setCancelTarget(null)}
          onSubmit={submitCancellation}
          loading={cancelling}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Submit Referral</h1>
        <p className="mt-1 text-sm text-slate-500">Create a new referral and manage pending submissions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.35fr]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">New Referral</h2>

          {errors.server && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errors.server}</p>}
          {submitted && (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Referral submitted successfully.
            </p>
          )}

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Employee</label>
              <select
                value={form.patientClerkUserId}
                onChange={(e) => setForm((prev) => ({ ...prev, patientClerkUserId: e.target.value }))}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                  errors.patientClerkUserId ? "border-red-300 bg-red-50" : "border-slate-300 bg-white"
                }`}
              >
                <option value="">Select employee...</option>
                {teamMembers.map((member) => {
                  const fullName = `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.name || "Employee";
                  return (
                    <option key={member.clerkUserId || member.id} value={member.clerkUserId || member.id}>
                      {fullName} {member.department ? `- ${member.department}` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Service Type</label>
              <input
                value={form.serviceType}
                onChange={(e) => setForm((prev) => ({ ...prev, serviceType: e.target.value }))}
                placeholder="e.g. Mental Health & Wellbeing"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                  errors.serviceType ? "border-red-300 bg-red-50" : "border-slate-300 bg-white"
                }`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Referral Reason</label>
              <textarea
                rows={4}
                value={form.referralReason}
                onChange={(e) => setForm((prev) => ({ ...prev, referralReason: e.target.value }))}
                className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                  errors.referralReason ? "border-red-300 bg-red-50" : "border-slate-300 bg-white"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Referral
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-800">My Submitted Referrals</h2>
            <span className="text-xs text-slate-500">Pending referrals can be cancelled</span>
          </div>

          <div className="max-h-124 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Referral</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myReferrals.map((ref) => {
                  const isPending = ref.referralStatus === "pending";
                  const isHighlighted = highlightedReferralId === String(ref._id);

                  return (
                    <tr key={ref._id} className={isHighlighted ? "bg-blue-50" : "hover:bg-slate-50"}>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-slate-500">{String(ref._id).slice(-8).toUpperCase()}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(ref.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{ref.serviceType || "-"}</td>
                      <td className="px-4 py-3"><StatusBadge status={ref.referralStatus} /></td>
                      <td className="px-4 py-3">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(ref)}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Not available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {myReferrals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                      you have not submitted any refferals
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">What happens next</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"><ClipboardList className="h-4 w-4" /> Assigned / In Progress</p>
            <p className="mt-1 text-xs text-slate-500">You receive in-app notification with direct link to the referral.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"><CheckCircle2 className="h-4 w-4" /> Completed</p>
            <p className="mt-1 text-xs text-slate-500">Completion updates appear in your notification feed and dashboard tables.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Users className="h-4 w-4" /> Cancelled</p>
            <p className="mt-1 text-xs text-slate-500">Employee and admin are notified, and dashboard status updates immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
