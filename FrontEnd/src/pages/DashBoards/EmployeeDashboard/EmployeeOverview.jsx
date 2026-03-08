import React, { useState } from "react";
import { 
  Clock, 
  FileText, 
  CalendarDays, 
  BookOpen, 
  PlusCircle, 
  TrendingUp,
  User,
  X,
  ClipboardList,
  Calendar as CalendarIcon
} from "lucide-react";
import { Link } from "react-router";

export const EmployeeOverview = () => {
  // State to track which referral is selected for the popup
  const [selectedReferral, setSelectedReferral] = useState(null);

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-1">A summary of your health journey and referral activity.</p>
      </div>

      {/* 2. Top Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Wait Time" 
          value="4 days" 
          subtext="Dr. Michell Micheal" 
          icon={Clock} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-600" 
        />
        <StatCard 
          title="Total Referrals" 
          value="7" 
          subtext="2 pending review" 
          icon={FileText} 
          iconBg="bg-amber-50" 
          iconColor="text-amber-600"
          trend="+2 this month"
        />
        <StatCard 
          title="Upcoming Appointments" 
          value="5" 
          subtext="Next in 4 days" 
          icon={CalendarDays} 
          iconBg="bg-purple-50" 
          iconColor="text-purple-600" 
        />
        <StatCard 
          title="Advice Sheets Accessed" 
          value="3" 
          subtext="This Month" 
          icon={BookOpen} 
          iconBg="bg-emerald-50" 
          iconColor="text-emerald-600"
          trend="+1 last week"
        />
      </div>

      {/* 3. Referral History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Referral History</h3>
          <Link 
            to="/employee/dashboard/submit-referral" 
            className="text-emerald-700 font-medium flex items-center gap-1 hover:text-emerald-800 transition-colors text-sm"
          >
            New referral <PlusCircle size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Referral ID</th>
                <th className="px-6 py-4 font-semibold">Date Submitted</th>
                <th className="px-6 py-4 font-semibold">Service Type</th>
                <th className="px-6 py-4 font-semibold text-left">Status</th>
                <th className="px-6 py-4 font-semibold text-right"></th> {/* Header name is blank */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <ReferralRow 
                id="REF-882" 
                date="28 Feb 2026" 
                type="Occupational Health" 
                status="Pending" 
                onView={() => setSelectedReferral({
                  id: "REF-882", 
                  date: "28 Feb 2026", 
                  type: "Occupational Health", 
                  status: "Pending",
                  reason: "Persistent back pain following workspace change. Required ergonomic assessment and clinical review."
                })}
              />
              <ReferralRow 
                id="REF-841" 
                date="24 Feb 2026" 
                type="Mental Health" 
                status="In Progress" 
                onView={() => setSelectedReferral({
                  id: "REF-841", 
                  date: "24 Feb 2026", 
                  type: "Mental Health", 
                  status: "In Progress",
                  reason: "Work-related stress consultation and mental wellbeing check-in."
                })}
              />
              <ReferralRow 
                id="REF-790" 
                date="18 Feb 2026" 
                type="Physiotherapy" 
                status="Completed" 
                onView={() => setSelectedReferral({
                  id: "REF-790", 
                  date: "18 Feb 2026", 
                  type: "Physiotherapy", 
                  status: "Completed",
                  reason: "Routine follow-up for sports-related knee injury."
                })}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Patient History Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Patient History Timeline</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Appointment Type</th>
                <th className="px-6 py-4 font-semibold">Doctor Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <HistoryRow date="15 Mar 2026" type="Physiotherapy Session" doctor="Dr. Sarah Jenkins" isUpcoming />
              <HistoryRow date="10 Feb 2026" type="Initial Consultation" doctor="Dr. Michael Chen" />
              <HistoryRow date="22 Jan 2026" type="Mental Health Check" doctor="Dr. Elena Rodriguez" />
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. REFERRAL DETAIL POPUP (MODAL) */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/30">
              <div>
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Referral Details</p>
                <h3 className="font-bold text-xl text-slate-800">{selectedReferral.id}</h3>
              </div>
              {/* Cross icon removed as requested */}
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <ModalInfo label="Date Submitted" value={selectedReferral.date} icon={<CalendarIcon size={14} />} />
                <ModalInfo label="Current Status" value={selectedReferral.status} icon={<Clock size={14} />} />
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service Type</p>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <ClipboardList size={16} className="text-emerald-600" />
                  {selectedReferral.type}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reason for Referral</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 italic leading-relaxed">
                  "{selectedReferral.reason}"
                </div>
              </div>

              <button 
                onClick={() => setSelectedReferral(null)}
                className="w-full py-4 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-lg shadow-emerald-700/20 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const ModalInfo = ({ label, value, icon }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
      <span className="text-emerald-600">{icon}</span>
      {value}
    </div>
  </div>
);

const StatCard = ({ title, value, subtext, icon: Icon, iconBg, iconColor, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
    </div>
    <div className="flex items-center gap-2">
      {trend && (
        <span className="flex items-center text-xs font-medium text-emerald-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend}
        </span>
      )}
      <span className="text-xs text-slate-400">{subtext}</span>
    </div>
  </div>
);

const ReferralRow = ({ id, date, type, status, onView }) => {
  const statusStyles = {
    'Pending': 'bg-amber-100 text-amber-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700'
  };
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4 text-sm text-slate-400 font-mono">{id}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{date}</td>
      <td className="px-6 py-4 font-semibold text-slate-800">{type}</td>
      <td className="px-6 py-4 text-left">
        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyles[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={onView}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          View Details
        </button>
      </td>
    </tr>
  );
};

const HistoryRow = ({ date, type, doctor, isUpcoming = false }) => (
  <tr className="hover:bg-slate-50 transition-colors group">
    <td className={`px-6 py-4 font-medium w-1/4 ${isUpcoming ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
      {date}
    </td>
    <td className="px-6 py-4 font-semibold text-slate-800 w-1/3">{type}</td>
    <td className="px-6 py-4 text-slate-600">
      <div className="flex items-center gap-2">
        <User size={14} className="text-slate-300" />
        {doctor}
      </div>
    </td>
  </tr>
);