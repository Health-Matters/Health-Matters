import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Mail, Phone, Save, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useGetMeQuery, useUpdateMeMutation } from "../../../store/api/usersApi";

const AUDIT_LOG_STORAGE_KEY = "manager_profile_audit_log";
const JOB_TITLE_STORAGE_KEY = "manager_profile_job_title";

const getStoredAuditLog = () => {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_LOG_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const getStoredJobTitle = () => localStorage.getItem(JOB_TITLE_STORAGE_KEY) || "";

export const ManagerTestProfile = () => {
  const { data: me, isLoading, error } = useGetMeQuery();
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    department: "",
    jobTitle: "",
  });
  const [email, setEmail] = useState("");
  const [auditLog, setAuditLog] = useState(getStoredAuditLog());

  useEffect(() => {
    if (!me) return;

    setForm({
      firstName: me.firstName || "",
      lastName: me.lastName || "",
      phone: me.phone || "",
      department: me.department || "",
      jobTitle: getStoredJobTitle(),
    });
    setEmail(me.email || "");
  }, [me]);

  const baseline = useMemo(
    () => ({
      firstName: me?.firstName || "",
      lastName: me?.lastName || "",
      phone: me?.phone || "",
      department: me?.department || "",
      jobTitle: getStoredJobTitle(),
    }),
    [me]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Name is required.");
      return;
    }

    const changedFields = [];
    if (form.firstName !== baseline.firstName) changedFields.push("firstName");
    if (form.lastName !== baseline.lastName) changedFields.push("lastName");
    if (form.phone !== baseline.phone) changedFields.push("phone");
    if (form.department !== baseline.department) changedFields.push("department");
    if (form.jobTitle !== baseline.jobTitle) changedFields.push("jobTitle");

    if (changedFields.length === 0) {
      toast.info("No profile changes to save.");
      return;
    }

    try {
      await updateMe({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
      }).unwrap();

      localStorage.setItem(JOB_TITLE_STORAGE_KEY, form.jobTitle.trim());

      const entry = {
        timestamp: new Date().toISOString(),
        action: "profile_updated",
        changedFields,
      };
      const nextAuditLog = [entry, ...auditLog].slice(0, 25);
      setAuditLog(nextAuditLog);
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(nextAuditLog));

      toast.success("Profile updated successfully.");
    } catch (requestError) {
      toast.error(requestError?.data?.message || "Unable to update profile.");
    }
  };

  const notifyEmailReverification = () => {
    toast.message("Email updates require re-verification. Use your verified account flow to change email.");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Toaster />

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profile & Access</h1>
        <p className="mt-1 text-sm text-slate-500">Update manager contact information and review profile change audit log.</p>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">Loading profile...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4" /> Unable to load profile details.
        </div>
      )}

      {!isLoading && !error && (
        <>
          <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Personal Details</h2>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Job Title</label>
                <input
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g., Operations Manager"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    value={email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={notifyEmailReverification}
                  className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-blue-700 hover:text-blue-800"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Email change requires re-verification
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
              >
                {isSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
                Save changes
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Audit Log</h2>
            <p className="mt-1 text-sm text-slate-500">Recent profile updates logged from this manager dashboard.</p>

            {auditLog.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">No audit entries yet.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {auditLog.map((entry, index) => (
                  <div key={`${entry.timestamp}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Profile updated
                      </p>
                      <p className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString("en-GB")}</p>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">Changed fields: {entry.changedFields.join(", ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};