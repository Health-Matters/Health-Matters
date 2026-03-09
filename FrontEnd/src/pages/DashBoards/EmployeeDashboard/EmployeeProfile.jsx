import React from "react";
import { Pencil, Bell, Settings, User, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router";

export const EmployeeProfile = () => {
  const navigate = useNavigate();
  const userProfileImageUrl = "https://lh3.googleusercontent.com/a/your-google-profile-id";

  // Reusable Display Field (No Input)
  const DisplayField = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">
        {label}
      </p>
      <div className="w-full bg-gray-50 rounded-2xl px-5 py-3.5 text-slate-700 font-semibold border border-transparent shadow-sm">
        {value || "—"}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 min-h-screen">
      {/* --- TOP HEADER BAR --- */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-gray-500 text-sm">Your professional and personal details</p>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate("/employee/dashboard/accessibility")} className="p-2 text-gray-400 hover:text-[#064E3B] transition-colors">
            <Settings size={24} strokeWidth={1.5} />
          </button>
          <button onClick={() => navigate("/employee/dashboard/notifications")} className="p-2 text-gray-400 hover:text-[#064E3B] transition-colors">
            <Bell size={24} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN --- */}
        <section className="lg:col-span-4 flex flex-col items-center">
          <div className="bg-white w-full p-10 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="relative">
              <div className="w-40 h-40 rounded-[2.5rem] border-4 border-emerald-50 overflow-hidden bg-white shadow-md">
                <img 
                  src={userProfileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=John+De+Lavada&background=064E3B&color=fff"; }}
                />
              </div>
              <button 
                onClick={() => navigate("/employee/dashboard/profile/edit")}
                className="absolute -bottom-2 -right-2 bg-[#064E3B] p-3 rounded-2xl text-white border-4 border-white hover:bg-emerald-800 transition-all shadow-lg hover:scale-105"
              >
                <Pencil size={18} />
              </button>
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-800">John De Lavada</h2>
            <div className="mt-2 border border-gray-200 px-4 py-1 rounded-full text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              UserID 456
            </div>
          </div>
        </section>

        {/* --- RIGHT COLUMN --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PERSONAL INFO */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-50 rounded-lg text-[#064E3B]"><User size={20} /></div>
              <h2 className="text-xl font-bold text-[#0F172A]">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DisplayField label="First Name" value="John" />
              <DisplayField label="Last Name" value="De Lavada" />
              <DisplayField label="Date of Birth" value="2002-05-12" />
              <DisplayField label="Department" value="Software Engineering" />
            </div>
          </section>

          {/* CONTACT DETAILS */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-50 rounded-lg text-[#064E3B]"><Phone size={20} /></div>
              <h2 className="text-xl font-bold text-[#0F172A]">Contact Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DisplayField label="Email" value="user@gmail.com" />
              <DisplayField label="Phone Number" value="07586900" />
              
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div className="md:col-span-2 flex items-center gap-2 mb-2 text-slate-400">
                  <MapPin size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Address Information</span>
                </div>
                <DisplayField label="Address Line 1" value="7th RD" />
                <DisplayField label="Address Line 2" value="Colombo 03" />
                <DisplayField label="City" value="Colombo" />
                <DisplayField label="Postcode" value="00300" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};