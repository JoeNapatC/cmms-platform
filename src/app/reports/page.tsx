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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Filter,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Share,
  Mail,
  Printer,
  File,
  Settings,
  Play,
  Pause,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// Mock data for reports
const reportTemplates = [
  {
    id: '1',
    name: 'Asset Performance Report',
    description: 'Comprehensive analysis of asset performance metrics',
    category: 'Performance',
    type: 'Standard',
    lastGenerated: '2024-01-15',
    frequency: 'Monthly',
    status: 'active',
    recipients: 3,
  },
  {
    id: '2',
    name: 'Work Order Summary',
    description: 'Summary of work order completion and backlog',
    category: 'Operations',
    type: 'Standard',
    lastGenerated: '2024-01-14',
    frequency: 'Weekly',
    status: 'active',
    recipients: 5,
  },
  {
    id: '3',
    name: 'Maintenance Cost Analysis',
    description: 'Detailed breakdown of maintenance costs by category',
    category: 'Financial',
    type: 'Custom',
    lastGenerated: '2024-01-10',
    frequency: 'Quarterly',
    status: 'draft',
    recipients: 2,
  },
  {
    id: '4',
    name: 'Compliance Audit Report',
    description: 'Regulatory compliance and audit trail documentation',
    category: 'Compliance',
    type: 'Standard',
    lastGenerated: '2024-01-12',
    frequency: 'Monthly',
    status: 'active',
    recipients: 4,
  },
  {
    id: '5',
    name: 'Inventory Status Report',
    description: 'Current inventory levels and reorder recommendations',
    category: 'Inventory',
    type: 'Standard',
    lastGenerated: '2024-01-13',
    frequency: 'Weekly',
    status: 'active',
    recipients: 3,
  },
];

const recentReports = [
  {
    id: '1',
    name: 'Monthly Asset Performance - December 2023',
    type: 'PDF',
    size: '2.4 MB',
    generatedBy: 'System',
    generatedAt: '2024-01-01 09:00',
    downloadCount: 12,
  },
  {
    id: '2',
    name: 'Weekly Work Order Summary - Week 2',
    type: 'Excel',
    size: '1.8 MB',
    generatedBy: 'John Smith',
    generatedAt: '2024-01-14 15:30',
    downloadCount: 8,
  },
  {
    id: '3',
    name: 'Q4 2023 Compliance Report',
    type: 'PDF',
    size: '5.2 MB',
    generatedBy: 'System',
    generatedAt: '2024-01-05 08:00',
    downloadCount: 15,
  },
];

const reportCategories = [
  { id: 'performance', name: 'Performance', icon: TrendingUp, count: 8 },
  { id: 'operations', name: 'Operations', icon: Wrench, count: 12 },
  { id: 'financial', name: 'Financial', icon: BarChart3, count: 6 },
  { id: 'compliance', name: 'Compliance', icon: CheckCircle, count: 4 },
  { id: 'inventory', name: 'Inventory', icon: Package, count: 5 },
  { id: 'safety', name: 'Safety', icon: AlertTriangle, count: 3 },
];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-600" />;
      case 'excel':
        return <File className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Generate, schedule, and manage comprehensive maintenance reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </div>
        </div>

        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Report Library</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="builder">Report Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            {/* Filters and Search */}
            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Reports</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name or description..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Categories */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.id} className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50 cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.count} reports</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Reports */}
            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Reports
                </CardTitle>
                <CardDescription>Recently generated reports and downloads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30">
                      <div className="flex items-center gap-3">
                        {getFileIcon(report.type)}
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.size} • Generated by {report.generatedBy} • {report.generatedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{report.downloadCount} downloads</Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Templates
                </CardTitle>
                <CardDescription>Manage and customize report templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportTemplates.map((template) => (
                    <div key={template.id} className="p-4 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge variant={getStatusColor(template.status)}>
                              {template.status}
                            </Badge>
                            <Badge variant="outline">{template.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {template.frequency}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last: {template.lastGenerated}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {template.recipients} recipients
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Scheduled Reports
                </CardTitle>
                <CardDescription>Manage automated report generation and distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportTemplates.filter(t => t.status === 'active').map((template) => (
                    <div key={template.id} className="p-4 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Runs {template.frequency.toLowerCase()} • Next run: Jan 22, 2024
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>Sent to {template.recipients} recipients</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch defaultChecked />
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Report
                  </CardTitle>
                  <CardDescription>Build custom reports with drag-and-drop interface</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input id="reportName" placeholder="Enter report name..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportDescription">Description</Label>
                    <Textarea id="reportDescription" placeholder="Describe the report purpose..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportCategory">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataSource">Data Source</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assets">Assets</SelectItem>
                        <SelectItem value="workorders">Work Orders</SelectItem>
                        <SelectItem value="maintenance">Maintenance Records</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Report
                    </Button>
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Report Components
                  </CardTitle>
                  <CardDescription>Drag components to build your report</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30 cursor-pointer hover:bg-white/40 dark:hover:bg-slate-700/40">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Bar Chart</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30 cursor-pointer hover:bg-white/40 dark:hover:bg-slate-700/40">
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Pie Chart</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30 cursor-pointer hover:bg-white/40 dark:hover:bg-slate-700/40">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Line Chart</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30 cursor-pointer hover:bg-white/40 dark:hover:bg-slate-700/40">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Data Table</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/30 dark:bg-slate-700/30 border border-white/10 dark:border-slate-600/30 cursor-pointer hover:bg-white/40 dark:hover:bg-slate-700/40">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">KPI Card</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Canvas */}
            <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Canvas
                </CardTitle>
                <CardDescription>Design your report layout</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <FileText className="mx-auto h-12 w-12 mb-2" />
                    <p>Drag components here to build your report</p>
                    <p className="text-sm">Start by selecting a data source and adding components</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}