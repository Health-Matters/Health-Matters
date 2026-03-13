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
  REPORT_SUMMARY,
  REPORT_TRENDS,
  SLA_STATUS
} from "./reportData";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export const ManagerTestReports = () => {

  const exportCSV = () => {

    const rows = [
      ["Metric", "Value"],
      ["Total Referrals", REPORT_SUMMARY.totalReferrals],
      ["Resolved Cases", REPORT_SUMMARY.resolvedCases],
      ["Avg Resolution Time", REPORT_SUMMARY.avgResolutionTime],
      ["SLA Compliance", REPORT_SUMMARY.slaCompliance + "%"]
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map(e => e.join(",")).join("\n");

    const link = document.createElement("a");

    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "manager_report.csv");

    document.body.appendChild(link);

    link.click();

  };

  const printReport = () => {
    window.print();
  };

  return (

    <div className="space-y-6">

      {/* TITLE */}

      <div>

        <h1 className="text-2xl font-bold">
          Manager Reports
        </h1>

        <p className="text-sm text-gray-500">
          Export and analyse team wellbeing trends
        </p>

      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-4 gap-4">

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Referrals</p>
          <p className="text-2xl font-bold">{REPORT_SUMMARY.totalReferrals}</p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Resolved Cases</p>
          <p className="text-2xl font-bold">{REPORT_SUMMARY.resolvedCases}</p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Avg Resolution Time</p>
          <p className="text-2xl font-bold">
            {REPORT_SUMMARY.avgResolutionTime} days
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">SLA Compliance</p>
          <p className="text-2xl font-bold">
            {REPORT_SUMMARY.slaCompliance}%
          </p>
        </div>

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* REFERRAL TREND */}

        <div className="bg-white border rounded-lg p-6 shadow-sm">

          <h2 className="mb-4 font-semibold">
            Referral Trend
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={REPORT_TRENDS}>

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

        {/* SLA STATUS */}

        <div className="bg-white border rounded-lg p-6 shadow-sm">

          <h2 className="mb-4 font-semibold">
            SLA Status
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={SLA_STATUS}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >

                {SLA_STATUS.map((entry, index) => (
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

      {/* ACTION BUTTONS */}

      <div className="flex gap-4">

        <button
          onClick={exportCSV}
          className="bg-slate-900 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>

        <button
          onClick={printReport}
          className="border px-4 py-2 rounded"
        >
          Print Report
        </button>

      </div>

    </div>

  );

};