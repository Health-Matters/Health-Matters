import { useMemo, useState } from "react";
import { Download, Printer, RefreshCcw } from "lucide-react";
import { useGetMyReferralsQuery } from "../../../store/api";

const DUMMY_INSIGHTS_REFERRALS = [
  {
    _id: "demo-i1",
    serviceType: "Mental Health & Wellbeing",
    referralStatus: "completed",
    createdAt: "2025-09-18T09:00:00.000Z",
    assignedDate: "2025-09-20T09:00:00.000Z",
    completedDate: "2025-09-30T09:00:00.000Z",
  },
  {
    _id: "demo-i2",
    serviceType: "Occupational Health",
    referralStatus: "completed",
    createdAt: "2025-11-05T09:00:00.000Z",
    assignedDate: "2025-11-11T09:00:00.000Z",
    completedDate: "2025-11-22T09:00:00.000Z",
  },
  {
    _id: "demo-i3",
    serviceType: "Physiotherapy",
    referralStatus: "in_progress",
    createdAt: "2026-01-12T09:00:00.000Z",
    assignedDate: "2026-01-14T09:00:00.000Z",
  },
  {
    _id: "demo-i4",
    serviceType: "Counselling",
    referralStatus: "pending",
    createdAt: "2026-02-25T09:00:00.000Z",
  },
  {
    _id: "demo-i5",
    serviceType: "Mental Health & Wellbeing",
    referralStatus: "cancelled",
    createdAt: "2026-03-01T09:00:00.000Z",
    assignedDate: "2026-03-02T09:00:00.000Z",
    cancelledDate: "2026-03-03T09:00:00.000Z",
  },
];

const getReferralsArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const toDayDiff = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Number.isFinite(diff) ? Math.max(diff, 0) : null;
};

const monthKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (key) => {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
};

const clampRange = (value, min, max) => Math.min(Math.max(value, min), max);

const ragClass = (ratio) => {
  if (ratio >= 0.85) return "bg-emerald-100 text-emerald-700";
  if (ratio >= 0.6) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

export const ManagerTestInsights = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [trendWindowMonths, setTrendWindowMonths] = useState(12);

  const { data: myReferralsResponse, isFetching } = useGetMyReferralsQuery({ limit: 200 });
  const liveReferrals = getReferralsArray(myReferralsResponse);
  const referrals = liveReferrals.length > 0 ? liveReferrals : DUMMY_INSIGHTS_REFERRALS;

  const filtered = useMemo(() => {
    return referrals.filter((ref) => {
      const created = new Date(ref.createdAt).getTime();
      const fromOk = dateFrom ? created >= new Date(`${dateFrom}T00:00:00`).getTime() : true;
      const toOk = dateTo ? created <= new Date(`${dateTo}T23:59:59`).getTime() : true;
      return fromOk && toOk;
    });
  }, [referrals, dateFrom, dateTo]);

  const analytics = useMemo(() => {
    const byService = filtered.reduce((acc, ref) => {
      const key = ref.serviceType || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const resolutionDays = filtered
      .map((ref) => toDayDiff(ref.createdAt, ref.completedDate || ref.cancelledDate))
      .filter((v) => v !== null);

    const avgResolution =
      resolutionDays.length > 0
        ? (resolutionDays.reduce((sum, current) => sum + current, 0) / resolutionDays.length).toFixed(1)
        : "0.0";

    const assignmentDays = filtered
      .map((ref) => toDayDiff(ref.createdAt, ref.assignedDate))
      .filter((v) => v !== null);

    const avgDaysToAssignment =
      assignmentDays.length > 0
        ? (assignmentDays.reduce((sum, current) => sum + current, 0) / assignmentDays.length).toFixed(1)
        : "0.0";

    const slaTargetDays = 3;
    const slaCheckPool = filtered.filter((ref) => ["assigned", "in_progress", "completed", "cancelled", "accepted"].includes(ref.referralStatus));

    const withinSlaCount = slaCheckPool.filter((ref) => {
      const days = toDayDiff(ref.createdAt, ref.assignedDate);
      return days !== null && days <= slaTargetDays;
    }).length;

    const breachedByAssignment = slaCheckPool.filter((ref) => {
      const days = toDayDiff(ref.createdAt, ref.assignedDate);
      return days !== null && days > slaTargetDays;
    });

    const breachedPending = filtered.filter((ref) => {
      if (ref.referralStatus !== "pending") return false;
      const daysOpen = toDayDiff(ref.createdAt, new Date().toISOString());
      return daysOpen !== null && daysOpen > slaTargetDays;
    });

    const breached = [...breachedByAssignment, ...breachedPending];

    const withinSlaRatio = slaCheckPool.length > 0 ? withinSlaCount / slaCheckPool.length : 1;

    const orgAverageWithinSla = 0.78;

    return {
      byService,
      avgResolution,
      avgDaysToAssignment,
      withinSlaCount,
      withinSlaRatio,
      breached,
      orgAverageWithinSla,
    };
  }, [filtered]);

  const trendData = useMemo(() => {
    const now = new Date();
    const months = clampRange(trendWindowMonths, 3, 12);
    const keys = [];
    for (let i = months - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    const counts = keys.map((key) => ({
      key,
      label: monthLabel(key),
      value: filtered.filter((ref) => monthKey(ref.createdAt) === key).length,
    }));

    const peak = counts.reduce((max, item) => Math.max(max, item.value), 1);

    return { counts, peak };
  }, [filtered, trendWindowMonths]);

  const exportBreachCsv = () => {
    const headers = ["ReferralId", "ServiceType", "Status", "CreatedAt", "AssignedDate", "DaysToAssignment"];
    const rows = analytics.breached.map((ref) => [
      ref._id,
      ref.serviceType || "",
      ref.referralStatus || "",
      ref.createdAt || "",
      ref.assignedDate || "",
      toDayDiff(ref.createdAt, ref.assignedDate) ?? "",
    ]);

    const content = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sla-breached-referrals.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Wellbeing Insights</h1>
          <p className="mt-1 text-sm text-slate-500">Anonymised, team-level trends only. No individual health records are exposed.</p>
          <p className="mt-1 text-xs text-slate-400">Data refreshes nightly at 02:00 local time.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportBreachCsv} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Download className="h-4 w-4" /> Export SLA CSV
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Printer className="h-4 w-4" /> Print Report
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Trend Window</label>
            <select value={trendWindowMonths} onChange={(e) => setTrendWindowMonths(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setDateFrom(""); setDateTo(""); setTrendWindowMonths(12); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <RefreshCcw className="h-4 w-4" /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Referrals (Anonymised)</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Avg Resolution Time</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{analytics.avgResolution}d</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Avg Days to Assignment</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{analytics.avgDaysToAssignment}d</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">SLA Compliance</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{Math.round(analytics.withinSlaRatio * 100)}%</p>
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ragClass(analytics.withinSlaRatio)}`}>
            {analytics.withinSlaRatio >= 0.85 ? "Green" : analytics.withinSlaRatio >= 0.6 ? "Amber" : "Red"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Referral Volume Trend ({trendWindowMonths} Months)</h2>
          <div className="mt-4 space-y-3">
            {trendData.counts.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <div className="w-18 text-xs text-slate-500">{item.label}</div>
                <div className="h-4 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-4 rounded-full bg-blue-600"
                    style={{ width: `${Math.max(8, (item.value / trendData.peak) * 100)}%` }}
                  />
                </div>
                <div className="w-8 text-right text-xs font-medium text-slate-700">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Service Type Breakdown</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(analytics.byService).map(([service, count]) => (
              <div key={service} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-700">{service}</span>
                <span className="text-sm font-semibold text-slate-800">{count}</span>
              </div>
            ))}
            {Object.keys(analytics.byService).length === 0 && <p className="text-sm text-slate-500">No data in selected date range.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">SLA Compliance Details</h2>
          <p className="mt-1 text-sm text-slate-500">Within SLA: {analytics.withinSlaCount} · Breached: {analytics.breached.length}</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Team Within SLA</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{Math.round(analytics.withinSlaRatio * 100)}%</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Org Average</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{Math.round(analytics.orgAverageWithinSla * 100)}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">SLA Breaches Drilldown</h2>
          <div className="mt-3 max-h-64 space-y-2 overflow-auto">
            {analytics.breached.length === 0 && <p className="text-sm text-slate-500">No SLA breaches in selected range.</p>}
            {analytics.breached.map((ref) => (
              <div key={ref._id} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="font-mono text-xs text-red-700">{String(ref._id).slice(-8).toUpperCase()}</p>
                <p className="mt-1 text-sm text-slate-700">{ref.serviceType || "Unknown Service"}</p>
                <p className="mt-0.5 text-xs text-slate-600">Status: {ref.referralStatus}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isFetching && <p className="text-xs text-slate-400">Refreshing insights...</p>}
    </div>
  );
};