import React, { useState } from "react";
import {
  Calendar,
  Home,
  Inbox,
  ChevronsUpDown,
  TriangleAlert,
  Activity,
  FileText,
  Users,
  Search,
  Bell,
  Clock,
  TrendingUp,
  PieChart,
  ArrowRight
} from "lucide-react";
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";

// Updated Menu Items with URLs
const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Referrals", url: "/referrals", icon: Inbox },
  { title: "Appointments", url: "/appointments", icon: Calendar },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Clinical Reports", url: "/reports", icon: FileText },
  { title: "Anomalies", url: "/anomalies", icon: TriangleAlert }, // We will style this one differently
  { title: "Analytics", url: "/analytics", icon: PieChart },
];

const HealthMattersDashboard = () => {
  const [activeUrl, setActiveUrl] = useState("/dashboard");

  return (
    <SidebarProvider className="font-sans min-h-screen w-full bg-[#09090b] text-white">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>

      <div className="flex min-h-screen w-full relative z-10">
        
        {/* --- SIDEBAR --- */}
        <Sidebar className="border-r border-white/5 bg-black/40 backdrop-blur-2xl text-white">
          <SidebarHeader className="h-16 flex items-center px-6 border-b border-white/5">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    <Activity className="text-white h-5 w-5" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">
                    Health<span className="text-cyan-400">Matters</span>
                </span>
             </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Platform
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const isActive = activeUrl === item.url;
                    const isAnomaly = item.title === "Anomalies";
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          tooltip={item.title}
                          isActive={isActive}
                          onClick={() => setActiveUrl(item.url)} 
                          className={`
                            h-10 px-4 rounded-xl transition-all duration-300 group mb-1 border
                            ${isActive 
                               ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" 
                               : "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
                            }
                            ${!isActive && isAnomaly ? "hover:text-rose-400 hover:bg-rose-500/5" : ""}
                          `}
                        >
                          <a href={item.url} className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-3">
                              <item.icon className={`h-4 w-4 transition-colors 
                                ${isActive ? "text-cyan-400" : isAnomaly ? "text-rose-400/70 group-hover:text-rose-400" : "text-slate-500 group-hover:text-white"}
                              `} />
                              <span className="font-medium">{item.title}</span>
                            </div>
                            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>}
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-white/5">
            <SidebarMenuButton className="h-auto w-full p-3 hover:bg-white/5 transition-all rounded-xl border border-white/5 group">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white ring-2 ring-black">
                    DS
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        Dr. Sarah
                    </span>
                    <span className="text-[10px] text-slate-400">
                        Head Practitioner
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-slate-600" />
              </div>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
          
          <header className="h-16 flex items-center justify-between px-6 bg-black/20 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20">
             <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9 border border-white/10 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors" />
                <div className="hidden md:flex items-center px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 focus-within:border-cyan-500/50 focus-within:bg-black/40 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all w-64">
                    <Search className="h-4 w-4 mr-2 text-slate-500" />
                    <input type="text" placeholder="Search records..." className="bg-transparent border-none outline-none placeholder:text-slate-600 w-full text-white" />
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                 <button className="relative p-2 text-slate-400 hover:text-white transition-colors group">
                    <Bell className="h-5 w-5 group-hover:text-cyan-400 transition-colors" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#22d3ee]"></span>
                 </button>
                 <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <div className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-xs font-medium text-emerald-400">System Live</span>
                 </div>
             </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="max-w-7xl mx-auto space-y-8">
               
               {/* Welcome Banner */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                        <p className="text-slate-400 mt-1">Welcome back, Dr. Sarah. You have <span className="text-rose-400 font-medium">3 anomalies</span> requiring review.</p>
                    </div>
                    <div className="flex gap-3">
                         <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors text-sm font-medium">Export Data</button>
                         <button className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-colors text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2">
                            <span>+ New Referral</span>
                         </button>
                    </div>
               </div>

               {/* Stats Grid - Now with distinct themes */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <StatCard 
                      title="Total Referrals" 
                      value="1,284" 
                      change="+12.5%" 
                      icon={FileText} 
                      trend="up" 
                      theme="cyan" 
                   />
                   <StatCard 
                      title="Appointments" 
                      value="42" 
                      change="Today" 
                      icon={Calendar} 
                      trend="neutral" 
                      theme="violet" 
                   />
                   <StatCard 
                      title="Wait Time" 
                      value="2.4d" 
                      change="-18%" 
                      icon={Clock} 
                      trend="down" 
                      theme="emerald" 
                   />
                   <StatCard 
                      title="Active Cases" 
                      value="365" 
                      change="+4%" 
                      icon={Activity} 
                      trend="up" 
                      theme="rose" 
                   />
               </div>

               {/* Charts & Content */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">
                   
                   {/* Main Chart */}
                   <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 flex flex-col relative overflow-hidden">
                        {/* Decorative Grid BG */}
                        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none" />
                        
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Case Volume</h3>
                                <p className="text-xs text-slate-500">Referrals processed over time</p>
                            </div>
                            <select className="bg-white/5 border border-white/10 text-xs text-slate-300 rounded-md px-3 py-1.5 outline-none hover:bg-white/10 cursor-pointer transition-colors">
                                <option className="bg-slate-900">Last 7 Days</option>
                                <option className="bg-slate-900">Last 30 Days</option>
                            </select>
                        </div>
                        
                        <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2 relative z-10">
                             {[45, 60, 50, 75, 60, 85, 95, 80, 70, 60, 80, 100].map((h, i) => (
                                 <div key={i} className="w-full flex flex-col justify-end gap-2 group cursor-pointer h-full">
                                     <div 
                                        className="w-full rounded-t-sm transition-all duration-300 bg-gradient-to-t from-cyan-500/10 to-cyan-500/40 group-hover:from-cyan-500/20 group-hover:to-cyan-400 border-t border-cyan-400/30" 
                                        style={{ height: `${h}%` }}
                                     ></div>
                                     <div className="h-0.5 w-full bg-white/10 group-hover:bg-cyan-500/50 transition-colors" />
                                 </div>
                             ))}
                        </div>
                   </div>

                   {/* Alerts / Anomalies Panel */}
                   <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white">Anomalies</h3>
                            <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2 py-1 rounded-full border border-rose-500/20 animate-pulse">3 REQUIRES ACTION</span>
                        </div>
                        
                        <div className="space-y-3 flex-1 overflow-auto">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex gap-4 p-3 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-rose-500/30 hover:from-rose-500/5 transition-all cursor-pointer group">
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:text-rose-300 group-hover:scale-110 transition-transform">
                                        <TriangleAlert className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-200 group-hover:text-white">High Risk Factor</h4>
                                        <p className="text-xs text-slate-500 mt-1">Patient #8294 flagged via AI model.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button className="w-full mt-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white border border-dashed border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2 group">
                            View All Anomalies <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                   </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

// Enhanced Stat Card with Themes
const StatCard = ({ title, value, change, icon: Icon, trend, theme = "cyan" }) => {
    // Theme Definitions
    const themes = {
        cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    };

    const isPositive = trend === "up";
    const trendIconClass = trend === "down" ? "rotate-180" : "";
    
    // Determine trend color based on context (Wait Time down = good/emerald)
    let trendColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (trend === "neutral") trendColor = "text-slate-400 bg-slate-500/10 border-slate-500/20";
    else if (title === "Active Cases" && trend === "up") trendColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";

    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all group relative overflow-hidden">
            {/* Subtle Gradient Glow Background */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[50px] opacity-20 group-hover:opacity-30 transition-opacity ${themes[theme].split(" ")[0].replace("text-", "bg-")}`} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl transition-all ${themes[theme]}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${trendColor}`}>
                    {trend !== "neutral" && <TrendingUp className={`h-3 w-3 ${trendIconClass}`} />}
                    {change}
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
                <p className="text-sm text-slate-400 font-medium">{title}</p>
            </div>
        </div>
    )
}

export default HealthMattersDashboard;