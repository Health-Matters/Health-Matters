import { useState } from "react";

/*
 Team J - Patient search, patient detail modal, and patient statistics cards (TMJ-005, TMJ-006, TMJ-007) . Done by Senithi, Yahanima, Dulmin, Akith, and Irindu
*/

export const PractitionerTestPatients = () => {

  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const patients = [
    {
      id: "P001",
      name: "John Smith",
      age: 35,
      condition: "Lower Back Pain",
      lastVisit: "24 Feb 2026",
      status: "Active",
      phone: "+94 77 XXXX XXXX",
      email: "john@email.com",
      history: "Chronic back pain",
      appointment: "20 Feb 2026",
      notes: "Physiotherapy recommended"
    },
    {
      id: "P002",
      name: "Sarah Lee",
      age: 29,
      condition: "Diabetes",
      lastVisit: "20 Feb 2026",
      status: "Inactive",
      phone: "+94 77 XXXX XXXX",
      email: "sarah@email.com",
      history: "Type 2 diabetes",
      appointment: "18 Feb 2026",
      notes: "Diet plan recommended"
    }
  ];

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPatients = patients.length;
  const activePatients = patients.filter((patient) => patient.status === "Active").length;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newPatients = patients.filter((patient) => {
    const parsed = new Date(patient.lastVisit);
    return !Number.isNaN(parsed.getTime()) && parsed >= thirtyDaysAgo;
  }).length;

  const handleReport = (patient) => {
    const reportText = [
      "Health Matters Patient Report",
      `Patient ID: ${patient.id}`,
      `Patient Name: ${patient.name}`,
      `Age: ${patient.age}`,
      `Condition: ${patient.condition}`,
      `Status: ${patient.status}`,
      `Last Visit: ${patient.lastVisit}`,
      `Medical History: ${patient.history}`,
      `Appointment: ${patient.appointment}`,
      `Treatment Notes: ${patient.notes}`,
    ].join("\n");

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${patient.id}-report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Welcome */}
      <div className="text-xl font-semibold mb-6">
        Welcome, Dr. Smith
      </div>

      {/* Patient Statistics */}
      <h2 className="text-2xl font-bold mb-4">Patient Statistics</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">

        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500 text-sm">Total Patients</p>
          <p className="text-2xl font-bold">{totalPatients}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500 text-sm">Active Patients</p>
          <p className="text-2xl font-bold">{activePatients}</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500 text-sm">New Patients</p>
          <p className="text-2xl font-bold">{newPatients}</p>
        </div>

      </div>

      {/* Patient List */}
      <h2 className="text-2xl font-bold mb-4">Patient List</h2>

      <input
        type="text"
        placeholder="Search patients..."
        className="border p-2 rounded w-60 mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="bg-white shadow rounded overflow-x-auto">

        <table className="w-full text-left">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Patient ID</th>
              <th className="p-3">Patient Name</th>
              <th className="p-3">Age</th>
              <th className="p-3">Condition</th>
              <th className="p-3">Last Visit</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPatients.map((p) => (
              <tr key={p.id} className="border-t">

                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.age}</td>
                <td className="p-3">{p.condition}</td>
                <td className="p-3">{p.lastVisit}</td>
                <td className="p-3">{p.status}</td>

                <td className="p-3 space-x-2">

                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => setSelectedPatient(p)}
                  >
                    View
                  </button>

                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => handleReport(p)}
                  >
                    Report
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-6">
        <button className="px-3 py-1 border rounded">Previous</button>
        <button className="px-3 py-1 border rounded bg-blue-500 text-white">1</button>
        <button className="px-3 py-1 border rounded">2</button>
        <button className="px-3 py-1 border rounded">3</button>
        <button className="px-3 py-1 border rounded">Next</button>
      </div>

      {/* Modal */}
      {selectedPatient && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg w-125 shadow-lg">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-xl font-bold">Patient Details</h2>

              <button
                className="text-xl"
                onClick={() => setSelectedPatient(null)}
              >
                ✕
              </button>

            </div>

            <div className="space-y-1 text-gray-700">
              <p><b>Name:</b> {selectedPatient.name}</p>
              <p><b>Age:</b> {selectedPatient.age}</p>
              <p><b>Condition:</b> {selectedPatient.condition}</p>
              <p><b>Last Visit:</b> {selectedPatient.lastVisit}</p>
              <p><b>Phone:</b> {selectedPatient.phone}</p>
              <p><b>Email:</b> {selectedPatient.email}</p>
            </div>

            <hr className="my-4" />

            <div className="mb-3">
              <p className="font-semibold">Medical History</p>
              <p className="text-gray-600">{selectedPatient.history}</p>
            </div>

            <div className="mb-3">
              <p className="font-semibold">Appointments</p>
              <p className="text-gray-600">{selectedPatient.appointment}</p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">Treatment Notes</p>
              <p className="text-gray-600">{selectedPatient.notes}</p>
            </div>

            <div className="flex justify-end">
              <button
                className="border px-4 py-2 rounded"
                onClick={() => setSelectedPatient(null)}
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