import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useGetMyPatientReferralsQuery } from "@/store/api/referralsApi";

import {
  User,
  FileText,
  Eye,
  AlertTriangle
} from "lucide-react";

/*
 Team I - Help and advice page, referral list/status cards, clinical summary view, and wellbeing guidance flow (TMI-001, TMI-002, TMI-003, TMI-004, TMI-005) . Done by Sasithi and Yovinma
*/

export const HelpAndAdvice = () => {

  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showClinicalSummary, setShowClinicalSummary] = useState(false);

  const { user } = useUser();

  const { data: referrals, isLoading, error } =
    useGetMyPatientReferralsQuery(undefined, {
      skip: !user?.id,
    });

  const handleCardClick = (ref) => {
    setSelectedReferral(ref);
    setShowClinicalSummary(false);
  };

  const mapStatus = (status) => {
    switch (status) {
      case "pending":
        return "PENDING";
      case "assigned":
        return "IN_PROGRESS";
      case "completed":
        return "COMPLETED";
      default:
        return "PENDING";
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            COMPLETED
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            IN PROGRESS
          </span>
        );
      case "PENDING":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            PENDING
          </span>
        );
      default:
        return null;
    }
  };

  /* ---------------- MOCK DATA (REMOVE LATER) ---------------- */

  const mockReferrals = [
    {
      _id: "REF-790",
      serviceType: "Physiotherapy",
      referralStatus: "completed",
      createdAt: new Date(),
      practitionerName: "Dr. Sarah Jenkins",
      clinicalSummary:
        "Initial physiotherapy assessment completed for lower back pain. Patient advised to perform daily stretching exercises and maintain proper posture during work hours. Follow-up recommended in 4 weeks."
    },
    {
      _id: "REF-841",
      serviceType: "Mental Health",
      referralStatus: "assigned",
      createdAt: new Date(),
      practitionerName: null
    },
    {
      _id: "REF-882",
      serviceType: "Occupational Health",
      referralStatus: "pending",
      createdAt: new Date(),
      practitionerName: null
    }
  ];

  /* ---------- Correct logic for backend vs mock ---------- */

  const showMockData = error && (!referrals || referrals.length === 0);

  const referralList = showMockData
    ? mockReferrals
    : referrals || [];

  /* ------------------------------------------------------- */

  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold mb-3">Help & Advice</h1>

      <p className="text-gray-600 mb-8">
        Access your care plans and clinical guidance.
      </p>

      <div className="flex relative items-start">

        {/* LEFT SIDE */}

        <div
          className={`${selectedReferral ? "w-[60%] pr-8" : "w-full"} transition-all duration-300`}
        >
          <div className="bg-white rounded-2xl shadow-sm p-10">

            <h2 className="text-3xl font-semibold mb-8">
              Your Care Plans
            </h2>

            <div className="space-y-6">

              {isLoading && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-600">
                  Loading your care plans...
                </div>
              )}

              {showMockData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 text-yellow-700 font-semibold mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Backend unavailable
                  </div>

                  <p className="text-sm text-yellow-700">
                    Unable to retrieve referrals from the server. Displaying sample data for testing.
                  </p>
                </div>
              )}

              {!isLoading && !showMockData && referralList.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-600">
                  You currently have no referrals.
                </div>
              )}

              {!isLoading && referralList.length > 0 && referralList.map((ref) => {

                const status = mapStatus(ref.referralStatus);

                const uiRef = {
                  id: ref._id,
                  service: ref.serviceType,
                  date: new Date(ref.createdAt).toLocaleDateString(),
                  doctor: ref.practitionerName || null,
                  status,
                  clinicalSummary: ref.clinicalSummary
                };

                const isSelected = selectedReferral?.id === uiRef.id;

                return (

                  <div
                    key={uiRef.id}
                    onClick={() => handleCardClick(uiRef)}
                    className={`p-6 rounded-xl transition border cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 shadow-sm"
                        : "bg-gray-50 hover:bg-gray-100 border-transparent"
                    }`}
                  >

                    <div className="flex justify-between items-start">

                      <div>

                        <h3 className="text-lg font-semibold text-gray-800">
                          {uiRef.service}
                        </h3>

                        <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                          {uiRef.id}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Submitted on {uiRef.date}
                        </p>

                        {uiRef.doctor && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{uiRef.doctor}</span>
                          </div>
                        )}

                      </div>

                      {renderStatusBadge(uiRef.status)}

                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}

        {selectedReferral && (

          <div className="w-[40%] bg-white rounded-2xl shadow-md p-10 relative self-start">

            <button
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700"
              onClick={() => setSelectedReferral(null)}
            >
              ✕
            </button>

            <h2 className="text-3xl font-semibold mb-2 text-gray-800">
              {selectedReferral.service}
            </h2>

            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              {selectedReferral.id}
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Submitted on {selectedReferral.date}
            </p>

{/* COMPLETED */}

{selectedReferral.status === "COMPLETED" && (
  <>
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <User className="w-4 h-4 text-gray-400" />
      <span>Provided by {selectedReferral.doctor}</span>
    </div>

    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-3 text-red-700 font-semibold">
        <AlertTriangle className="w-4 h-4" />
        When to Seek Help
      </div>

      <ul className="list-disc list-inside space-y-2 text-red-700 text-sm">
        <li>Seek urgent medical care if symptoms suddenly worsen.</li>
        <li>Contact your GP if pain or discomfort increases significantly.</li>
        <li>Attend emergency services if you experience severe or unusual symptoms.</li>
      </ul>
    </div>

    <h3 className="font-semibold mb-4">Care Documents</h3>

    <div className="space-y-3">

      <div
        onClick={() => setShowClinicalSummary(!showClinicalSummary)}
        className="bg-gray-50 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100"
      >

        <div>
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <FileText className="w-4 h-4" />
            Clinical Summary
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {showClinicalSummary ? "Click to hide" : "Click to view"}
          </p>
        </div>

        <Eye className="w-4 h-4 text-gray-400" />

      </div>

    </div>

    {showClinicalSummary && (
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-800 mb-2">
          Clinical Summary
        </h3>

        <p className="text-sm text-blue-700">
          {selectedReferral.clinicalSummary ||
           "No clinical summary available yet."}
        </p>
      </div>
    )}
  </>
)}

{/* PENDING / IN_PROGRESS */}

{selectedReferral.status !== "COMPLETED" && (
  <>
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <h3 className="font-semibold text-blue-800 mb-2">
        While You Wait
      </h3>

      <p className="text-sm text-blue-700">
        Your referral is currently being processed.
        Here is some general wellbeing guidance while you wait.
      </p>
    </div>

    <div className="bg-gray-50 rounded-xl p-6 mb-6">
      <h4 className="font-semibold mb-3">General Wellbeing Advice</h4>

      <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
        <li>Stay hydrated and drink enough water.</li>
        <li>Maintain regular sleep patterns.</li>
        <li>Practice slow breathing exercises to reduce stress.</li>
        <li>Engage in light physical activity if comfortable.</li>
        <li>Reach out to support services if symptoms worsen.</li>
      </ul>
    </div>

    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
        <AlertTriangle className="w-4 h-4" />
        When to Seek Help
      </div>

      <p className="text-sm text-red-700">
        If your symptoms suddenly worsen or you experience severe
        discomfort, seek medical attention immediately.
      </p>
    </div>
  </>
)}

          </div>
        )}

      </div>
    </div>
  );
};