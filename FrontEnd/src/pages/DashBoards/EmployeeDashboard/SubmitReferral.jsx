import React, { useState } from "react";
import { useNavigate } from "react-router"; 
import { PlusCircle, ChevronLeft, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useCreateReferralMutation } from "../../../store/api";
import { useUser } from "@clerk/clerk-react";

// Required Fields Note (centered with circular info icon + red star)
const RequiredFieldsNote = () => (
  <div className="flex justify-center mt-6">
    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
        i
      </div>
      <p className="text-xs text-emerald-800">
        <span className="text-red-600">*</span> Indicates required fields. All patient information is handled in accordance with GDPR and healthcare data protection regulations.
      </p>
    </div>
  </div>
);

export const SubmitReferral = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [referralReason, setReferralReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [createReferral, { isLoading, error }] = useCreateReferralMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceType || !referralReason) return;

    try {
      await createReferral({
        patientClerkUserId: user?.id,
        submittedByClerkUserId: user?.id,
        serviceType,
        referralReason,
        notes: notes || undefined,
      }).unwrap();

      setSubmitted(true);
    } catch (_) {
      // error is surfaced via the `error` state from the mutation
    }
  };

  const handleNewReferral = () => {
    setServiceType("");
    setReferralReason("");
    setNotes("");
    setSubmitted(false);
    setIsCreating(false);
  };

  // ─── PART A: THE PRICING LIST (First View) ───
  if (!isCreating) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Available Services</h1>
            <p className="text-sm text-gray-500 mt-2">View our clinical offerings, duration, and pricing.</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-lg transition-all"
          >
            <PlusCircle size={20} /> New Referral
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50/50">
                <th className="p-4 text-xs font-bold text-emerald-800 uppercase tracking-widest">Service</th>
                <th className="p-4 text-xs font-bold text-emerald-800 uppercase tracking-widest text-center">Est. Duration</th>
                <th className="p-4 text-xs font-bold text-emerald-800 uppercase tracking-widest text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <ServiceRow name="Occupational Health" duration="45 mins" price="£85.00" />
              <ServiceRow name="Mental Health" duration="60 mins" price="£60.00" />
              <ServiceRow name="Physiotherapy" duration="30 mins" price="£45.00" />
              <ServiceRow name="Health Screening" duration="90 mins" price="£110.00" />
              <ServiceRow name="Counselling" duration="50 mins" price="£55.00" />
              <ServiceRow name="Ergonomic Assessment" duration="60 mins" price="£150.00" />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─── SUCCESS STATE ───
  if (submitted) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-12 flex flex-col items-center gap-4 text-center">
          <CheckCircle size={56} className="text-emerald-600" />
          <h2 className="text-2xl font-bold text-slate-900">Referral Submitted</h2>
          <p className="text-sm text-slate-500 max-w-sm">
            Your referral has been received and is currently <span className="font-semibold text-emerald-700">pending review</span>. You will be notified once it is processed.
          </p>
          <button
            onClick={handleNewReferral}
            className="mt-4 px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-lg transition-all"
          >
            Submit Another Referral
          </button>
        </div>
      </div>
    );
  }

  // ─── PART B: THE SUBMIT FORM (Second View) ───
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
      <button 
        onClick={() => setIsCreating(false)}
        className="flex items-center gap-2 text-emerald-700 font-semibold hover:underline"
      >
        <ChevronLeft size={18} /> Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient ID Confirmation */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4">1. Identity Confirmation</h2>
          <div className="max-w-xs">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Patient ID (Verified)</label>
            <input 
              type="text" 
              value={user?.id ?? "Loading..."}
              readOnly 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed outline-none" 
            />
          </div>
        </div>

        {/* Referral Details */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-6">
          <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">2. Referral Details</h2>
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">
              Service Type <span className="text-red-600">*</span>
            </label>
            <select
              required
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="">-- Select a Service --</option>
              <option value="Occupational Health">Occupational Health</option>
              <option value="Mental Health">Mental Health</option>
              <option value="Physiotherapy">Physiotherapy</option>
              <option value="Health Screening">Health Screening</option>
              <option value="Counselling">Counselling</option>
              <option value="Ergonomic Assessment">Ergonomic Assessment</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">
              Reason for Referral <span className="text-red-600">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={referralReason}
              onChange={(e) => setReferralReason(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Describe the reason for this request..."
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Any additional context for the practitioner (optional)..."
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error?.data?.message ?? "Failed to submit referral. Please try again."}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !serviceType || !referralReason}
          className="w-full py-4 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><Loader2 size={18} className="animate-spin" /> Submitting...</>
          ) : (
            <>Submit Referral <Send size={18} /></>
          )}
        </button>
      </form>

      <RequiredFieldsNote />
    </div>
  );
};

// Updated Table Row Helper with Duration
const ServiceRow = ({ name, duration, price }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="p-4 text-sm font-semibold text-slate-800">{name}</td>
    <td className="p-4 text-sm text-slate-500 text-center font-medium">{duration}</td>
    <td className="p-4 text-sm font-bold text-slate-700 text-right">{price}</td>
  </tr>
);