import React, { useState } from "react";
import {
  Calendar,
  CalendarDays,
  List,
  Users,
  DoorOpen,
  Download,
  FileDown,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  Settings,
  Grid3x3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Calendar View Component
const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data for appointments
  const appointments = [
    { id: 1, time: "09:00", patient: "John Doe", practitioner: "Dr. Smith", room: "Room A", status: "scheduled" },
    { id: 2, time: "10:30", patient: "Jane Wilson", practitioner: "Dr. Jones", room: "Room B", status: "scheduled" },
    { id: 3, time: "14:00", patient: "Bob Johnson", practitioner: "Dr. Smith", room: "Room A", status: "completed" },
    { id: 4, time: "15:30", patient: "Alice Brown", practitioner: "Dr. Davis", room: "Room C", status: "scheduled" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-black/40 border-white/10 text-white hover:bg-white/5">
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">←</Button>
            <span className="text-sm font-medium px-4">Week of Jan 10-16, 2026</span>
            <Button variant="ghost" size="icon" className="h-8 w-8">→</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-black/40 border-white/10 text-white hover:bg-white/5">
            <Grid3x3 className="h-4 w-4 mr-2" />
            Week View
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-slate-400 pb-2">
            {day}
          </div>
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="min-h-[200px] bg-black/30 border border-white/10 rounded-lg p-2 hover:border-cyan-500/30 transition-colors"
          >
            <div className="text-sm font-medium text-slate-300 mb-2">{10 + i}</div>
            {appointments.slice(0, 2).map((apt) => (
              <div
                key={apt.id}
                className={`text-xs p-2 mb-1 rounded border ${getStatusColor(apt.status)} cursor-pointer hover:bg-opacity-20 transition-all`}
              >
                <div className="font-medium">{apt.time}</div>
                <div className="truncate">{apt.patient}</div>
                <div className="text-[10px] opacity-70">{apt.room}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// List View Component
const ListView = () => {
  const appointments = [
    { id: 1, date: "2026-01-10", time: "09:00", patient: "John Doe", practitioner: "Dr. Smith", room: "Room A", service: "Consultation", status: "scheduled" },
    { id: 2, date: "2026-01-10", time: "10:30", patient: "Jane Wilson", practitioner: "Dr. Jones", room: "Room B", service: "Follow-up", status: "scheduled" },
    { id: 3, date: "2026-01-10", time: "14:00", patient: "Bob Johnson", practitioner: "Dr. Smith", room: "Room A", service: "Physical", status: "completed" },
    { id: 4, date: "2026-01-11", time: "09:30", patient: "Alice Brown", practitioner: "Dr. Davis", room: "Room C", service: "Consultation", status: "scheduled" },
    { id: 5, date: "2026-01-11", time: "11:00", patient: "Charlie Green", practitioner: "Dr. Smith", room: "Room A", service: "Assessment", status: "scheduled" },
  ];

  const getStatusBadge = (status) => {
    const configs = {
      scheduled: { icon: Clock, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      completed: { icon: CheckCircle2, color: "bg-green-500/10 text-green-400 border-green-500/20" },
      cancelled: { icon: XCircle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
    };
    const config = configs[status] || configs.scheduled;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search appointments..."
            className="w-64 bg-black/40 border-white/10 text-white placeholder:text-slate-500"
          />
          <Button variant="outline" size="sm" className="bg-black/40 border-white/10 text-white hover:bg-white/5">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <Button variant="outline" size="sm" className="bg-black/40 border-white/10 text-white hover:bg-white/5">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden bg-black/30">
        <table className="w-full">
          <thead className="bg-black/50 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                <input type="checkbox" className="rounded border-white/20 bg-black/40" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Practitioner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Room</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Service</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-white/20 bg-black/40" />
                </td>
                <td className="px-4 py-3 text-sm text-white">
                  <div>{new Date(apt.date).toLocaleDateString()}</div>
                  <div className="text-xs text-slate-400">{apt.time}</div>
                </td>
                <td className="px-4 py-3 text-sm text-white font-medium">{apt.patient}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{apt.practitioner}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{apt.room}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{apt.service}</td>
                <td className="px-4 py-3">{getStatusBadge(apt.status)}</td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                      <DropdownMenuItem className="text-white hover:bg-white/10">View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-white/10">Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-white/10">Reschedule</DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">Cancel</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Practitioner View Component
const PractitionerView = () => {
  const practitioners = [
    { id: 1, name: "Dr. Smith", appointments: 12, utilization: 85, available: true },
    { id: 2, name: "Dr. Jones", appointments: 8, utilization: 60, available: true },
    { id: 3, name: "Dr. Davis", appointments: 15, utilization: 95, available: false },
    { id: 4, name: "Dr. Wilson", appointments: 10, utilization: 75, available: true },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {practitioners.map((prac) => (
          <Card key={prac.id} className="bg-black/30 border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">{prac.name}</CardTitle>
                <div className={`h-2 w-2 rounded-full ${prac.available ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Appointments Today</span>
                    <span className="text-white font-medium">{prac.appointments}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Utilization</span>
                    <span className="text-white font-medium">{prac.utilization}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${prac.utilization > 90 ? 'bg-red-400' : prac.utilization > 70 ? 'bg-yellow-400' : 'bg-green-400'}`}
                      style={{ width: `${prac.utilization}%` }}
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-black/40 border-white/10 text-white hover:bg-white/5">
                  View Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Room View Component
const RoomView = () => {
  const rooms = [
    { id: 1, name: "Room A", capacity: 1, status: "occupied", currentAppointment: "Dr. Smith - Consultation", nextAvailable: "15:00" },
    { id: 2, name: "Room B", capacity: 1, status: "available", currentAppointment: null, nextAvailable: "Now" },
    { id: 3, name: "Room C", capacity: 2, status: "occupied", currentAppointment: "Dr. Davis - Assessment", nextAvailable: "16:30" },
    { id: 4, name: "Conference Room", capacity: 6, status: "maintenance", currentAppointment: null, nextAvailable: "Tomorrow" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "occupied":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "maintenance":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="bg-black/30 border-white/10 hover:border-cyan-500/30 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">{room.name}</CardTitle>
                <Badge variant="outline" className={`${getStatusColor(room.status)} border text-xs`}>
                  {room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>Capacity: {room.capacity}</span>
                </div>
                {room.currentAppointment && (
                  <div className="p-2 bg-black/40 rounded border border-white/10">
                    <div className="text-xs text-slate-400 mb-1">Current:</div>
                    <div className="text-sm text-white">{room.currentAppointment}</div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">Next: {room.nextAvailable}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-black/40 border-white/10 text-white hover:bg-white/5">
                  View Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDiaryDashboard = () => {
  const [activeView, setActiveView] = useState("calendar");

  // Overview statistics
  const stats = [
    {
      title: "Total Appointments",
      value: "156",
      change: "+12%",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Today's Appointments",
      value: "24",
      change: "+3",
      icon: CalendarDays,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Active Conflicts",
      value: "2",
      change: "-1",
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
    },
    {
      title: "Utilization Rate",
      value: "82%",
      change: "+5%",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
  ];

  console.log("AdminDiaryDashboard rendered", activeView); // Debug log

  return (
    <div className="space-y-6 w-full min-h-screen">{/* Removed p-6 padding since parent already has padding */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Diary Management</h1>
          <p className="text-slate-400 text-sm">
            Manage appointments, practitioners, and room schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-black/40 border-white/10 text-white hover:bg-white/5">
                <FileDown className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
              <DropdownMenuLabel className="text-slate-400">Operations</DropdownMenuLabel>
              <DropdownMenuItem className="text-white hover:bg-white/10">Bulk Reschedule</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-white/10">Bulk Cancel</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-white/10">Bulk Export</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuLabel className="text-slate-400">Reports</DropdownMenuLabel>
              <DropdownMenuItem className="text-white hover:bg-white/10">Utilization Report</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-white/10">Conflict Report</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-white/10">Summary Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-black/30 border-white/10 hover:border-cyan-500/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-green-400">{stat.change} from last week</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Tabs */}
      <Card className="bg-black/30 border-white/10">
        <CardHeader className="border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
              <TabsList className="bg-black/40 border border-white/10 p-1 grid w-full sm:w-auto sm:inline-grid grid-cols-4 gap-1">
                <TabsTrigger
                  value="calendar"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/20 text-slate-400"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Calendar</span>
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/20 text-slate-400"
                >
                  <List className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">List</span>
                </TabsTrigger>
                <TabsTrigger
                  value="practitioners"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/20 text-slate-400"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Practitioners</span>
                </TabsTrigger>
                <TabsTrigger
                  value="rooms"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/20 text-slate-400"
                >
                  <DoorOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Rooms</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-black/40 border-white/10 text-white hover:bg-white/5">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeView} className="w-full">
            <TabsContent value="calendar" className="mt-0">
              <CalendarView />
            </TabsContent>
            <TabsContent value="list" className="mt-0">
              <ListView />
            </TabsContent>
            <TabsContent value="practitioners" className="mt-0">
              <PractitionerView />
            </TabsContent>
            <TabsContent value="rooms" className="mt-0">
              <RoomView />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDiaryDashboard;
