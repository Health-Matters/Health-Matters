import React, { useMemo, useState } from "react";
import { CalendarDays, UserRoundCheck, X, BellRing, FileText, CheckCircle2 } from "lucide-react";
import { useGetNotificationsQuery } from "../../../store/api";

/*
 Team E - Employee in-app notifications page with polling and grouped rendering (TME-001) . Done by Abhiman and Methmi
 Team D - Shared manager/employee notification visualization behavior support (TMD-001) . Done by Ramiru
*/

const formatDateGroup = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return "Earlier";
};

const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getIcon = (type) => {
  switch (type) {
    case "referral_submitted":
    case "referral_triaged":
      return <BellRing className="text-sky-500" size={18} />;
    case "referral_assigned":
      return <CheckCircle2 className="text-emerald-500" size={18} />;
    case "appointment_scheduled":
    case "appointment_reminder_24h":
    case "appointment_reminder_1h":
      return <CalendarDays className="text-orange-400" size={18} />;
    case "appointment_cancelled":
      return <X className="text-red-500" size={18} />;
    case "outcome_report_ready":
    case "follow_up_required":
      return <FileText className="text-purple-500" size={18} />;
    case "appointment_completed":
      return <CheckCircle2 className="text-emerald-500" size={18} />;
    default:
      return <UserRoundCheck className="text-slate-500" size={18} />;
  }
};

export const Notifications = () => {
  const [selectedNote, setSelectedNote] = useState(null);

  const { data, isLoading, isError } = useGetNotificationsQuery(undefined, {
    pollingInterval: 10000,
  });

  const notifications = data ?? [];

  const enrichedNotifications = useMemo(() => {
    return notifications.map((notification) => {
      const date = notification.createdAt || notification.updatedAt || new Date().toISOString();
      return {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        date: formatDisplayDate(date),
        group: formatDateGroup(date),
        type: notification.type,
      };
    });
  }, [notifications]);

  const hasNotifications = enrichedNotifications.length > 0;
  const showEmptyState = !isLoading && !hasNotifications;

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {isError && (
        <div className="m-6 rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700">
          <p className="text-sm font-semibold">
            Unable to load notifications. Showing available data. Please try again later.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="m-6 text-slate-700">
          <p className="text-lg font-semibold">Loading notifications…</p>
        </div>
      )}

      <div className="flex-1 m-2 flex gap-4 overflow-hidden">

        {/* LEFT SIDE: Notification List */}
        <div className={`flex flex-col transition-all duration-300 ${selectedNote ? "w-[40%]" : "w-full"}`}>
          <div>
            <h1 className="text-3xl font-bold text-[#001F3F]">Notifications</h1>
          </div>

          <div className="flex justify-between items-center mb-4 px-1 border-b border-green-200 flex-shrink-0">
            <div className="text-slate-500 text-sm font-bold pb-2">
              <span>All notifications</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {showEmptyState ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-lg font-semibold">No notifications yet.</p>
                <p className="mt-2 text-sm">You'll see updates here when new notifications arrive.</p>
              </div>
            ) : (
              ["Today", "Yesterday", "Earlier"].map((group) => {
                const groupNotes = enrichedNotifications.filter((n) => n.group === group);
                if (groupNotes.length === 0) return null;

                return (
                  <div key={group} className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 ml-1">{group}</h3>
                    <div className="space-y-3">
                      {groupNotes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => setSelectedNote(note)}
                          className={`cursor-pointer rounded-2xl flex items-center justify-between p-4 shadow-sm border transition-all ${
                            selectedNote?.id === note.id
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-4 truncate">
                            <div className="flex-shrink-0">
                              {getIcon(note.type)}
                            </div>
                            <div className="truncate">
                              <p className="text-sm truncate font-medium text-slate-800">
                                {note.title}
                              </p>
                              <p className="text-slate-400 text-[10px] mt-1 font-bold">{note.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Detail View */}
        {selectedNote && (
          <div className="w-[60%] bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col h-full animate-in slide-in-from-right-4">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                {getIcon(selectedNote.type)}
                <h2 className="font-bold text-slate-800 text-lg">Message Detail</h2>
              </div>
              <button onClick={() => setSelectedNote(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <p className="text-xs text-slate-400 font-bold uppercase mb-2">{selectedNote.date}</p>
              <h3 className="text-xl font-bold text-slate-900 mb-6">{selectedNote.title}</h3>
              <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedNote.message}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};