import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Package,
  Shield,
  Users,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useGetReferralsQuery,
  useGetServicesQuery,
  useGetUsersQuery,
} from "@/store/api";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getFullName = (user) => {
  if (!user) return "Unknown";
  const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return full || user.userName || user.email || "Unknown";
};

export const TestOverview = () => {
  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
  } = useGetUsersQuery();

  const {
    data: services = [],
    isLoading: servicesLoading,
    isError: servicesError,
  } = useGetServicesQuery();

  const {
    data: referrals = [],
    isLoading: referralsLoading,
    isError: referralsError,
  } = useGetReferralsQuery();

  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    isError: notificationsError,
  } = useGetNotificationsQuery();

  const isLoading = usersLoading || servicesLoading || referralsLoading || notificationsLoading;
  const hasError = usersError || servicesError || referralsError || notificationsError;

  const usersByClerkId = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      if (u.clerkUserId) map.set(u.clerkUserId, u);
    });
    return map;
  }, [users]);

  const summary = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;
    const pendingReferrals = referrals.filter((r) => r.referralStatus === "pending").length;
    const acceptedReferrals = referrals.filter((r) => r.referralStatus === "accepted").length;
    const rejectedReferrals = referrals.filter((r) => r.referralStatus === "rejected").length;
    const activeServices = services.filter((s) => s.isActive).length;
    const unreadNotifications = notifications.filter((n) => !n?.channels?.inApp?.read).length;

    const roleBreakdown = {
      admin: users.filter((u) => u.role === "admin").length,
      manager: users.filter((u) => u.role === "manager").length,
      practitioner: users.filter((u) => u.role === "practitioner").length,
      employee: users.filter((u) => u.role === "employee").length,
    };

    const serviceVolumeMap = referrals.reduce((acc, referral) => {
      const key = referral.serviceType || "Unspecified";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topServices = Object.entries(serviceVolumeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentReferrals = [...referrals]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    return {
      totalUsers,
      activeUsers,
      pendingReferrals,
      acceptedReferrals,
      rejectedReferrals,
      totalReferrals: referrals.length,
      activeServices,
      totalServices: services.length,
      unreadNotifications,
      roleBreakdown,
      topServices,
      recentReferrals,
    };
  }, [users, services, referrals, notifications]);

  return (
    <div className="space-y-6 rounded-2xl border border-blue-100/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Unified summary of analytics, services, referrals, and platform health.
        </p>
      </div>

      {hasError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Some dashboard data failed to load. Refresh the page to retry.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Users</p>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isLoading ? "..." : summary.totalUsers}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Active: {summary.activeUsers}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Referrals</p>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isLoading ? "..." : summary.totalReferrals}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Pending: {summary.pendingReferrals}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Services</p>
            <Package className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isLoading ? "..." : summary.totalServices}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Active: {summary.activeServices}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Unread Alerts</p>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isLoading ? "..." : summary.unreadNotifications}
          </p>
          <p className="mt-1 text-xs text-slate-500">In-app notifications</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Referral Pipeline Snapshot</h2>
            <Clock3 className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Pending</p>
              <p className="mt-1 text-2xl font-bold text-amber-800">{summary.pendingReferrals}</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Accepted</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">{summary.acceptedReferrals}</p>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-rose-700">Rejected</p>
              <p className="mt-1 text-2xl font-bold text-rose-800">{summary.rejectedReferrals}</p>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-800">Recent Referrals</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-2">Patient</th>
                    <th className="px-2 py-2">Service</th>
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.recentReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-2 py-4 text-slate-500">No referral activity yet.</td>
                    </tr>
                  ) : (
                    summary.recentReferrals.map((referral) => {
                      const patient = usersByClerkId.get(referral.patientClerkUserId);
                      return (
                        <tr key={referral._id}>
                          <td className="px-2 py-3 text-slate-700">{getFullName(patient)}</td>
                          <td className="px-2 py-3 text-slate-600">{referral.serviceType || "Unspecified"}</td>
                          <td className="px-2 py-3 text-slate-600">{formatDate(referral.createdAt)}</td>
                          <td className="px-2 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                referral.referralStatus === "accepted"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : referral.referralStatus === "rejected"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {referral.referralStatus || "pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">User Roles</h2>
              <Shield className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-700"><span>Admins</span><span>{summary.roleBreakdown.admin}</span></div>
              <div className="flex items-center justify-between text-slate-700"><span>Managers</span><span>{summary.roleBreakdown.manager}</span></div>
              <div className="flex items-center justify-between text-slate-700"><span>Practitioners</span><span>{summary.roleBreakdown.practitioner}</span></div>
              <div className="flex items-center justify-between text-slate-700"><span>Employees</span><span>{summary.roleBreakdown.employee}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Top Service Demand</h2>
              <CheckCircle2 className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {summary.topServices.length === 0 ? (
                <p className="text-slate-500">No service usage data yet.</p>
              ) : (
                summary.topServices.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5">
                    <span className="truncate text-slate-700">{item.name}</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
            <div className="mt-3 grid gap-2">
              <a href="/admin/dashboard/analytics" className="rounded-md border border-blue-700 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Open Analytics & KPI</a>
              <a href="/admin/dashboard/services" className="rounded-md border border-blue-700 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Open Service Management</a>
              <a href="/admin/dashboard/referrals" className="rounded-md border border-blue-700 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Open Referral Triage</a>
              <a href="/admin/dashboard/users" className="rounded-md border border-blue-700 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Open User Role Console</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};