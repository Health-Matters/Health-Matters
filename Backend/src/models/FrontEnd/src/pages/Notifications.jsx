import { Link } from "react-router-dom";

const notifications = [
  {
    id: 1,
    message: "Referral REF-001 assigned to practitioner",
    link: "/manager/dashboard/referral",
    time: "2 minutes ago"
  },
  {
    id: 2,
    message: "Referral REF-002 moved to In Progress",
    link: "/manager/dashboard/referral",
    time: "10 minutes ago"
  },
  {
    id: 3,
    message: "Referral REF-003 completed",
    link: "/manager/dashboard/referral",
    time: "1 hour ago"
  },
  {
    id: 4,
    message: "Referral REF-004 cancelled",
    link: "/manager/dashboard/referral",
    time: "Yesterday"
  }
];

export default function Notifications() {

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Notifications
        </h1>

        <p className="text-sm text-slate-500">
          Updates about referral status changes
        </p>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">

        {notifications.map((n) => (

          <Link
            key={n.id}
            to={n.link}
            className="block p-4 border-b hover:bg-slate-50"
          >

            <p className="text-sm text-slate-700">
              {n.message}
            </p>

            <span className="text-xs text-slate-400">
              {n.time}
            </span>

          </Link>

        ))}

      </div>

    </div>
  );

}