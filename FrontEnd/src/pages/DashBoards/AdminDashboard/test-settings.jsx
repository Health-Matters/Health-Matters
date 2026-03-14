import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useGetMeQuery, useUpdateMeMutation } from "@/store/api";

const InputField = ({ label, name, value, onChange, readOnly = false, type = "text", placeholder = "" }) => (
  <div>
    <label htmlFor={name} className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
      {label}
      {readOnly && <span className="ml-2 normal-case font-normal text-slate-300">(managed by Clerk)</span>}
    </label>
    <input
      id={name}
      name={name}
      value={value}
      onChange={readOnly ? undefined : onChange}
      readOnly={readOnly}
      type={type}
      placeholder={placeholder}
      className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none transition ${
        readOnly
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          : "border-blue-100 bg-blue-50/40 text-slate-700 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
      }`}
    />
  </div>
);

export const TestSettings = () => {
  const { user: clerkUser } = useUser();
  const { data: me, isLoading, isError, error } = useGetMeQuery();

  const [updateMe, { isLoading: saving, isSuccess, isError: saveError, error: saveErrorData, reset }] =
    useUpdateMeMutation();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    department: "",
    email: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      postcode: "",
    },
  });

  useEffect(() => {
    if (!me) return;
    setForm({
      firstName: me.firstName ?? "",
      lastName: me.lastName ?? "",
      phone: me.phone ?? "",
      department: me.department ?? "",
      email: me.email ?? "",
      address: {
        line1: me.address?.line1 ?? "",
        line2: me.address?.line2 ?? "",
        city: me.address?.city ?? "",
        postcode: me.address?.postcode ?? "",
      },
    });
  }, [me]);

  const fullName = useMemo(() => {
    const value = `${form.firstName} ${form.lastName}`.trim();
    return value || "Admin User";
  }, [form.firstName, form.lastName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (saveError) reset();

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      phone: form.phone || undefined,
      department: form.department || undefined,
      address: {
        line1: form.address.line1 || undefined,
        line2: form.address.line2 || undefined,
        city: form.address.city || undefined,
        postcode: form.address.postcode || undefined,
      },
    };

    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    try {
      await updateMe(cleanedPayload).unwrap();
    } catch (_err) {
      // surfaced by mutation state
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading profile settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Settings Profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update your admin profile details and contact information.
        </p>
      </header>

      {isError && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error?.data?.message || "Failed to load profile details."}
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Profile updated successfully.
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {saveErrorData?.data?.message || "Failed to save profile changes."}
        </div>
      )}

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="lg:col-span-4">
          <div className="sticky top-6 rounded-[30px] border border-blue-100 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-[28px] border-4 border-blue-50 bg-blue-700 text-4xl font-bold text-white">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span>{(form.firstName || clerkUser?.firstName || "A").charAt(0).toUpperCase()}</span>
              )}
            </div>

            <h2 className="mt-5 truncate text-center text-xl font-bold text-slate-900">{fullName}</h2>
            <p className="mt-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              {me?.role || "admin"}
            </p>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm text-slate-700">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="truncate">{form.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm text-slate-700">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="truncate">{me?.department || "No department set"}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>

        <section className="space-y-6 lg:col-span-8">
          <div className="rounded-[30px] border border-blue-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} placeholder="e.g. Alex" />
              <InputField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} placeholder="e.g. Morgan" />
              <InputField label="Department" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Administration" />
              <InputField label="Email" name="email" value={form.email} readOnly type="email" />
            </div>
          </div>

          <div className="rounded-[30px] border border-blue-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Contact Information</h3>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. +44 7700 000000" />
            </div>

            <div className="mt-7 border-t border-blue-100 pt-6">
              <div className="mb-4 flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Address</span>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <InputField label="Address Line 1" name="address.line1" value={form.address.line1} onChange={handleChange} placeholder="Street and number" />
                <InputField label="Address Line 2" name="address.line2" value={form.address.line2} onChange={handleChange} placeholder="Optional" />
                <InputField label="City" name="address.city" value={form.address.city} onChange={handleChange} placeholder="City" />
                <InputField label="Postcode" name="address.postcode" value={form.address.postcode} onChange={handleChange} placeholder="Postcode" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
