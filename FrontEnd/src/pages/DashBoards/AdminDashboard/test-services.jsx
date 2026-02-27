import React, { useState } from "react";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Clock,
  Package,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const TestServices = () => {
  // Sample service data - will be replaced with real data later
  const [services] = useState([
    {
      id: 1,
      name: "General Health Assessment",
      category: "Assessment",
      duration: "45 mins",
      price: "$120",
      status: "active",
      bookings: 245,
    },
    {
      id: 2,
      name: "Occupational Therapy",
      category: "Therapy",
      duration: "60 mins",
      price: "$180",
      status: "active",
      bookings: 189,
    },
    {
      id: 3,
      name: "Mental Health Consultation",
      category: "Consultation",
      duration: "50 mins",
      price: "$150",
      status: "active",
      bookings: 312,
    },
    {
      id: 4,
      name: "Physiotherapy Session",
      category: "Therapy",
      duration: "45 mins",
      price: "$135",
      status: "active",
      bookings: 178,
    },
    {
      id: 5,
      name: "Ergonomic Assessment",
      category: "Assessment",
      duration: "30 mins",
      price: "$95",
      status: "inactive",
      bookings: 67,
    },
    {
      id: 6,
      name: "Wellness Workshop",
      category: "Workshop",
      duration: "90 mins",
      price: "$200",
      status: "active",
      bookings: 423,
    },
  ]);

  const statsCards = [
    {
      title: "Total Services",
      value: "24",
      change: "+3 this month",
      icon: Package,
      color: "blue",
    },
    {
      title: "Active Services",
      value: "19",
      change: "79% of total",
      icon: Settings,
      color: "green",
    },
    {
      title: "Avg. Price",
      value: "$145",
      change: "+$12 from last month",
      icon: DollarSign,
      color: "purple",
    },
    {
      title: "Total Bookings",
      value: "1,414",
      change: "+18% increase",
      icon: Clock,
      color: "orange",
    },
  ];

  const categories = ["All", "Assessment", "Therapy", "Consultation", "Workshop"];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Service Management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage services, update pricing, and configure service durations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-slate-700 hover:text-slate-900 border-slate-300">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Services Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Current Services
              </CardTitle>
              <CardDescription>
                View and manage all available services
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search services..."
                  className="pl-8 w-64 border-slate-300 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className={
                  index === 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-slate-700 hover:text-slate-900 border-slate-300"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Services Table */}
          <div className="rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Service Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {services.map((service) => (
                    <tr
                      key={service.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {service.name}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className="border-blue-200 text-blue-700 bg-blue-50"
                        >
                          {service.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{service.duration}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-semibold">
                            {service.price}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            service.status === "active" ? "default" : "secondary"
                          }
                          className={
                            service.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-slate-100 text-slate-800 hover:bg-slate-100"
                          }
                        >
                          {service.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">
                          {service.bookings}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Duration Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Pricing Configuration
            </CardTitle>
            <CardDescription>
              Set base rates and pricing rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Standard Rate
                </h4>
                <p className="text-2xl font-bold text-blue-600">$150/hour</p>
                <p className="text-xs text-slate-500 mt-1">
                  Base hourly rate for services
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Premium Rate
                </h4>
                <p className="text-2xl font-bold text-blue-600">$200/hour</p>
                <p className="text-xs text-slate-500 mt-1">
                  Specialized services and consultations
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Discount Rate
                </h4>
                <p className="text-2xl font-bold text-blue-600">15% off</p>
                <p className="text-xs text-slate-500 mt-1">
                  Package deals and bulk bookings
                </p>
              </div>
              <Button variant="outline" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                Update Pricing
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Duration Settings
            </CardTitle>
            <CardDescription>
              Manage standard appointment durations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Quick Session
                </h4>
                <p className="text-2xl font-bold text-blue-600">30 mins</p>
                <p className="text-xs text-slate-500 mt-1">
                  Brief consultations and follow-ups
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Standard Session
                </h4>
                <p className="text-2xl font-bold text-blue-600">60 mins</p>
                <p className="text-xs text-slate-500 mt-1">
                  Regular appointments and assessments
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Extended Session
                </h4>
                <p className="text-2xl font-bold text-blue-600">90 mins</p>
                <p className="text-xs text-slate-500 mt-1">
                  Comprehensive evaluations and workshops
                </p>
              </div>
              <Button variant="outline" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                Update Durations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
