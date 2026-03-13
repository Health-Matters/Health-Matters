
import { useEffect } from "react";
import { Outlet } from "react-router";
import { useUser } from "@clerk/clerk-react";

export const RootLayout = () => {
    const { isLoaded, isSignedIn, user } = useUser();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            console.log("Authenticated role:", user?.publicMetadata?.role);
        }
    }, [isLoaded, isSignedIn, user]);

    return (
        <>
            <Outlet /> 
            {/* Renders the matched child route component like HomePage or DashBoardPage Placeholder for other layouts */}
        </>
    );
};

export default RootLayout;