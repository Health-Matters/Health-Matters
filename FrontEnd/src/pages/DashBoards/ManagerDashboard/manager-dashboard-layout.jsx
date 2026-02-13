import React from "react";
import { Outlet, useLocation } from "react-router";
import {
  Home,
  Users,
  LineChart,
  Wallet,
  User,
  ChevronsUpDown,
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
    title: "Overview",
    url: "/manager/dashboard",
    icon: Home,
  },
  {
    title: "Team",
    url: "/manager/dashboard/team",
    icon: Users,
  },
  {
    title: "Insights",
    url: "/manager/dashboard/insights",
    icon: LineChart,
  },
  {
    title: "Budget",
    url: "/manager/dashboard/budget",
    icon: Wallet,
  },
  {
    title: "Profile",
    url: "/manager/dashboard/profile",
    icon: User,
  },
];

const ManagerDashboardLayout = () => {
  const { user } = useUser();
  const location = useLocation();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-50">
          <Sidebar className="border-r border-slate-800 bg-slate-900 text-white">
            <SidebarHeader className="flex h-16 items-center border-b border-slate-800 px-6">
              <span className="text-lg font-bold tracking-wide text-white">
                Manager Panel
              </span>
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
                                  ? "bg-slate-700 text-white"
                                  : "text-slate-100 hover:bg-slate-800 hover:text-white"
                              }
                            `}
                          >
                            <a href={item.url} className="flex items-center gap-3">
                              <item.icon className="h-5 w-5" />
                              <span className="font-medium">{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-800 p-4">
              <div className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-slate-800">
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
                    <span className="text-xs text-slate-200">Manager</span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-slate-200" />
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex flex-1 flex-col overflow-hidden">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-slate-900 hover:bg-slate-50 hover:text-slate-700" />
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

export default ManagerDashboardLayout;
