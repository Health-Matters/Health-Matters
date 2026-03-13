import { Outlet } from "react-router"
import { Navbar } from "../pages/Landing-page/NavBar/navBar"

export const MainLayout = () => {
    return (
        <>
        <Navbar />
        <Outlet />
        </>
    )
}
export default MainLayout;