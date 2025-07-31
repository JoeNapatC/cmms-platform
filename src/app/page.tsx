/**
 * Dashboard Page
 * Main dashboard with overview statistics and quick actions
 */

'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Wrench,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/components/providers/TRPCProvider';

// Mock data for demonstration
const mockStats = {
  assets: { total: 1247, active: 1156, maintenance: 67, retired: 24, critical: 89 },
  workOrders: { total: 342, pending: 45, inProgress: 23, completed: 267, overdue: 7, highPriority: 12 },
};

const recentWorkOrders = [
  {
    id: '1',
    title: 'Replace HVAC Filter - Building A',
    asset: 'HVAC-001',
    priority: 'high' as const,
    status: 'pending' as const,
    assignee: 'John Smith',
    dueDate: '2024-01-15',
  },
  {
    id: '2',
    title: 'Pump Maintenance - Water System',
    asset: 'PUMP-045',
    priority: 'medium' as const,
    status: 'in_progress' as const,
    assignee: 'Sarah Johnson',
    dueDate: '2024-01-16',
  },
  {
    id: '3',
    title: 'Emergency Repair - Generator',
    asset: 'GEN-003',
    priority: 'critical' as const,
    status: 'pending' as const,
    assignee: 'Mike Wilson',
    dueDate: '2024-01-14',
  },
];

const criticalAssets = [
  {
    id: '1',
    name: 'Main Generator',
    location: 'Building A - Basement',
    status: 'maintenance' as const,
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-01-20',
  },
  {
    id: '2',
    name: 'Chiller Unit #2',
    location: 'Roof - North Wing',
    status: 'active' as const,
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-01-25',
  },
];

export default function Dashboard() {
  // Uncomment when backend is ready
  // const { data: assetStats } = api.asset.getStats.useQuery();
  // const { data: workOrderStats } = api.workOrder.getStats.useQuery();

  const assetStats = mockStats.assets;
  const workOrderStats = mockStats.workOrders;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome back! Here's what's happening with your assets and maintenance.
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Button>
            <Button variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Assets */}
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12</span> from last month
              </p>
            </CardContent>
          </Card>

          {/* Active Work Orders */}
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(workOrderStats.pending + workOrderStats.inProgress).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600">{workOrderStats.overdue}</span> overdue
              </p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((workOrderStats.completed / workOrderStats.total) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5%</span> from last month
              </p>
            </CardContent>
          </Card>

          {/* Critical Assets */}
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Assets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.critical}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Work Orders */}
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Work Orders</CardTitle>
                  <CardDescription>Latest maintenance requests and tasks</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWorkOrders.map((workOrder) => (
                  <div
                    key={workOrder.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {workOrder.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {workOrder.asset} • Assigned to {workOrder.assignee}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(workOrder.priority)}>
                        {workOrder.priority}
                      </Badge>
                      <Badge variant={getStatusColor(workOrder.status)}>
                        {workOrder.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Assets */}
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Critical Assets</CardTitle>
                  <CardDescription>Assets requiring immediate attention</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {asset.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {asset.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Next maintenance: {asset.nextMaintenance}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Wrench className="h-6 w-6" />
                <span>Create Work Order</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Package className="h-6 w-6" />
                <span>Add Asset</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Clock className="h-6 w-6" />
                <span>Schedule Maintenance</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
