import React from "react";
import {
  Pencil,
  Bell,
  Settings,
  User,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useGetMeQuery } from "../../../store/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const displayValue = (value) => (value && String(value).trim() ? value : "—");

const DisplayField = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">
      {label}
    </p>
    <div className="w-full bg-gray-50 rounded-2xl px-5 py-3.5 text-slate-700 font-semibold border border-transparent shadow-sm min-h-[48px] flex items-center">
      {displayValue(value)}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Avatar — uses Clerk's user image with graceful fallback to initials
// ---------------------------------------------------------------------------
const ProfileAvatar = ({ clerkUser, firstName }) => {
  const imageUrl = clerkUser?.imageUrl;
  const initial = (firstName || clerkUser?.firstName || "U")
    .charAt(0)
    .toUpperCase();

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <span className="text-white text-6xl font-bold select-none">{initial}</span>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const { data: user, isLoading, isError, error } = useGetMeQuery();

  // ── Loading ──────────────────────────────────────────────────────────────
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

  // ── Derived values ────────────────────────────────────────────────────────
  const profile = user ?? {};
  const fullName =
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "—";
  const dob = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";
  const badgeLabel = profile.department || profile.role || "Employee";

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 min-h-screen">

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {isError && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-red-700 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-semibold">
            {error?.data?.message ||
              "Profile data could not be loaded. Showing placeholders."}
          </p>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Your professional and personal details
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate("/employee/dashboard/accessibility")}
            className="p-2.5 rounded-xl text-gray-400 hover:text-[#064E3B] hover:bg-emerald-50 transition-colors"
            title="Accessibility settings"
          >
            <Settings size={22} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => navigate("/employee/dashboard/notifications")}
            className="p-2.5 rounded-xl text-gray-400 hover:text-[#064E3B] hover:bg-emerald-50 transition-colors"
            title="Notifications"
          >
            <Bell size={22} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN */}
        <section className="lg:col-span-4">
          <div className="bg-white w-full p-10 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-[2.5rem] border-4 border-emerald-50 bg-[#064E3B] shadow-md flex items-center justify-center overflow-hidden">
                <ProfileAvatar
                  clerkUser={clerkUser}
                  firstName={profile.firstName}
                />
              </div>
              <button
                onClick={() => navigate("/employee/dashboard/profile/edit")}
                className="absolute -bottom-2 -right-2 bg-[#064E3B] p-3 rounded-2xl text-white border-4 border-white hover:bg-emerald-800 transition-all shadow-lg hover:scale-105"
                title="Edit profile"
              >
                <Pencil size={16} />
              </button>
            </div>

            {/* Name & Badge */}
            <h2 className="mt-6 text-2xl font-bold text-slate-800 text-center">
              {fullName}
            </h2>
            <div className="mt-2 border border-gray-200 px-4 py-1 rounded-full text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              {badgeLabel}
            </div>

            {/* Quick info pills */}
            {profile.email && (
              <div className="mt-6 w-full bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-slate-600">
                <ShieldCheck size={16} className="text-[#064E3B] shrink-0" />
                <span className="truncate font-medium">{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className="mt-2 w-full bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-slate-600">
                <Phone size={16} className="text-[#064E3B] shrink-0" />
                <span className="font-medium">{profile.phone}</span>
              </div>
            )}
            {profile.dateOfBirth && (
              <div className="mt-2 w-full bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-slate-600">
                <Calendar size={16} className="text-[#064E3B] shrink-0" />
                <span className="font-medium">{dob}</span>
              </div>
            )}

            {/* Edit CTA */}
            <button
              onClick={() => navigate("/employee/dashboard/profile/edit")}
              className="mt-8 w-full bg-[#064E3B] text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20"
            >
              Edit Profile
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-6">

          {/* PERSONAL INFORMATION */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-7">
              <div className="p-2 bg-emerald-50 rounded-xl text-[#064E3B]">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DisplayField label="First Name" value={profile.firstName} />
              <DisplayField label="Last Name" value={profile.lastName} />
              <DisplayField label="Date of Birth" value={dob} />
              <DisplayField label="Department" value={profile.department} />
            </div>
          </section>

          {/* CONTACT DETAILS */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-7">
              <div className="p-2 bg-emerald-50 rounded-xl text-[#064E3B]">
                <Phone size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                Contact Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DisplayField label="Email Address" value={profile.email} />
              <DisplayField label="Phone Number" value={profile.phone} />
            </div>

            {/* Address sub-section */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-5 text-slate-400">
                <MapPin size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Address Information
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DisplayField
                  label="Address Line 1"
                  value={profile.address?.line1}
                />
                <DisplayField
                  label="Address Line 2"
                  value={profile.address?.line2}
                />
                <DisplayField label="City" value={profile.address?.city} />
                <DisplayField
                  label="Postcode"
                  value={profile.address?.postcode}
                />
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};