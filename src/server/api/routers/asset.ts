/**
 * Asset Router
 * tRPC router for asset management operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc';

// Input validation schemas
const createAssetSchema = z.object({
  tag: z.string().min(1, 'Asset tag is required'),
  serialNumber: z.string().optional(),
  model: z.string().min(1, 'Model is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  purchaseDate: z.date().optional(),
  commissioningDate: z.date().optional(),
  warrantyExpiry: z.date().optional(),
  lifecycleStatus: z.enum(['ACTIVE', 'INACTIVE', 'DECOMMISSIONED', 'UNDER_MAINTENANCE']).default('ACTIVE'),
  criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  locationId: z.string().cuid(),
  categoryId: z.string().cuid(),
  cost: z.number().positive().optional(),
  description: z.string().optional(),
});

const updateAssetSchema = createAssetSchema.partial().extend({
  id: z.string().cuid(),
});

const assetFilterSchema = z.object({
  locationId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  lifecycleStatus: z.enum(['ACTIVE', 'INACTIVE', 'DECOMMISSIONED', 'UNDER_MAINTENANCE']).optional(),
  criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const assetRouter = createTRPCRouter({
  /**
   * Get all assets with filtering and pagination
   */
  getAll: publicProcedure
    .input(assetFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const { page = 1, limit = 20, search, locationId, categoryId, lifecycleStatus, criticality } = input || {};
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { tag: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { manufacturer: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (locationId) where.locationId = locationId;
      if (categoryId) where.categoryId = categoryId;
      if (lifecycleStatus) where.lifecycleStatus = lifecycleStatus;
      if (criticality) where.criticality = criticality;

      const [assets, total] = await Promise.all([
        ctx.db.asset.findMany({
          where,
          skip,
          take: limit,
          include: {
            location: {
              select: { id: true, name: true, type: true },
            },
            category: {
              select: { id: true, name: true },
            },
            workOrders: {
              where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
              select: { id: true, title: true, status: true, priority: true },
            },
            _count: {
              select: {
                workOrders: true,
                documents: true,
                sensorStreams: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.asset.count({ where }),
      ]);

      return {
        assets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  /**
   * Get asset by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUnique({
        where: { id: input.id },
        include: {
          location: true,
          category: true,
          workOrders: {
            include: {
              requestor: {
                select: { id: true, name: true, email: true },
              },
              assignee: {
                select: { id: true, name: true, email: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          documents: {
            orderBy: { createdAt: 'desc' },
          },
          sensorStreams: {
            orderBy: { createdAt: 'desc' },
          },
          maintenancePlans: {
            where: { isActive: true },
          },
        },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Asset not found',
        });
      }

      return asset;
    }),

  /**
   * Create new asset
   */
  create: protectedProcedure
    .input(createAssetSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify location and category exist
      const [location, category] = await Promise.all([
        ctx.db.location.findUnique({ where: { id: input.locationId } }),
        ctx.db.category.findUnique({ where: { id: input.categoryId } }),
      ]);

      if (!location) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Location not found',
        });
      }

      if (!category) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Category not found',
        });
      }

      // Check if tag is unique
      const existingAsset = await ctx.db.asset.findUnique({
        where: { tag: input.tag },
      });

      if (existingAsset) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Asset tag already exists',
        });
      }

      const asset = await ctx.db.asset.create({
        data: input,
        include: {
          location: true,
          category: true,
        },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'Asset',
          entityId: asset.id,
          userId: ctx.session.user.id,
          before: null,
          after: {
            assetTag: asset.tag,
            location: location.name,
            category: category.name,
          },
        },
      });

      return asset;
    }),

  /**
   * Update asset
   */
  update: protectedProcedure
    .input(updateAssetSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if asset exists
      const existingAsset = await ctx.db.asset.findUnique({
        where: { id },
        include: { location: true, category: true },
      });

      if (!existingAsset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Asset not found',
        });
      }

      // Check if tag is unique (if being updated)
      if (updateData.tag && updateData.tag !== existingAsset.tag) {
        const tagExists = await ctx.db.asset.findUnique({
          where: { tag: updateData.tag },
        });

        if (tagExists) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Asset tag already exists',
          });
        }
      }

      const asset = await ctx.db.asset.update({
        where: { id },
        data: updateData,
        include: {
          location: true,
          category: true,
        },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'Asset',
          entityId: asset.id,
          userId: ctx.session.user.id,
          before: existingAsset,
          after: asset,
        },
      });

      return asset;
    }),

  /**
   * Delete asset (soft delete by setting status to decommissioned)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if asset exists and has no active work orders
      const asset = await ctx.db.asset.findUnique({
        where: { id: input.id },
        include: {
          workOrders: {
            where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
          },
        },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Asset not found',
        });
      }

      if (asset.workOrders.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete asset with active work orders',
        });
      }

      // Soft delete by setting status to decommissioned
      const deletedAsset = await ctx.db.asset.update({
        where: { id: input.id },
        data: {
          lifecycleStatus: 'DECOMMISSIONED',
        },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          action: 'DELETE',
          entityType: 'Asset',
          entityId: asset.id,
          userId: ctx.session.user.id,
          before: asset,
          after: deletedAsset,
        },
      });

      return deletedAsset;
    }),

  /**
   * Get asset statistics
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalAssets,
        activeAssets,
        maintenanceAssets,
        decommissionedAssets,
        criticalAssets,
        assetsWithActiveWorkOrders,
      ] = await Promise.all([
        ctx.db.asset.count(),
        ctx.db.asset.count({ where: { lifecycleStatus: 'ACTIVE' } }),
        ctx.db.asset.count({ where: { lifecycleStatus: 'UNDER_MAINTENANCE' } }),
        ctx.db.asset.count({ where: { lifecycleStatus: 'DECOMMISSIONED' } }),
        ctx.db.asset.count({ where: { criticality: 'CRITICAL' } }),
        ctx.db.asset.count({
          where: {
            workOrders: {
              some: {
                status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
              },
            },
          },
        }),
      ]);

      return {
        total: totalAssets,
        active: activeAssets,
        maintenance: maintenanceAssets,
        decommissioned: decommissionedAssets,
        critical: criticalAssets,
        withActiveWorkOrders: assetsWithActiveWorkOrders,
      };
    }),
});