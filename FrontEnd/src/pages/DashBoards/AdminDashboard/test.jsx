import { useMemo, useState } from "react";

export const TestFeature = () => {
  const [referrals, setReferrals] = useState([
    {
      _id: "REF-001",
      patientClerkUserId: "user_patient001",
      serviceType: "physiotherapy",
      referralStatus: "pending",
      urgency: "High",
      assignedTo: "",
    },
    {
      _id: "REF-002",
      patientClerkUserId: "user_patient002",
      serviceType: "mental_health",
      referralStatus: "accepted",
      urgency: "Medium",
      assignedTo: "Dr. Sarah Mitchell",
    },
    {
      _id: "REF-003",
      patientClerkUserId: "user_patient003",
      serviceType: "counselling",
      referralStatus: "rejected",
      urgency: "Low",
      assignedTo: "",
    },
  ]);

  const [patientId, setPatientId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const practitioners = [
    "Dr. Sarah Mitchell",
    "Dr. James Wilson",
    "Dr. Emily Chen",
  ];

  const handleCreateReferral = () => {
    if (!patientId.trim() || !serviceType.trim()) return;

    const newReferral = {
      _id: `REF-00${referrals.length + 1}`,
      patientClerkUserId: patientId,
      serviceType,
      referralStatus: "pending",
      urgency,
      assignedTo: "",
    };

    setReferrals((prev) => [newReferral, ...prev]);
    setPatientId("");
    setServiceType("");
    setUrgency("Medium");
  };

  const handleAssign = (referralId, practitionerName) => {
    setReferrals((prev) =>
      prev.map((ref) =>
        ref._id === referralId
          ? { ...ref, assignedTo: practitionerName, referralStatus: "accepted" }
          : ref
      )
    );
  };

  const handleStatusChange = (referralId, newStatus) => {
    setReferrals((prev) =>
      prev.map((ref) =>
        ref._id === referralId ? { ...ref, referralStatus: newStatus } : ref
      )
    );
  };

  const filteredReferrals = useMemo(() => {
    return referrals.filter((ref) => {
      const matchesSearch =
        ref._id.toLowerCase().includes(search.toLowerCase()) ||
        ref.patientClerkUserId.toLowerCase().includes(search.toLowerCase()) ||
        ref.serviceType.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || ref.referralStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [referrals, search, statusFilter]);

  const getStatusClasses = (status) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "accepted") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const getUrgencyClasses = (level) => {
    if (level === "High") return "bg-red-100 text-red-700";
    if (level === "Medium") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Referrals Dashboard</h1>
        <p className="text-gray-500">
          Manage referrals, assign practitioners, and review statuses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500 mb-1">Total Referrals</p>
          <p className="text-3xl font-bold">{referrals.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-3xl font-bold">
            {referrals.filter((r) => r.referralStatus === "pending").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500 mb-1">Accepted</p>
          <p className="text-3xl font-bold">
            {referrals.filter((r) => r.referralStatus === "accepted").length}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Create Referral</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Patient Clerk ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Service Type"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={handleCreateReferral}
            className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
          >
            Create
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">Referrals</h2>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by ID, patient, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Referral ID</th>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Urgency</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Assigned</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReferrals.map((ref) => (
                <tr key={ref._id} className="border-t">
                  <td className="p-3">{ref._id}</td>
                  <td className="p-3">{ref.patientClerkUserId}</td>
                  <td className="p-3">{ref.serviceType}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${getUrgencyClasses(
                        ref.urgency
                      )}`}
                    >
                      {ref.urgency}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${getStatusClasses(
                        ref.referralStatus
                      )}`}
                    >
                      {ref.referralStatus}
                    </span>
                  </td>

                  <td className="p-3">
                    <select
                      value={ref.assignedTo}
                      onChange={(e) => handleAssign(ref._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Unassigned</option>
                      {practitioners.map((doctor) => (
                        <option key={doctor} value={doctor}>
                          {doctor}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(ref._id, "accepted")}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleStatusChange(ref._id, "rejected")}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReferrals.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    No referrals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};