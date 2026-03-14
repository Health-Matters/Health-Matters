import React from "react";
import { Outlet, useLocation } from "react-router";
import {
  Home,
  TriangleAlert,
  Users,
  Settings,
  ChevronsUpDown,
  BarChart3,
  Package,
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
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Analytics & KPI",
    url: "/admin/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Service Management",
    url: "/admin/dashboard/services",
    icon: Package,
  },
  {
    title: "Referrals",
    url: "/admin/dashboard/referrals",
    icon: TriangleAlert,
  },
  {
    title: "Users",
    url: "/admin/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/admin/dashboard/settings",
    icon: Settings,
  },
];

const AdminDashboardLayout = () => {
  const { user } = useUser();
  const location = useLocation();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div data-dashboard="admin" className="flex min-h-screen w-full bg-linear-to-br from-slate-100 via-blue-50/60 to-slate-100 dark:bg-linear-to-br dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-950 dark:text-slate-100">
          {/* SIDEBAR: Blue Theme Applied Here */}
          <Sidebar className="border-r border-blue-800 bg-blue-900 text-white dark:border-blue-900 dark:bg-slate-950">
            
            {/* Header */}
            <SidebarHeader className="flex h-16 items-center border-b border-blue-800 px-6 dark:border-blue-900">
              <div className="flex w-full items-center gap-3">
                <img
                  src={logoTrans}
                  alt="Health Matters"
                  className="h-10 w-10 rounded-md bg-white/10 p-1 object-contain"
                />
                <span className="text-lg font-bold tracking-wide text-white">
                  Admin Panel
                </span>
              </div>
            </SidebarHeader>

            {/* Content / Menu */}
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
                                  ? "bg-blue-700 text-white" // Active State
                                  : "text-blue-100 hover:bg-blue-800 hover:text-white" // Inactive State
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

            {/* Footer */}
            <SidebarFooter className="border-t border-blue-800 p-4 dark:border-blue-900">
              <div className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-blue-800 dark:hover:bg-slate-900">
                <div className="flex items-center gap-3">
                  <UserButton 
                    appearance={{
                      elements: { userButtonAvatarBox: "h-8 w-8" }
                    }}
                  />
                  <div className="flex flex-col text-sm text-white">
                    <span className="font-medium">
                      {user?.firstName || "User"}
                    </span>
                    <span className="text-xs text-blue-200">
                      Admin
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-blue-200" />
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* MAIN CONTENT */}
          <main className="flex flex-1 flex-col overflow-hidden">
            {/* Top Navbar */}
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-blue-900 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-200 dark:hover:bg-slate-800 dark:hover:text-blue-100" />
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

            {/* Page Content Outlet */}
            <div className="flex-1 overflow-auto p-6 text-slate-900 dark:text-slate-100 [--admin-btn:#2563eb] [&_button]:font-medium [&_button]:transition-colors [&_button:not([data-sidebar=trigger])]:rounded-lg [&_button:not([data-sidebar=trigger])]:border [&_button:not([data-sidebar=trigger])]:border-blue-700 [&_button:not([data-sidebar=trigger])]:bg-blue-600 [&_button:not([data-sidebar=trigger])]:text-white [&_button:not([data-sidebar=trigger])]:hover:bg-blue-700 [&_button:not([data-sidebar=trigger])]:hover:text-white">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AdminDashboardLayout;
