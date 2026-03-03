import React from "react";

export const SubmitReferral = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Submit Referral</h1>
      <p className="mt-4 text-sm text-gray-600 leading-relaxed">
        Please fill out the referral form below. Fields marked with <span className="text-red-600">*</span> are required.
      </p>

      <form className="space-y-10 mt-10">
        <PersonalInformation />
        <ReferralDetails />
        <ActionButtons />
        <RequiredFieldsNote />
      </form>
    </div>
  );
};

// Personal Information Section
const PersonalInformation = () => (
  <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-6">
    <h2 className="text-lg font-semibold text-slate-800">Personal Information</h2>

    {/* Full Name on its own line */}
    <Field label="Full Name" required />

    {/* Other fields in 3 columns */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Field label="Gender" />
      <Field label="Date of Birth (dd-mm-yyyy)" required />
      <Field label="ID" />
      <Field label="Phone Number" />
      <Field label="Email Address" required type="email" />
      <Field label="Emergency Contact" />
      <Field label="Address" />
    </div>
  </div>
);

// Referral Details Section
const ReferralDetails = () => (
  <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-6">
    <h2 className="text-lg font-semibold text-slate-800">Referral Details</h2>
    <Field label="Symptoms" required textarea />
    <Field label="Allergies" />
    <Field label="Current Medication" />
  </div>
);

// Action Buttons
const ActionButtons = () => (
  <div className="flex justify-end items-center gap-4">
    <button 
      type="button"
      className="px-6 py-2 text-slate-500 font-medium hover:text-slate-800 transition-colors"
    >
      Back
    </button>
    <button 
      type="submit"
      className="px-10 py-3 bg-emerald-700 text-white rounded-xl font-bold 
                 hover:bg-emerald-800 shadow-lg shadow-emerald-100 transition-all active:scale-95"
    >
      Submit Referral
    </button>
  </div>
);

// Required Fields Note (centered with circular info icon + red star)
const RequiredFieldsNote = () => (
  <div className="flex justify-center mt-6">
    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
      {/* Proper circular info icon */}
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
        i
      </div>
      <p className="text-xs text-emerald-800">
        <span className="text-red-600">*</span> Indicates required fields. All patient information is handled in accordance with GDPR and healthcare data protection regulations.
      </p>
    </div>
  </div>
);

// Reusable Field Component
const Field = ({ label, required = false, type = "text", textarea = false }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-slate-700 mb-1">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    {textarea ? (
      <textarea
        rows={4}
        className={inputStyle}
        placeholder={label}
      />
    ) : (
      <input
        type={type}
        className={inputStyle}
        placeholder={label}
      />
    )}
  </div>
);

// Shared input style
const inputStyle = "w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none";