"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Edit, 
  Save, 
  X,
  Plus,
  Minus,
  History,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock data for demonstration
const mockSparePart = {
  id: "1",
  partNumber: "BRG-001",
  name: "Ball Bearing 6205",
  description: "Deep groove ball bearing for motor applications. Suitable for high-speed operations with excellent load capacity.",
  unitCost: 25.50,
  supplierId: "SUP-001",
  supplierName: "Industrial Bearings Co.",
  createdAt: "2024-01-15",
  updatedAt: "2024-01-20",
  inventory: [
    {
      id: "inv-1",
      locationId: "loc-1",
      location: { 
        name: "Main Warehouse",
        type: "WAREHOUSE",
        address: "Building A, Floor 1"
      },
      quantityOnHand: 15,
      reorderPoint: 10,
      safetyStock: 5,
      lastUpdated: "2024-01-20",
    },
    {
      id: "inv-2",
      locationId: "loc-2",
      location: { 
        name: "Building A Storage",
        type: "STORAGE",
        address: "Building A, Floor 2"
      },
      quantityOnHand: 3,
      reorderPoint: 5,
      safetyStock: 2,
      lastUpdated: "2024-01-18",
    },
  ],
  usage: [
    {
      id: "usage-1",
      quantity: 2,
      createdAt: "2024-01-19",
      workOrder: {
        id: "wo-1",
        title: "Motor Maintenance - Pump #3",
        status: "COMPLETED",
        asset: {
          name: "Centrifugal Pump #3",
          location: { name: "Production Floor A" }
        }
      }
    },
    {
      id: "usage-2",
      quantity: 1,
      createdAt: "2024-01-15",
      workOrder: {
        id: "wo-2",
        title: "Bearing Replacement - Conveyor Belt",
        status: "COMPLETED",
        asset: {
          name: "Conveyor Belt System",
          location: { name: "Packaging Area" }
        }
      }
    },
    {
      id: "usage-3",
      quantity: 3,
      createdAt: "2024-01-10",
      workOrder: {
        id: "wo-3",
        title: "Preventive Maintenance - Motor Bank",
        status: "COMPLETED",
        asset: {
          name: "Motor Bank Unit 2",
          location: { name: "Production Floor B" }
        }
      }
    },
  ]
};

const mockUsageStats = {
  totalUsed: 24,
  averageMonthlyUsage: 8,
  lastUsageDate: "2024-01-19",
  topAssets: [
    { name: "Centrifugal Pump #3", usage: 6 },
    { name: "Motor Bank Unit 2", usage: 4 },
    { name: "Conveyor Belt System", usage: 3 },
  ]
};

export default function InventoryDetailPage() {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPart, setEditedPart] = useState(mockSparePart);
  const [stockAdjustments, setStockAdjustments] = useState<{[key: string]: number}>({});

  const totalStock = mockSparePart.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0);
  const totalValue = totalStock * mockSparePart.unitCost;
  const minReorderPoint = Math.min(...mockSparePart.inventory.map(inv => inv.reorderPoint));
  const isLowStock = totalStock <= minReorderPoint;

  const handleSave = () => {
    // Here you would typically call the API to update the spare part
    console.log("Saving changes:", editedPart);
    setIsEditing(false);
  };

  const handleStockAdjustment = (inventoryId: string, adjustment: number) => {
    setStockAdjustments(prev => ({
      ...prev,
      [inventoryId]: (prev[inventoryId] || 0) + adjustment
    }));
  };

  const applyStockAdjustments = () => {
    // Here you would typically call the API to update stock levels
    console.log("Applying stock adjustments:", stockAdjustments);
    setStockAdjustments({});
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/inventory" className="text-muted-foreground hover:text-foreground">
              Inventory
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{mockSparePart.name}</span>
          </div>
          <h1 className="text-3xl font-bold">{mockSparePart.name}</h1>
          <p className="text-muted-foreground">
            Part Number: {mockSparePart.partNumber} | Supplier: {mockSparePart.supplierName}
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Part
            </Button>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {isLowStock && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Low Stock Alert</span>
              <Badge variant="destructive">Action Required</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current stock ({totalStock}) is at or below the minimum reorder point ({minReorderPoint}).
            </p>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">
              Across {mockSparePart.inventory.length} locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              @ ${mockSparePart.unitCost.toFixed(2)} per unit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsageStats.averageMonthlyUsage}</div>
            <p className="text-xs text-muted-foreground">
              Average per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Point</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{minReorderPoint}</div>
            <p className="text-xs text-muted-foreground">
              Minimum stock level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="usage">Usage History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Part Information</CardTitle>
              <CardDescription>
                Basic information and specifications for this spare part
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Part Name</Label>
                    <Input
                      id="name"
                      value={editedPart.name}
                      onChange={(e) => setEditedPart({...editedPart, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partNumber">Part Number</Label>
                    <Input
                      id="partNumber"
                      value={editedPart.partNumber}
                      onChange={(e) => setEditedPart({...editedPart, partNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitCost">Unit Cost ($)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      value={editedPart.unitCost}
                      onChange={(e) => setEditedPart({...editedPart, unitCost: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select value={editedPart.supplierId} onValueChange={(value) => setEditedPart({...editedPart, supplierId: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUP-001">Industrial Bearings Co.</SelectItem>
                        <SelectItem value="SUP-002">MechParts Supply</SelectItem>
                        <SelectItem value="SUP-003">Global Components Ltd.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editedPart.description}
                      onChange={(e) => setEditedPart({...editedPart, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Part Number</Label>
                      <p className="text-lg font-mono">{mockSparePart.partNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Unit Cost</Label>
                      <p className="text-lg">${mockSparePart.unitCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Supplier</Label>
                      <p className="text-lg">{mockSparePart.supplierName}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="text-lg">{new Date(mockSparePart.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                      <p className="text-lg">{new Date(mockSparePart.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-base mt-1">{mockSparePart.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock by Location</CardTitle>
              <CardDescription>
                Current inventory levels across all storage locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSparePart.inventory.map((inv) => {
                  const adjustment = stockAdjustments[inv.id] || 0;
                  const newQuantity = inv.quantityOnHand + adjustment;
                  const isLowStockLocation = newQuantity <= inv.reorderPoint;

                  return (
                    <div key={inv.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {inv.location.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{inv.location.address}</p>
                        </div>
                        {isLowStockLocation && (
                          <Badge variant="destructive">Low Stock</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">On Hand</Label>
                          <p className="text-lg font-bold">{newQuantity}</p>
                          {adjustment !== 0 && (
                            <p className="text-xs text-muted-foreground">
                              ({inv.quantityOnHand} {adjustment > 0 ? '+' : ''}{adjustment})
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Reorder Point</Label>
                          <p className="text-lg">{inv.reorderPoint}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Safety Stock</Label>
                          <p className="text-lg">{inv.safetyStock}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Value</Label>
                          <p className="text-lg">${(newQuantity * mockSparePart.unitCost).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Stock Adjustment:</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStockAdjustment(inv.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center text-sm font-mono">
                          {adjustment > 0 ? '+' : ''}{adjustment}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStockAdjustment(inv.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {Object.keys(stockAdjustments).length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <Button onClick={applyStockAdjustments} className="w-full">
                    Apply Stock Adjustments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Usage History
              </CardTitle>
              <CardDescription>
                Recent work orders that used this spare part
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSparePart.usage.map((usage) => (
                  <div key={usage.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">
                          <Link 
                            href={`/work-orders/${usage.workOrder.id}`}
                            className="hover:underline"
                          >
                            {usage.workOrder.title}
                          </Link>
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {usage.workOrder.asset.name} • {usage.workOrder.asset.location.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{usage.workOrder.status}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(usage.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Quantity Used:</span>
                      <span className="font-medium">{usage.quantity} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Used (All Time):</span>
                    <span className="font-medium">{mockUsageStats.totalUsed} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Monthly Usage:</span>
                    <span className="font-medium">{mockUsageStats.averageMonthlyUsage} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Usage:</span>
                    <span className="font-medium">{new Date(mockUsageStats.lastUsageDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Months Remaining:</span>
                    <span className="font-medium">
                      {Math.floor(totalStock / mockUsageStats.averageMonthlyUsage)} months
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Consuming Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockUsageStats.topAssets.map((asset, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{asset.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(asset.usage / mockUsageStats.totalUsed) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{asset.usage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}