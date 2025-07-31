/**
 * Assets Page
 * Main asset management interface with search, filtering, and CRUD operations
 */

'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  MapPin, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/components/providers/TRPCProvider';

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState<string>('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('');

  // Mock data for now - will be replaced with tRPC calls
  const assets = [
    {
      id: '1',
      tag: 'PUMP-001',
      name: 'Main Water Pump',
      category: 'Pumps',
      location: 'Building A - Basement',
      status: 'operational',
      criticality: 'high',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      workOrderCount: 3,
      documentCount: 5,
    },
    {
      id: '2',
      tag: 'GEN-001',
      name: 'Emergency Generator',
      category: 'Generators',
      location: 'Building A - Roof',
      status: 'maintenance',
      criticality: 'critical',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-01-20',
      workOrderCount: 1,
      documentCount: 8,
    },
    {
      id: '3',
      tag: 'HVAC-001',
      name: 'Main HVAC Unit',
      category: 'HVAC',
      location: 'Building B - Roof',
      status: 'operational',
      criticality: 'medium',
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-03-05',
      workOrderCount: 0,
      documentCount: 3,
    },
    {
      id: '4',
      tag: 'COMP-001',
      name: 'Air Compressor #1',
      category: 'Compressors',
      location: 'Building A - Mechanical Room',
      status: 'operational',
      criticality: 'low',
      lastMaintenance: '2023-12-20',
      nextMaintenance: '2024-02-20',
      workOrderCount: 2,
      documentCount: 2,
    },
  ];

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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'offline':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !selectedLocation || asset.location.includes(selectedLocation);
    const matchesCategory = !selectedCategory || asset.category === selectedCategory;
    const matchesStatus = !selectedStatus || asset.status === selectedStatus;
    
    return matchesSearch && matchesLocation && matchesCategory && matchesStatus;
  });

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Asset Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and monitor all your assets in one place
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
            <Button variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Import Assets
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-white/20 backdrop-blur-sm focus:bg-white/80 dark:bg-slate-800/50 dark:border-slate-700/50 dark:focus:bg-slate-800/80"
                />
              </div>

              {/* Location Filter */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="bg-white/50 border-white/20 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700/50">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  <SelectItem value="Building A">Building A</SelectItem>
                  <SelectItem value="Building B">Building B</SelectItem>
                  <SelectItem value="Roof">Roof</SelectItem>
                  <SelectItem value="Basement">Basement</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white/50 border-white/20 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="Pumps">Pumps</SelectItem>
                  <SelectItem value="Generators">Generators</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="Compressors">Compressors</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-white/50 border-white/20 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700/50">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assets Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(asset.status)}
                      <CardTitle className="text-lg">{asset.name}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{asset.tag}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-xl border-white/20 dark:bg-slate-800/90 dark:border-slate-700/50">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Asset
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Maintenance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status and Criticality */}
                <div className="flex gap-2">
                  <Badge variant={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                  <Badge variant={getCriticalityColor(asset.criticality)}>
                    {asset.criticality} priority
                  </Badge>
                </div>

                {/* Location and Category */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {asset.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    {asset.category}
                  </div>
                </div>

                {/* Maintenance Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last:</span>
                    <span>{asset.lastMaintenance}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Next:</span>
                    <span>{asset.nextMaintenance}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t border-white/10 dark:border-slate-600/30">
                  <span>{asset.workOrderCount} Work Orders</span>
                  <span>{asset.documentCount} Documents</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAssets.length === 0 && (
          <Card className="bg-white/50 backdrop-blur-sm border-white/20 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assets found</h3>
              <p className="text-muted-foreground text-center mb-4">
                No assets match your current filters. Try adjusting your search criteria.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedLocation('');
                setSelectedCategory('');
                setSelectedStatus('');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}