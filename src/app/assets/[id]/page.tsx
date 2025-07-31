/**
 * Asset Detail Page
 * Detailed view of a single asset with all related information
 */

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Edit,
  Settings,
  FileText,
  Calendar,
  MapPin,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  History,
  Upload,
  Download,
  Plus,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.id as string;

  // Mock data - will be replaced with tRPC call
  const asset = {
    id: assetId,
    tag: 'PUMP-001',
    name: 'Main Water Pump',
    description: 'Primary water circulation pump for Building A cooling system',
    category: 'Pumps',
    subcategory: 'Centrifugal Pumps',
    location: 'Building A - Basement',
    status: 'operational',
    criticality: 'high',
    manufacturer: 'Grundfos',
    model: 'CR 32-4',
    serialNumber: 'GF2024001',
    installationDate: '2023-06-15',
    warrantyExpiry: '2025-06-15',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-04-15',
    maintenanceInterval: 90, // days
    specifications: {
      power: '15 kW',
      flow: '120 m³/h',
      head: '45 m',
      efficiency: '85%',
      weight: '125 kg',
    },
    workOrders: [
      {
        id: '1',
        title: 'Quarterly Maintenance',
        status: 'completed',
        priority: 'medium',
        assignee: 'John Smith',
        createdAt: '2024-01-10',
        completedAt: '2024-01-15',
      },
      {
        id: '2',
        title: 'Bearing Replacement',
        status: 'completed',
        priority: 'high',
        assignee: 'Mike Johnson',
        createdAt: '2023-12-05',
        completedAt: '2023-12-08',
      },
      {
        id: '3',
        title: 'Vibration Check',
        status: 'scheduled',
        priority: 'low',
        assignee: 'Sarah Wilson',
        createdAt: '2024-01-20',
        scheduledDate: '2024-02-01',
      },
    ],
    documents: [
      {
        id: '1',
        name: 'Installation Manual',
        type: 'PDF',
        size: '2.4 MB',
        uploadedAt: '2023-06-15',
        uploadedBy: 'Admin',
      },
      {
        id: '2',
        name: 'Maintenance Log',
        type: 'Excel',
        size: '156 KB',
        uploadedAt: '2024-01-15',
        uploadedBy: 'John Smith',
      },
      {
        id: '3',
        name: 'Warranty Certificate',
        type: 'PDF',
        size: '890 KB',
        uploadedAt: '2023-06-15',
        uploadedBy: 'Admin',
      },
    ],
    maintenanceHistory: [
      {
        id: '1',
        date: '2024-01-15',
        type: 'Preventive',
        description: 'Quarterly maintenance - oil change, filter replacement',
        technician: 'John Smith',
        duration: '2 hours',
        cost: '$150',
        status: 'completed',
      },
      {
        id: '2',
        date: '2023-12-08',
        type: 'Corrective',
        description: 'Bearing replacement due to excessive vibration',
        technician: 'Mike Johnson',
        duration: '4 hours',
        cost: '$320',
        status: 'completed',
      },
      {
        id: '3',
        date: '2023-10-15',
        type: 'Preventive',
        description: 'Quarterly maintenance - inspection and lubrication',
        technician: 'John Smith',
        duration: '1.5 hours',
        cost: '$100',
        status: 'completed',
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'default';
      case 'maintenance':
        return 'destructive';
      case 'offline':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'offline':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getWorkOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      case 'overdue':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/assets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assets
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {getStatusIcon(asset.status)}
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {asset.name}
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-mono">
              {asset.tag}
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              {asset.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Asset
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Maintenance
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(asset.status)}>
                  {asset.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Current Status</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant={getCriticalityColor(asset.criticality)}>
                  {asset.criticality} priority
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Criticality</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{asset.nextMaintenance}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Next Maintenance</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{asset.workOrders.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Work Orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic Information */}
              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{asset.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subcategory</p>
                      <p className="font-medium">{asset.subcategory}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Manufacturer</p>
                      <p className="font-medium">{asset.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="font-medium">{asset.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serial Number</p>
                      <p className="font-medium font-mono">{asset.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {asset.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates & Warranty */}
              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle>Dates & Warranty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Installation Date</p>
                    <p className="font-medium">{asset.installationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Warranty Expiry</p>
                    <p className="font-medium">{asset.warrantyExpiry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Maintenance</p>
                    <p className="font-medium">{asset.lastMaintenance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance Interval</p>
                    <p className="font-medium">{asset.maintenanceInterval} days</p>
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50 md:col-span-2">
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(asset.specifications).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="work-orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Work Orders</h3>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Work Order
              </Button>
            </div>
            <div className="space-y-3">
              {asset.workOrders.map((workOrder) => (
                <Card key={workOrder.id} className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{workOrder.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Assigned to: {workOrder.assignee}</span>
                          <span>Created: {workOrder.createdAt}</span>
                          {workOrder.completedAt && (
                            <span>Completed: {workOrder.completedAt}</span>
                          )}
                          {workOrder.scheduledDate && (
                            <span>Scheduled: {workOrder.scheduledDate}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getWorkOrderStatusColor(workOrder.status)}>
                          {workOrder.status}
                        </Badge>
                        <Badge variant="outline">
                          {workOrder.priority}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Maintenance History</h3>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export History
              </Button>
            </div>
            <div className="space-y-3">
              {asset.maintenanceHistory.map((maintenance) => (
                <Card key={maintenance.id} className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{maintenance.type}</Badge>
                          <span className="text-sm text-muted-foreground">{maintenance.date}</span>
                        </div>
                        <h4 className="font-medium">{maintenance.description}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Technician: {maintenance.technician}</span>
                          <span>Duration: {maintenance.duration}</span>
                          <span>Cost: {maintenance.cost}</span>
                        </div>
                      </div>
                      <Badge variant={getWorkOrderStatusColor(maintenance.status)}>
                        {maintenance.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Documents</h3>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {asset.documents.map((document) => (
                <Card key={document.id} className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium text-sm">{document.name}</h4>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{document.type} • {document.size}</p>
                          <p>Uploaded by {document.uploadedBy}</p>
                          <p>{document.uploadedAt}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}