"use client";

import { useState } from "react";
import { Search, Plus, Filter, Calendar, User, Wrench, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";

// Mock data for work orders
const mockWorkOrders = [
  {
    id: "wo-001",
    workOrderNumber: "WO-2024-001",
    title: "Pump A-101 Maintenance",
    description: "Routine maintenance for centrifugal pump A-101",
    status: "IN_PROGRESS",
    priority: "HIGH",
    type: "PREVENTIVE",
    asset: {
      id: "asset-1",
      tag: "PUMP-A-101",
      name: "Centrifugal Pump A-101",
      location: { name: "Building A - Floor 1" }
    },
    assignee: {
      id: "user-1",
      name: "John Smith",
      email: "john.smith@company.com"
    },
    requestor: {
      id: "user-2",
      name: "Jane Doe",
      email: "jane.doe@company.com"
    },
    createdAt: new Date("2024-01-15T08:00:00Z"),
    scheduledStart: new Date("2024-01-16T09:00:00Z"),
    scheduledEnd: new Date("2024-01-16T17:00:00Z"),
    dueDate: new Date("2024-01-16T17:00:00Z"),
    estimatedHours: 8,
    actualHours: 6,
    tasks: [
      { id: "task-1", title: "Inspect pump housing", completed: true },
      { id: "task-2", title: "Replace seals", completed: true },
      { id: "task-3", title: "Check alignment", completed: false },
    ]
  },
  {
    id: "wo-002",
    workOrderNumber: "WO-2024-002",
    title: "Emergency Repair - Conveyor Belt",
    description: "Conveyor belt motor failure - production line down",
    status: "SCHEDULED",
    priority: "CRITICAL",
    type: "EMERGENCY",
    asset: {
      id: "asset-2",
      tag: "CONV-B-205",
      name: "Conveyor Belt B-205",
      location: { name: "Building B - Floor 2" }
    },
    assignee: {
      id: "user-3",
      name: "Mike Johnson",
      email: "mike.johnson@company.com"
    },
    requestor: {
      id: "user-4",
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com"
    },
    createdAt: new Date("2024-01-14T14:30:00Z"),
    scheduledStart: new Date("2024-01-15T06:00:00Z"),
    scheduledEnd: new Date("2024-01-15T14:00:00Z"),
    dueDate: new Date("2024-01-15T14:00:00Z"),
    estimatedHours: 8,
    actualHours: null,
    tasks: [
      { id: "task-4", title: "Diagnose motor failure", completed: false },
      { id: "task-5", title: "Replace motor", completed: false },
      { id: "task-6", title: "Test operation", completed: false },
    ]
  },
  {
    id: "wo-003",
    workOrderNumber: "WO-2024-003",
    title: "HVAC System Inspection",
    description: "Quarterly inspection of HVAC system in Building C",
    status: "COMPLETED",
    priority: "MEDIUM",
    type: "PREVENTIVE",
    asset: {
      id: "asset-3",
      tag: "HVAC-C-301",
      name: "HVAC Unit C-301",
      location: { name: "Building C - Roof" }
    },
    assignee: {
      id: "user-5",
      name: "David Brown",
      email: "david.brown@company.com"
    },
    requestor: {
      id: "user-6",
      name: "Lisa Garcia",
      email: "lisa.garcia@company.com"
    },
    createdAt: new Date("2024-01-10T10:00:00Z"),
    scheduledStart: new Date("2024-01-12T08:00:00Z"),
    scheduledEnd: new Date("2024-01-12T16:00:00Z"),
    dueDate: new Date("2024-01-12T16:00:00Z"),
    estimatedHours: 8,
    actualHours: 7.5,
    tasks: [
      { id: "task-7", title: "Check filters", completed: true },
      { id: "task-8", title: "Inspect ductwork", completed: true },
      { id: "task-9", title: "Test controls", completed: true },
    ]
  },
  {
    id: "wo-004",
    workOrderNumber: "WO-2024-004",
    title: "Predictive Maintenance - Compressor",
    description: "Vibration analysis indicates potential bearing wear",
    status: "ON_HOLD",
    priority: "HIGH",
    type: "PREDICTIVE",
    asset: {
      id: "asset-4",
      tag: "COMP-A-150",
      name: "Air Compressor A-150",
      location: { name: "Building A - Basement" }
    },
    assignee: {
      id: "user-7",
      name: "Robert Taylor",
      email: "robert.taylor@company.com"
    },
    requestor: {
      id: "user-8",
      name: "Emily Davis",
      email: "emily.davis@company.com"
    },
    createdAt: new Date("2024-01-13T11:15:00Z"),
    scheduledStart: new Date("2024-01-18T08:00:00Z"),
    scheduledEnd: new Date("2024-01-18T12:00:00Z"),
    dueDate: new Date("2024-01-20T17:00:00Z"),
    estimatedHours: 4,
    actualHours: null,
    tasks: [
      { id: "task-10", title: "Perform vibration analysis", completed: false },
      { id: "task-11", title: "Replace bearings if needed", completed: false },
      { id: "task-12", title: "Retest and verify", completed: false },
    ]
  }
];

const statusColors = {
  SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ON_HOLD: "bg-orange-100 text-orange-800 border-orange-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800 border-gray-200",
  MEDIUM: "bg-blue-100 text-blue-800 border-blue-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
};

const typeColors = {
  CORRECTIVE: "bg-red-100 text-red-800 border-red-200",
  PREVENTIVE: "bg-green-100 text-green-800 border-green-200",
  PREDICTIVE: "bg-purple-100 text-purple-800 border-purple-200",
  EMERGENCY: "bg-red-100 text-red-800 border-red-200",
};

export default function WorkOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter work orders based on search and filters
  const filteredWorkOrders = mockWorkOrders.filter((workOrder) => {
    const matchesSearch = 
      workOrder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || workOrder.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || workOrder.priority === priorityFilter;
    const matchesType = typeFilter === "all" || workOrder.type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTaskProgress = (tasks: any[]) => {
    const completed = tasks.filter(task => task.completed).length;
    return `${completed}/${tasks.length}`;
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
            <p className="text-muted-foreground">
              Manage and track maintenance work orders
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Work Order
          </Button>
        </div>

      {/* Filters and Search */}
      <Card className="bg-white/50 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white/50 border-white/20"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <option value="all">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <option value="all">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <option value="all">All Types</option>
                <option value="CORRECTIVE">Corrective</option>
                <option value="PREVENTIVE">Preventive</option>
                <option value="PREDICTIVE">Predictive</option>
                <option value="EMERGENCY">Emergency</option>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={clearFilters} className="bg-white/50 border-white/20">
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Grid */}
      {filteredWorkOrders.length === 0 ? (
        <Card className="bg-white/50 backdrop-blur-sm border-white/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No work orders found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Get started by creating your first work order."}
            </p>
            {(searchTerm || statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkOrders.map((workOrder) => (
            <Link key={workOrder.id} href={`/work-orders/${workOrder.id}`}>
              <Card className="bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {workOrder.title}
                      </CardTitle>
                      <CardDescription className="text-sm font-mono">
                        {workOrder.workOrderNumber}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Assign</DropdownMenuItem>
                        <DropdownMenuItem>Clone</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={statusColors[workOrder.status as keyof typeof statusColors]}>
                      {workOrder.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={priorityColors[workOrder.priority as keyof typeof priorityColors]}>
                      {workOrder.priority}
                    </Badge>
                    <Badge className={typeColors[workOrder.type as keyof typeof typeColors]}>
                      {workOrder.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {workOrder.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{workOrder.asset.tag}</span>
                      <span className="text-muted-foreground ml-1">
                        • {workOrder.asset.location.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{workOrder.assignee?.name || "Unassigned"}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Due: {formatDate(workOrder.dueDate)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        Tasks: {getTaskProgress(workOrder.tasks)} • 
                        {workOrder.estimatedHours}h estimated
                      </span>
                    </div>
                  </div>
                  
                  {workOrder.priority === "CRITICAL" && (
                    <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded-md">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      <span className="font-medium">Critical Priority</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
}