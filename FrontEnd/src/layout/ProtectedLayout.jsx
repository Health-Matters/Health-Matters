import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useGetMeQuery } from "@/store/api";

const roleToPath = {
    admin: "/admin/dashboard",
    employee: "/employee/dashboard",
    practitioner: "/practitioner/dashboard",
    manager: "/manager/dashboard",
};

export const ProtectedLayout = () => {
    const { isSignedIn, isLoaded, user } = useUser();
    const { pathname } = useLocation();

    const { data: me } = useGetMeQuery(undefined, {
        skip: !isSignedIn,
    });

    const clerkRole = typeof user?.publicMetadata?.role === "string"
        ? user.publicMetadata.role.toLowerCase()
        : undefined;
    const dbRole = typeof me?.role === "string" ? me.role.toLowerCase() : undefined;
    const effectiveRole = clerkRole || dbRole;
    const targetPath = effectiveRole ? roleToPath[effectiveRole] : undefined;

    if (!isLoaded) {
        return null;
    }

    if (!isSignedIn) {
        return <Navigate to="/sign-in" replace />;
    }

    if (!targetPath) {
        return (
            <div className="min-h-screen w-full bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <h1 className="text-xl font-semibold text-slate-800">
                            Role Pending
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            An admin will assign your role soon.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!pathname.startsWith(targetPath)) {
        return <Navigate to={targetPath} replace />;
    }

    return <Outlet />;
};