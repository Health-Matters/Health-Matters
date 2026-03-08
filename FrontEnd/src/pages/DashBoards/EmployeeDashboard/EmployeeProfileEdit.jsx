import React from "react";
import { User, Phone, MapPin, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export const EmployeeProfileEdit = () => {
  const navigate = useNavigate();
  const userProfileImageUrl = "https://lh3.googleusercontent.com/a/your-google-profile-id";

  // Reusable Edit Field Component
  const EditField = ({ label, defaultValue, type = "text", fullWidth = false }) => (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-slate-700 font-medium focus:bg-white focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-none transition-all"
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 min-h-screen">
      
      {/* --- HEADER --- */}
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-slate-600"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-gray-500 text-sm">Update your information and save changes</p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: AVATAR & ACTIONS --- */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] border-4 border-emerald-50 overflow-hidden bg-white shadow-md">
                <img 
                  src={userProfileImageUrl} 
                  alt="User Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://ui-avatars.com/api/?name=John+De+Lavada&background=064E3B&color=fff";
                  }}
                />
              </div>
            </div>

            <div className="mt-6 border border-gray-200 px-4 py-1 rounded-full text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              UserID 456
            </div>

            <div className="flex flex-col gap-3 w-full mt-10">
              <button 
                onClick={() => navigate(-1)}
                className="w-full bg-[#064E3B] text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all hover:-translate-y-0.5"
              >
                Save Changes
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="w-full bg-white text-slate-600 border border-gray-200 py-4 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>

        {/* --- RIGHT COLUMN: FORM --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PERSONAL INFORMATION */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-50 rounded-lg text-[#064E3B]">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditField label="First Name" defaultValue="John" />
              <EditField label="Last Name" defaultValue="De Lavada" />
              <EditField label="Date of Birth" defaultValue="2002-05-12" />
              <EditField label="Department" defaultValue="Software Engineering" />
            </div>
          </section>

          {/* CONTACT INFORMATION */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-50 rounded-lg text-[#064E3B]">
                <Phone size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Contact Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EditField label="Email" defaultValue="user@gmail.com" type="email" />
              <EditField label="Phone Number" defaultValue="07586900" />
              
              {/* Split Address into the requested fields */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div className="md:col-span-2 flex items-center gap-2 mb-2 text-slate-400">
                  <MapPin size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Address Information</span>
                </div>
                <EditField label="Address Line 1" defaultValue="7th RD" />
                <EditField label="Address Line 2" defaultValue="Colombo 03" />
                <EditField label="City" defaultValue="Colombo" />
                <EditField label="Postcode" defaultValue="00300" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};