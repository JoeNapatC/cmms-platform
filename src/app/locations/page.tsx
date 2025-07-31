"use client";

import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Search, Plus, Filter, MapPin, Building, Edit, Trash2, MoreHorizontal, Package, Wrench, AlertTriangle, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

// Mock data for locations
const mockLocations = [
  {
    id: "loc-001",
    name: "Building A",
    code: "BLDG-A",
    type: "BUILDING",
    description: "Main production facility with manufacturing equipment",
    address: "123 Industrial Drive, Manufacturing District",
    parentLocation: null,
    manager: {
      id: "user-1",
      name: "John Smith",
      email: "john.smith@company.com"
    },
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    area: 15000, // square feet
    status: "ACTIVE",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    assets: [
      { id: "asset-1", tag: "PUMP-A-101", name: "Centrifugal Pump A-101", status: "OPERATIONAL" },
      { id: "asset-2", tag: "CONV-A-201", name: "Conveyor Belt A-201", status: "OPERATIONAL" },
      { id: "asset-3", tag: "COMP-A-150", name: "Air Compressor A-150", status: "MAINTENANCE" }
    ],
    workOrders: {
      open: 3,
      inProgress: 1,
      completed: 45
    },
    maintenancePlans: 8,
    criticalAssets: 2
  },
  {
    id: "loc-002",
    name: "Building A - Floor 1",
    code: "BLDG-A-F1",
    type: "FLOOR",
    description: "Ground floor production area",
    address: null,
    parentLocation: {
      id: "loc-001",
      name: "Building A"
    },
    manager: {
      id: "user-2",
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com"
    },
    coordinates: null,
    area: 7500,
    status: "ACTIVE",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    assets: [
      { id: "asset-1", tag: "PUMP-A-101", name: "Centrifugal Pump A-101", status: "OPERATIONAL" },
      { id: "asset-4", tag: "TANK-A-110", name: "Storage Tank A-110", status: "OPERATIONAL" }
    ],
    workOrders: {
      open: 1,
      inProgress: 1,
      completed: 22
    },
    maintenancePlans: 4,
    criticalAssets: 1
  },
  {
    id: "loc-003",
    name: "Building A - Floor 2",
    code: "BLDG-A-F2",
    type: "FLOOR",
    description: "Second floor assembly area",
    address: null,
    parentLocation: {
      id: "loc-001",
      name: "Building A"
    },
    manager: {
      id: "user-3",
      name: "Mike Johnson",
      email: "mike.johnson@company.com"
    },
    coordinates: null,
    area: 7500,
    status: "ACTIVE",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    assets: [
      { id: "asset-2", tag: "CONV-A-201", name: "Conveyor Belt A-201", status: "OPERATIONAL" },
      { id: "asset-5", tag: "ROBOT-A-250", name: "Assembly Robot A-250", status: "OPERATIONAL" }
    ],
    workOrders: {
      open: 2,
      inProgress: 0,
      completed: 23
    },
    maintenancePlans: 4,
    criticalAssets: 1
  },
  {
    id: "loc-004",
    name: "Building B",
    code: "BLDG-B",
    type: "BUILDING",
    description: "Secondary production facility and warehouse",
    address: "456 Industrial Drive, Manufacturing District",
    parentLocation: null,
    manager: {
      id: "user-4",
      name: "Robert Taylor",
      email: "robert.taylor@company.com"
    },
    coordinates: {
      latitude: 40.7130,
      longitude: -74.0058
    },
    area: 20000,
    status: "ACTIVE",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    assets: [
      { id: "asset-6", tag: "CONV-B-205", name: "Conveyor Belt B-205", status: "DOWN" },
      { id: "asset-7", tag: "CRANE-B-300", name: "Overhead Crane B-300", status: "OPERATIONAL" },
      { id: "asset-8", tag: "HVAC-B-400", name: "HVAC Unit B-400", status: "OPERATIONAL" }
    ],
    workOrders: {
      open: 5,
      inProgress: 2,
      completed: 67
    },
    maintenancePlans: 12,
    criticalAssets: 3
  },
  {
    id: "loc-005",
    name: "Building C",
    code: "BLDG-C",
    type: "BUILDING",
    description: "Administrative offices and meeting rooms",
    address: "789 Corporate Blvd, Business District",
    parentLocation: null,
    manager: {
      id: "user-5",
      name: "Emily Davis",
      email: "emily.davis@company.com"
    },
    coordinates: {
      latitude: 40.7125,
      longitude: -74.0065
    },
    area: 8000,
    status: "ACTIVE",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    assets: [
      { id: "asset-9", tag: "HVAC-C-301", name: "HVAC Unit C-301", status: "OPERATIONAL" },
      { id: "asset-10", tag: "GEN-C-400", name: "Emergency Generator C-400", status: "OPERATIONAL" },
      { id: "asset-11", tag: "UPS-C-500", name: "UPS System C-500", status: "OPERATIONAL" }
    ],
    workOrders: {
      open: 1,
      inProgress: 0,
      completed: 28
    },
    maintenancePlans: 6,
    criticalAssets: 1
  },
  {
    id: "loc-006",
    name: "Warehouse",
    code: "WAREHOUSE",
    type: "WAREHOUSE",
    description: "Main storage and distribution center",
    address: "321 Storage Way, Industrial District",
    parentLocation: null,
    manager: {
      id: "user-6",
      name: "David Brown",
      email: "david.brown@company.com"
    },
    coordinates: {
      latitude: 40.7135,
      longitude: -74.0055
    },
    area: 25000,
    status: "ACTIVE",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    assets: [
      { id: "asset-12", tag: "FORK-W-101", name: "Forklift W-101", status: "OPERATIONAL" },
      { id: "asset-13", tag: "FORK-W-102", name: "Forklift W-102", status: "MAINTENANCE" },
      { id: "asset-14", tag: "DOCK-W-201", name: "Loading Dock W-201", status: "OPERATIONAL" }
    ],
    workOrders: {
      open: 2,
      inProgress: 1,
      completed: 34
    },
    maintenancePlans: 5,
    criticalAssets: 0
  },
  {
    id: "loc-007",
    name: "Parking Lot A",
    code: "PARK-A",
    type: "OUTDOOR",
    description: "Employee parking area adjacent to Building A",
    address: null,
    parentLocation: null,
    manager: {
      id: "user-7",
      name: "Lisa Garcia",
      email: "lisa.garcia@company.com"
    },
    coordinates: {
      latitude: 40.7126,
      longitude: -74.0062
    },
    area: 5000,
    status: "MAINTENANCE",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    assets: [
      { id: "asset-15", tag: "LIGHT-P-001", name: "Parking Light P-001", status: "DOWN" },
      { id: "asset-16", tag: "GATE-P-100", name: "Security Gate P-100", status: "OPERATIONAL" }
    ],
    workOrders: {
      open: 3,
      inProgress: 1,
      completed: 12
    },
    maintenancePlans: 2,
    criticalAssets: 0
  }
];

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  MAINTENANCE: "bg-orange-100 text-orange-800 border-orange-200",
  INACTIVE: "bg-gray-100 text-gray-800 border-gray-200",
  DECOMMISSIONED: "bg-red-100 text-red-800 border-red-200",
};

const typeColors = {
  BUILDING: "bg-blue-100 text-blue-800 border-blue-200",
  FLOOR: "bg-purple-100 text-purple-800 border-purple-200",
  ROOM: "bg-green-100 text-green-800 border-green-200",
  WAREHOUSE: "bg-orange-100 text-orange-800 border-orange-200",
  OUTDOOR: "bg-gray-100 text-gray-800 border-gray-200",
};

const assetStatusColors = {
  OPERATIONAL: "bg-green-100 text-green-800",
  MAINTENANCE: "bg-orange-100 text-orange-800",
  DOWN: "bg-red-100 text-red-800",
};

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Filter locations based on search and filters
  const filteredLocations = mockLocations.filter((location) => {
    const matchesSearch = 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.address && location.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || location.status === statusFilter;
    const matchesType = typeFilter === "all" || location.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const formatArea = (area: number) => {
    return area.toLocaleString() + " sq ft";
  };

  const getTotalAssets = () => {
    return mockLocations.reduce((acc, loc) => acc + loc.assets.length, 0);
  };

  const getTotalWorkOrders = () => {
    return mockLocations.reduce((acc, loc) => acc + loc.workOrders.open + loc.workOrders.inProgress, 0);
  };

  const getCriticalAssets = () => {
    return mockLocations.reduce((acc, loc) => acc + loc.criticalAssets, 0);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
            <p className="text-muted-foreground">
              Manage facility locations and organize your assets
            </p>
          </div>
          <Button asChild>
            <Link href="/locations/new">
              <Plus className="mr-2 h-4 w-4" />
              New Location
            </Link>
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLocations.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all facilities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalAssets()}</div>
            <p className="text-xs text-muted-foreground">
              Distributed across locations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalWorkOrders()}</div>
            <p className="text-xs text-muted-foreground">
              Open and in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Assets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{getCriticalAssets()}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations, codes, or addresses..."
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
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DECOMMISSIONED">Decommissioned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BUILDING">Building</SelectItem>
                  <SelectItem value="FLOOR">Floor</SelectItem>
                  <SelectItem value="ROOM">Room</SelectItem>
                  <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                  <SelectItem value="OUTDOOR">Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLocations.map((location) => (
          <Card key={location.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    {location.name}
                  </CardTitle>
                  <CardDescription>
                    <span className="font-mono text-sm">{location.code}</span>
                  </CardDescription>
                  <CardDescription className="line-clamp-2">
                    {location.description}
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
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={statusColors[location.status]}>
                  {location.status}
                </Badge>
                <Badge className={typeColors[location.type]}>
                  {location.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parent Location */}
              {location.parentLocation && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Parent: </span>
                  <span className="font-medium">{location.parentLocation.name}</span>
                </div>
              )}

              {/* Address */}
              {location.address && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Address: </span>
                  <span>{location.address}</span>
                </div>
              )}

              {/* Manager */}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{location.manager.name}</span>
              </div>

              {/* Area */}
              <div className="text-sm">
                <span className="text-muted-foreground">Area: </span>
                <span className="font-medium">{formatArea(location.area)}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Assets: </span>
                  <span className="font-medium">{location.assets.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Work Orders: </span>
                  <span className="font-medium">{location.workOrders.open + location.workOrders.inProgress}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Plans: </span>
                  <span className="font-medium">{location.maintenancePlans}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Critical: </span>
                  <span className={`font-medium ${location.criticalAssets > 0 ? 'text-orange-600' : ''}`}>
                    {location.criticalAssets}
                  </span>
                </div>
              </div>

              {/* Assets Preview */}
              {location.assets.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Recent Assets:</span>
                  <div className="space-y-1">
                    {location.assets.slice(0, 3).map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between text-xs">
                        <span className="font-mono">{asset.tag}</span>
                        <Badge className={`text-xs ${assetStatusColors[asset.status]}`}>
                          {asset.status}
                        </Badge>
                      </div>
                    ))}
                    {location.assets.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{location.assets.length - 3} more assets
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/locations/${location.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/locations/${location.id}/assets`}>
                    <Package className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No locations found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Get started by adding your first location."}
            </p>
            {(!searchTerm && statusFilter === "all" && typeFilter === "all") && (
              <Button asChild>
                <Link href="/locations/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
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