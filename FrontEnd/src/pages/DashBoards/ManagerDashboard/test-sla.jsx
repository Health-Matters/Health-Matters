import { SLA_DATA } from "./slaData";

export function ManagerTestSLA() {

  const total = SLA_DATA.length;

  const within = SLA_DATA.filter(x => x.status === "within").length;
  const warning = SLA_DATA.filter(x => x.status === "warning").length;
  const breach = SLA_DATA.filter(x => x.status === "breach").length;

  const avgDays =
    SLA_DATA.reduce((a, b) => a + b.days, 0) / total;

  return (

    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-semibold">
          SLA Compliance
        </h1>

        <p className="text-sm text-gray-500">
          Team SLA performance monitoring
        </p>
      </div>

      {/* STAT CARDS */}

      <div className="grid grid-cols-5 gap-4">

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Total Referrals</div>
          <div className="text-xl font-bold">{total}</div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Within SLA</div>
          <div className="text-xl font-bold text-green-600">
            {within}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Warning</div>
          <div className="text-xl font-bold text-orange-500">
            {warning}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Breached</div>
          <div className="text-xl font-bold text-red-600">
            {breach}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Avg Days</div>
          <div className="text-xl font-bold">
            {avgDays.toFixed(1)}
          </div>
        </div>

      </div>

      {/* REFERRAL TABLE */}

      <div className="bg-white border rounded-lg shadow-sm">

        <div className="p-3 border-b font-medium">
          Referral SLA Status
        </div>

        <table className="w-full">

          <thead className="bg-gray-50 text-sm">

            <tr>
              <th className="p-2 text-left">Referral ID</th>
              <th className="p-2 text-left">Employee</th>
              <th className="p-2 text-left">Days Open</th>
              <th className="p-2 text-left">Status</th>
            </tr>

          </thead>

          <tbody>

            {SLA_DATA.map(r => (

              <tr key={r.id} className="border-t">

                <td className="p-2">{r.id}</td>
                <td className="p-2">{r.employee}</td>
                <td className="p-2">{r.days}</td>

                <td className="p-2">

                  <span
                    className={
                      r.status === "within"
                        ? "text-green-600 font-medium"
                        : r.status === "warning"
                        ? "text-orange-500 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {r.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* EXPORT BUTTON */}

      <button className="bg-slate-900 text-white px-4 py-2 rounded">
        Export CSV
      </button>

    </div>

  );

}