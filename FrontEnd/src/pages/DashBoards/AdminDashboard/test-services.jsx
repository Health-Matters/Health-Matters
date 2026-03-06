import React, { useState, useMemo } from "react";
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
  Loader,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useGetServicesQuery } from "@/store/api/servicesApi";

export const TestServices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch services from API
  const { data: servicesData = [], isLoading, error, refetch } = useGetServicesQuery({});

  // Map API data to table format and filter
  const services = useMemo(() => {
    return servicesData.map((service) => ({
      id: service._id,
      name: service.name,
      category: service.category ? service.category.replace(/_/g, " ").toUpperCase() : "Uncategorized",
      duration: service.defaultDuration ? `${service.defaultDuration} mins` : "Not set",
      price: "$0", // Placeholder - API doesn't track pricing
      status: service.isActive ? "active" : "inactive",
      bookings: 0, // Placeholder - API doesn't track bookings
      description: service.description || "",
    }));
  }, [servicesData]);

  // Filter services based on search and category
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  // Calculate stats from API data
  const statsCards = useMemo(() => {
    const totalServices = servicesData.length;
    const activeServices = servicesData.filter(s => s.isActive).length;
    const totalDuration = servicesData.reduce((sum, s) => sum + (s.defaultDuration || 0), 0);
    const avgDuration = totalServices > 0 ? Math.round(totalDuration / totalServices) : 0;

    return [
      {
        title: "Total Services",
        value: totalServices?.toLocaleString(),
        change: `${totalServices} available`,
        icon: Package,
        color: "blue",
      },
      {
        title: "Active Services",
        value: activeServices?.toLocaleString(),
        change: totalServices > 0 ? `${Math.round((activeServices / totalServices) * 100)}% of total` : "0%",
        icon: Settings,
        color: "green",
      },
      {
        title: "Avg. Duration",
        value: `${avgDuration} mins`,
        change: "Average session length",
        icon: Clock,
        color: "purple",
      },
      {
        title: "Inactive Services",
        value: (totalServices - activeServices)?.toLocaleString(),
        change: "Disabled services",
        icon: DollarSign,
        color: "orange",
      },
    ];
  }, [servicesData]);

  // Extract unique categories from API data
  const categories = useMemo(() => {
    const uniqueCategories = new Set(servicesData.map(s => s.category).filter(Boolean));
    const displayCategories = Array.from(uniqueCategories).map(cat => 
      cat.replace(/_/g, " ").toUpperCase()
    );
    return ["All", ...displayCategories];
  }, [servicesData]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Service Management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage services, update configurations, and monitor service status
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refetch}
            variant="outline" 
            className="gap-2 text-slate-700 hover:text-slate-900 border-slate-300"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center gap-2 text-red-700">
            <Package className="h-5 w-5" />
            <p className="text-sm">
              Failed to load services. Please check your API connection.
            </p>
          </CardContent>
        </Card>
      )}

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
                {isLoading ? (
                  <div className="flex items-center gap-2 h-8">
                    <Loader className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-slate-500">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                  </>
                )}
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
                {isLoading ? "Loading services..." : `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} available`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search services..."
                  className="pl-8 w-64 border-slate-300 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-slate-700 hover:text-slate-900 border-slate-300"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Services Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Loading services...</span>
            </div>
          ) : (
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
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredServices.length > 0 ? (
                      filteredServices.map((service) => (
                        <tr
                          key={service.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <div className="font-medium text-slate-900">
                              {service.name}
                            </div>
                            {service.description && (
                              <p className="text-xs text-slate-500 mt-1">{service.description}</p>
                            )}
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                          No services found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duration & Status Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Service Duration Overview
            </CardTitle>
            <CardDescription>
              Service duration statistics from API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {[30, 60, 90].map((duration) => {
                  const count = servicesData.filter(s => s.defaultDuration === duration).length;
                  return (
                    <div key={duration} className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {duration} Minute Sessions
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">{count} service{count !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {count > 0 ? `${Math.round((count / servicesData.length) * 100)}% of all services` : 'No services with this duration'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Service Status Overview
            </CardTitle>
            <CardDescription>
              Active vs Inactive services breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Active Services
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {servicesData.filter(s => s.isActive).length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Currently enabled and available
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Inactive Services
                  </h4>
                  <p className="text-2xl font-bold text-slate-600">
                    {servicesData.filter(s => !s.isActive).length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Currently disabled
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Total Services
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {servicesData.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    In the system
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
