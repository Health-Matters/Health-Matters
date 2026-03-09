import { useState } from "react";
import {
  User,
  FileText,
  Download,
  AlertTriangle
} from "lucide-react";

export const HelpAndAdvice = () => {
  const [selectedReferral, setSelectedReferral] = useState(null);

  const referrals = [
    {
      id: "REF-882",
      date: "28 Feb 2026",
      service: "Occupational Health",
      doctor: null,
      status: "PENDING",
      estimatedCompletion: "3–5 working days"
    },
    {
      id: "REF-841",
      date: "24 Feb 2026",
      service: "Mental Health",
      doctor: null,
      status: "IN_PROGRESS",
      estimatedCompletion: "2 Mar 2026"
    },
    {
      id: "REF-790",
      date: "18 Feb 2026",
      service: "Physiotherapy",
      doctor: "Dr. Sarah Jenkins",
      status: "COMPLETED",
      guidance: {
        summary:
          "Initial physiotherapy assessment completed for lower back pain.",
        nextSteps: [
          "Perform strengthening exercises twice daily.",
          "Avoid heavy lifting for 2 weeks.",
          "Book follow-up appointment in 3 weeks."
        ],
        safetyNetting: [
          "Seek urgent care if numbness or weakness develops.",
          "Contact GP if pain worsens significantly.",
          "Attend A&E if loss of bladder or bowel control occurs."
        ]
      },
      documents: [
        {
          name: "Clinical Summary",
          type: "PDF",
          size: "1.8MB",
          category: "Clinical Summary"
        },
        {
          name: "Exercise Plan",
          type: "PDF",
          size: "2.4MB",
          category: "Self-Care Sheet"
        },
        {
          name: "Fit Note",
          type: "PDF",
          size: "500KB",
          category: "Administrative Note"
        }
      ]
    }
  ];

  const handleCardClick = (ref) => {
    setSelectedReferral(ref);
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

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-3">Help & Advice</h1>
      <p className="text-gray-600 mb-8">
        Access structured clinical guidance and care documents from your services.
      </p>

      <div className="flex relative items-start">

        {/* LEFT SIDE */}
        <div
          className={`${selectedReferral ? "w-[60%] pr-8" : "w-full"} transition-all duration-300`}
        >
          <div className="bg-white rounded-2xl shadow-sm p-10">
            <h2 className="text-3xl font-semibold mb-8">
              Referral History
            </h2>

            <div className="space-y-6">
              {referrals.map((ref) => {
                const isSelected = selectedReferral?.id === ref.id;

                return (
                  <div
                    key={ref.id}
                    onClick={() => handleCardClick(ref)}
                    className={`p-6 rounded-xl transition border cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 shadow-sm"
                        : "bg-gray-50 hover:bg-gray-100 border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {ref.service}
                        </h3>

                        <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                          {ref.id}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Submitted on {ref.date}
                        </p>

                        {ref.doctor && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{ref.doctor}</span>
                          </div>
                        )}
                      </div>

                      {renderStatusBadge(ref.status)}
                    </div>

                    {/* Status Messaging */}
                    {ref.status === "COMPLETED" && (
                      <p className="text-blue-600 font-medium mt-3">
                        View Guidance →
                      </p>
                    )}

                    {ref.status === "PENDING" && (
                      <p className="text-yellow-600 text-sm font-medium mt-3">
                        Estimated review time: {ref.estimatedCompletion}
                      </p>
                    )}

                    {ref.status === "IN_PROGRESS" && (
                      <p className="text-blue-600 text-sm font-medium mt-3">
                        Under clinical review • Expected: {ref.estimatedCompletion}
                      </p>
                    )}
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

            {/* ================= COMPLETED ================= */}
            {selectedReferral.status === "COMPLETED" && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Provided by {selectedReferral.doctor}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Care Plan Overview
                </h3>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold mb-2">Clinical Summary</h4>
                  <p className="text-gray-700">
                    {selectedReferral.guidance.summary}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Next Steps</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    {selectedReferral.guidance.nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                  <div className="flex items-center gap-2 mb-3 text-red-700 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    When to Seek Help
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-red-700 text-sm">
                    {selectedReferral.guidance.safetyNetting.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <h3 className="font-semibold mb-4">Care Documents</h3>
                <div className="space-y-3">
                  {selectedReferral.documents.map((doc) => (
                    <div
                      key={doc.name}
                      className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <FileText className="w-4 h-4" />
                          {doc.name}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {doc.category} • {doc.type} • {doc.size}
                        </p>
                      </div>

                      <Download className="w-4 h-4 text-gray-400 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ================= PENDING / IN_PROGRESS ================= */}
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

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 text-yellow-700 font-semibold mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Important
                  </div>
                  <p className="text-sm text-yellow-700">
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