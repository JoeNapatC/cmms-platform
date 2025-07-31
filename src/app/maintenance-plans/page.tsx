"use client";

import { useState } from "react";
import { Search, Plus, Filter, Calendar, Clock, Wrench, Settings, Play, Pause, Edit, Trash2, Copy, MoreHorizontal, AlertTriangle, CheckCircle, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";

// Mock data for maintenance plans
const mockMaintenancePlans = [
  {
    id: "mp-001",
    name: "Pump A-101 Quarterly Maintenance",
    description: "Comprehensive quarterly maintenance for centrifugal pump A-101",
    status: "ACTIVE",
    frequency: "QUARTERLY",
    priority: "HIGH",
    asset: {
      id: "asset-1",
      tag: "PUMP-A-101",
      name: "Centrifugal Pump A-101",
      location: { name: "Building A - Floor 1" }
    },
    assignee: {
      id: "user-1",
      name: "John Smith",
      role: "Senior Technician"
    },
    estimatedDuration: 8,
    lastExecuted: new Date("2023-10-15T08:00:00Z"),
    nextDue: new Date("2024-01-15T08:00:00Z"),
    createdAt: new Date("2023-01-01T00:00:00Z"),
    tasks: [
      { id: "task-1", title: "Inspect pump housing for cracks", estimatedTime: 1 },
      { id: "task-2", title: "Replace mechanical seals", estimatedTime: 3 },
      { id: "task-3", title: "Check and adjust alignment", estimatedTime: 2 },
      { id: "task-4", title: "Lubricate bearings", estimatedTime: 1 },
      { id: "task-5", title: "Test performance and vibration", estimatedTime: 1 }
    ],
    parts: [
      { id: "part-1", name: "Mechanical Seal Kit", quantity: 1, cost: 150 },
      { id: "part-2", name: "Bearing Grease", quantity: 2, cost: 25 }
    ],
    completionRate: 95,
    totalExecutions: 12,
    avgExecutionTime: 7.5
  },
  {
    id: "mp-002",
    name: "HVAC Monthly Filter Change",
    description: "Monthly air filter replacement for all HVAC units",
    status: "ACTIVE",
    frequency: "MONTHLY",
    priority: "MEDIUM",
    asset: {
      id: "asset-2",
      tag: "HVAC-ALL",
      name: "All HVAC Units",
      location: { name: "All Buildings" }
    },
    assignee: {
      id: "user-2",
      name: "Mike Johnson",
      role: "HVAC Technician"
    },
    estimatedDuration: 4,
    lastExecuted: new Date("2023-12-15T08:00:00Z"),
    nextDue: new Date("2024-01-15T08:00:00Z"),
    createdAt: new Date("2023-01-01T00:00:00Z"),
    tasks: [
      { id: "task-6", title: "Remove old filters", estimatedTime: 1 },
      { id: "task-7", title: "Install new filters", estimatedTime: 2 },
      { id: "task-8", title: "Check airflow and pressure", estimatedTime: 1 }
    ],
    parts: [
      { id: "part-3", name: "HEPA Filter 20x25x4", quantity: 12, cost: 480 },
      { id: "part-4", name: "Pre-filter 20x25x1", quantity: 24, cost: 120 }
    ],
    completionRate: 100,
    totalExecutions: 24,
    avgExecutionTime: 3.8
  },
  {
    id: "mp-003",
    name: "Conveyor Belt Weekly Inspection",
    description: "Weekly safety and performance inspection of conveyor systems",
    status: "ACTIVE",
    frequency: "WEEKLY",
    priority: "HIGH",
    asset: {
      id: "asset-3",
      tag: "CONV-B-205",
      name: "Conveyor Belt B-205",
      location: { name: "Building B - Floor 2" }
    },
    assignee: {
      id: "user-3",
      name: "Sarah Wilson",
      role: "Production Technician"
    },
    estimatedDuration: 2,
    lastExecuted: new Date("2024-01-08T08:00:00Z"),
    nextDue: new Date("2024-01-15T08:00:00Z"),
    createdAt: new Date("2023-01-01T00:00:00Z"),
    tasks: [
      { id: "task-9", title: "Visual inspection of belt condition", estimatedTime: 0.5 },
      { id: "task-10", title: "Check belt tension", estimatedTime: 0.5 },
      { id: "task-11", title: "Inspect rollers and bearings", estimatedTime: 0.5 },
      { id: "task-12", title: "Test emergency stops", estimatedTime: 0.5 }
    ],
    parts: [],
    completionRate: 98,
    totalExecutions: 52,
    avgExecutionTime: 1.9
  },
  {
    id: "mp-004",
    name: "Compressor Annual Overhaul",
    description: "Comprehensive annual overhaul of air compressor systems",
    status: "DRAFT",
    frequency: "ANNUALLY",
    priority: "CRITICAL",
    asset: {
      id: "asset-4",
      tag: "COMP-A-150",
      name: "Air Compressor A-150",
      location: { name: "Building A - Basement" }
    },
    assignee: {
      id: "user-4",
      name: "Robert Taylor",
      role: "Senior Technician"
    },
    estimatedDuration: 16,
    lastExecuted: new Date("2023-01-20T08:00:00Z"),
    nextDue: new Date("2024-01-20T08:00:00Z"),
    createdAt: new Date("2023-12-01T00:00:00Z"),
    tasks: [
      { id: "task-13", title: "Complete disassembly", estimatedTime: 4 },
      { id: "task-14", title: "Inspect all components", estimatedTime: 2 },
      { id: "task-15", title: "Replace worn parts", estimatedTime: 6 },
      { id: "task-16", title: "Reassemble and test", estimatedTime: 4 }
    ],
    parts: [
      { id: "part-5", name: "Compressor Rebuild Kit", quantity: 1, cost: 1200 },
      { id: "part-6", name: "Oil Filter", quantity: 2, cost: 80 },
      { id: "part-7", name: "Air Filter", quantity: 1, cost: 45 }
    ],
    completionRate: 0,
    totalExecutions: 0,
    avgExecutionTime: 0
  },
  {
    id: "mp-005",
    name: "Emergency Generator Monthly Test",
    description: "Monthly load test and inspection of emergency backup generator",
    status: "PAUSED",
    frequency: "MONTHLY",
    priority: "HIGH",
    asset: {
      id: "asset-5",
      tag: "GEN-C-400",
      name: "Emergency Generator C-400",
      location: { name: "Building C - Exterior" }
    },
    assignee: {
      id: "user-5",
      name: "David Brown",
      role: "Electrical Technician"
    },
    estimatedDuration: 3,
    lastExecuted: new Date("2023-11-15T08:00:00Z"),
    nextDue: new Date("2024-01-15T08:00:00Z"),
    createdAt: new Date("2023-01-01T00:00:00Z"),
    tasks: [
      { id: "task-17", title: "Check fuel levels", estimatedTime: 0.5 },
      { id: "task-18", title: "Start generator and run load test", estimatedTime: 1.5 },
      { id: "task-19", title: "Check electrical connections", estimatedTime: 0.5 },
      { id: "task-20", title: "Test automatic transfer switch", estimatedTime: 0.5 }
    ],
    parts: [
      { id: "part-8", name: "Engine Oil", quantity: 1, cost: 35 },
      { id: "part-9", name: "Fuel Filter", quantity: 1, cost: 25 }
    ],
    completionRate: 92,
    totalExecutions: 11,
    avgExecutionTime: 2.8
  }
];

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
  PAUSED: "bg-orange-100 text-orange-800 border-orange-200",
  ARCHIVED: "bg-red-100 text-red-800 border-red-200",
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800 border-gray-200",
  MEDIUM: "bg-blue-100 text-blue-800 border-blue-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
};

const frequencyColors = {
  DAILY: "bg-purple-100 text-purple-800 border-purple-200",
  WEEKLY: "bg-blue-100 text-blue-800 border-blue-200",
  MONTHLY: "bg-green-100 text-green-800 border-green-200",
  QUARTERLY: "bg-orange-100 text-orange-800 border-orange-200",
  ANNUALLY: "bg-red-100 text-red-800 border-red-200",
};

export default function MaintenancePlansPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");

  // Filter maintenance plans based on search and filters
  const filteredPlans = mockMaintenancePlans.filter((plan) => {
    const matchesSearch = 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.asset.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || plan.priority === priorityFilter;
    const matchesFrequency = frequencyFilter === "all" || plan.frequency === frequencyFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesFrequency;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${hours * 60}m`;
    }
    return `${hours}h`;
  };

  const isOverdue = (nextDue: Date) => {
    return nextDue < new Date();
  };

  const getDaysUntilDue = (nextDue: Date) => {
    const today = new Date();
    const diffTime = nextDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Plans</h1>
            <p className="text-muted-foreground">
              Create and manage preventive maintenance schedules
            </p>
          </div>
          <Button asChild>
            <Link href="/maintenance-plans/new">
              <Plus className="mr-2 h-4 w-4" />
              New Plan
            </Link>
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockMaintenancePlans.filter(p => p.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockMaintenancePlans.filter(p => isOverdue(p.nextDue)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockMaintenancePlans.reduce((acc, p) => acc + p.completionRate, 0) / mockMaintenancePlans.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +5% from last quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockMaintenancePlans.reduce((acc, p) => acc + p.totalExecutions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans, assets, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequency</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="ANNUALLY">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {plan.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {plan.status === 'ACTIVE' ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={statusColors[plan.status]}>
                  {plan.status}
                </Badge>
                <Badge className={priorityColors[plan.priority]}>
                  {plan.priority}
                </Badge>
                <Badge className={frequencyColors[plan.frequency]}>
                  {plan.frequency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Asset Info */}
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{plan.asset.tag}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{plan.asset.location.name}</span>
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{plan.assignee.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{plan.assignee.role}</span>
              </div>

              {/* Schedule Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Due:</span>
                  <span className={`font-medium ${isOverdue(plan.nextDue) ? 'text-red-600' : ''}`}>
                    {formatDate(plan.nextDue)}
                    {isOverdue(plan.nextDue) && (
                      <span className="ml-1 text-red-600">(Overdue)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{formatDuration(plan.estimatedDuration)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion Rate:</span>
                  <span className="font-medium">{plan.completionRate}%</span>
                </div>
              </div>

              {/* Tasks Summary */}
              <div className="text-sm">
                <span className="text-muted-foreground">Tasks: </span>
                <span className="font-medium">{plan.tasks.length} steps</span>
              </div>

              {/* Parts Cost */}
              {plan.parts.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Parts Cost: </span>
                  <span className="font-medium">
                    ${plan.parts.reduce((acc, part) => acc + (part.cost * part.quantity), 0)}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No maintenance plans found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || frequencyFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Get started by creating your first maintenance plan."}
            </p>
            {(!searchTerm && statusFilter === "all" && priorityFilter === "all" && frequencyFilter === "all") && (
              <Button asChild>
                <Link href="/maintenance-plans/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Maintenance Plan
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </Layout>
  );
}