import React, { useState } from "react";
import { useGetReferralsQuery, useUpdateReferralByIdMutation } from "@/store/api/referralsApi";

export const PractitionerTestOverview = () => {
  const [search, setSearch] = useState("");

  const {
    data: referrals = [],
    isLoading,
    isError,
    error,
  } = useGetReferralsQuery();

  const [updateReferral, { isLoading: isUpdating }] = useUpdateReferralByIdMutation();
  // Track which referral ID is currently being actioned so we can show a per-row spinner
  const [actioningId, setActioningId] = useState(null);

  // Filter by patient ID or referral ID
  const filtered = referrals.filter(
    (r) =>
      r.patientClerkUserId?.toLowerCase().includes(search.toLowerCase()) ||
      r._id?.toLowerCase().includes(search.toLowerCase())
  );

  // Summary counts — a referral is "unassigned" when it has no practitionerClerkUserId
  const summary = {
    unassigned: referrals.filter((r) => !r.practitionerClerkUserId).length,
    accepted: referrals.filter((r) => r.referralStatus === "accepted").length,
    rejected: referrals.filter((r) => r.referralStatus === "rejected").length,
  };

  // Accept or reject a referral.
  // The backend reads the practitioner's Clerk ID directly from the token,
  // so we never need to pass it from the frontend.
  const handleDecision = async (referralId, status) => {
    setActioningId(referralId);
    try {
      await updateReferral({
        referralId,
        body: { referralStatus: status },
      }).unwrap();
    } catch (err) {
      console.error("Failed to update referral:", err);
      alert(err?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) return <p className="p-8">Loading referrals...</p>;
  if (isError) return <p className="p-8 text-red-600">Error: {error?.message}</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Referral Management Overview
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-yellow-100 p-4 shadow">
          <h3 className="text-sm font-medium text-yellow-800">Unassigned Referrals</h3>
          <p className="text-2xl font-bold text-yellow-900">{summary.unassigned}</p>
        </div>
        <div className="rounded-lg bg-green-100 p-4 shadow">
          <h3 className="text-sm font-medium text-green-800">Accepted Referrals</h3>
          <p className="text-2xl font-bold text-green-900">{summary.accepted}</p>
        </div>
        <div className="rounded-lg bg-red-100 p-4 shadow">
          <h3 className="text-sm font-medium text-red-800">Rejected Referrals</h3>
          <p className="text-2xl font-bold text-red-900">{summary.rejected}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by patient ID or referral ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3 rounded border px-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Referral ID</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Patient Clerk ID</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Date Submitted</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Service Type</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Assigned To</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Assigned From</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r) => {
              const isUnassigned = !r.practitionerClerkUserId;
              const isPending = actioningId === r._id;

              return (
                <tr key={r._id}>
                  <td className="px-4 py-2">{r._id}</td>
                  <td className="px-4 py-2">{r.patientClerkUserId}</td>
                  <td className="px-4 py-2">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{r.serviceType}</td>
                  <td className="px-4 py-2">
                    {/* Show Accept/Reject buttons only for referrals with no practitioner assigned */}
                    {isUnassigned ? (
                      <div className="flex gap-2">
                        <button
                          disabled={isUpdating}
                          onClick={() => handleDecision(r._id, "accepted")}
                          className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {isPending ? "..." : "Accept"}
                        </button>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleDecision(r._id, "rejected")}
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {isPending ? "..." : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          r.referralStatus === "accepted"
                            ? "bg-green-100 text-green-800"
                            : r.referralStatus === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {r.referralStatus}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">{r.practitionerClerkUserId || "-"}</td>
                  <td className="px-4 py-2">{r.assignedByClerkUserId || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-4 py-2 text-sm text-gray-600">
          Showing {filtered.length} of {referrals.length} referrals
        </div>
      </div>
    </div>
  );
};