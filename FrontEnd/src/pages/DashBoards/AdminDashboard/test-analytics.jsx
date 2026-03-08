import React, { useMemo } from "react";
import {
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw,
  Loader,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { useGetReferralsQuery, useGetReferralsByPatientIdQuery } from "@/store/api/referralsApi";
import { useGetServicesQuery } from "@/store/api/servicesApi";

export const TestAnalytics = () => {
  // Fetch API data
  const { data: usersData = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useGetUsersQuery({});
  const { data: referralsData = [], isLoading: referralsLoading, error: referralsError, refetch: refetchReferrals } = useGetReferralsQuery();
  const { data: servicesData = [], isLoading: servicesLoading, error: servicesError, refetch: refetchServices } = useGetServicesQuery({});

  // Calculate metrics from API data
  const kpiMetrics = useMemo(() => {
    const totalUsers = usersData?.length || 0;
    const totalReferrals = referralsData?.length || 0;
    const totalServices = servicesData?.length || 0;
    
    // Count referrals by status
    const pendingReferrals = referralsData?.filter(r => r.referralStatus === 'pending')?.length || 0;
    const acceptedReferrals = referralsData?.filter(r => r.referralStatus === 'accepted')?.length || 0;
    
    // Count active services
    const activeServices = servicesData?.filter(s => s.isActive)?.length || 0;
    
    // Count users by role
    const practitioners = usersData?.filter(u => u.role === 'practitioner')?.length || 0;
    
    return [
      {
        title: "Total Users",
        value: totalUsers?.toLocaleString(),
        change: practitioners > 0 ? `${practitioners} practitioners` : "+0",
        trend: "up",
        icon: Users,
        description: "Active users in system",
      },
      {
        title: "Total Services",
        value: totalServices?.toLocaleString(),
        change: `${activeServices} active`,
        trend: activeServices > totalServices / 2 ? "up" : "down",
        icon: Activity,
        description: "Services available",
      },
      {
        title: "Total Referrals",
        value: totalReferrals?.toLocaleString(),
        change: `${pendingReferrals} pending`,
        trend: pendingReferrals > 0 ? "up" : "down",
        icon: Calendar,
        description: "Referrals in system",
      },
      {
        title: "Accepted Referrals",
        value: acceptedReferrals?.toLocaleString(),
        change: totalReferrals > 0 ? `${Math.round((acceptedReferrals / totalReferrals) * 100)}%` : "0%",
        trend: acceptedReferrals > 0 ? "up" : "down",
        icon: DollarSign,
        description: "Accepted and active",
      },
    ];
  }, [usersData, referralsData, servicesData]);

  const reportTypes = [
    {
      title: "User Analytics Report",
      description: `Detailed breakdown of users - ${usersData?.length || 0} active users`,
      icon: Users,
      lastGenerated: "Real-time data",
    },
    {
      title: "Referral Analytics",
      description: `${referralsData?.length || 0} total referrals tracked`,
      icon: Calendar,
      lastGenerated: "Real-time data",
    },
    {
      title: "Service Performance",
      description: `${servicesData?.length || 0} services available in system`,
      icon: BarChart3,
      lastGenerated: "Real-time data",
    },
    {
      title: "System Health",
      description: "API connectivity and performance metrics",
      icon: Activity,
      lastGenerated: "Real-time data",
    },
  ];

  const handleRefresh = () => {
    refetchUsers();
    refetchReferrals();
    refetchServices();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Analytics & KPI
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            View metrics, track performance, and manage referrals and services
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          variant="outline" 
          className="gap-2 text-slate-700 hover:text-slate-900 border-slate-300"
          disabled={usersLoading || referralsLoading || servicesLoading}
        >
          <RefreshCw className={`h-4 w-4 ${(usersLoading || referralsLoading || servicesLoading) ? 'animate-spin' : ''}`} />
          {usersLoading || referralsLoading || servicesLoading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Error Messages */}
      {(usersError || referralsError || servicesError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center gap-2 text-red-700">
            <Activity className="h-5 w-5" />
            <p className="text-sm">
              {usersError && 'Failed to load users. '}
              {referralsError && 'Failed to load referrals. '}
              {servicesError && 'Failed to load services. '}
              Please check your API connection.
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isLoading = usersLoading || referralsLoading || servicesLoading;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2 h-8">
                    <Loader className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-slate-500">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-900">
                      {metric.value}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={metric.trend === "up" ? "default" : "destructive"}
                        className={`text-xs ${
                          metric.trend === "up"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }`}
                      >
                        {metric.change}
                      </Badge>
                      <p className="text-xs text-slate-500">{metric.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Referral Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of referrals by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralsLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4 h-[300px] flex flex-col justify-center">
                {["pending", "accepted", "rejected", "completed"].map((status) => {
                  const count = referralsData?.filter(r => r.referralStatus === status)?.length || 0;
                  const total = referralsData?.length || 1;
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 capitalize">{status}</span>
                        <span className="text-sm font-semibold text-slate-900">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            status === 'pending' ? 'bg-orange-500' :
                            status === 'accepted' ? 'bg-blue-500' :
                            status === 'completed' ? 'bg-green-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              User Roles Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of users by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4 h-[300px] flex flex-col justify-center">
                {["admin", "practitioner", "manager", "employee"].map((role) => {
                  const count = usersData?.filter(u => u.role === role)?.length || 0;
                  const total = usersData?.length || 1;
                  const percentage = Math.round((count / total) * 100);
                  const colors = {
                    admin: 'bg-red-500',
                    practitioner: 'bg-blue-500',
                    manager: 'bg-purple-500',
                    employee: 'bg-green-500'
                  };
                  return (
                    <div key={role} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 capitalize">{role}</span>
                        <span className="text-sm font-semibold text-slate-900">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${colors[role]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reports Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Report Generation
          </CardTitle>
          <CardDescription>
            Generate and download comprehensive reports for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {reportTypes.map((report, index) => {
              const Icon = report.icon;
              return (
                <div
                  key={index}
                  className="flex items-start justify-between rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                >
                  <div className="flex gap-3">
                    <div className="rounded-md bg-blue-100 p-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-900">
                        {report.title}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {report.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        Last generated: {report.lastGenerated}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                    <Download className="h-4 w-4" />
                    Generate
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Quick Insights
          </CardTitle>
          <CardDescription>
            Real-time system insights and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                Referral Completion Rate
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {referralsData?.length > 0 
                  ? `${Math.round((referralsData.filter(r => r.referralStatus === 'completed').length / referralsData.length) * 100)}%`
                  : "0%"
                }
              </p>
              <p className="mt-1 text-xs text-green-600">
                {referralsData?.filter(r => r.referralStatus === 'completed').length || 0} completed
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                Pending Referrals
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {referralsData?.filter(r => r.referralStatus === 'pending').length || 0}
              </p>
              <p className="mt-1 text-xs text-orange-600">
                Awaiting assignment
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                Active Services
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {servicesData?.filter(s => s.isActive).length || 0}
              </p>
              <p className="mt-1 text-xs text-green-600">
                Out of {servicesData?.length || 0} total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
