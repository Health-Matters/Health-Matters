import React from "react";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const TestAnalytics = () => {
  // Sample KPI data - will be replaced with real data later
  const kpiMetrics = [
    {
      title: "Total Users",
      value: "12,458",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      description: "Active users this month",
    },
    {
      title: "System Activity",
      value: "8,942",
      change: "+8.3%",
      trend: "up",
      icon: Activity,
      description: "Total activities logged",
    },
    {
      title: "Revenue",
      value: "$45,231",
      change: "+23.1%",
      trend: "up",
      icon: DollarSign,
      description: "Monthly revenue",
    },
    {
      title: "Appointments",
      value: "1,892",
      change: "-2.4%",
      trend: "down",
      icon: Calendar,
      description: "Scheduled this month",
    },
  ];

  const reportTypes = [
    {
      title: "User Analytics Report",
      description: "Detailed breakdown of user demographics and activity patterns",
      icon: Users,
      lastGenerated: "2 days ago",
    },
    {
      title: "Financial Report",
      description: "Revenue, expenses, and financial performance metrics",
      icon: DollarSign,
      lastGenerated: "1 week ago",
    },
    {
      title: "Performance Metrics",
      description: "System performance and operational efficiency statistics",
      icon: BarChart3,
      lastGenerated: "3 days ago",
    },
    {
      title: "Appointment Analytics",
      description: "Appointment trends, cancellations, and scheduling patterns",
      icon: Calendar,
      lastGenerated: "5 days ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Analytics & KPI
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            View metrics, track performance, and generate comprehensive reports
          </p>
        </div>
        <Button variant="outline" className="gap-2 text-slate-700 hover:text-slate-900 border-slate-300">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
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
              Performance Overview
            </CardTitle>
            <CardDescription>
              Monthly performance trends and comparisons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Chart Visualization
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Integration pending - will display performance metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              Distribution Analysis
            </CardTitle>
            <CardDescription>
              User segments and category breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="text-center">
                <PieChart className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Chart Visualization
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Integration pending - will display distribution data
                </p>
              </div>
            </div>
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
                Average Response Time
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">2.4s</p>
              <p className="mt-1 text-xs text-green-600">
                ↓ 0.3s faster than last week
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                User Satisfaction
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">94.2%</p>
              <p className="mt-1 text-xs text-green-600">
                ↑ 2.1% increase this month
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                System Uptime
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">99.9%</p>
              <p className="mt-1 text-xs text-green-600">
                ✓ Above target threshold
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
