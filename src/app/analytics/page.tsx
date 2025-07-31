'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Wrench,
  Package,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  DollarSign,
  Users,
  Zap,
} from 'lucide-react';

// Mock data for analytics
const kpiData = {
  mttr: { value: 4.2, unit: 'hours', trend: -8.5, status: 'improving' },
  mtbf: { value: 168, unit: 'hours', trend: 12.3, status: 'improving' },
  availability: { value: 94.8, unit: '%', trend: 2.1, status: 'improving' },
  pmp: { value: 78.5, unit: '%', trend: -3.2, status: 'declining' },
  scheduleCompliance: { value: 89.2, unit: '%', trend: 5.7, status: 'improving' },
  maintenanceCost: { value: 125000, unit: '$', trend: -7.8, status: 'improving' },
};

const chartData = {
  workOrderTrends: [
    { month: 'Jan', completed: 45, pending: 12, overdue: 3 },
    { month: 'Feb', completed: 52, pending: 8, overdue: 2 },
    { month: 'Mar', completed: 48, pending: 15, overdue: 5 },
    { month: 'Apr', completed: 61, pending: 10, overdue: 1 },
    { month: 'May', completed: 55, pending: 18, overdue: 4 },
    { month: 'Jun', completed: 67, pending: 12, overdue: 2 },
  ],
  assetPerformance: [
    { asset: 'HVAC System', uptime: 98.5, efficiency: 92.1, cost: 15000 },
    { asset: 'Generator #1', uptime: 96.2, efficiency: 88.7, cost: 22000 },
    { asset: 'Pump Station', uptime: 94.8, efficiency: 91.3, cost: 8500 },
    { asset: 'Conveyor Belt', uptime: 97.1, efficiency: 89.9, cost: 12000 },
    { asset: 'Chiller Unit', uptime: 95.6, efficiency: 93.2, cost: 18500 },
  ],
  maintenanceTypes: [
    { type: 'Preventive', count: 145, percentage: 65 },
    { type: 'Corrective', count: 52, percentage: 23 },
    { type: 'Predictive', count: 18, percentage: 8 },
    { type: 'Emergency', count: 9, percentage: 4 },
  ],
};

const anomalies = [
  {
    id: '1',
    asset: 'Generator #2',
    type: 'Vibration Spike',
    severity: 'high',
    detected: '2024-01-15 14:30',
    description: 'Unusual vibration pattern detected in bearing assembly',
  },
  {
    id: '2',
    asset: 'HVAC Unit B',
    type: 'Temperature Anomaly',
    severity: 'medium',
    detected: '2024-01-15 12:15',
    description: 'Operating temperature 15% above normal range',
  },
  {
    id: '3',
    asset: 'Pump #3',
    type: 'Pressure Drop',
    severity: 'low',
    detected: '2024-01-15 09:45',
    description: 'Gradual pressure decrease over past 48 hours',
  },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedAssetType, setSelectedAssetType] = useState('all');

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (status: string) => {
    switch (status) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Real-time insights and performance metrics for your maintenance operations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Time Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="timeRange">Time Range</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="building-a">Building A</SelectItem>
                    <SelectItem value="building-b">Building B</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetType">Asset Type</Label>
                <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDate">Custom Date</Label>
                <Input type="date" id="customDate" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mean Time To Repair (MTTR)</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpiData.mttr.value} {kpiData.mttr.unit}
                  </div>
                  <div className={`flex items-center text-xs ${getTrendColor(kpiData.mttr.status)}`}>
                    {getTrendIcon(kpiData.mttr.trend)}
                    <span className="ml-1">{Math.abs(kpiData.mttr.trend)}% from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mean Time Between Failures (MTBF)</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpiData.mtbf.value} {kpiData.mtbf.unit}
                  </div>
                  <div className={`flex items-center text-xs ${getTrendColor(kpiData.mtbf.status)}`}>
                    {getTrendIcon(kpiData.mtbf.trend)}
                    <span className="ml-1">{Math.abs(kpiData.mtbf.trend)}% from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Equipment Effectiveness</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpiData.availability.value}{kpiData.availability.unit}
                  </div>
                  <div className={`flex items-center text-xs ${getTrendColor(kpiData.availability.status)}`}>
                    {getTrendIcon(kpiData.availability.trend)}
                    <span className="ml-1">{Math.abs(kpiData.availability.trend)}% from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Planned Maintenance Percentage</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpiData.pmp.value}{kpiData.pmp.unit}
                  </div>
                  <div className={`flex items-center text-xs ${getTrendColor(kpiData.pmp.status)}`}>
                    {getTrendIcon(kpiData.pmp.trend)}
                    <span className="ml-1">{Math.abs(kpiData.pmp.trend)}% from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Schedule Compliance</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpiData.scheduleCompliance.value}{kpiData.scheduleCompliance.unit}
                  </div>
                  <div className={`flex items-center text-xs ${getTrendColor(kpiData.scheduleCompliance.status)}`}>
                    {getTrendIcon(kpiData.scheduleCompliance.trend)}
                    <span className="ml-1">{Math.abs(kpiData.scheduleCompliance.trend)}% from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${kpiData.maintenanceCost.value.toLocaleString()}
                  </div>
                  <div className={`flex items-center text-xs ${getTrendColor(kpiData.maintenanceCost.status)}`}>
                    {getTrendIcon(kpiData.maintenanceCost.trend)}
                    <span className="ml-1">{Math.abs(kpiData.maintenanceCost.trend)}% from last period</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Work Order Trends
                  </CardTitle>
                  <CardDescription>Monthly work order completion trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <BarChart3 className="mx-auto h-12 w-12 mb-2" />
                      <p>Interactive chart would be displayed here</p>
                      <p className="text-xs">Showing completed, pending, and overdue work orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Maintenance Type Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of maintenance activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chartData.maintenanceTypes.map((type) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium">{type.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{type.count}</span>
                          <Badge variant="secondary">{type.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Asset Performance Metrics
                </CardTitle>
                <CardDescription>Detailed performance analysis by asset</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.assetPerformance.map((asset, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{asset.asset}</h4>
                        <Badge variant="outline">${asset.cost.toLocaleString()}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Uptime</span>
                            <span className="font-medium">{asset.uptime}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${asset.uptime}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Efficiency</span>
                            <span className="font-medium">{asset.efficiency}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${asset.efficiency}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Cost Trends
                  </CardTitle>
                  <CardDescription>Maintenance cost analysis over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <TrendingUp className="mx-auto h-12 w-12 mb-2" />
                    <p>Cost trend chart would be displayed here</p>
                    <p className="text-xs">Showing labor, parts, and total costs</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Reliability Trends
                  </CardTitle>
                  <CardDescription>Asset reliability metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Activity className="mx-auto h-12 w-12 mb-2" />
                    <p>Reliability trend chart would be displayed here</p>
                    <p className="text-xs">MTBF, MTTR, and availability trends</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI-Detected Anomalies
                </CardTitle>
                <CardDescription>Real-time anomaly detection and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {anomalies.map((anomaly) => (
                    <div key={anomaly.id} className="p-4 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{anomaly.asset}</h4>
                            <Badge variant={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {anomaly.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {anomaly.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Detected: {anomaly.detected}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}