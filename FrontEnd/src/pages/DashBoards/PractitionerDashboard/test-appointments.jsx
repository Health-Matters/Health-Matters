import { useState } from "react";

const TIME_SLOTS = [
  "08:00", "08:30",
  "09:00", "09:30",
  "10:00", "10:30",
  "11:00", "11:30",
];

function formatDateKey(date) {
  return date.toISOString().split("T")[0];
}

const INITIAL_APPOINTMENTS = {
  "2026-03-08": [
    { id: 1, patient: "John Doe", patientId: "P-1001", serviceType: "Physiotherapy", startTime: "08:30", endTime: "09:15" },
    { id: 2, patient: "Jane Smith", patientId: "P-1002", serviceType: "Dental", startTime: "09:30", endTime: "10:00" },
    { id: 3, patient: "Alex Johnson", patientId: "P-1003", serviceType: "Cardiology", startTime: "10:30", endTime: "11:30" },
  ],
  "2026-03-10": [
    { id: 4, patient: "Mary Wilson", patientId: "P-1004", serviceType: "Neurology", startTime: "08:00", endTime: "08:45" },
    { id: 5, patient: "Peter Parker", patientId: "P-1005", serviceType: "General Practice", startTime: "09:00", endTime: "09:30" },
  ],
  "2026-03-11": [
    { id: 6, patient: "Mary Wilson", patientId: "P-1004", serviceType: "Neurology", startTime: "09:00", endTime: "09:45" },
    { id: 7, patient: "Peter Parker", patientId: "P-1005", serviceType: "General Practice", startTime: "11:00", endTime: "11:30" },
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
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);

  const dateKey = formatDateKey(selectedDate);
  const appointmentsForDate = appointments[dateKey] || [];

  const appointmentsByStartTime = {};
  appointmentsForDate.forEach((appt) => {
    appointmentsByStartTime[appt.startTime] = appt;
  });

  const handlePrevDay = () => setSelectedDate((prev) => addDays(prev, -1));
  const handleNextDay = () => setSelectedDate((prev) => addDays(prev, 1));
  const handleToday = () => setSelectedDate(new Date());

  const handleCancelAppointment = (id) => {
    setAppointments((prev) => {
      const updated = { ...prev };
      updated[dateKey] = updated[dateKey].filter((appt) => appt.id !== id);
      return updated;
    });
    alert("Appointment cancelled successfully.");
  };

  const getAppointmentsForPatient = (patientId) => {
    const allAppointments = [];
    Object.entries(appointments).forEach(([date, appts]) => {
      appts.forEach((a) => {
        if (a.patientId === patientId) {
          allAppointments.push({ ...a, date });
        }
      });
    });
    return allAppointments;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
        <div className="space-x-2">
          <button onClick={handleToday} className="bg-blue-100 text-blue-700 px-3 py-1 rounded">Today</button>
          <button onClick={handlePrevDay} className="border px-3 py-1 rounded hover:bg-gray-100">&lt;</button>
          <button onClick={handleNextDay} className="border px-3 py-1 rounded hover:bg-gray-100">&gt;</button>
        </div>
      </div>

      {/* Time slots */}
      <div className="divide-y divide-gray-200 border rounded-md">
        {TIME_SLOTS.map((time) => {
          const appt = appointmentsByStartTime[time];
          return (
            <div key={time} className="flex items-center px-4 py-3 min-h-12">
              <div className="w-20 text-gray-500 font-mono">{time}</div>
              <div className="flex-1 ml-4 text-sm text-gray-700">
                {!appt ? (
                  <span className="italic text-gray-400">No appointments</span>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedPatient(appt)}
                      className="flex-1 text-left p-2 bg-blue-100 rounded text-blue-800 hover:bg-blue-200 mr-2"
                    >
                      <div><strong>{appt.patient}</strong> <span className="text-xs text-gray-500">({appt.patientId})</span></div>
                      <div className="text-xs italic text-gray-600">{appt.serviceType}</div>
                      <div className="text-xs text-gray-600">{appt.startTime} - {appt.endTime}</div>
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(appt.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-2">{selectedPatient.patient}</h3>
            <p className="text-sm text-gray-600 mb-4">Patient ID: {selectedPatient.patientId}</p>

            <h4 className="font-medium mb-2">Appointments:</h4>
            <ul className="space-y-2 text-sm">
              {getAppointmentsForPatient(selectedPatient.patientId).map((appt) => (
                <li key={appt.id} className="border rounded p-2">
                  <div className="font-semibold">{appt.serviceType}</div>
                  <div className="text-gray-600">{appt.date} | {appt.startTime} - {appt.endTime}</div>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectedPatient(null)}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
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
