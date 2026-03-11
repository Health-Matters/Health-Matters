import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  Phone,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useGetMeQuery, useUpdateMeMutation } from "../../../store/api";

// ---------------------------------------------------------------------------
// EditField — defined OUTSIDE the parent component so it never remounts,
// which prevents the cursor-jumping / focus-loss bug on every keystroke.
// ---------------------------------------------------------------------------
const EditField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
  placeholder = "",
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1"
    >
      {label}
      {readOnly && (
        <span className="ml-2 normal-case font-normal text-gray-300">
          (managed by Clerk)
        </span>
      )}
    </label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={readOnly ? undefined : onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      autoComplete="off"
      className={`w-full border rounded-2xl px-4 py-3 text-slate-700 font-medium outline-none transition-all ${
        readOnly
          ? "bg-gray-100 border-gray-100 opacity-60 cursor-not-allowed"
          : "bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#064E3B] focus:border-transparent"
      }`}
    />
  </div>
);

// ---------------------------------------------------------------------------
// Avatar — mirrors the profile page for visual consistency
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
export const EmployeeProfileEdit = () => {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();

  const { data: user, isLoading, isError } = useGetMeQuery();
  const [
    updateMe,
    {
      isLoading: isSaving,
      isSuccess,
      isError: isSaveError,
      error: saveError,
      reset: resetMutation,
    },
  ] = useUpdateMeMutation();

  // Prevent re-initialising form every time the cache re-fetches
  const initializedRef = useRef(false);

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

  // Pre-fill form once — skip on subsequent cache updates so typing isn't disrupted
  useEffect(() => {
    if (!initializedRef.current && user) {
      initializedRef.current = true;
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

  // Auto-navigate after successful save
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => navigate(-1), 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Reset any previous save error so the banner clears on typing
    if (isSaveError) resetMutation?.();

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }, [isSaveError, resetMutation]);

  const handleSave = async () => {
    try {
      // Build payload — omit email (backend rejects it per DTO),
      // omit empty dateOfBirth (z.coerce.date() rejects "").
      const payload = {
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        department: form.department || undefined,
        phone: form.phone || undefined,
        address: {
          line1: form.address.line1 || undefined,
          line2: form.address.line2 || undefined,
          city: form.address.city || undefined,
          postcode: form.address.postcode || undefined,
        },
      };

      // Remove undefined keys at top level (the backend refine check needs ≥1 key)
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined)
      );

      await updateMe(cleanPayload).unwrap();
    } catch (_) {
      // Error is surfaced via RTK state — no additional handling needed
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
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

  const previewName =
    `${form.firstName} ${form.lastName}`.trim() || "Your Name";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 min-h-screen">

      {/* ── Load error (still allows editing) ───────────────────────────── */}
      {isError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          Failed to load existing data. You can still enter your details and save.
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-slate-600"
          title="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Update your information and save changes
          </p>
        </div>
      </header>

      {/* ── Save feedback ────────────────────────────────────────────────── */}
      {isSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl text-sm font-semibold">
          <CheckCircle2 size={18} className="shrink-0" />
          Profile updated successfully! Redirecting…
        </div>
      )}
      {isSaveError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          {saveError?.data?.message ||
            saveError?.data?.errors?.[0]?.message ||
            "Failed to save. Please try again."}
        </div>
      )}

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT — avatar card + action buttons */}
        <section className="lg:col-span-4">
          <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center sticky top-6">
            {/* Avatar */}
            <div className="w-40 h-40 rounded-[2.5rem] border-4 border-emerald-50 bg-[#064E3B] shadow-md flex items-center justify-center overflow-hidden">
              <ProfileAvatar
                clerkUser={clerkUser}
                firstName={form.firstName}
              />
            </div>

            {/* Live name preview */}
            <h2 className="mt-6 text-xl font-bold text-slate-700 text-center">
              {previewName}
            </h2>
            <div className="mt-2 border border-gray-200 px-4 py-1 rounded-full text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              {user?.department || user?.role || "Employee"}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full mt-10">
              <button
                onClick={handleSave}
                disabled={isSaving || isSuccess}
                className="w-full bg-[#064E3B] text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
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

        {/* RIGHT — form fields */}
        <div className="lg:col-span-8 space-y-6">

          {/* PERSONAL INFORMATION */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-7">
              <div className="p-2 bg-emerald-50 rounded-xl text-[#064E3B]">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EditField
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="e.g. Jane"
              />
              <EditField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="e.g. Smith"
              />
              <EditField
                label="Date of Birth"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                type="date"
              />
              <EditField
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Engineering"
              />
            </div>
          </section>

          {/* CONTACT DETAILS */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-7">
              <div className="p-2 bg-emerald-50 rounded-xl text-[#064E3B]">
                <Phone size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Contact Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email is read-only — managed by Clerk, excluded from PUT payload */}
              <EditField
                label="Email Address"
                name="email"
                value={form.email}
                type="email"
                readOnly
              />
              <EditField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. +44 7700 000000"
              />
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
                <EditField
                  label="Address Line 1"
                  name="address.line1"
                  value={form.address.line1}
                  onChange={handleChange}
                  placeholder="e.g. 12 Baker Street"
                />
                <EditField
                  label="Address Line 2"
                  name="address.line2"
                  value={form.address.line2}
                  onChange={handleChange}
                  placeholder="e.g. Flat 3 (optional)"
                />
                <EditField
                  label="City"
                  name="address.city"
                  value={form.address.city}
                  onChange={handleChange}
                  placeholder="e.g. London"
                />
                <EditField
                  label="Postcode"
                  name="address.postcode"
                  value={form.address.postcode}
                  onChange={handleChange}
                  placeholder="e.g. W1A 1AA"
                />
              </div>
            </div>
          </section>

          {/* Bottom save — convenience for long forms */}
          <div className="flex justify-end gap-3 pb-4">
            <button
              onClick={() => navigate(-1)}
              disabled={isSaving}
              className="px-6 py-3 bg-white text-slate-600 border border-gray-200 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isSuccess}
              className="px-8 py-3 bg-[#064E3B] text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};