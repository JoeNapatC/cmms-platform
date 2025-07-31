"use client";

import { useState } from "react";
import { Search, Plus, Filter, Mail, Phone, MapPin, Calendar, User, Shield, Settings, Edit, Trash2, MoreHorizontal, Users, UserCheck, Clock, Award } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// Mock data for team members
const mockTeamMembers = [
  {
    id: "user-001",
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    role: "MAINTENANCE_MANAGER",
    department: "Maintenance",
    location: "Building A - Floor 1",
    status: "ACTIVE",
    avatar: null,
    joinDate: new Date("2022-03-15T00:00:00Z"),
    lastActive: new Date("2024-01-15T14:30:00Z"),
    skills: ["Electrical", "HVAC", "Plumbing", "Safety"],
    certifications: ["OSHA 30", "EPA 608", "Electrical License"],
    workOrders: {
      assigned: 8,
      completed: 156,
      inProgress: 3
    },
    performance: {
      rating: 4.8,
      completionRate: 95,
      avgResponseTime: "2.5 hours"
    }
  },
  {
    id: "user-002",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 234-5678",
    role: "TECHNICIAN",
    department: "Maintenance",
    location: "Building B - Floor 2",
    status: "ACTIVE",
    avatar: null,
    joinDate: new Date("2023-01-20T00:00:00Z"),
    lastActive: new Date("2024-01-15T13:45:00Z"),
    skills: ["Mechanical", "Welding", "Preventive Maintenance"],
    certifications: ["Welding Certification", "Forklift License"],
    workOrders: {
      assigned: 5,
      completed: 89,
      inProgress: 2
    },
    performance: {
      rating: 4.6,
      completionRate: 92,
      avgResponseTime: "3.1 hours"
    }
  },
  {
    id: "user-003",
    name: "Mike Rodriguez",
    email: "mike.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
    role: "SUPERVISOR",
    department: "Operations",
    location: "Building C - Basement",
    status: "ACTIVE",
    avatar: null,
    joinDate: new Date("2021-08-10T00:00:00Z"),
    lastActive: new Date("2024-01-15T15:00:00Z"),
    skills: ["Team Leadership", "Quality Control", "Process Improvement"],
    certifications: ["Six Sigma Green Belt", "PMP"],
    workOrders: {
      assigned: 12,
      completed: 234,
      inProgress: 4
    },
    performance: {
      rating: 4.9,
      completionRate: 98,
      avgResponseTime: "1.8 hours"
    }
  },
  {
    id: "user-004",
    name: "Emily Chen",
    email: "emily.chen@company.com",
    phone: "+1 (555) 456-7890",
    role: "TECHNICIAN",
    department: "Maintenance",
    location: "Building D - Roof",
    status: "ON_LEAVE",
    avatar: null,
    joinDate: new Date("2023-06-05T00:00:00Z"),
    lastActive: new Date("2024-01-10T16:30:00Z"),
    skills: ["HVAC", "Refrigeration", "Controls"],
    certifications: ["HVAC License", "EPA 608"],
    workOrders: {
      assigned: 0,
      completed: 67,
      inProgress: 0
    },
    performance: {
      rating: 4.7,
      completionRate: 94,
      avgResponseTime: "2.8 hours"
    }
  },
  {
    id: "user-005",
    name: "David Wilson",
    email: "david.wilson@company.com",
    phone: "+1 (555) 567-8901",
    role: "ADMIN",
    department: "IT",
    location: "Building A - Floor 3",
    status: "ACTIVE",
    avatar: null,
    joinDate: new Date("2020-11-12T00:00:00Z"),
    lastActive: new Date("2024-01-15T14:15:00Z"),
    skills: ["System Administration", "Database Management", "Network Security"],
    certifications: ["CompTIA Security+", "Microsoft Certified"],
    workOrders: {
      assigned: 3,
      completed: 45,
      inProgress: 1
    },
    performance: {
      rating: 4.5,
      completionRate: 89,
      avgResponseTime: "4.2 hours"
    }
  }
];

const roleColors = {
  ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  MAINTENANCE_MANAGER: "bg-blue-100 text-blue-800 border-blue-200",
  SUPERVISOR: "bg-green-100 text-green-800 border-green-200",
  TECHNICIAN: "bg-orange-100 text-orange-800 border-orange-200",
  OPERATOR: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  INACTIVE: "bg-gray-100 text-gray-800 border-gray-200",
  ON_LEAVE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  SUSPENDED: "bg-red-100 text-red-800 border-red-200",
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return <Shield className="h-4 w-4" />;
    case 'MAINTENANCE_MANAGER':
      return <Users className="h-4 w-4" />;
    case 'SUPERVISOR':
      return <UserCheck className="h-4 w-4" />;
    case 'TECHNICIAN':
      return <User className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Filter team members based on search and filters
  const filteredMembers = mockTeamMembers.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeSinceLastActive = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calculate stats
  const activeMembers = mockTeamMembers.filter(m => m.status === 'ACTIVE').length;
  const totalWorkOrders = mockTeamMembers.reduce((acc, m) => acc + m.workOrders.assigned, 0);
  const avgPerformance = mockTeamMembers.reduce((acc, m) => acc + m.performance.rating, 0) / mockTeamMembers.length;
  const departments = [...new Set(mockTeamMembers.map(m => m.department))];

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members, roles, and performance
          </p>
        </div>
        <Button asChild>
          <Link href="/team/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeMembers / mockTeamMembers.length) * 100)}% of total team
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Work Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerformance.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 rating
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, department, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MAINTENANCE_MANAGER">Manager</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="TECHNICIAN">Technician</SelectItem>
                  <SelectItem value="OPERATOR">Operator</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.email}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={roleColors[member.role]}>
                  {getRoleIcon(member.role)}
                  <span className="ml-1">{member.role.replace('_', ' ')}</span>
                </Badge>
                <Badge className={statusColors[member.status]}>
                  {member.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{member.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {formatDate(member.joinDate)}</span>
                </div>
              </div>

              {/* Work Orders Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Work Orders</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-blue-600">{member.workOrders.assigned}</div>
                    <div className="text-xs text-blue-600">Assigned</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-orange-600">{member.workOrders.inProgress}</div>
                    <div className="text-xs text-orange-600">In Progress</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-green-600">{member.workOrders.completed}</div>
                    <div className="text-xs text-green-600">Completed</div>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Performance</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Rating:</span>
                    <span className="font-medium">{member.performance.rating}/5.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate:</span>
                    <span className="font-medium">{member.performance.completionRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Response:</span>
                    <span className="font-medium">{member.performance.avgResponseTime}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {member.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Last Active */}
              <div className="text-xs text-muted-foreground">
                Last active: {getTimeSinceLastActive(member.lastActive)}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/team/${member.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || roleFilter !== "all" || statusFilter !== "all" || departmentFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Get started by adding your first team member."}
            </p>
            {(!searchTerm && roleFilter === "all" && statusFilter === "all" && departmentFilter === "all") && (
              <Button asChild>
                <Link href="/team/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
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