/**
 * Maintenance Planning Router
 * tRPC router for maintenance planning operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
} from '@/server/api/trpc';

// Input validation schemas
const createMaintenancePlanSchema = z.object({
  assetId: z.string().cuid(),
  name: z.string().min(1, 'Plan name is required'),
  type: z.enum(['TIME_BASED', 'METER_BASED', 'PREDICTIVE']),
  frequency: z.number().int().positive().optional(),
  meterThreshold: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  nextDueDate: z.date().optional(),
});

const updateMaintenancePlanSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).optional(),
  type: z.enum(['TIME_BASED', 'METER_BASED', 'PREDICTIVE']).optional(),
  frequency: z.number().int().positive().optional(),
  meterThreshold: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  nextDueDate: z.date().optional(),
});

const maintenancePlanFilterSchema = z.object({
  assetId: z.string().cuid().optional(),
  type: z.enum(['TIME_BASED', 'METER_BASED', 'PREDICTIVE']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const maintenanceRouter = createTRPCRouter({
  /**
   * Get all maintenance plans with filtering and pagination
   */
  getAll: protectedProcedure
    .input(maintenancePlanFilterSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, assetId, type, isActive } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(assetId && { assetId }),
        ...(type && { type }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { asset: { tag: { contains: search, mode: 'insensitive' as const } } },
            { asset: { model: { contains: search, mode: 'insensitive' as const } } },
          ],
        }),
      };

      const [plans, total] = await Promise.all([
        ctx.db.maintenancePlan.findMany({
          where,
          include: {
            asset: {
              select: {
                id: true,
                tag: true,
                model: true,
                manufacturer: true,
                location: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        ctx.db.maintenancePlan.count({ where }),
      ]);

      return {
        plans,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  /**
   * Get a single maintenance plan by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.db.maintenancePlan.findUnique({
        where: { id: input.id },
        include: {
          asset: {
            include: {
              location: true,
              category: true,
            },
          },
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Maintenance plan not found',
        });
      }

      return plan;
    }),

  /**
   * Create a new maintenance plan
   */
  create: protectedProcedure
    .input(createMaintenancePlanSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate that the asset exists
      const asset = await ctx.db.asset.findUnique({
        where: { id: input.assetId },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Asset not found',
        });
      }

      // Validate maintenance plan type requirements
      if (input.type === 'TIME_BASED' && !input.frequency) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Frequency is required for time-based maintenance plans',
        });
      }

      if (input.type === 'METER_BASED' && !input.meterThreshold) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Meter threshold is required for meter-based maintenance plans',
        });
      }

      const plan = await ctx.db.maintenancePlan.create({
        data: input,
        include: {
          asset: {
            select: {
              id: true,
              tag: true,
              model: true,
              manufacturer: true,
            },
          },
        },
      });

      return plan;
    }),

  /**
   * Update an existing maintenance plan
   */
  update: protectedProcedure
    .input(updateMaintenancePlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if the plan exists
      const existingPlan = await ctx.db.maintenancePlan.findUnique({
        where: { id },
      });

      if (!existingPlan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Maintenance plan not found',
        });
      }

      // Validate maintenance plan type requirements
      const finalType = updateData.type || existingPlan.type;
      if (finalType === 'TIME_BASED' && updateData.frequency === undefined && !existingPlan.frequency) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Frequency is required for time-based maintenance plans',
        });
      }

      if (finalType === 'METER_BASED' && updateData.meterThreshold === undefined && !existingPlan.meterThreshold) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Meter threshold is required for meter-based maintenance plans',
        });
      }

      const plan = await ctx.db.maintenancePlan.update({
        where: { id },
        data: updateData,
        include: {
          asset: {
            select: {
              id: true,
              tag: true,
              model: true,
              manufacturer: true,
            },
          },
        },
      });

      return plan;
    }),

  /**
   * Delete a maintenance plan
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.db.maintenancePlan.findUnique({
        where: { id: input.id },
      });

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Maintenance plan not found',
        });
      }

      await ctx.db.maintenancePlan.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get maintenance plans by asset ID
   */
  getByAssetId: protectedProcedure
    .input(z.object({ assetId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const plans = await ctx.db.maintenancePlan.findMany({
        where: { assetId: input.assetId },
        include: {
          asset: {
            select: {
              id: true,
              tag: true,
              model: true,
              manufacturer: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return plans;
    }),

  /**
   * Get maintenance plan statistics
   */
  getStatistics: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalPlans,
        activePlans,
        timeBased,
        meterBased,
        predictive,
        overduePlans,
      ] = await Promise.all([
        ctx.db.maintenancePlan.count(),
        ctx.db.maintenancePlan.count({ where: { isActive: true } }),
        ctx.db.maintenancePlan.count({ where: { type: 'TIME_BASED' } }),
        ctx.db.maintenancePlan.count({ where: { type: 'METER_BASED' } }),
        ctx.db.maintenancePlan.count({ where: { type: 'PREDICTIVE' } }),
        ctx.db.maintenancePlan.count({
          where: {
            isActive: true,
            nextDueDate: {
              lt: new Date(),
            },
          },
        }),
      ]);

      return {
        totalPlans,
        activePlans,
        inactivePlans: totalPlans - activePlans,
        overduePlans,
        byType: {
          timeBased,
          meterBased,
          predictive,
        },
      };
    }),

  /**
   * Generate work orders from due maintenance plans
   */
  generateWorkOrders: protectedProcedure
    .input(z.object({
      planIds: z.array(z.string().cuid()).optional(),
      dueDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { planIds, dueDate = new Date() } = input;

      // Get due maintenance plans
      const where = {
        isActive: true,
        nextDueDate: {
          lte: dueDate,
        },
        ...(planIds && { id: { in: planIds } }),
      };

      const duePlans = await ctx.db.maintenancePlan.findMany({
        where,
        include: {
          asset: true,
        },
      });

      if (duePlans.length === 0) {
        return { workOrdersCreated: 0, workOrders: [] };
      }

      // Create work orders for due plans
      const workOrdersData = duePlans.map((plan) => ({
        title: `${plan.type.replace('_', ' ')} Maintenance - ${plan.asset.tag}`,
        description: `Scheduled maintenance for ${plan.asset.tag} based on plan: ${plan.name}`,
        type: 'PREVENTIVE' as const,
        priority: 'MEDIUM' as const,
        assetId: plan.assetId,
        requestorId: ctx.session.user.id,
        dueDate: plan.nextDueDate,
        status: 'SCHEDULED' as const,
      }));

      const workOrders = await ctx.db.workOrder.createMany({
        data: workOrdersData,
      });

      // Update next due dates for time-based plans
      const timeBasedPlans = duePlans.filter(plan => plan.type === 'TIME_BASED' && plan.frequency);
      for (const plan of timeBasedPlans) {
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + (plan.frequency || 0));
        
        await ctx.db.maintenancePlan.update({
          where: { id: plan.id },
          data: { nextDueDate },
        });
      }

      return {
        workOrdersCreated: workOrders.count,
        workOrders: duePlans.map(plan => ({
          planId: plan.id,
          planName: plan.name,
          assetTag: plan.asset.tag,
        })),
      };
    }),
});