"use client";

import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Package, AlertTriangle, TrendingDown, DollarSign, Filter } from "lucide-react";
import Link from "next/link";

// Mock data for demonstration
const mockSpareParts = [
  {
    id: "1",
    partNumber: "BRG-001",
    name: "Ball Bearing 6205",
    description: "Deep groove ball bearing for motor applications",
    unitCost: 25.50,
    supplierId: "SUP-001",
    inventory: [
      {
        id: "inv-1",
        locationId: "loc-1",
        location: { name: "Main Warehouse" },
        quantityOnHand: 15,
        reorderPoint: 10,
        safetyStock: 5,
      },
      {
        id: "inv-2",
        locationId: "loc-2",
        location: { name: "Building A Storage" },
        quantityOnHand: 3,
        reorderPoint: 5,
        safetyStock: 2,
      },
    ],
    usage: [
      { id: "usage-1", quantity: 2, workOrder: { title: "Motor Maintenance" } },
    ],
  },
  {
    id: "2",
    partNumber: "FLT-002",
    name: "Oil Filter OF-150",
    description: "High-efficiency oil filter for hydraulic systems",
    unitCost: 45.00,
    supplierId: "SUP-002",
    inventory: [
      {
        id: "inv-3",
        locationId: "loc-1",
        location: { name: "Main Warehouse" },
        quantityOnHand: 8,
        reorderPoint: 12,
        safetyStock: 6,
      },
    ],
    usage: [
      { id: "usage-2", quantity: 1, workOrder: { title: "Hydraulic Service" } },
    ],
  },
  {
    id: "3",
    partNumber: "BLT-003",
    name: "V-Belt A-Section",
    description: "Industrial V-belt for power transmission",
    unitCost: 18.75,
    supplierId: "SUP-001",
    inventory: [
      {
        id: "inv-4",
        locationId: "loc-1",
        location: { name: "Main Warehouse" },
        quantityOnHand: 25,
        reorderPoint: 15,
        safetyStock: 8,
      },
    ],
    usage: [],
  },
];

const mockLowStockItems = [
  {
    id: "inv-2",
    part: { name: "Ball Bearing 6205", partNumber: "BRG-001" },
    location: { name: "Building A Storage" },
    quantityOnHand: 3,
    reorderPoint: 5,
    safetyStock: 2,
  },
  {
    id: "inv-3",
    part: { name: "Oil Filter OF-150", partNumber: "FLT-002" },
    location: { name: "Main Warehouse" },
    quantityOnHand: 8,
    reorderPoint: 12,
    safetyStock: 6,
  },
];

const mockStats = {
  totalParts: 156,
  totalLocations: 8,
  lowStockCount: 12,
  totalValue: 45750.25,
};

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("parts");

  const filteredParts = mockSpareParts.filter((part) => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === "all" || 
                           part.inventory.some(inv => inv.location.name === selectedLocation);
    const matchesSupplier = selectedSupplier === "all" || part.supplierId === selectedSupplier;
    
    return matchesSearch && matchesLocation && matchesSupplier;
  });

  const getStockStatus = (inventory: any[]) => {
    const totalStock = inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0);
    const minReorderPoint = Math.min(...inventory.map(inv => inv.reorderPoint));
    
    if (totalStock === 0) return { status: "out-of-stock", label: "Out of Stock", color: "destructive" };
    if (totalStock <= minReorderPoint) return { status: "low-stock", label: "Low Stock", color: "destructive" };
    if (totalStock <= minReorderPoint * 1.5) return { status: "reorder-soon", label: "Reorder Soon", color: "secondary" };
    return { status: "in-stock", label: "In Stock", color: "default" };
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage spare parts, stock levels, and inventory locations
          </p>
        </div>
        <Button asChild>
          <Link href="/inventory/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Spare Part
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalParts}</div>
            <p className="text-xs text-muted-foreground">
              Across {mockStats.totalLocations} locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{mockStats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4x</div>
            <p className="text-xs text-muted-foreground">
              Annual inventory turnover
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="parts">Spare Parts</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock Alerts</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="parts" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search parts by name or part number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                    <SelectItem value="Building A Storage">Building A Storage</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    <SelectItem value="SUP-001">Supplier 001</SelectItem>
                    <SelectItem value="SUP-002">Supplier 002</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Parts List */}
          <div className="grid gap-4">
            {filteredParts.map((part) => {
              const stockStatus = getStockStatus(part.inventory);
              const totalStock = part.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0);
              const totalValue = totalStock * part.unitCost;

              return (
                <Card key={part.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          <Link 
                            href={`/inventory/${part.id}`}
                            className="hover:underline"
                          >
                            {part.name}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          Part #: {part.partNumber} | Unit Cost: ${part.unitCost.toFixed(2)}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground">{part.description}</p>
                      </div>
                      <Badge variant={stockStatus.color as any}>
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Stock Levels</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total on Hand:</span>
                            <span className="font-medium">{totalStock}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Value:</span>
                            <span className="font-medium">${totalValue.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Locations</h4>
                        <div className="space-y-1 text-sm">
                          {part.inventory.map((inv) => (
                            <div key={inv.id} className="flex justify-between">
                              <span>{inv.location.name}:</span>
                              <span className={inv.quantityOnHand <= inv.reorderPoint ? "text-destructive font-medium" : ""}>
                                {inv.quantityOnHand}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Recent Usage</h4>
                        <div className="space-y-1 text-sm">
                          {part.usage.length > 0 ? (
                            part.usage.slice(0, 2).map((usage) => (
                              <div key={usage.id} className="flex justify-between">
                                <span className="truncate">{usage.workOrder.title}:</span>
                                <span>{usage.quantity}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground">No recent usage</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>
                Items that have reached or fallen below their reorder point
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{item.part.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.part.partNumber} • {item.location.name}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm">
                        <span className="text-destructive font-medium">{item.quantityOnHand}</span>
                        <span className="text-muted-foreground"> / {item.reorderPoint} reorder point</span>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {item.reorderPoint - item.quantityOnHand > 0 
                          ? `${item.reorderPoint - item.quantityOnHand} below reorder`
                          : "At reorder point"
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Locations</CardTitle>
              <CardDescription>
                Overview of inventory distribution across locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Main Warehouse</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Parts:</span>
                          <span className="font-medium">89</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low Stock Items:</span>
                          <span className="font-medium text-destructive">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Value:</span>
                          <span className="font-medium">$28,450</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Building A Storage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Parts:</span>
                          <span className="font-medium">34</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low Stock Items:</span>
                          <span className="font-medium text-destructive">5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Value:</span>
                          <span className="font-medium">$12,300</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Building B Storage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Parts:</span>
                          <span className="font-medium">33</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low Stock Items:</span>
                          <span className="font-medium text-destructive">4</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Value:</span>
                          <span className="font-medium">$5,000</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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