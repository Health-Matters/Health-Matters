import {
  AlertCircle,
  Calendar,
  Moon,
  Phone,
  ShieldCheck,
  Stethoscope,
  Sun,
  User,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useGetMeQuery } from "../../../store/api";
import { useDispatch, useSelector } from "react-redux";
import { setThemeMode } from "../../../store/themeSlice";

/*
 Team G - Practitioner profile details single-page view with role-specific identity data (TMG-006) . Done by Helika
*/

const displayValue = (value) => (value && String(value).trim() ? value : "—");

const DisplayField = ({ label, value }) => (
  <div>
    <p className="mb-1 ml-1 text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
    <div className="flex min-h-12 items-center overflow-hidden rounded-2xl border border-transparent bg-gray-50 px-5 py-3.5 text-slate-700 shadow-sm">
      <span className="w-full truncate font-semibold">{displayValue(value)}</span>
    </div>
  </div>
);

const ProfileAvatar = ({ clerkUser, firstName }) => {
  const imageUrl = clerkUser?.imageUrl;
  const initial = (firstName || clerkUser?.firstName || "P").charAt(0).toUpperCase();

  if (imageUrl) {
    return <img src={imageUrl} alt="Profile" className="h-full w-full object-cover" />;
  }

  return <span className="select-none text-6xl font-bold text-white">{initial}</span>;
};

export const PractitionerTestProfile = () => {
  const { user: clerkUser } = useUser();
  const { data: me, isLoading, isError, error } = useGetMeQuery();
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.theme.mode);

  if (isLoading || !clerkUser) {
    return (
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center p-6">
        <p className="text-sm font-medium text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const profile = me ?? {};
  const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "—";
  const dateOfBirth = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto min-h-screen max-w-7xl space-y-8 p-6">
      {isError && (
        <div className="flex items-center gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-semibold">
            {error?.data?.message || "Profile data could not be loaded. Showing placeholders."}
          </p>
        </div>
      )}

      <header>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-0.5 text-sm text-gray-500">Your professional and personal practitioner details</p>
      </header>

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="lg:col-span-4">
          <div className="flex w-full flex-col items-center rounded-[32px] border border-gray-100 bg-white p-10 shadow-sm">
            <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-[2.5rem] border-4 border-blue-50 bg-blue-900 shadow-md">
              <ProfileAvatar clerkUser={clerkUser} firstName={profile.firstName} />
            </div>

            <h2 className="mt-6 w-full truncate text-center text-2xl font-bold text-slate-800">{fullName}</h2>
            <div className="mt-2 max-w-full overflow-hidden rounded-full border border-gray-200 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              <span className="block truncate">{profile.department || "Practitioner"}</span>
            </div>

            {profile.email && (
              <div className="mt-6 flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gray-50 px-4 py-3 text-sm text-slate-600">
                <ShieldCheck size={16} className="shrink-0 text-blue-900" />
                <span className="truncate font-medium">{profile.email}</span>
              </div>
            )}

            {profile.phone && (
              <div className="mt-2 flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gray-50 px-4 py-3 text-sm text-slate-600">
                <Phone size={16} className="shrink-0 text-blue-900" />
                <span className="truncate font-medium">{profile.phone}</span>
              </div>
            )}

            {profile.dateOfBirth && (
              <div className="mt-2 flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gray-50 px-4 py-3 text-sm text-slate-600">
                <Calendar size={16} className="shrink-0 text-blue-900" />
                <span className="truncate font-medium">{dateOfBirth}</span>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-7 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-900">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <DisplayField label="First Name" value={profile.firstName} />
              <DisplayField label="Last Name" value={profile.lastName} />
              <DisplayField label="Date of Birth" value={dateOfBirth} />
              <DisplayField label="Department" value={profile.department} />
            </div>
          </section>

          <section className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-7 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-900">
                <Stethoscope size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Contact Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <DisplayField label="Email Address" value={profile.email} />
              <DisplayField label="Phone Number" value={profile.phone} />
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Profile Display</p>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-medium text-slate-700">Dark mode</p>
                <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => dispatch(setThemeMode("light"))}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      themeMode === "light" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(setThemeMode("dark"))}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      themeMode === "dark" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" /> Dark
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
