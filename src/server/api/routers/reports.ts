/**
 * Reports Router
 * tRPC router for generating various CMMS reports and analytics
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  managerProcedure,
} from '@/server/api/trpc';

// Input validation schemas
const reportFilterSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  locationId: z.string().cuid().optional(),
  assetId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
});

const assetReportSchema = reportFilterSchema.extend({
  includeInactive: z.boolean().default(false),
  groupBy: z.enum(['location', 'category', 'status']).default('location'),
});

const workOrderReportSchema = reportFilterSchema.extend({
  status: z.enum(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'EMERGENCY']).optional(),
  groupBy: z.enum(['status', 'priority', 'type', 'assignee', 'asset']).default('status'),
});

const maintenanceReportSchema = reportFilterSchema.extend({
  planType: z.enum(['TIME_BASED', 'USAGE_BASED', 'CONDITION_BASED']).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  includeCompleted: z.boolean().default(true),
});

const costReportSchema = reportFilterSchema.extend({
  costType: z.enum(['LABOR', 'PARTS', 'EXTERNAL', 'TOTAL']).optional(),
  groupBy: z.enum(['asset', 'location', 'category', 'month']).default('month'),
});

export const reportRouter = createTRPCRouter({
  /**
   * Asset Performance Report
   */
  assetPerformance: protectedProcedure
    .input(assetReportSchema)
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, locationId, categoryId, includeInactive, groupBy } = input;

      const where: any = {};
      if (locationId) where.locationId = locationId;
      if (categoryId) where.categoryId = categoryId;
      if (!includeInactive) where.isActive = true;

      const assets = await ctx.db.asset.findMany({
        where,
        include: {
          location: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          workOrders: {
            where: {
              createdAt: { gte: startDate, lte: endDate },
            },
            select: {
              id: true,
              status: true,
              priority: true,
              type: true,
              createdAt: true,
              completedAt: true,
              estimatedHours: true,
              actualHours: true,
            },
          },
          maintenancePlans: {
            select: {
              id: true,
              isActive: true,
              frequency: true,
              lastCompletedAt: true,
            },
          },
          _count: {
            select: {
              workOrders: {
                where: {
                  createdAt: { gte: startDate, lte: endDate },
                },
              },
            },
          },
        },
      });

      const assetMetrics = assets.map(asset => {
        const workOrders = asset.workOrders;
        const completedWOs = workOrders.filter(wo => wo.status === 'COMPLETED');
        const emergencyWOs = workOrders.filter(wo => wo.priority === 'CRITICAL');
        
        const totalDowntime = completedWOs.reduce((sum, wo) => {
          if (wo.completedAt && wo.createdAt) {
            return sum + (wo.completedAt.getTime() - wo.createdAt.getTime());
          }
          return sum;
        }, 0);

        const avgRepairTime = completedWOs.length > 0 
          ? totalDowntime / completedWOs.length / (1000 * 60 * 60) // Convert to hours
          : 0;

        const mtbf = completedWOs.length > 1 
          ? (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * completedWOs.length)
          : 0;

        return {
          id: asset.id,
          name: asset.name,
          assetTag: asset.assetTag,
          location: asset.location?.name,
          category: asset.category?.name,
          status: asset.status,
          totalWorkOrders: workOrders.length,
          completedWorkOrders: completedWOs.length,
          emergencyWorkOrders: emergencyWOs.length,
          avgRepairTime: Math.round(avgRepairTime * 100) / 100,
          mtbf: Math.round(mtbf * 100) / 100,
          availability: asset.status === 'OPERATIONAL' ? 95 : 75, // Simplified calculation
          maintenancePlans: asset.maintenancePlans.length,
          activePlans: asset.maintenancePlans.filter(p => p.isActive).length,
        };
      });

      // Group by specified field
      const groupedData = groupAssetData(assetMetrics, groupBy);

      return {
        assets: assetMetrics,
        summary: {
          totalAssets: assets.length,
          operationalAssets: assets.filter(a => a.status === 'OPERATIONAL').length,
          avgAvailability: assetMetrics.reduce((sum, a) => sum + a.availability, 0) / assetMetrics.length,
          totalWorkOrders: assetMetrics.reduce((sum, a) => sum + a.totalWorkOrders, 0),
          avgMTBF: assetMetrics.reduce((sum, a) => sum + a.mtbf, 0) / assetMetrics.length,
        },
        groupedData,
      };
    }),

  /**
   * Work Order Analysis Report
   */
  workOrderAnalysis: protectedProcedure
    .input(workOrderReportSchema)
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, locationId, assetId, teamId, userId, status, priority, type, groupBy } = input;

      const where: any = {
        createdAt: { gte: startDate, lte: endDate },
      };

      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (type) where.type = type;
      if (assetId) where.assetId = assetId;
      if (userId) where.assigneeId = userId;
      if (teamId) where.assignee = { teamId };
      if (locationId) where.asset = { locationId };

      const workOrders = await ctx.db.workOrder.findMany({
        where,
        include: {
          asset: {
            select: { id: true, name: true, assetTag: true, location: { select: { name: true } } },
          },
          assignee: {
            select: { id: true, name: true, team: { select: { name: true } } },
          },
          tasks: {
            select: { id: true, status: true, estimatedHours: true, actualHours: true },
          },
          partUsage: {
            include: {
              sparePart: { select: { name: true, unitCost: true } },
            },
          },
        },
      });

      const workOrderMetrics = workOrders.map(wo => {
        const completedTasks = wo.tasks.filter(t => t.status === 'COMPLETED');
        const totalEstimatedHours = wo.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
        const totalActualHours = wo.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
        const partsCost = wo.partUsage.reduce((sum, pu) => sum + (pu.quantity * pu.sparePart.unitCost), 0);

        const responseTime = wo.scheduledDate && wo.createdAt 
          ? (wo.scheduledDate.getTime() - wo.createdAt.getTime()) / (1000 * 60 * 60)
          : 0;

        const completionTime = wo.completedAt && wo.createdAt
          ? (wo.completedAt.getTime() - wo.createdAt.getTime()) / (1000 * 60 * 60)
          : 0;

        return {
          id: wo.id,
          title: wo.title,
          status: wo.status,
          priority: wo.priority,
          type: wo.type,
          asset: wo.asset?.name,
          location: wo.asset?.location?.name,
          assignee: wo.assignee?.name,
          team: wo.assignee?.team?.name,
          createdAt: wo.createdAt,
          completedAt: wo.completedAt,
          totalTasks: wo.tasks.length,
          completedTasks: completedTasks.length,
          estimatedHours: totalEstimatedHours,
          actualHours: totalActualHours,
          partsCost,
          responseTime: Math.round(responseTime * 100) / 100,
          completionTime: Math.round(completionTime * 100) / 100,
          efficiency: totalEstimatedHours > 0 ? (totalEstimatedHours / totalActualHours) * 100 : 0,
        };
      });

      // Group by specified field
      const groupedData = groupWorkOrderData(workOrderMetrics, groupBy);

      return {
        workOrders: workOrderMetrics,
        summary: {
          totalWorkOrders: workOrders.length,
          completedWorkOrders: workOrders.filter(wo => wo.status === 'COMPLETED').length,
          avgResponseTime: workOrderMetrics.reduce((sum, wo) => sum + wo.responseTime, 0) / workOrderMetrics.length,
          avgCompletionTime: workOrderMetrics.reduce((sum, wo) => sum + wo.completionTime, 0) / workOrderMetrics.length,
          totalCost: workOrderMetrics.reduce((sum, wo) => sum + wo.partsCost, 0),
          avgEfficiency: workOrderMetrics.reduce((sum, wo) => sum + wo.efficiency, 0) / workOrderMetrics.length,
        },
        groupedData,
      };
    }),

  /**
   * Maintenance Compliance Report
   */
  maintenanceCompliance: protectedProcedure
    .input(maintenanceReportSchema)
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, locationId, assetId, planType, frequency, includeCompleted } = input;

      const where: any = {};
      if (planType) where.type = planType;
      if (frequency) where.frequency = frequency;
      if (assetId) where.assetId = assetId;
      if (locationId) where.asset = { locationId };

      const plans = await ctx.db.maintenancePlan.findMany({
        where,
        include: {
          asset: {
            select: { 
              id: true, 
              name: true, 
              assetTag: true,
              location: { select: { name: true } },
            },
          },
          workOrders: {
            where: {
              createdAt: { gte: startDate, lte: endDate },
              ...(includeCompleted ? {} : { status: { not: 'COMPLETED' } }),
            },
            select: {
              id: true,
              status: true,
              scheduledDate: true,
              completedAt: true,
              dueDate: true,
            },
          },
        },
      });

      const complianceMetrics = plans.map(plan => {
        const scheduledWOs = plan.workOrders.length;
        const completedWOs = plan.workOrders.filter(wo => wo.status === 'COMPLETED').length;
        const overdueWOs = plan.workOrders.filter(wo => 
          wo.dueDate && wo.dueDate < new Date() && wo.status !== 'COMPLETED'
        ).length;
        const onTimeWOs = plan.workOrders.filter(wo => 
          wo.completedAt && wo.dueDate && wo.completedAt <= wo.dueDate
        ).length;

        const complianceRate = scheduledWOs > 0 ? (completedWOs / scheduledWOs) * 100 : 0;
        const onTimeRate = completedWOs > 0 ? (onTimeWOs / completedWOs) * 100 : 0;

        return {
          id: plan.id,
          name: plan.name,
          type: plan.type,
          frequency: plan.frequency,
          asset: plan.asset.name,
          location: plan.asset.location?.name,
          isActive: plan.isActive,
          scheduledWorkOrders: scheduledWOs,
          completedWorkOrders: completedWOs,
          overdueWorkOrders: overdueWOs,
          onTimeWorkOrders: onTimeWOs,
          complianceRate: Math.round(complianceRate * 100) / 100,
          onTimeRate: Math.round(onTimeRate * 100) / 100,
          lastCompletedAt: plan.lastCompletedAt,
          nextDueDate: plan.nextDueDate,
        };
      });

      return {
        plans: complianceMetrics,
        summary: {
          totalPlans: plans.length,
          activePlans: plans.filter(p => p.isActive).length,
          avgComplianceRate: complianceMetrics.reduce((sum, p) => sum + p.complianceRate, 0) / complianceMetrics.length,
          avgOnTimeRate: complianceMetrics.reduce((sum, p) => sum + p.onTimeRate, 0) / complianceMetrics.length,
          totalOverdue: complianceMetrics.reduce((sum, p) => sum + p.overdueWorkOrders, 0),
        },
      };
    }),

  /**
   * Cost Analysis Report
   */
  costAnalysis: protectedProcedure
    .input(costReportSchema)
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, locationId, assetId, categoryId, costType, groupBy } = input;

      const where: any = {
        createdAt: { gte: startDate, lte: endDate },
      };

      if (assetId) where.assetId = assetId;
      if (locationId) where.asset = { locationId };
      if (categoryId) where.asset = { categoryId };

      const workOrders = await ctx.db.workOrder.findMany({
        where,
        include: {
          asset: {
            select: { 
              id: true, 
              name: true, 
              assetTag: true,
              location: { select: { id: true, name: true } },
              category: { select: { id: true, name: true } },
            },
          },
          tasks: {
            select: { actualHours: true },
          },
          partUsage: {
            include: {
              sparePart: { select: { name: true, unitCost: true } },
            },
          },
        },
      });

      const costMetrics = workOrders.map(wo => {
        const laborHours = wo.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
        const laborCost = laborHours * 50; // Assuming $50/hour labor rate
        const partsCost = wo.partUsage.reduce((sum, pu) => sum + (pu.quantity * pu.sparePart.unitCost), 0);
        const externalCost = wo.externalCost || 0;
        const totalCost = laborCost + partsCost + externalCost;

        return {
          id: wo.id,
          title: wo.title,
          asset: wo.asset?.name,
          location: wo.asset?.location?.name,
          category: wo.asset?.category?.name,
          createdAt: wo.createdAt,
          laborHours,
          laborCost,
          partsCost,
          externalCost,
          totalCost,
        };
      });

      // Filter by cost type if specified
      let filteredMetrics = costMetrics;
      if (costType && costType !== 'TOTAL') {
        filteredMetrics = costMetrics.map(metric => ({
          ...metric,
          totalCost: costType === 'LABOR' ? metric.laborCost :
                    costType === 'PARTS' ? metric.partsCost :
                    metric.externalCost,
        }));
      }

      // Group by specified field
      const groupedData = groupCostData(filteredMetrics, groupBy);

      return {
        costs: filteredMetrics,
        summary: {
          totalWorkOrders: workOrders.length,
          totalLaborCost: costMetrics.reduce((sum, c) => sum + c.laborCost, 0),
          totalPartsCost: costMetrics.reduce((sum, c) => sum + c.partsCost, 0),
          totalExternalCost: costMetrics.reduce((sum, c) => sum + c.externalCost, 0),
          grandTotal: costMetrics.reduce((sum, c) => sum + c.totalCost, 0),
          avgCostPerWorkOrder: costMetrics.reduce((sum, c) => sum + c.totalCost, 0) / costMetrics.length,
        },
        groupedData,
      };
    }),

  /**
   * Inventory Usage Report
   */
  inventoryUsage: protectedProcedure
    .input(reportFilterSchema)
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, locationId } = input;

      const where: any = {
        createdAt: { gte: startDate, lte: endDate },
      };

      if (locationId) {
        where.workOrder = { asset: { locationId } };
      }

      const partUsage = await ctx.db.workOrderPartUsage.findMany({
        where,
        include: {
          sparePart: {
            select: {
              id: true,
              name: true,
              partNumber: true,
              unitCost: true,
              category: true,
              location: { select: { name: true } },
            },
          },
          workOrder: {
            select: {
              id: true,
              title: true,
              asset: { select: { name: true } },
            },
          },
        },
      });

      const usageMetrics = partUsage.reduce((acc, usage) => {
        const partId = usage.sparePart.id;
        if (!acc[partId]) {
          acc[partId] = {
            part: usage.sparePart,
            totalQuantity: 0,
            totalCost: 0,
            usageCount: 0,
            workOrders: [],
          };
        }

        acc[partId].totalQuantity += usage.quantity;
        acc[partId].totalCost += usage.quantity * usage.sparePart.unitCost;
        acc[partId].usageCount += 1;
        acc[partId].workOrders.push({
          id: usage.workOrder.id,
          title: usage.workOrder.title,
          asset: usage.workOrder.asset?.name,
          quantity: usage.quantity,
          date: usage.createdAt,
        });

        return acc;
      }, {} as any);

      const inventoryReport = Object.values(usageMetrics);

      return {
        usage: inventoryReport,
        summary: {
          totalParts: inventoryReport.length,
          totalQuantityUsed: inventoryReport.reduce((sum: number, item: any) => sum + item.totalQuantity, 0),
          totalCost: inventoryReport.reduce((sum: number, item: any) => sum + item.totalCost, 0),
          avgCostPerPart: inventoryReport.reduce((sum: number, item: any) => sum + item.totalCost, 0) / inventoryReport.length,
        },
      };
    }),

  /**
   * Export report data (placeholder for future implementation)
   */
  exportReport: managerProcedure
    .input(z.object({
      reportType: z.enum(['asset', 'workOrder', 'maintenance', 'cost', 'inventory']),
      format: z.enum(['csv', 'pdf', 'excel']),
      filters: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      // This would implement actual export functionality
      // For now, return a placeholder response
      return {
        success: true,
        downloadUrl: `/api/reports/download/${input.reportType}-${Date.now()}.${input.format}`,
        message: 'Report export initiated. Download will be available shortly.',
      };
    }),
});

// Helper functions for grouping data
function groupAssetData(assets: any[], groupBy: string) {
  return assets.reduce((acc, asset) => {
    const key = asset[groupBy] || 'Unknown';
    if (!acc[key]) {
      acc[key] = {
        name: key,
        count: 0,
        totalWorkOrders: 0,
        avgAvailability: 0,
      };
    }
    acc[key].count += 1;
    acc[key].totalWorkOrders += asset.totalWorkOrders;
    acc[key].avgAvailability += asset.availability;
    return acc;
  }, {});
}

function groupWorkOrderData(workOrders: any[], groupBy: string) {
  return workOrders.reduce((acc, wo) => {
    const key = wo[groupBy] || 'Unknown';
    if (!acc[key]) {
      acc[key] = {
        name: key,
        count: 0,
        totalCost: 0,
        avgCompletionTime: 0,
      };
    }
    acc[key].count += 1;
    acc[key].totalCost += wo.partsCost;
    acc[key].avgCompletionTime += wo.completionTime;
    return acc;
  }, {});
}

function groupCostData(costs: any[], groupBy: string) {
  return costs.reduce((acc, cost) => {
    let key: string;
    if (groupBy === 'month') {
      key = cost.createdAt.toISOString().substring(0, 7); // YYYY-MM
    } else {
      key = cost[groupBy] || 'Unknown';
    }
    
    if (!acc[key]) {
      acc[key] = {
        name: key,
        count: 0,
        totalCost: 0,
      };
    }
    acc[key].count += 1;
    acc[key].totalCost += cost.totalCost;
    return acc;
  }, {});
}