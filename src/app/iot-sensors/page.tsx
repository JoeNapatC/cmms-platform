"use client";

import { useState } from "react";
import { Search, Plus, Filter, Wifi, WifiOff, Battery, Thermometer, Zap, Activity, AlertTriangle, CheckCircle, Settings, Edit, Trash2, MoreHorizontal, TrendingUp, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Layout } from "@/components/layout/Layout";
import Link from "next/link";

// Mock data for IoT sensors
const mockSensors = [
  {
    id: "sensor-001",
    name: "Temperature Sensor - Pump A-101",
    deviceId: "TEMP-A101-001",
    type: "TEMPERATURE",
    status: "ONLINE",
    batteryLevel: 85,
    signalStrength: 92,
    asset: {
      id: "asset-1",
      tag: "PUMP-A-101",
      name: "Centrifugal Pump A-101",
      location: { name: "Building A - Floor 1" }
    },
    lastReading: {
      value: 68.5,
      unit: "°C",
      timestamp: new Date("2024-01-15T14:30:00Z"),
      status: "NORMAL"
    },
    thresholds: {
      warning: { min: 60, max: 80 },
      critical: { min: 50, max: 90 }
    },
    manufacturer: "SensorTech",
    model: "ST-TEMP-300",
    firmwareVersion: "v2.1.4",
    installDate: new Date("2023-06-15T00:00:00Z"),
    lastMaintenance: new Date("2023-12-01T00:00:00Z"),
    alertsCount: 2,
    dataPoints: 1440 // readings per day
  },
  {
    id: "sensor-002",
    name: "Vibration Sensor - Motor B-205",
    deviceId: "VIB-B205-001",
    type: "VIBRATION",
    status: "ONLINE",
    batteryLevel: 72,
    signalStrength: 88,
    asset: {
      id: "asset-2",
      tag: "MOTOR-B-205",
      name: "Electric Motor B-205",
      location: { name: "Building B - Floor 2" }
    },
    lastReading: {
      value: 2.3,
      unit: "mm/s",
      timestamp: new Date("2024-01-15T14:29:00Z"),
      status: "WARNING"
    },
    thresholds: {
      warning: { min: 0, max: 2.5 },
      critical: { min: 0, max: 4.0 }
    },
    manufacturer: "VibeTech",
    model: "VT-VIB-500",
    firmwareVersion: "v1.8.2",
    installDate: new Date("2023-08-20T00:00:00Z"),
    lastMaintenance: new Date("2023-11-15T00:00:00Z"),
    alertsCount: 5,
    dataPoints: 2880
  },
  {
    id: "sensor-003",
    name: "Pressure Sensor - Compressor C-150",
    deviceId: "PRES-C150-001",
    type: "PRESSURE",
    status: "OFFLINE",
    batteryLevel: 15,
    signalStrength: 0,
    asset: {
      id: "asset-3",
      tag: "COMP-C-150",
      name: "Air Compressor C-150",
      location: { name: "Building C - Basement" }
    },
    lastReading: {
      value: 8.2,
      unit: "bar",
      timestamp: new Date("2024-01-14T22:15:00Z"),
      status: "NORMAL"
    },
    thresholds: {
      warning: { min: 6.0, max: 10.0 },
      critical: { min: 4.0, max: 12.0 }
    },
    manufacturer: "PressurePro",
    model: "PP-PRES-200",
    firmwareVersion: "v3.0.1",
    installDate: new Date("2023-05-10T00:00:00Z"),
    lastMaintenance: new Date("2023-10-20T00:00:00Z"),
    alertsCount: 1,
    dataPoints: 720
  },
  {
    id: "sensor-004",
    name: "Current Sensor - HVAC Unit D-301",
    deviceId: "CURR-D301-001",
    type: "CURRENT",
    status: "ONLINE",
    batteryLevel: 94,
    signalStrength: 95,
    asset: {
      id: "asset-4",
      tag: "HVAC-D-301",
      name: "HVAC Unit D-301",
      location: { name: "Building D - Roof" }
    },
    lastReading: {
      value: 12.8,
      unit: "A",
      timestamp: new Date("2024-01-15T14:31:00Z"),
      status: "NORMAL"
    },
    thresholds: {
      warning: { min: 8.0, max: 15.0 },
      critical: { min: 5.0, max: 18.0 }
    },
    manufacturer: "ElectroSense",
    model: "ES-CURR-400",
    firmwareVersion: "v2.3.1",
    installDate: new Date("2023-09-05T00:00:00Z"),
    lastMaintenance: new Date("2023-12-10T00:00:00Z"),
    alertsCount: 0,
    dataPoints: 1440
  },
  {
    id: "sensor-005",
    name: "Flow Sensor - Cooling System E-401",
    deviceId: "FLOW-E401-001",
    type: "FLOW",
    status: "WARNING",
    batteryLevel: 45,
    signalStrength: 78,
    asset: {
      id: "asset-5",
      tag: "COOL-E-401",
      name: "Cooling System E-401",
      location: { name: "Building E - Floor 1" }
    },
    lastReading: {
      value: 45.2,
      unit: "L/min",
      timestamp: new Date("2024-01-15T14:28:00Z"),
      status: "WARNING"
    },
    thresholds: {
      warning: { min: 40.0, max: 60.0 },
      critical: { min: 30.0, max: 70.0 }
    },
    manufacturer: "FlowMaster",
    model: "FM-FLOW-600",
    firmwareVersion: "v1.9.3",
    installDate: new Date("2023-07-12T00:00:00Z"),
    lastMaintenance: new Date("2023-11-30T00:00:00Z"),
    alertsCount: 3,
    dataPoints: 1440
  }
];

const statusColors = {
  ONLINE: "bg-green-100 text-green-800 border-green-200",
  OFFLINE: "bg-red-100 text-red-800 border-red-200",
  WARNING: "bg-orange-100 text-orange-800 border-orange-200",
  MAINTENANCE: "bg-blue-100 text-blue-800 border-blue-200",
};

const typeColors = {
  TEMPERATURE: "bg-red-100 text-red-800 border-red-200",
  VIBRATION: "bg-purple-100 text-purple-800 border-purple-200",
  PRESSURE: "bg-blue-100 text-blue-800 border-blue-200",
  CURRENT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  FLOW: "bg-cyan-100 text-cyan-800 border-cyan-200",
  HUMIDITY: "bg-green-100 text-green-800 border-green-200",
};

const readingStatusColors = {
  NORMAL: "bg-green-100 text-green-800",
  WARNING: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const getSensorIcon = (type: string) => {
  switch (type) {
    case 'TEMPERATURE':
      return <Thermometer className="h-4 w-4" />;
    case 'VIBRATION':
      return <Activity className="h-4 w-4" />;
    case 'PRESSURE':
      return <Zap className="h-4 w-4" />;
    case 'CURRENT':
      return <Zap className="h-4 w-4" />;
    case 'FLOW':
      return <Activity className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export default function IoTSensorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter sensors based on search and filters
  const filteredSensors = mockSensors.filter((sensor) => {
    const matchesSearch = 
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.asset.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || sensor.status === statusFilter;
    const matchesType = typeFilter === "all" || sensor.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSinceLastReading = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-600";
    if (level > 20) return "text-orange-600";
    return "text-red-600";
  };

  const getSignalColor = (strength: number) => {
    if (strength > 80) return "text-green-600";
    if (strength > 50) return "text-orange-600";
    return "text-red-600";
  };

  // Calculate stats
  const onlineSensors = mockSensors.filter(s => s.status === 'ONLINE').length;
  const offlineSensors = mockSensors.filter(s => s.status === 'OFFLINE').length;
  const warningSensors = mockSensors.filter(s => s.status === 'WARNING').length;
  const totalAlerts = mockSensors.reduce((acc, s) => acc + s.alertsCount, 0);

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">IoT Sensors</h1>
            <p className="text-muted-foreground">
              Monitor and manage IoT sensors for predictive maintenance
            </p>
          </div>
          <Button asChild>
            <Link href="/iot-sensors/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Sensor
            </Link>
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Sensors</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineSensors}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((onlineSensors / mockSensors.length) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Sensors</CardTitle>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{offlineSensors}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{warningSensors}</div>
            <p className="text-xs text-muted-foreground">
              Sensors with warnings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Sensors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sensors, devices, or assets..."
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
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="TEMPERATURE">Temperature</SelectItem>
                  <SelectItem value="VIBRATION">Vibration</SelectItem>
                  <SelectItem value="PRESSURE">Pressure</SelectItem>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="FLOW">Flow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSensors.map((sensor) => (
          <Card key={sensor.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getSensorIcon(sensor.type)}
                    {sensor.name}
                  </CardTitle>
                  <CardDescription>
                    <span className="font-mono text-sm">{sensor.deviceId}</span>
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
                      <Activity className="mr-2 h-4 w-4" />
                      View Data
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={statusColors[sensor.status]}>
                  {sensor.status === 'ONLINE' && <Wifi className="mr-1 h-3 w-3" />}
                  {sensor.status === 'OFFLINE' && <WifiOff className="mr-1 h-3 w-3" />}
                  {sensor.status === 'WARNING' && <AlertTriangle className="mr-1 h-3 w-3" />}
                  {sensor.status}
                </Badge>
                <Badge className={typeColors[sensor.type]}>
                  {sensor.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Asset Info */}
              <div className="text-sm">
                <span className="text-muted-foreground">Asset: </span>
                <span className="font-medium">{sensor.asset.tag}</span>
                <br />
                <span className="text-muted-foreground">{sensor.asset.location.name}</span>
              </div>

              {/* Last Reading */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Reading:</span>
                  <Badge className={readingStatusColors[sensor.lastReading.status]}>
                    {sensor.lastReading.status}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {sensor.lastReading.value} {sensor.lastReading.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getTimeSinceLastReading(sensor.lastReading.timestamp)}
                </div>
              </div>

              {/* Battery Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Battery className="h-4 w-4" />
                    Battery
                  </span>
                  <span className={`font-medium ${getBatteryColor(sensor.batteryLevel)}`}>
                    {sensor.batteryLevel}%
                  </span>
                </div>
                <Progress value={sensor.batteryLevel} className="h-2" />
              </div>

              {/* Signal Strength */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Signal className="h-4 w-4" />
                    Signal
                  </span>
                  <span className={`font-medium ${getSignalColor(sensor.signalStrength)}`}>
                    {sensor.signalStrength}%
                  </span>
                </div>
                <Progress value={sensor.signalStrength} className="h-2" />
              </div>

              {/* Device Info */}
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Model: </span>
                  <span>{sensor.manufacturer} {sensor.model}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Firmware: </span>
                  <span className="font-mono">{sensor.firmwareVersion}</span>
                </div>
              </div>

              {/* Alerts */}
              {sensor.alertsCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-600 font-medium">
                    {sensor.alertsCount} active alert{sensor.alertsCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/iot-sensors/${sensor.id}`}>
                    <Activity className="mr-2 h-4 w-4" />
                    View Data
                  </Link>
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
      {filteredSensors.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wifi className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sensors found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Get started by adding your first IoT sensor."}
            </p>
            {(!searchTerm && statusFilter === "all" && typeFilter === "all") && (
              <Button asChild>
                <Link href="/iot-sensors/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sensor
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