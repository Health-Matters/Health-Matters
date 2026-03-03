import React from "react";
import { Pencil, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router"; 

export const EmployeeProfile = () => {
  const navigate = useNavigate(); 

  const userProfileImageUrl = "https://lh3.googleusercontent.com/a/your-google-profile-id";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* --- TOP HEADER BAR --- */}
      {/* Removed the box/shadow style to let it sit flat at the top */}
      <header className="flex justify-between items-center mb-3">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <div className="flex gap-6 items-center">
          <button 
            onClick={() => navigate("/employee/dashboard/accessibility")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings size={24} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => navigate("/employee/dashboard/notifications")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Bell size={24} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        
        {/* --- PROFILE PICTURE SECTION --- */}
        <section className="flex flex-col items-center mb-12">
          <div className="relative">
            {/* Circular Image Container */}
            <div className="w-32 h-32 rounded-full border border-gray-200 overflow-hidden bg-white flex items-center justify-center shadow-sm">
              <img 
                src={userProfileImageUrl} 
                alt="User Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to Initials if image fails
                  e.target.src = "https://ui-avatars.com/api/?name=User&background=E2E8F0&color=475569";
                }}
              />
            </div>

            {/* Edit Pencil Button - Styled like the dark green box in your image */}
            <button 
              onClick={() => navigate("/employee/dashboard/profile/edit")}
              className="absolute bottom-1 right-1 bg-[#064E3B] p-2 rounded-lg text-white border-2 border-[#F0FDF9] hover:bg-emerald-800 transition-all shadow-md"
            >
              <Pencil size={14} />
            </button>
          </div>

          {/* UserID Badge - Removed grey background box */}
          <div className="mt-4 border border-gray-300 px-6 py-1 rounded-full text-[12px] font-bold text-gray-500 tracking-widest uppercase">
            UserID 456
          </div>
        </section>

        <div className="space-y-10">
          
          {/* --- PERSONAL INFORMATION CARD --- */}
          <div className="bg-white px-10 py-5 rounded-[40px] shadow-sm border border-gray-50">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-8">Personal Information</h2>
            
            {/* Grid matches the side-by-side layout in your image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  defaultValue="John De Lavada" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-600 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                <input 
                  type="text" 
                  defaultValue="Male" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-600 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                <input 
                  type="text" 
                  defaultValue="2002-05-12" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-600 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          {/* --- CONTACT INFORMATION CARD --- */}
          <div className="bg-white px-10 py-5 rounded-[40px] shadow-sm border border-gray-50">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-8">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="text" 
                  defaultValue="07586900" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-600 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  defaultValue="user@gmail.com" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-600 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                <input 
                  type="text" 
                  defaultValue="7th RD, Colombo" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-600 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          {/* --- EMERGENCY CONTACT CARD --- */}
          <div className="bg-white px-10 py-5 rounded-[40px] shadow-sm border border-gray-50">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-8">Emergency Contact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  defaultValue="Jasse De Lavada" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-600 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="text" 
                  defaultValue="074XX4578" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-600 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};