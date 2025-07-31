"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, Clock, User, Wrench, FileText, Package, AlertTriangle, CheckCircle, Circle, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Link from "next/link";

// Mock data for work order detail
const mockWorkOrder = {
  id: "wo-001",
  workOrderNumber: "WO-2024-001",
  title: "Pump A-101 Maintenance",
  description: "Routine maintenance for centrifugal pump A-101 including seal replacement, alignment check, and performance testing.",
  status: "IN_PROGRESS",
  priority: "HIGH",
  type: "PREVENTIVE",
  asset: {
    id: "asset-1",
    tag: "PUMP-A-101",
    name: "Centrifugal Pump A-101",
    location: { name: "Building A - Floor 1" },
    manufacturer: "Grundfos",
    model: "CR 32-4"
  },
  assignee: {
    id: "user-1",
    name: "John Smith",
    email: "john.smith@company.com",
    avatar: "/avatars/john-smith.jpg"
  },
  requestor: {
    id: "user-2",
    name: "Jane Doe",
    email: "jane.doe@company.com"
  },
  createdAt: new Date("2024-01-15T08:00:00Z"),
  scheduledStart: new Date("2024-01-16T09:00:00Z"),
  scheduledEnd: new Date("2024-01-16T17:00:00Z"),
  actualStart: new Date("2024-01-16T09:15:00Z"),
  actualEnd: null,
  dueDate: new Date("2024-01-16T17:00:00Z"),
  estimatedHours: 8,
  actualHours: 6.5,
  tasks: [
    {
      id: "task-1",
      title: "Inspect pump housing for cracks or damage",
      description: "Visual inspection of pump housing and impeller",
      completed: true,
      completedAt: new Date("2024-01-16T10:30:00Z"),
      completedBy: { name: "John Smith" },
      estimatedHours: 1,
      actualHours: 0.5,
      order: 1
    },
    {
      id: "task-2",
      title: "Replace mechanical seals",
      description: "Remove old seals and install new mechanical seals",
      completed: true,
      completedAt: new Date("2024-01-16T14:00:00Z"),
      completedBy: { name: "John Smith" },
      estimatedHours: 4,
      actualHours: 3.5,
      order: 2
    },
    {
      id: "task-3",
      title: "Check pump alignment",
      description: "Verify shaft alignment using laser alignment tool",
      completed: false,
      completedAt: null,
      completedBy: null,
      estimatedHours: 2,
      actualHours: null,
      order: 3
    },
    {
      id: "task-4",
      title: "Performance test and documentation",
      description: "Run pump at various speeds and document performance",
      completed: false,
      completedAt: null,
      completedBy: null,
      estimatedHours: 1,
      actualHours: null,
      order: 4
    }
  ],
  parts: [
    {
      id: "part-1",
      partNumber: "SEAL-001",
      name: "Mechanical Seal Kit",
      quantity: 2,
      unitCost: 125.50,
      totalCost: 251.00
    },
    {
      id: "part-2",
      partNumber: "GASKET-002",
      name: "Housing Gasket",
      quantity: 1,
      unitCost: 15.75,
      totalCost: 15.75
    }
  ],
  documents: [
    {
      id: "doc-1",
      name: "Pump Manual.pdf",
      type: "manual",
      size: "2.4 MB",
      uploadedAt: new Date("2024-01-10T10:00:00Z")
    },
    {
      id: "doc-2",
      name: "Maintenance Checklist.pdf",
      type: "checklist",
      size: "156 KB",
      uploadedAt: new Date("2024-01-15T08:30:00Z")
    },
    {
      id: "doc-3",
      name: "Before Photos.zip",
      type: "photos",
      size: "5.2 MB",
      uploadedAt: new Date("2024-01-16T09:20:00Z")
    }
  ],
  notes: [
    {
      id: "note-1",
      content: "Found minor wear on impeller blades. Recommend monitoring for next maintenance cycle.",
      createdAt: new Date("2024-01-16T10:45:00Z"),
      createdBy: { name: "John Smith" }
    },
    {
      id: "note-2",
      content: "Seals were more worn than expected. Increased frequency of inspections recommended.",
      createdAt: new Date("2024-01-16T14:15:00Z"),
      createdBy: { name: "John Smith" }
    }
  ]
};

const statusColors = {
  SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ON_HOLD: "bg-orange-100 text-orange-800 border-orange-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800 border-gray-200",
  MEDIUM: "bg-blue-100 text-blue-800 border-blue-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
};

const typeColors = {
  CORRECTIVE: "bg-red-100 text-red-800 border-red-200",
  PREVENTIVE: "bg-green-100 text-green-800 border-green-200",
  PREDICTIVE: "bg-purple-100 text-purple-800 border-purple-200",
  EMERGENCY: "bg-red-100 text-red-800 border-red-200",
};

export default function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorkOrder, setEditedWorkOrder] = useState(mockWorkOrder);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getTaskProgress = () => {
    const completed = mockWorkOrder.tasks.filter(task => task.completed).length;
    const total = mockWorkOrder.tasks.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const getTotalCost = () => {
    return mockWorkOrder.parts.reduce((sum, part) => sum + part.totalCost, 0);
  };

  const toggleTaskCompletion = (taskId: string) => {
    // In a real app, this would call the tRPC mutation
    console.log(`Toggle task ${taskId}`);
  };

  const handleSave = () => {
    // In a real app, this would call the tRPC mutation
    setIsEditing(false);
    console.log("Saving work order:", editedWorkOrder);
  };

  const handleCancel = () => {
    setEditedWorkOrder(mockWorkOrder);
    setIsEditing(false);
  };

  const progress = getTaskProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/work-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Work Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{mockWorkOrder.title}</h1>
            <p className="text-muted-foreground font-mono">{mockWorkOrder.workOrderNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/50 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={statusColors[mockWorkOrder.status as keyof typeof statusColors]}>
                  {mockWorkOrder.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                <Badge className={priorityColors[mockWorkOrder.priority as keyof typeof priorityColors]}>
                  {mockWorkOrder.priority}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{progress.percentage}%</p>
                <p className="text-xs text-muted-foreground">{progress.completed}/{progress.total} tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">{formatDuration(mockWorkOrder.actualHours)}</p>
                <p className="text-xs text-muted-foreground">of {formatDuration(mockWorkOrder.estimatedHours)} estimated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/50 backdrop-blur-sm border-white/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="parts">Parts & Materials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes & History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card className="bg-white/50 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Work Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    {isEditing ? (
                      <Input
                        value={editedWorkOrder.description}
                        onChange={(e) => setEditedWorkOrder({...editedWorkOrder, description: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1">{mockWorkOrder.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Type</label>
                      <div className="mt-1">
                        <Badge className={typeColors[mockWorkOrder.type as keyof typeof typeColors]}>
                          {mockWorkOrder.type}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="mt-1 text-sm">{formatDate(mockWorkOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Information */}
            <Card className="bg-white/50 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{mockWorkOrder.asset.name}</p>
                    <p className="text-sm text-muted-foreground">{mockWorkOrder.asset.tag}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Location</label>
                    <p>{mockWorkOrder.asset.location.name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Manufacturer</label>
                    <p>{mockWorkOrder.asset.manufacturer}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Model</label>
                    <p>{mockWorkOrder.asset.model}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment & Schedule */}
            <Card className="bg-white/50 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Assignment & Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{mockWorkOrder.assignee.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{mockWorkOrder.requestor.name}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Scheduled Start</label>
                      <p className="mt-1 text-sm">{formatDate(mockWorkOrder.scheduledStart)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                      <p className="mt-1 text-sm">{formatDate(mockWorkOrder.dueDate)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Tracking */}
            <Card className="bg-white/50 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Time Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estimated Hours</label>
                    <p className="mt-1 text-2xl font-bold">{formatDuration(mockWorkOrder.estimatedHours)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Actual Hours</label>
                    <p className="mt-1 text-2xl font-bold">{formatDuration(mockWorkOrder.actualHours)}</p>
                  </div>
                </div>
                
                {mockWorkOrder.actualStart && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-muted-foreground">Started</label>
                      <p>{formatDate(mockWorkOrder.actualStart)}</p>
                    </div>
                    {mockWorkOrder.actualEnd && (
                      <div>
                        <label className="font-medium text-muted-foreground">Completed</label>
                        <p>{formatDate(mockWorkOrder.actualEnd)}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card className="bg-white/50 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Task Checklist</CardTitle>
              <CardDescription>
                Complete tasks in order to finish the work order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkOrder.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border ${
                      task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="mt-1"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {task.actualHours ? formatDuration(task.actualHours) : formatDuration(task.estimatedHours)}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {task.description}
                      </p>
                      
                      {task.completed && task.completedAt && (
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Completed by {task.completedBy?.name}</span>
                          <span>•</span>
                          <span>{formatDate(task.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts" className="space-y-6">
          <Card className="bg-white/50 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Parts & Materials</CardTitle>
              <CardDescription>
                Parts and materials used for this work order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkOrder.parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{part.name}</h4>
                        <p className="text-sm text-muted-foreground">Part #: {part.partNumber}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">${part.totalCost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {part.quantity} × ${part.unitCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium">Total Parts Cost:</span>
                  <span className="text-lg font-bold">${getTotalCost().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="bg-white/50 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Documents & Attachments</CardTitle>
              <CardDescription>
                Files and documents related to this work order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkOrder.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {doc.size} • {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card className="bg-white/50 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Notes & History</CardTitle>
              <CardDescription>
                Work notes and activity history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkOrder.notes.map((note) => (
                  <div key={note.id} className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{note.createdBy.name}</span>
                      <span className="text-sm text-muted-foreground">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}