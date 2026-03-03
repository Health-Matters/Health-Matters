import React from "react";
import { Outlet, useLocation, Link } from "react-router";
import {
  Home,
  ClipboardList,
  BarChart3,
  CalendarDays,
  User,
  ChevronsUpDown,
  LogOut,
  Settings,
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

const items = [
  {
    title: "Dashboard",
    url: "/employee/dashboard",
    icon: Home,
  },
  {
    title: "Submit Referral",
    url: "/employee/dashboard/submit-referral",
    icon: ClipboardList,
  },
  {
    title: "My Profile",
    url: "/employee/dashboard/profile",
    icon: User,
  },
  {
    title: "Notifications",
    url: "/employee/dashboard/notifications",
    icon: CalendarDays,
  },
  {
    title: "Help & Advice",
    url: "/employee/dashboard/help",
    icon: User,
  },
  {
    title: "Settings",
    url: "/employee/dashboard/settings",
    icon: Settings,
  },
];

const EmployeeDashboardLayout = () => {
  const { user } = useUser();
  const location = useLocation();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-emerald-50">
          <Sidebar className="border-r border-emerald-800 bg-emerald-900 text-white">
            <SidebarHeader className="flex h-16 items-center border-b border-emerald-800 px-6">
              <span className="text-lg font-bold tracking-wide text-white">
                Employee Panel
              </span>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => {
                      const isActive = location.pathname.startsWith(item.url);
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
                                  ? "bg-emerald-700 text-white"
                                  : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
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

            <SidebarFooter className="border-t border-emerald-800 p-4">
              <div className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-emerald-800">
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
                    <span className="text-xs text-emerald-200">Employee</span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-emerald-200" />
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex flex-1 flex-col overflow-hidden">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-emerald-200 bg-white px-6 shadow-sm">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-emerald-900 hover:bg-emerald-50 hover:text-emerald-700" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Dashboard
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium text-slate-600">Online</span>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default EmployeeDashboardLayout;


