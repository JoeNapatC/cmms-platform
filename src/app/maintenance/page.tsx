'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { 
  Calendar, 
  Clock, 
  Settings, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Edit,
  Trash2,
  Gauge,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for maintenance plans
const mockMaintenancePlans = [
  {
    id: '1',
    name: 'Monthly HVAC Filter Replacement',
    type: 'TIME_BASED',
    frequency: 30,
    asset: {
      id: 'asset-1',
      tag: 'HVAC-001',
      model: 'Carrier 50TCQ',
      manufacturer: 'Carrier',
      location: { name: 'Building A - Floor 1' }
    },
    isActive: true,
    nextDueDate: '2024-02-15',
    createdAt: '2024-01-01',
    lastCompleted: '2024-01-15'
  },
  {
    id: '2',
    name: 'Compressor Oil Analysis',
    type: 'METER_BASED',
    meterThreshold: 1000,
    asset: {
      id: 'asset-2',
      tag: 'COMP-002',
      model: 'Atlas Copco GA55',
      manufacturer: 'Atlas Copco',
      location: { name: 'Production Floor' }
    },
    isActive: true,
    nextDueDate: '2024-02-20',
    createdAt: '2024-01-05',
    lastCompleted: '2024-01-20'
  },
  {
    id: '3',
    name: 'Predictive Vibration Analysis',
    type: 'PREDICTIVE',
    asset: {
      id: 'asset-3',
      tag: 'PUMP-003',
      model: 'Grundfos CR32',
      manufacturer: 'Grundfos',
      location: { name: 'Utility Room' }
    },
    isActive: true,
    nextDueDate: '2024-02-10',
    createdAt: '2024-01-10',
    lastCompleted: '2024-01-25'
  },
  {
    id: '4',
    name: 'Quarterly Safety Inspection',
    type: 'TIME_BASED',
    frequency: 90,
    asset: {
      id: 'asset-4',
      tag: 'CRANE-004',
      model: 'Konecranes CXT',
      manufacturer: 'Konecranes',
      location: { name: 'Warehouse' }
    },
    isActive: false,
    nextDueDate: '2024-03-01',
    createdAt: '2024-01-15',
    lastCompleted: '2023-12-01'
  },
  {
    id: '5',
    name: 'Belt Tension Check',
    type: 'METER_BASED',
    meterThreshold: 500,
    asset: {
      id: 'asset-5',
      tag: 'CONV-005',
      model: 'Dorner 2200',
      manufacturer: 'Dorner',
      location: { name: 'Assembly Line' }
    },
    isActive: true,
    nextDueDate: '2024-02-05',
    createdAt: '2024-01-20',
    lastCompleted: '2024-01-30'
  }
];

// Mock statistics
const mockStats = {
  totalPlans: 24,
  activePlans: 18,
  overduePlans: 3,
  dueThisWeek: 7,
  byType: {
    timeBased: 15,
    meterBased: 6,
    predictive: 3
  }
};

const getMaintenanceTypeIcon = (type: string) => {
  switch (type) {
    case 'TIME_BASED':
      return <Clock className="h-4 w-4" />;
    case 'METER_BASED':
      return <Gauge className="h-4 w-4" />;
    case 'PREDICTIVE':
      return <Brain className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

const getMaintenanceTypeColor = (type: string) => {
  switch (type) {
    case 'TIME_BASED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'METER_BASED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'PREDICTIVE':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const getDueDateStatus = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { status: 'overdue', color: 'text-red-600 dark:text-red-400', text: `${Math.abs(diffDays)} days overdue` };
  } else if (diffDays === 0) {
    return { status: 'today', color: 'text-orange-600 dark:text-orange-400', text: 'Due today' };
  } else if (diffDays <= 7) {
    return { status: 'soon', color: 'text-yellow-600 dark:text-yellow-400', text: `Due in ${diffDays} days` };
  } else {
    return { status: 'future', color: 'text-green-600 dark:text-green-400', text: `Due in ${diffDays} days` };
  }
};

export default function MaintenancePlansPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPlans = mockMaintenancePlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.asset.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || plan.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && plan.isActive) ||
                         (statusFilter === 'inactive' && !plan.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Maintenance Planning
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage preventive, predictive, and meter-based maintenance schedules
            </p>
          </div>
          <Button className="w-fit">
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalPlans}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {mockStats.activePlans} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockStats.dueThisWeek}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockStats.overduePlans}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Need immediate action
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictive Plans</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{mockStats.byType.predictive}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              AI-driven maintenance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search maintenance plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="TIME_BASED">Time-Based</SelectItem>
                  <SelectItem value="METER_BASED">Meter-Based</SelectItem>
                  <SelectItem value="PREDICTIVE">Predictive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Plans List */}
      <div className="grid gap-4">
        {filteredPlans.length === 0 ? (
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                  No maintenance plans found
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Try adjusting your search criteria or create a new maintenance plan.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPlans.map((plan) => {
            const dueStatus = getDueDateStatus(plan.nextDueDate);
            
            return (
              <Card key={plan.id} className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-900/60 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link 
                              href={`/maintenance/${plan.id}`}
                              className="text-lg font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {plan.name}
                            </Link>
                            <Badge 
                              variant="secondary" 
                              className={`${getMaintenanceTypeColor(plan.type)} flex items-center gap-1`}
                            >
                              {getMaintenanceTypeIcon(plan.type)}
                              {plan.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                              {plan.isActive ? (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <Pause className="mr-1 h-3 w-3" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>Asset: {plan.asset.tag}</span>
                            <span>•</span>
                            <span>{plan.asset.model}</span>
                            <span>•</span>
                            <span>{plan.asset.location.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Schedule:</span>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {plan.type === 'TIME_BASED' && plan.frequency && `Every ${plan.frequency} days`}
                            {plan.type === 'METER_BASED' && plan.meterThreshold && `Every ${plan.meterThreshold} hours`}
                            {plan.type === 'PREDICTIVE' && 'AI-driven schedule'}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Next Due:</span>
                          <div className={`font-medium ${dueStatus.color}`}>
                            {new Date(plan.nextDueDate).toLocaleDateString()}
                            <div className="text-xs">{dueStatus.text}</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Last Completed:</span>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {plan.lastCompleted ? new Date(plan.lastCompleted).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {plan.isActive ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="mr-2 h-4 w-4" />
                          Generate Work Order
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      </div>
    </Layout>
  );
}