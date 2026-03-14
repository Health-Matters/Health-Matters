import { useState } from "react";

const TIME_SLOTS = [
  "08:00", "08:30",
  "09:00", "09:30",
  "10:00", "10:30",
  "11:00", "11:30",
];

// Utility to format date to yyyy-mm-dd string (to key dummy data by date)
function formatDateKey(date) {
  return date.toISOString().split("T")[0];
}

// Dummy appointment data keyed by date string
// Each appointment has id, patient, startTime, endTime, and serviceType
const DUMMY_APPOINTMENTS = {
  "2026-03-03": [
    { id: 1, patient: "John Doe", serviceType: "Physiotherapy", startTime: "08:30", endTime: "09:15" },
    { id: 2, patient: "Jane Smith", serviceType: "Dental", startTime: "09:30", endTime: "10:00" },
    { id: 3, patient: "Alex Johnson", serviceType: "Cardiology", startTime: "10:30", endTime: "11:30" },
  ],
  "2026-03-04": [
    { id: 4, patient: "Mary Wilson", serviceType: "Neurology", startTime: "08:00", endTime: "08:45" },
    { id: 5, patient: "Peter Parker", serviceType: "General Practice", startTime: "09:00", endTime: "09:30" },
  ],
};

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const PractitionerTestAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateKey = formatDateKey(selectedDate);
  const appointmentsForDate = DUMMY_APPOINTMENTS[dateKey] || [];

  // Map startTime to appointment object for quick lookup
  const appointmentsByStartTime = {};
  appointmentsForDate.forEach((appt) => {
    appointmentsByStartTime[appt.startTime] = appt;
  });

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">

      {/* Header with date and navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>

        <div className="space-x-2">
          <button
            onClick={handleToday}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded"
          >
            Today
          </button>
          <button
            onClick={handlePrevDay}
            className="border px-3 py-1 rounded hover:bg-gray-100"
            aria-label="Previous day"
          >
            &lt;
          </button>
          <button
            onClick={handleNextDay}
            className="border px-3 py-1 rounded hover:bg-gray-100"
            aria-label="Next day"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Time slots with appointments */}
      <div className="divide-y divide-gray-200 border rounded-md">
        {TIME_SLOTS.map((time) => {
          const appt = appointmentsByStartTime[time];

          return (
            <div key={time} className="flex items-center px-4 py-3 min-h-[48px]">
              <div className="w-20 text-gray-500 font-mono">{time}</div>

              <div className="flex-1 ml-4 text-sm text-gray-700">
                {!appt ? (
                  <span className="italic text-gray-400">No appointments</span>
                ) : (
                  <div className="p-2 bg-blue-100 rounded text-blue-800">
                    <div><strong>{appt.patient}</strong></div>
                    <div className="text-xs italic text-gray-600">{appt.serviceType}</div>
                    <div className="text-xs text-gray-600">
                      {appt.startTime} - {appt.endTime}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};