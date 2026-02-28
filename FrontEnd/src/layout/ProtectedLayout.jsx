import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router"; // Removed Outlet if not used, or keep if needed
import { useEffect } from "react";

const roleToPath = {
    admin: "/admin/dashboard",
    employee: "/employee/dashboard",
    practitioner: "/practitioner/dashboard",
    manager: "/manager/dashboard",
};

export const ProtectedLayout = () => {
    // 1. Always call Hooks at the top level
    const { isSignedIn, isLoaded, user } = useUser();

    // 2. Define variables immediately (safe to do even if loading)
    const role = user?.publicMetadata?.role;
    const targetPath = role && roleToPath[role]; // Safe check

    // 3. Call useEffect BEFORE any return statements
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            console.log("Authenticated role:", role);
        }
    }, [isLoaded, isSignedIn, role]);

    // 4. NOW you can handle your conditional returns
    if (!isLoaded) {
        return null;
    }

    if (!isSignedIn) {
        return <Navigate to="/sign-in" replace />;
    }

    // If the user has a valid role, redirect them immediately
    if (targetPath) {
        return <Navigate to={targetPath} replace />;
    }

    // If signed in but no role assigned yet
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
};