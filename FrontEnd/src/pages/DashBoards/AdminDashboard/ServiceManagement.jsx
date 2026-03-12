import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
  Package,
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceByIdMutation,
  useDeleteServiceByIdMutation,
} from "@/store/api";

const CATEGORIES = [
  { value: "all", label: "All Services" },
  { value: "occupational_health", label: "Occupational Health" },
  { value: "mental_health", label: "Mental Health" },
  { value: "physiotherapy", label: "Physiotherapy" },
  { value: "health_screening", label: "Health Screening" },
  { value: "counselling", label: "Counselling" },
  { value: "ergonomic_assessment", label: "Ergonomic Assessment" },
];

export const ServiceManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingService, setEditingService] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // API hooks
  const { data: services = [], isLoading, refetch } = useGetServicesQuery();
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceByIdMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceByIdMutation();

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive).length;
    const avgDuration = services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + (s.defaultDuration || 0), 0) / services.length)
      : 0;
    
    const categoryCounts = services.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {});
    const mostPopularCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      active,
      avgDuration,
      mostPopularCategory: mostPopularCategory ? mostPopularCategory[0] : "N/A",
    };
  }, [services]);

  const handleEdit = (service) => {
    setEditingService(service);
    setIsEditOpen(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService(serviceId).unwrap();
      } catch (error) {
        console.error("Failed to delete service:", error);
        alert("Failed to delete service. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-slate-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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
          <Button
            variant="outline"
            className="gap-2 text-slate-700 hover:text-slate-900 border-slate-300"
            onClick={refetch}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </SheetTrigger>
            <ServiceFormSheet
              onClose={() => setIsCreateOpen(false)}
              createService={createService}
              isCreating={isCreating}
            />
          </Sheet>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Services
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">All service types</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Services
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Avg. Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.avgDuration} min</div>
            <p className="text-xs text-slate-500 mt-1">Average session length</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Top Category
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 truncate capitalize">
              {stats.mostPopularCategory.replace(/_/g, " ")}
            </div>
            <p className="text-xs text-slate-500 mt-1">Most common type</p>
          </CardContent>
        </Card>
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
            {CATEGORIES.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className={
                  selectedCategory === category.value
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-slate-700 hover:text-slate-900 border-slate-300"
                }
              >
                {category.label}
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
                      Code
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
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                        No services found. Try adjusting your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((service) => (
                      <tr
                        key={service._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">
                            {service.name}
                          </div>
                          {service.description && (
                            <div className="text-xs text-slate-500 mt-1 max-w-md truncate">
                              {service.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {service.code}
                          </code>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant="outline"
                            className="border-blue-200 text-blue-700 bg-blue-50"
                          >
                            {service.category?.replace(/_/g, " ") || "N/A"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-slate-700">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">{service.defaultDuration || 30} min</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant={service.isActive ? "default" : "secondary"}
                            className={
                              service.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-slate-100 text-slate-800 hover:bg-slate-100"
                            }
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(service._id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet 
        open={isEditOpen} 
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingService(null);
          }
        }}
      >
        <ServiceFormSheet
          service={editingService}
          onClose={() => {
            setIsEditOpen(false);
            setEditingService(null);
          }}
          updateService={updateService}
          isUpdating={isUpdating}
        />
      </Sheet>
    </div>
  );
};

// Service Form Sheet Component
const ServiceFormSheet = ({ service, onClose, createService, updateService, isCreating, isUpdating }) => {
  const [formData, setFormData] = useState({
    name: service?.name || "",
    code: service?.code || "",
    description: service?.description || "",
    category: service?.category || "occupational_health",
    defaultDuration: service?.defaultDuration || 30,
    isActive: service?.isActive ?? true,
  });

  // Update form data when service prop changes (for edit mode)
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        code: service.code || "",
        description: service.description || "",
        category: service.category || "occupational_health",
        defaultDuration: service.defaultDuration || 30,
        isActive: service.isActive ?? true,
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        code: "",
        description: "",
        category: "occupational_health",
        defaultDuration: 30,
        isActive: true,
      });
    }
  }, [service]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log form data for debugging
    console.log("Submitting service data:", formData);
    
    try {
      if (service) {
        const result = await updateService({ serviceId: service._id, body: formData }).unwrap();
        console.log("Update successful:", result);
      } else {
        const result = await createService(formData).unwrap();
        console.log("Create successful:", result);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save service - Full error:", error);
      
      // Extract meaningful error message
      let errorMessage = "Failed to save service. ";
      
      if (error?.data?.message) {
        errorMessage += error.data.message;
      } else if (error?.message) {
        errorMessage += error.message;
      } else if (error?.status) {
        errorMessage += `Server returned status ${error.status}`;
      } else {
        errorMessage += "Please check the form and try again.";
      }
      
      alert(errorMessage);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <SheetContent 
      side="right" 
      className="w-full sm:max-w-[540px] overflow-y-auto !bg-white shadow-xl border-l border-slate-200 p-0"
    >
      <div className="bg-white min-h-full">
        <SheetHeader className="pb-6 border-b border-slate-200 bg-white px-6 pt-6">
          <SheetTitle className="text-xl font-semibold text-slate-900">
            {service ? "Edit Service" : "Create New Service"}
          </SheetTitle>
          <SheetDescription className="text-sm text-slate-600">
            {service
              ? "Update the service details below."
              : "Fill in the details to create a new service."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6 pb-6 bg-white px-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-900">
              Service Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., General Health Assessment"
              className="w-full"
              required
            />
            <p className="text-xs text-slate-500">Enter a descriptive name for the service</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium text-slate-900">
              Service Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
              placeholder="e.g., PHYSIO-001"
              className="w-full uppercase"
              required
            />
            <p className="text-xs text-slate-500">Unique identifier for the service (will be converted to uppercase)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-900">
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of the service"
              className="w-full"
            />
            <p className="text-xs text-slate-500">Optional: Provide additional details</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-slate-900">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.slice(1).map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">Choose the service type</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-slate-900">
              Default Duration (minutes) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="240"
              step="5"
              value={formData.defaultDuration}
              onChange={(e) => handleChange("defaultDuration", parseInt(e.target.value) || 30)}
              className="w-full"
              required
            />
            <p className="text-xs text-slate-500">Must be between 15 and 240 minutes</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive" className="text-sm font-medium text-slate-900">
              Status
            </Label>
            <Select
              value={formData.isActive ? "active" : "inactive"}
              onValueChange={(value) => handleChange("isActive", value === "active")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Active
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                    Inactive
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">Active services are available for booking</p>
          </div>

          <SheetFooter className="flex gap-3 pt-6 border-t border-slate-200 bg-white px-6 pb-6 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>{service ? "Update Service" : "Create Service"}</>
            )}
          </Button>
        </SheetFooter>
      </form>
      </div>
    </SheetContent>
  );
};
