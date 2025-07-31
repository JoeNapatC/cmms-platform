/**
 * Work Order Router
 * tRPC router for work order management operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
} from '@/server/api/trpc';

// Input validation schemas
const createWorkOrderSchema = z.object({
  title: z.string().min(1, 'Work order title is required'),
  description: z.string().optional(),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'EMERGENCY']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assetId: z.string().cuid(),
  assigneeId: z.string().cuid().optional(),
  requestorId: z.string().cuid().optional(),
  scheduledStart: z.date().optional(),
  scheduledEnd: z.date().optional(),
  estimatedHours: z.number().positive().optional(),
  instructions: z.string().optional(),
  safetyNotes: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
});

const updateWorkOrderSchema = createWorkOrderSchema.partial().extend({
  id: z.string().cuid(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  actualStart: z.date().optional(),
  actualEnd: z.date().optional(),
  actualHours: z.number().positive().optional(),
  completionNotes: z.string().optional(),
});

const workOrderFilterSchema = z.object({
  assetId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'EMERGENCY']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const addTaskSchema = z.object({
  workOrderId: z.string().cuid(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
  assigneeId: z.string().cuid().optional(),
  order: z.number().int().positive().default(1),
});

const updateTaskSchema = z.object({
  id: z.string().cuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  assigneeId: z.string().cuid().optional(),
  completionNotes: z.string().optional(),
});

export const workOrderRouter = createTRPCRouter({
  /**
   * Get all work orders with filtering and pagination
   */
  getAll: protectedProcedure
    .input(workOrderFilterSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, assetId, assigneeId, status, type, priority, dateFrom, dateTo } = input;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { workOrderNumber: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (assetId) where.assetId = assetId;
      if (assigneeId) where.assigneeId = assigneeId;
      if (status) where.status = status;
      if (type) where.type = type;
      if (priority) where.priority = priority;

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const [workOrders, total] = await Promise.all([
        ctx.db.workOrder.findMany({
          where,
          skip,
          take: limit,
          include: {
            asset: {
              select: { id: true, tag: true, lifecycleStatus: true, criticality: true },
            },
            assignee: {
              select: { id: true, name: true, email: true },
            },
            requestor: {
              select: { id: true, name: true, email: true },
            },
            tasks: {
              select: { id: true, title: true, status: true },
            },
            _count: {
              select: {
                tasks: true,
                partUsages: true,
              },
            },
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
          ],
        }),
        ctx.db.workOrder.count({ where }),
      ]);

      return {
        workOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  /**
   * Get work order by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const workOrder = await ctx.db.workOrder.findUnique({
        where: { id: input.id },
        include: {
          asset: {
            include: {
              location: true,
              category: true,
            },
          },
          assignee: {
            select: { id: true, name: true, email: true },
          },
          requestor: {
            select: { id: true, name: true, email: true },
          },
          tasks: {
            include: {
              assignee: {
                select: { id: true, name: true, email: true },
              },
            },
            orderBy: { order: 'asc' },
          },
          partUsages: {
            include: {
              sparePart: {
                select: { id: true, name: true, partNumber: true, unitPrice: true },
              },
            },
          },
          maintenancePlan: {
            select: { id: true, name: true, type: true },
          },
        },
      });

      if (!workOrder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Work order not found',
        });
      }

      return workOrder;
    }),

  /**
   * Create new work order
   */
  create: protectedProcedure
    .input(createWorkOrderSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify asset exists
      const asset = await ctx.db.asset.findUnique({
        where: { id: input.assetId },
        include: { location: true },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Asset not found',
        });
      }

      // Verify assigned user exists if provided
      if (input.assigneeId) {
        const assignedUser = await ctx.db.user.findUnique({
          where: { id: input.assigneeId },
        });

        if (!assignedUser) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Assigned user not found',
          });
        }
      }

      // Generate work order number
      const count = await ctx.db.workOrder.count();
      const workOrderNumber = `WO-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const workOrder = await ctx.db.workOrder.create({
        data: {
          ...input,
          workOrderNumber,
          requestorId: input.requestorId || ctx.session.user.id,
        },
        include: {
          asset: {
            select: { id: true, tag: true, location: { select: { name: true } } },
          },
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'WorkOrder',
          entityId: workOrder.id,
          userId: ctx.session.user.id,
          before: null,
          after: {
            workOrderNumber: workOrder.workOrderNumber,
            title: workOrder.title,
            assetTag: asset.tag,
            priority: workOrder.priority,
          },
        },
      });

      return workOrder;
    }),

  /**
   * Update work order
   */
  update: protectedProcedure
    .input(updateWorkOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if work order exists
      const existingWorkOrder = await ctx.db.workOrder.findUnique({
        where: { id },
        include: { asset: true },
      });

      if (!existingWorkOrder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Work order not found',
        });
      }

      // Verify assigned user if being updated
      if (updateData.assigneeId) {
        const assignedUser = await ctx.db.user.findUnique({
          where: { id: updateData.assigneeId },
        });

        if (!assignedUser) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Assigned user not found',
          });
        }
      }

      // Auto-set actual start/end times based on status changes
      if (updateData.status) {
        if (updateData.status === 'IN_PROGRESS' && !existingWorkOrder.actualStart) {
          updateData.actualStart = new Date();
        }
        if (updateData.status === 'COMPLETED' && !existingWorkOrder.actualEnd) {
          updateData.actualEnd = new Date();
        }
      }

      const workOrder = await ctx.db.workOrder.update({
        where: { id },
        data: updateData,
        include: {
          asset: {
            select: { id: true, tag: true },
          },
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'WorkOrder',
          entityId: workOrder.id,
          userId: ctx.session.user.id,
          before: existingWorkOrder,
          after: workOrder,
        },
      });

      return workOrder;
    }),

  /**
   * Delete work order
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const workOrder = await ctx.db.workOrder.findUnique({
        where: { id: input.id },
        include: {
          tasks: true,
          partUsages: true,
        },
      });

      if (!workOrder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Work order not found',
        });
      }

      // Cannot delete completed work orders
      if (workOrder.status === 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete completed work orders',
        });
      }

      // Delete related records first
      await ctx.db.$transaction([
        ctx.db.task.deleteMany({ where: { workOrderId: input.id } }),
        ctx.db.workOrderPartUsage.deleteMany({ where: { workOrderId: input.id } }),
        ctx.db.workOrder.delete({ where: { id: input.id } }),
      ]);

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          action: 'DELETE',
          entityType: 'WorkOrder',
          entityId: workOrder.id,
          userId: ctx.session.user.id,
          before: workOrder,
          after: null,
        },
      });

      return { success: true };
    }),

  /**
   * Add task to work order
   */
  addTask: protectedProcedure
    .input(addTaskSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify work order exists
      const workOrder = await ctx.db.workOrder.findUnique({
        where: { id: input.workOrderId },
      });

      if (!workOrder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Work order not found',
        });
      }

      const task = await ctx.db.task.create({
        data: input,
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return task;
    }),

  /**
   * Update task
   */
  updateTask: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingTask = await ctx.db.task.findUnique({
        where: { id },
        include: { workOrder: true },
      });

      if (!existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      const task = await ctx.db.task.update({
        where: { id },
        data: updateData,
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return task;
    }),

  /**
   * Get work order statistics
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalWorkOrders,
        scheduledWorkOrders,
        inProgressWorkOrders,
        completedWorkOrders,
        overdueWorkOrders,
        highPriorityWorkOrders,
      ] = await Promise.all([
        ctx.db.workOrder.count(),
        ctx.db.workOrder.count({ where: { status: 'SCHEDULED' } }),
        ctx.db.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
        ctx.db.workOrder.count({ where: { status: 'COMPLETED' } }),
        ctx.db.workOrder.count({
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
            scheduledEnd: { lt: new Date() },
          },
        }),
        ctx.db.workOrder.count({
          where: { priority: { in: ['HIGH', 'CRITICAL'] } },
        }),
      ]);

      return {
        total: totalWorkOrders,
        scheduled: scheduledWorkOrders,
        inProgress: inProgressWorkOrders,
        completed: completedWorkOrders,
        overdue: overdueWorkOrders,
        highPriority: highPriorityWorkOrders,
      };
    }),

  /**
   * Get my assigned work orders
   */
  getMyWorkOrders: protectedProcedure
    .input(z.object({
      status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, status } = input;
      const skip = (page - 1) * limit;

      const where: any = {
        assigneeId: ctx.session.user.id,
      };

      if (status) {
        where.status = status;
      }

      const [workOrders, total] = await Promise.all([
        ctx.db.workOrder.findMany({
          where,
          skip,
          take: limit,
          include: {
            asset: {
              select: { id: true, tag: true, lifecycleStatus: true, criticality: true },
            },
            tasks: {
              select: { id: true, title: true, status: true },
            },
          },
          orderBy: [
            { priority: 'desc' },
            { scheduledStart: 'asc' },
          ],
        }),
        ctx.db.workOrder.count({ where }),
      ]);

      return {
        workOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),
});