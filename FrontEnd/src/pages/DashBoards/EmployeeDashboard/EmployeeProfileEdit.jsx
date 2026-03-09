import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { UserAvatar } from "@clerk/clerk-react";
import { useGetMeQuery, useUpdateMeMutation } from "../../../store/api";

export const EmployeeProfileEdit = () => {
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useGetMeQuery();
  const [updateMe, { isLoading: isSaving, isSuccess, isError: isSaveError, error: saveError }] =
    useUpdateMeMutation();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    department: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      postcode: "",
    },
  });

  // Pre-fill form once user data arrives
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        department: user.department ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        address: {
          line1: user.address?.line1 ?? "",
          line2: user.address?.line2 ?? "",
          city: user.address?.city ?? "",
          postcode: user.address?.postcode ?? "",
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      await updateMe(form).unwrap();
      // Navigate back after a short delay so success message is visible
      setTimeout(() => navigate(-1), 1200);
    } catch (_) {
      // error handled via RTK state
    }
  };

  // Reusable Edit Field Component
  const EditField = ({ label, name, value, type = "text", fullWidth = false }) => (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-slate-700 font-medium focus:bg-white focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-none transition-all"
      />
    </div>
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 size={40} className="animate-spin text-[#064E3B]" />
          <p className="text-sm font-medium">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-red-500 bg-red-50 p-10 rounded-3xl border border-red-100">
          <AlertCircle size={40} />
          <p className="text-sm font-semibold">Failed to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim() || "—";

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

      {/* Save feedback banners */}
      {isSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl text-sm font-semibold">
          <CheckCircle2 size={18} />
          Profile updated successfully! Redirecting…
        </div>
      )}
      {isSaveError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} />
          {saveError?.data?.message || "Failed to save. Please try again."}
        </div>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* --- LEFT COLUMN: AVATAR & ACTIONS --- */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] border-4 border-emerald-50 overflow-hidden bg-white shadow-md">
                <UserAvatar
                  userId={user?.clerkUserId}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-700">{fullName}</h2>

            <div className="mt-2 border border-gray-200 px-4 py-1 rounded-full text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              {user?.department || user?.role || "Employee"}
            </div>

            <div className="flex flex-col gap-3 w-full mt-10">
              <button
                onClick={handleSave}
                disabled={isSaving || isSuccess}
                className="w-full bg-[#064E3B] text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={() => navigate(-1)}
                disabled={isSaving}
                className="w-full bg-white text-slate-600 border border-gray-200 py-4 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-60"
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
              <EditField label="First Name" name="firstName" value={form.firstName} />
              <EditField label="Last Name" name="lastName" value={form.lastName} />
              <EditField label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} type="date" />
              <EditField label="Department" name="department" value={form.department} />
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
              <EditField label="Email" name="email" value={form.email} type="email" />
              <EditField label="Phone Number" name="phone" value={form.phone} />

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div className="md:col-span-2 flex items-center gap-2 mb-2 text-slate-400">
                  <MapPin size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Address Information
                  </span>
                </div>
                <EditField label="Address Line 1" name="address.line1" value={form.address.line1} />
                <EditField label="Address Line 2" name="address.line2" value={form.address.line2} />
                <EditField label="City" name="address.city" value={form.address.city} />
                <EditField label="Postcode" name="address.postcode" value={form.address.postcode} />
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};