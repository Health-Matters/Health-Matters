import React from "react";
import { Outlet, useLocation } from "react-router";
import {
  Home,
  TriangleAlert,
  BookOpen,
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
    title: "Diary",
    url: "/admin/dashboard/diary",
    icon: BookOpen,
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
        <div className="flex min-h-screen w-full bg-slate-50">
          {/* SIDEBAR: Blue Theme Applied Here */}
          <Sidebar className="border-r border-blue-800 bg-blue-900 text-white">
            
            {/* Header */}
            <SidebarHeader className="flex h-16 items-center border-b border-blue-800 px-6">
              <span className="text-lg font-bold tracking-wide text-white">
                Admin Panel
              </span>
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
            <SidebarFooter className="border-t border-blue-800 p-4">
              <div className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-blue-800">
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
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-blue-900 hover:bg-blue-50 hover:text-blue-700" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Dashboard
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium text-slate-600">Online</span>
              </div>
            </header>

            {/* Page Content Outlet */}
            <div className="flex-1 overflow-auto p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AdminDashboardLayout;
