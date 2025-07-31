'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  Settings, 
  Edit,
  Play,
  Pause,
  Plus,
  Gauge,
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Wrench,
  History,
  BarChart3,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for maintenance plan detail
const mockMaintenancePlan = {
  id: '1',
  name: 'Monthly HVAC Filter Replacement',
  description: 'Regular replacement of HVAC filters to maintain air quality and system efficiency',
  type: 'TIME_BASED',
  frequency: 30,
  meterThreshold: null,
  isActive: true,
  nextDueDate: '2024-02-15',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-30',
  lastCompleted: '2024-01-15',
  asset: {
    id: 'asset-1',
    tag: 'HVAC-001',
    model: 'Carrier 50TCQ',
    manufacturer: 'Carrier',
    location: { name: 'Building A - Floor 1' },
    status: 'OPERATIONAL'
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Remove old filter',
      description: 'Carefully remove the old HVAC filter',
      estimatedDuration: 15,
      order: 1
    },
    {
      id: 'task-2',
      title: 'Inspect filter housing',
      description: 'Check for any damage or debris in the filter housing',
      estimatedDuration: 10,
      order: 2
    },
    {
      id: 'task-3',
      title: 'Install new filter',
      description: 'Install the new filter ensuring proper fit and orientation',
      estimatedDuration: 15,
      order: 3
    },
    {
      id: 'task-4',
      title: 'Test system operation',
      description: 'Run the HVAC system to ensure proper operation',
      estimatedDuration: 20,
      order: 4
    }
  ],
  parts: [
    {
      id: 'part-1',
      name: 'HVAC Filter 20x25x1',
      partNumber: 'FLT-20251',
      quantity: 1,
      unitCost: 25.99
    },
    {
      id: 'part-2',
      name: 'Filter Gasket',
      partNumber: 'GSK-001',
      quantity: 1,
      unitCost: 5.50
    }
  ],
  workOrders: [
    {
      id: 'wo-1',
      title: 'HVAC Filter Replacement - January',
      status: 'COMPLETED',
      completedAt: '2024-01-15',
      assignedTo: 'John Smith',
      duration: 45
    },
    {
      id: 'wo-2',
      title: 'HVAC Filter Replacement - December',
      status: 'COMPLETED',
      completedAt: '2023-12-15',
      assignedTo: 'Mike Johnson',
      duration: 50
    },
    {
      id: 'wo-3',
      title: 'HVAC Filter Replacement - November',
      status: 'COMPLETED',
      completedAt: '2023-11-15',
      assignedTo: 'John Smith',
      duration: 40
    }
  ]
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'SCHEDULED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

export default function MaintenancePlanDetailPage() {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(mockMaintenancePlan);

  const plan = mockMaintenancePlan;
  const dueDate = new Date(plan.nextDueDate);
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const getDueDateStatus = () => {
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

  const dueDateStatus = getDueDateStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/maintenance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Maintenance Plans
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {plan.name}
            </h1>
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
                  <XCircle className="mr-1 h-3 w-3" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {plan.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
            <span>Asset: {plan.asset.tag}</span>
            <span>•</span>
            <span>{plan.asset.model}</span>
            <span>•</span>
            <span>{plan.asset.location.name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Generate Work Order
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button variant="outline">
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
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Due</CardTitle>
            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueDate.toLocaleDateString()}</div>
            <p className={`text-xs ${dueDateStatus.color}`}>
              {dueDateStatus.text}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule</CardTitle>
            {getMaintenanceTypeIcon(plan.type)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plan.type === 'TIME_BASED' && plan.frequency && `${plan.frequency} days`}
              {plan.type === 'METER_BASED' && plan.meterThreshold && `${plan.meterThreshold} hrs`}
              {plan.type === 'PREDICTIVE' && 'AI-driven'}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Maintenance interval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Last 12 months
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">45 min</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Per work order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Plan Details */}
            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Plan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Plan Name</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editData.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Maintenance Type</Label>
                      <Select value={editData.type} onValueChange={(value) => setEditData({...editData, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TIME_BASED">Time-Based</SelectItem>
                          <SelectItem value="METER_BASED">Meter-Based</SelectItem>
                          <SelectItem value="PREDICTIVE">Predictive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editData.type === 'TIME_BASED' && (
                      <div>
                        <Label htmlFor="frequency">Frequency (days)</Label>
                        <Input
                          id="frequency"
                          type="number"
                          value={editData.frequency || ''}
                          onChange={(e) => setEditData({...editData, frequency: parseInt(e.target.value)})}
                        />
                      </div>
                    )}
                    {editData.type === 'METER_BASED' && (
                      <div>
                        <Label htmlFor="threshold">Meter Threshold (hours)</Label>
                        <Input
                          id="threshold"
                          type="number"
                          value={editData.meterThreshold || ''}
                          onChange={(e) => setEditData({...editData, meterThreshold: parseInt(e.target.value)})}
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Type:</span>
                      <div className="font-medium">{plan.type.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Schedule:</span>
                      <div className="font-medium">
                        {plan.type === 'TIME_BASED' && plan.frequency && `Every ${plan.frequency} days`}
                        {plan.type === 'METER_BASED' && plan.meterThreshold && `Every ${plan.meterThreshold} hours`}
                        {plan.type === 'PREDICTIVE' && 'AI-driven schedule'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
                      <div className="font-medium">{plan.isActive ? 'Active' : 'Inactive'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Created:</span>
                      <div className="font-medium">{new Date(plan.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Last Updated:</span>
                      <div className="font-medium">{new Date(plan.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Asset Information */}
            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Asset Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Asset Tag:</span>
                  <div className="font-medium">
                    <Link 
                      href={`/assets/${plan.asset.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {plan.asset.tag}
                    </Link>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Model:</span>
                  <div className="font-medium">{plan.asset.model}</div>
                </div>
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Manufacturer:</span>
                  <div className="font-medium">{plan.asset.manufacturer}</div>
                </div>
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Location:</span>
                  <div className="font-medium">{plan.asset.location.name}</div>
                </div>
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
                  <div className="font-medium">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      {plan.asset.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Maintenance Tasks
                </CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.tasks.map((task, index) => (
                  <div key={task.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                      {task.order}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white">{task.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Estimated: {task.estimatedDuration} min</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts" className="space-y-4">
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Required Parts
                </CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Part
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{part.name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Part #: {part.partNumber}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Qty: {part.quantity}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">${part.unitCost}</div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total Cost per Maintenance:</span>
                    <span>${plan.parts.reduce((sum, part) => sum + (part.quantity * part.unitCost), 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Work Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.workOrders.map((workOrder) => (
                  <div key={workOrder.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        <Link 
                          href={`/work-orders/${workOrder.id}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {workOrder.title}
                        </Link>
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
                        <span>Completed: {new Date(workOrder.completedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Assigned to: {workOrder.assignedTo}</span>
                        <span>•</span>
                        <span>Duration: {workOrder.duration} min</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(workOrder.status)}>
                      {workOrder.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Completion Rate:</span>
                    <span className="font-medium text-green-600">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Average Duration:</span>
                    <span className="font-medium">45 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Cost per Maintenance:</span>
                    <span className="font-medium">${plan.parts.reduce((sum, part) => sum + (part.quantity * part.unitCost), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Work Orders:</span>
                    <span className="font-medium">{plan.workOrders.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-900/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Efficiency Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <BarChart3 className="mx-auto h-12 w-12 mb-2" />
                    <p>Analytics charts would be displayed here</p>
                    <p className="text-xs">Duration trends, cost analysis, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}