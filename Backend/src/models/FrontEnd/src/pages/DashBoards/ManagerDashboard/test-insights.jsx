import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import {
  TEAM_HEALTH_STATS,
  REFERRAL_BY_TYPE,
  REFERRAL_TREND
} from "./managerInsightsData";

const COLORS = ["#2563eb", "#10b981", "#f59e0b"];

export const ManagerTestInsights = () => {

  return (

    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Team Health Overview
        </h1>
        <p className="text-sm text-slate-500">
          Aggregated health trends of your team.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-4">

        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Referrals
          </p>

          <p className="text-3xl font-bold text-slate-800">
            {TEAM_HEALTH_STATS.totalReferrals}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Avg Resolution Time
          </p>

          <p className="text-3xl font-bold text-slate-800">
            {TEAM_HEALTH_STATS.avgResolutionTime} days
          </p>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* REFERRAL TREND */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">

          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Referral Trend (Last 6 Months)
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={REFERRAL_TREND}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="referrals"
                stroke="#2563eb"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

        {/* REFERRAL TYPES */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">

          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Referral Types
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={REFERRAL_BY_TYPE}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >

                {REFERRAL_BY_TYPE.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  );

};