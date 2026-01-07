
import { Outlet } from "react-router"

export const RootLayout = () => {
    return (
        <>
            <Outlet /> 
            {/* Renders the matched child route component like HomePage or DashBoardPage Placeholder for other layouts */}
        </>
    );
};

export default RootLayout;