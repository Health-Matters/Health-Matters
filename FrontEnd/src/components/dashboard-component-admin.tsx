"use client"
import React, { useState, useEffect } from "react";
import {
  Home,
  DollarSign,
  Monitor,
  ShoppingCart,
  Tag,
  BarChart3,
  Users,
  ChevronDown,
  ChevronsRight,
  Moon,
  Sun,
  TrendingUp,
  Activity,
  Package,
  Bell,
  Settings,
  HelpCircle,
  User,
  Menu,
  X,
} from "lucide-react";

export const Admin = () => {
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Controls width on desktop
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Controls visibility on mobile

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`flex h-screen w-full ${isDark ? 'dark' : ''}`}>
      <div className="flex h-full w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        <ExampleContent 
          isDark={isDark} 
          setIsDark={setIsDark} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
      </div>
    </div>
  );
};

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [selected, setSelected] = useState("Dashboard");

  // Determine width based on state and device
  // Desktop: Controlled by isSidebarOpen (w-64 or w-16)
  // Mobile: Always w-64 when open, but handled via transform
  const desktopClasses = isSidebarOpen ? 'md:w-64' : 'md:w-16';
  const mobileClasses = isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <nav
      className={`
        fixed inset-y-0 left-0 z-50 h-screen shrink-0 border-r bg-white shadow-sm transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900
        ${desktopClasses} 
        md:sticky md:top-0 md:translate-x-0 
        ${mobileClasses}
        w-64 p-2 
      `}
    >
      <TitleSection open={isSidebarOpen} isMobile={false} />

      <div className="space-y-1 mb-8">
        <Option
          Icon={Home}
          title="Dashboard"
          selected={selected}
          setSelected={setSelected}
          open={isSidebarOpen}
        />
        <Option
          Icon={DollarSign}
          title="Sales"
          selected={selected}
          setSelected={setSelected}
          open={isSidebarOpen}
          notifs={3}
        />
        <Option
          Icon={Monitor}
          title="View Site"
          selected={selected}
          setSelected={setSelected}
          open={isSidebarOpen}
        />
        <Option
          Icon={ShoppingCart}
          title="Products"
          selected={selected}
          setSelected={setSelected}
          open={isSidebarOpen}
        />
        <Option
          Icon={Tag}
          title="Tags"
          selected={selected}
          setSelected={setSelected}
          open={isSidebarOpen}
        />
        <Option
          Icon={BarChart3}
          title="Analytics"
          selected={selected}
          setSelected={setSelected}
          open={isSidebarOpen}
        />
        <Option
          Icon={Users}
          title="Members"
          selected={selected}
          setSelected={setSelected}
          open={isSidebarOpen}
          notifs={12}
        />
      </div>

      <div className={`border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1 ${!isSidebarOpen && 'hidden md:block'}`}>
        {(isSidebarOpen || isMobileMenuOpen) && (
             <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Account
             </div>
        )}
        <Option
          Icon={Settings}
          title="Settings"
          selected={selected}
          setSelected={setSelected}
          open={isSidebarOpen}
        />
        <Option
          Icon={HelpCircle}
          title="Help & Support"
          selected={selected}
          setSelected={setSelected}
          open={isSidebarOpen}
        />
      </div>

      <ToggleClose open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      
      {/* Mobile Close Button (Top Right of Sidebar) */}
      <button 
        onClick={() => setIsMobileMenuOpen(false)}
        className="absolute top-4 right-4 md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <X className="h-6 w-6" />
      </button>
    </nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs }) => {
  const isSelected = selected === title;
  
  return (
    <button
      onClick={() => setSelected(title)}
      className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
        isSelected 
          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <div className="grid h-full w-12 shrink-0 place-content-center">
        <Icon className="h-4 w-4" />
      </div>
      
      <span
        className={`text-sm font-medium transition-all duration-200 overflow-hidden whitespace-nowrap ${
          open ? 'w-auto opacity-100' : 'w-0 opacity-0 md:w-0'
        }`}
      >
        {title}
      </span>

      {notifs && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-xs text-white font-medium">
          {notifs}
        </span>
      )}
    </button>
  );
};

const TitleSection = ({ open }) => {
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-3">
          <Logo />
          <div className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${open ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            <div className="flex items-center gap-2">
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  TomIsLoading
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Pro Plan
                </span>
              </div>
            </div>
          </div>
        </div>
        {open && (
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
      <svg
        width="20"
        height="auto"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
      >
        <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" />
        <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" />
      </svg>
    </div>
  );
};

const ToggleClose = ({ open, setOpen }) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="hidden md:block absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Hide
          </span>
        )}
      </div>
    </button>
  );
};

const ExampleContent = ({ isDark, setIsDark, onMenuClick }) => {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 md:p-6 overflow-y-auto overflow-x-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-sm py-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">Welcome back to your dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button className="relative p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors hidden sm:block">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard 
          icon={DollarSign} 
          title="Total Sales" 
          value="$24,567" 
          trend="+12% from last month" 
          color="blue" 
        />
        <StatCard 
          icon={Users} 
          title="Active Users" 
          value="1,234" 
          trend="+5% from last week" 
          color="green" 
        />
        <StatCard 
          icon={ShoppingCart} 
          title="Orders" 
          value="456" 
          trend="+8% from yesterday" 
          color="purple" 
        />
        <StatCard 
          icon={Package} 
          title="Products" 
          value="89" 
          trend="+3 new this week" 
          color="orange" 
        />
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {[
                { icon: DollarSign, title: "New sale recorded", desc: "Order #1234 completed", time: "2 min ago", color: "green" },
                { icon: Users, title: "New user registered", desc: "john.doe@example.com joined", time: "5 min ago", color: "blue" },
                { icon: Package, title: "Product updated", desc: "iPhone 15 Pro stock updated", time: "10 min ago", color: "purple" },
                { icon: Activity, title: "System maintenance", desc: "Scheduled backup completed", time: "1 hour ago", color: "orange" },
                { icon: Bell, title: "New notification", desc: "Marketing campaign results", time: "2 hours ago", color: "red" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className={`p-2 shrink-0 rounded-lg ${
                    activity.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                    activity.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    activity.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' :
                    activity.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                    'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <activity.icon className={`h-4 w-4 ${
                      activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      activity.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      activity.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {activity.desc}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <ProgressBar label="Conversion Rate" value="3.2%" percentage={32} color="bg-blue-500" />
              <ProgressBar label="Bounce Rate" value="45%" percentage={45} color="bg-orange-500" />
              <ProgressBar label="Page Views" value="8.7k" percentage={87} color="bg-green-500" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Products</h3>
            <div className="space-y-3">
              {['iPhone 15 Pro', 'MacBook Air M2', 'AirPods Pro', 'iPad Air'].map((product, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{product}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${Math.floor(Math.random() * 1000 + 500)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extracted small components for cleaner code
const StatCard = ({ icon: Icon, title, value, trend, color }) => {
  const colors = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
    green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
    orange: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
  };

  return (
    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <TrendingUp className="h-4 w-4 text-green-500" />
      </div>
      <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-green-600 dark:text-green-400 mt-1">{trend}</p>
    </div>
  );
};

const ProgressBar = ({ label, value, percentage, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
);

export default Admin;

