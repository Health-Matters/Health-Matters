import React, { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Package,
  UserCheck,
  AlertCircle,
  Download,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  useGetServicesQuery,
  useGetReferralsQuery,
  useGetUsersQuery,
} from "@/store/api";

const COLORS = {
  pending: "#f59e0b",
  accepted: "#10b981",
  rejected: "#ef4444",
  active: "#3b82f6",
  inactive: "#6b7280",
};

export const AnalyticsKPI = () => {
  const { data: services = [], isLoading: servicesLoading, refetch: refetchServices } = useGetServicesQuery();
  const { data: referrals = [], isLoading: referralsLoading, refetch: refetchReferrals } = useGetReferralsQuery();
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useGetUsersQuery();

  const isLoading = servicesLoading || referralsLoading || usersLoading;

  // Calculate KPIs
  const kpis = useMemo(() => {
    // Referral metrics
    const totalReferrals = referrals.length;
    const pendingReferrals = referrals.filter(r => r.referralStatus === "pending").length;
    const acceptedReferrals = referrals.filter(r => r.referralStatus === "accepted").length;
    const rejectedReferrals = referrals.filter(r => r.referralStatus === "rejected").length;
    
    // Calculate acceptance rate
    const totalProcessed = acceptedReferrals + rejectedReferrals;
    const acceptanceRate = totalProcessed > 0 
      ? Math.round((acceptedReferrals / totalProcessed) * 100) 
      : 0;

    // User metrics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const practitionerCount = users.filter(u => u.role === "practitioner").length;
    const employeeCount = users.filter(u => u.role === "employee").length;
    const managerCount = users.filter(u => u.role === "manager").length;
    const adminCount = users.filter(u => u.role === "admin").length;

    // Service metrics
    const totalServices = services.length;
    const activeServices = services.filter(s => s.isActive).length;
    const avgServiceDuration = services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + (s.defaultDuration || 0), 0) / services.length)
      : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReferrals = referrals.filter(r => 
      new Date(r.createdAt) >= sevenDaysAgo
    ).length;

    // Month-over-month trend (simplified - comparing last 30 days to previous 30)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const lastMonthReferrals = referrals.filter(r => 
      new Date(r.createdAt) >= thirtyDaysAgo
    ).length;
    const previousMonthReferrals = referrals.filter(r => {
      const date = new Date(r.createdAt);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;
    
    const monthlyGrowth = previousMonthReferrals > 0
      ? Math.round(((lastMonthReferrals - previousMonthReferrals) / previousMonthReferrals) * 100)
      : 0;

    return {
      totalReferrals,
      pendingReferrals,
      acceptedReferrals,
      rejectedReferrals,
      acceptanceRate,
      totalUsers,
      activeUsers,
      practitionerCount,
      employeeCount,
      managerCount,
      adminCount,
      totalServices,
      activeServices,
      avgServiceDuration,
      recentReferrals,
      monthlyGrowth,
    };
  }, [referrals, users, services]);

  // Referral status distribution for pie chart
  const referralStatusData = useMemo(() => [
    { name: "Pending", value: kpis.pendingReferrals, color: COLORS.pending },
    { name: "Accepted", value: kpis.acceptedReferrals, color: COLORS.accepted },
    { name: "Rejected", value: kpis.rejectedReferrals, color: COLORS.rejected },
  ].filter(item => item.value > 0), [kpis]);

  // User role distribution for bar chart
  const userRoleData = useMemo(() => [
    { role: "Admins", count: kpis.adminCount },
    { role: "Managers", count: kpis.managerCount },
    { role: "Practitioners", count: kpis.practitionerCount },
    { role: "Employees", count: kpis.employeeCount },
  ], [kpis]);

  // Service category distribution
  const serviceCategoryData = useMemo(() => {
    const categoryCounts = services.reduce((acc, service) => {
      const category = service.category || "Unknown";
      const label = category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [services]);

  // Time-based referral trend (last 7 days)
  const referralTrendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const count = referrals.filter(r => {
        const refDate = new Date(r.createdAt);
        return refDate >= dayStart && refDate <= dayEnd;
      }).length;

      days.push({ day: dayLabel, referrals: count });
    }
    return days;
  }, [referrals]);

  const handleRefreshAll = () => {
    refetchServices();
    refetchReferrals();
    refetchUsers();
  };

  const handleDownloadAnalyticsData = () => {
    const now = new Date();

    const sections = [
      "Health Matters - Analytics and KPI Dashboard Export",
      `Generated: ${now.toLocaleString()}`,
      "",
      "KPI SUMMARY",
      `- Total Referrals: ${kpis.totalReferrals}`,
      `- Pending Referrals: ${kpis.pendingReferrals}`,
      `- Accepted Referrals: ${kpis.acceptedReferrals}`,
      `- Rejected Referrals: ${kpis.rejectedReferrals}`,
      `- Acceptance Rate: ${kpis.acceptanceRate}%`,
      `- Total Users: ${kpis.totalUsers}`,
      `- Active Users: ${kpis.activeUsers}`,
      `- Practitioners: ${kpis.practitionerCount}`,
      `- Managers: ${kpis.managerCount}`,
      `- Employees: ${kpis.employeeCount}`,
      `- Admins: ${kpis.adminCount}`,
      `- Total Services: ${kpis.totalServices}`,
      `- Active Services: ${kpis.activeServices}`,
      `- Average Service Duration: ${kpis.avgServiceDuration} minutes`,
      `- Recent Referrals (7 days): ${kpis.recentReferrals}`,
      `- Monthly Growth: ${kpis.monthlyGrowth}%`,
      "",
      "REFERRAL STATUS DISTRIBUTION",
      ...(referralStatusData.length > 0
        ? referralStatusData.map((item) => `- ${item.name}: ${item.value}`)
        : ["- No referral status data available"]),
      "",
      "USER ROLE DISTRIBUTION",
      ...(userRoleData.length > 0
        ? userRoleData.map((item) => `- ${item.role}: ${item.count}`)
        : ["- No user role data available"]),
      "",
      "SERVICE CATEGORY DISTRIBUTION",
      ...(serviceCategoryData.length > 0
        ? serviceCategoryData.map((item) => `- ${item.name}: ${item.value}`)
        : ["- No service category data available"]),
      "",
      "REFERRAL TREND (LAST 7 DAYS)",
      ...(referralTrendData.length > 0
        ? referralTrendData.map((item) => `- ${item.day}: ${item.referrals}`)
        : ["- No referral trend data available"]),
      "",
      "End of export.",
    ];

    const content = sections.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const timestamp = now.toISOString().replace(/[:.]/g, "-");

    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-kpi-export-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Analytics & KPI Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Monitor key performance indicators and system metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 border border-blue-700 bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleRefreshAll}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh All
          </Button>
          <Button
            size="sm"
            className="gap-2 border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            onClick={handleDownloadAnalyticsData}
          >
            <Download className="h-4 w-4" />
            Download .txt
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Referrals
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{kpis.totalReferrals}</div>
            <div className="flex items-center gap-1 mt-1">
              {kpis.monthlyGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
              )}
              <p className={`text-xs ${kpis.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {kpis.monthlyGrowth >= 0 ? '+' : ''}{kpis.monthlyGrowth}% this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Acceptance Rate
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{kpis.acceptanceRate}%</div>
            <p className="text-xs text-slate-500 mt-1">
              {kpis.acceptedReferrals} accepted / {kpis.rejectedReferrals} rejected
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{kpis.activeUsers}</div>
            <p className="text-xs text-slate-500 mt-1">
              {kpis.totalUsers > 0 ? Math.round((kpis.activeUsers / kpis.totalUsers) * 100) : 0}% of {kpis.totalUsers} total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Services
            </CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{kpis.activeServices}</div>
            <p className="text-xs text-slate-500 mt-1">
              Avg. {kpis.avgServiceDuration} min duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending Referrals
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{kpis.pendingReferrals}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Practitioners
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{kpis.practitionerCount}</div>
            <p className="text-xs text-slate-500 mt-1">Healthcare providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Recent Activity
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{kpis.recentReferrals}</div>
            <p className="text-xs text-slate-500 mt-1">Referrals (last 7 days)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Referral Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Referral Trend (7 Days)
            </CardTitle>
            <CardDescription>Daily referral submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={referralTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="referrals" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Referral Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Referral Status Distribution
            </CardTitle>
            <CardDescription>Current referral statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-75">
              {referralStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={referralStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {referralStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No referral data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Roles Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              User Distribution by Role
            </CardTitle>
            <CardDescription>Breakdown of user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userRoleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="role" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Categories Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Service Categories
            </CardTitle>
            <CardDescription>Distribution of service types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-75">
              {serviceCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={{ stroke: '#cbd5e1' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No service data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Active Services:</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {kpis.activeServices} / {kpis.totalServices}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Active Users:</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {kpis.activeUsers} / {kpis.totalUsers}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Pending Referrals:</span>
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                  {kpis.pendingReferrals}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Inactive Services:</span>
                <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                  {kpis.totalServices - kpis.activeServices}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Total Managers:</span>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {kpis.managerCount}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Total Employees:</span>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {kpis.employeeCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
