import React, { useState } from "react";
import { useNavigate } from "react-router"; 
import { PlusCircle, ChevronLeft, Send } from "lucide-react";

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
  const [isCreating, setIsCreating] = useState(false);

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

  // ─── PART B: THE SUBMIT FORM (Second View) ───
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
      <button 
        onClick={() => setIsCreating(false)}
        className="flex items-center gap-2 text-emerald-700 font-semibold hover:underline"
      >
        <ChevronLeft size={18} /> Back
      </button>

      <form className="space-y-8">
        {/* Patient ID Confirmation */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4">1. Identity Confirmation</h2>
          <div className="max-w-xs">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Patient ID (Verified)</label>
            <input 
              type="text" 
              value="PAT-882-2026" 
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
            <select className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="">-- Select a Service --</option>
              <option value="occupational_health">Occupational Health</option>
              <option value="mental_health">Mental Health</option>
              <option value="physiotherapy">Physiotherapy</option>
              <option value="health_screening">Health Screening</option>
              <option value="counselling">Counselling</option>
              <option value="ergonomic_assessment">Ergonomic Assessment</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">
              Reason for Referral <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={5}
              className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Describe the reason for this request..."
            />
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-lg transition-all active:scale-95">
          Submit Referral <Send size={18} className="inline ml-2" />
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