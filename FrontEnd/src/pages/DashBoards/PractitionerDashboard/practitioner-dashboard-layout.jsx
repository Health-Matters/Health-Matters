//practtioner-dashboard-layout.jsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router";
import {
  Home,
  Stethoscope,
  ClipboardCheck,
  CalendarCheck,
  User,
  ChevronsUpDown,
  File
} from "lucide-react";
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { UserButton, useUser } from "@clerk/clerk-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import logoTrans from "../../../assets/Health matter logo_trans.png";

const items = [
  {
    title: "Overview",
    url: "/practitioner/dashboard",
    icon: Home,
  },
  {
    title: "Patients",
    url: "/practitioner/dashboard/patients",
    icon: Stethoscope,
  },
  {
    title: "Reviews",
    url: "/practitioner/dashboard/reviews",
    icon: ClipboardCheck,
  },
  {
    title: "Appointments",
    url: "/practitioner/dashboard/appointments",
    icon: CalendarCheck,
  },
  {
    title: "Profile",
    url: "/practitioner/dashboard/profile",
    icon: User,
  },
  {
    title: "Create Referral",
    url: "/practitioner/dashboard/create_referral",
    icon: File,
  },
];


const PractitionerDashboardLayout = () => {
  const { user } = useUser();
  const location = useLocation();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div data-dashboard="practitioner" className="flex min-h-screen w-full bg-blue-50 dark:bg-linear-to-br dark:from-slate-950 dark:via-blue-950/25 dark:to-slate-950 dark:text-slate-100">
          <Sidebar className="border-r border-slate-800 bg-slate-900 text-slate-100 dark:border-slate-700 dark:bg-slate-950">
            <SidebarHeader className="flex h-16 items-center border-b border-slate-800 px-6 dark:border-slate-700">
              <div className="flex w-full items-center gap-3">
                <img
                  src={logoTrans}
                  alt="Health Matters"
                  className="h-10 w-10 rounded-md bg-white/10 p-1 object-contain"
                />
                <span className="text-lg font-bold tracking-wide text-white">
                  Practitioner Panel
                </span>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            isActive={isActive}
                            className={`
                              mb-1 h-10 w-full rounded-md px-3 transition-colors
                              ${
                                isActive
                                  ? "bg-blue-100 text-slate-900"
                                  : "text-slate-100 hover:bg-slate-800 hover:text-white"
                              }
                            `}
                          >
                            <Link to={item.url} className="flex items-center gap-3">
                              <item.icon className="h-5 w-5" />
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-800 p-4 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-slate-800 dark:hover:bg-slate-900">
                <div className="flex items-center gap-3">
                  <UserButton
                    appearance={{
                      elements: { userButtonAvatarBox: "h-8 w-8" },
                    }}
                  />
                  <div className="flex flex-col text-sm text-white">
                    <span className="font-medium">
                      {user?.firstName || "User"}
                    </span>
                    <span className="text-xs text-slate-300">Practitioner</span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-slate-300" />
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex flex-1 flex-col overflow-hidden">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-blue-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="bg-blue-700 text-white hover:bg-blue-800 dark:bg-slate-800 dark:hover:bg-slate-700" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Dashboard</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    Signed in as {user?.fullName || user?.firstName || "User"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Online</span>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6 text-slate-900 dark:text-slate-100">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default PractitionerDashboardLayout;