/**
 * Dashboard Router
 * tRPC router for dashboard statistics and overview data
 */

import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
} from '@/server/api/trpc';

export const dashboardRouter = createTRPCRouter({
  /**
   * Get dashboard overview statistics
   */
  getOverview: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        // Asset statistics
        totalAssets,
        activeAssets,
        maintenanceAssets,
        retiredAssets,
        criticalAssets,
        
        // Work order statistics
        totalWorkOrders,
        scheduledWorkOrders,
        inProgressWorkOrders,
        completedWorkOrders,
        cancelledWorkOrders,
        overdueWorkOrders,
        highPriorityWorkOrders,
        
        // Recent work orders
        recentWorkOrders,
        
        // Critical assets
        criticalAssetsList,
      ] = await Promise.all([
        // Asset counts
        ctx.db.asset.count(),
        ctx.db.asset.count({ where: { lifecycleStatus: 'ACTIVE' } }),
        ctx.db.asset.count({ where: { lifecycleStatus: 'MAINTENANCE' } }),
        ctx.db.asset.count({ where: { lifecycleStatus: 'DECOMMISSIONED' } }),
        ctx.db.asset.count({ where: { criticality: 'CRITICAL' } }),
        
        // Work order counts
        ctx.db.workOrder.count(),
        ctx.db.workOrder.count({ where: { status: 'SCHEDULED' } }),
        ctx.db.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
        ctx.db.workOrder.count({ where: { status: 'COMPLETED' } }),
        ctx.db.workOrder.count({ where: { status: 'CANCELLED' } }),
        ctx.db.workOrder.count({
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
            scheduledEnd: { lt: new Date() },
          },
        }),
        ctx.db.workOrder.count({
          where: { priority: { in: ['HIGH', 'CRITICAL'] } },
        }),
        
        // Recent work orders (last 10)
        ctx.db.workOrder.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            asset: {
              select: { id: true, tag: true },
            },
            assignee: {
              select: { id: true, name: true },
            },
          },
        }),
        
        // Critical assets (up to 10)
        ctx.db.asset.findMany({
          where: { 
            criticality: 'CRITICAL',
            lifecycleStatus: { in: ['ACTIVE', 'MAINTENANCE'] },
          },
          take: 10,
          include: {
            location: {
              select: { id: true, name: true },
            },
            _count: {
              select: {
                workOrders: {
                  where: {
                    status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
                  },
                },
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

      return {
        assets: {
          total: totalAssets,
          active: activeAssets,
          maintenance: maintenanceAssets,
          retired: retiredAssets,
          critical: criticalAssets,
        },
        workOrders: {
          total: totalWorkOrders,
          scheduled: scheduledWorkOrders,
          inProgress: inProgressWorkOrders,
          completed: completedWorkOrders,
          cancelled: cancelledWorkOrders,
          overdue: overdueWorkOrders,
          highPriority: highPriorityWorkOrders,
        },
        recentWorkOrders: recentWorkOrders.map(wo => ({
          id: wo.id,
          title: wo.title,
          status: wo.status,
          priority: wo.priority,
          assetTag: wo.asset.tag,
          assigneeName: wo.assignee?.name || 'Unassigned',
          createdAt: wo.createdAt,
          scheduledStart: wo.scheduledStart,
        })),
        criticalAssets: criticalAssetsList.map(asset => ({
          id: asset.id,
          tag: asset.tag,
          description: asset.description,
          location: asset.location?.name || 'Unknown',
          lifecycleStatus: asset.lifecycleStatus,
          criticality: asset.criticality,
          activeWorkOrders: asset._count.workOrders,
          lastUpdated: asset.updatedAt,
        })),
      };
    }),

  /**
   * Get maintenance calendar data
   */
  getMaintenanceCalendar: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const workOrders = await ctx.db.workOrder.findMany({
        where: {
          OR: [
            {
              scheduledStart: {
                gte: input.startDate,
                lte: input.endDate,
              },
            },
            {
              scheduledEnd: {
                gte: input.startDate,
                lte: input.endDate,
              },
            },
          ],
        },
        include: {
          asset: {
            select: { id: true, tag: true },
          },
          assignee: {
            select: { id: true, name: true },
          },
        },
        orderBy: { scheduledStart: 'asc' },
      });

      return workOrders.map(wo => ({
        id: wo.id,
        title: wo.title,
        status: wo.status,
        priority: wo.priority,
        type: wo.type,
        assetTag: wo.asset.tag,
        assigneeName: wo.assignee?.name || 'Unassigned',
        scheduledStart: wo.scheduledStart,
        scheduledEnd: wo.scheduledEnd,
        estimatedHours: wo.estimatedHours,
      }));
    }),

  /**
   * Get asset performance metrics
   */
  getAssetMetrics: protectedProcedure
    .input(z.object({
      assetId: z.string().cuid().optional(),
      days: z.number().int().positive().default(30),
    }))
    .query(async ({ ctx, input }) => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const where: any = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (input.assetId) {
        where.assetId = input.assetId;
      }

      const [
        workOrdersByDay,
        workOrdersByType,
        workOrdersByPriority,
        avgCompletionTime,
      ] = await Promise.all([
        // Work orders by day
        ctx.db.workOrder.groupBy({
          by: ['createdAt'],
          where,
          _count: { id: true },
        }),
        
        // Work orders by type
        ctx.db.workOrder.groupBy({
          by: ['type'],
          where,
          _count: { id: true },
        }),
        
        // Work orders by priority
        ctx.db.workOrder.groupBy({
          by: ['priority'],
          where,
          _count: { id: true },
        }),
        
        // Average completion time
        ctx.db.workOrder.aggregate({
          where: {
            ...where,
            status: 'COMPLETED',
            actualStart: { not: null },
            actualEnd: { not: null },
          },
          _avg: {
            actualHours: true,
          },
        }),
      ]);

      return {
        workOrdersByDay,
        workOrdersByType,
        workOrdersByPriority,
        avgCompletionTime: avgCompletionTime._avg.actualHours || 0,
      };
    }),

  /**
   * Get system health indicators
   */
  getSystemHealth: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalUsers,
        activeUsers,
        totalLocations,
        totalCategories,
        recentAuditLogs,
      ] = await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({ where: { isActive: true } }),
        ctx.db.location.count(),
        ctx.db.category.count(),
        ctx.db.auditLog.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        }),
      ]);

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        system: {
          locations: totalLocations,
          categories: totalCategories,
        },
        recentActivity: recentAuditLogs.map(log => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          userName: log.user.name,
          createdAt: log.createdAt,
        })),
      };
    }),
});