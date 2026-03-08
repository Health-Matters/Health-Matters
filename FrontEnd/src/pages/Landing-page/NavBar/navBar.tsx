import React from "react";
import Logo from "../../../assets/Health matter logo_trans.png";
import { UserButton } from "@clerk/clerk-react";

export const Navbar = () => {
  return (
    <nav className="w-full flex justify-between fixed top-0 left-0 bg-transparent z-50 mx-auto px-4 py-2 items-center">
      {/* NavBar content goes here */}
      <img 
    src={Logo} 
    alt="Health Matters Logo" 
    className="h-20 w-auto object-contain" 
  />
  <UserButton />
    </nav>
  );
}
export default Navbar;