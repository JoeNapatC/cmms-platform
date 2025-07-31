/**
 * Location Router
 * tRPC router for location hierarchy and management operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  managerProcedure,
} from '@/server/api/trpc';

// Input validation schemas
const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  type: z.enum(['SITE', 'BUILDING', 'FLOOR', 'ROOM']),
  parentId: z.string().cuid().optional(),
  gisCoords: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  description: z.string().optional(),
});

const updateLocationSchema = createLocationSchema.partial().extend({
  id: z.string().cuid(),
});

const locationFilterSchema = z.object({
  type: z.enum(['SITE', 'BUILDING', 'FLOOR', 'ROOM']).optional(),
  parentId: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const locationRouter = createTRPCRouter({
  /**
   * Get all locations with filtering and pagination
   */
  getAll: publicProcedure
    .input(locationFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const { page = 1, limit = 100, search, type, parentId } = input || {};
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (type) where.type = type;
      if (parentId) where.parentId = parentId;

      const [locations, total] = await Promise.all([
        ctx.db.location.findMany({
          where,
          skip,
          take: limit,
          include: {
            parent: {
              select: { id: true, name: true, type: true },
            },
            children: {
              select: { id: true, name: true, type: true },
            },
            _count: {
              select: {
                assets: true,
                teams: true,
                children: true,
              },
            },
          },
          orderBy: [
            { type: 'asc' },
            { name: 'asc' },
          ],
        }),
        ctx.db.location.count({ where }),
      ]);

      return {
        locations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  /**
   * Get location hierarchy tree
   */
  getHierarchy: protectedProcedure
    .query(async ({ ctx }) => {
      // Get all locations and build hierarchy
      const locations = await ctx.db.location.findMany({
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: true,
                },
              },
            },
          },
          _count: {
            select: {
              assets: true,
              teams: true,
            },
          },
        },
        where: {
          parentId: null, // Start with root locations
        },
        orderBy: { name: 'asc' },
      });

      return locations;
    }),

  /**
   * Get location by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const location = await ctx.db.location.findUnique({
        where: { id: input.id },
        include: {
          parent: true,
          children: {
            include: {
              _count: {
                select: {
                  assets: true,
                  teams: true,
                },
              },
            },
          },
          assets: {
            include: {
              category: {
                select: { id: true, name: true },
              },
              _count: {
                select: {
                  workOrders: true,
                },
              },
            },
            orderBy: { tag: 'asc' },
            take: 50, // Limit assets for performance
          },
          teams: {
            include: {
              _count: {
                select: {
                  users: true,
                },
              },
            },
          },
          _count: {
            select: {
              assets: true,
              teams: true,
              children: true,
            },
          },
        },
      });

      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Location not found',
        });
      }

      return location;
    }),

  /**
   * Create new location
   */
  create: managerProcedure
    .input(createLocationSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify parent location exists if provided
      if (input.parentId) {
        const parent = await ctx.db.location.findUnique({
          where: { id: input.parentId },
        });

        if (!parent) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Parent location not found',
          });
        }

        // Validate hierarchy rules
        const hierarchyRules = {
          SITE: [],
          BUILDING: ['SITE'],
          FLOOR: ['BUILDING'],
          ROOM: ['FLOOR'],
        };

        const allowedParentTypes = hierarchyRules[input.type];
        if (!allowedParentTypes.includes(parent.type)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `${input.type} can only be created under: ${allowedParentTypes.join(', ')}`,
          });
        }
      } else if (input.type !== 'SITE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only SITE locations can be created without a parent',
        });
      }

      const location = await ctx.db.location.create({
        data: {
          ...input,
          gisCoords: input.gisCoords ? JSON.stringify(input.gisCoords) : null,
        },
        include: {
          parent: {
            select: { id: true, name: true, type: true },
          },
          _count: {
            select: {
              assets: true,
              teams: true,
              children: true,
            },
          },
        },
      });

      return location;
    }),

  /**
   * Update location
   */
  update: managerProcedure
    .input(updateLocationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify location exists
      const existingLocation = await ctx.db.location.findUnique({
        where: { id },
      });

      if (!existingLocation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Location not found',
        });
      }

      // Verify parent location exists if provided
      if (updateData.parentId) {
        const parent = await ctx.db.location.findUnique({
          where: { id: updateData.parentId },
        });

        if (!parent) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Parent location not found',
          });
        }

        // Prevent circular references
        if (updateData.parentId === id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Location cannot be its own parent',
          });
        }

        // Check if the new parent would create a circular reference
        let currentParent = parent;
        while (currentParent.parentId) {
          if (currentParent.parentId === id) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'This would create a circular reference in the location hierarchy',
            });
          }
          currentParent = await ctx.db.location.findUnique({
            where: { id: currentParent.parentId },
          }) as any;
          if (!currentParent) break;
        }

        // Validate hierarchy rules if type is being changed
        const newType = updateData.type || existingLocation.type;
        const hierarchyRules = {
          SITE: [],
          BUILDING: ['SITE'],
          FLOOR: ['BUILDING'],
          ROOM: ['FLOOR'],
        };

        const allowedParentTypes = hierarchyRules[newType];
        if (!allowedParentTypes.includes(parent.type)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `${newType} can only be created under: ${allowedParentTypes.join(', ')}`,
          });
        }
      }

      const location = await ctx.db.location.update({
        where: { id },
        data: {
          ...updateData,
          gisCoords: updateData.gisCoords ? JSON.stringify(updateData.gisCoords) : undefined,
        },
        include: {
          parent: {
            select: { id: true, name: true, type: true },
          },
          children: {
            select: { id: true, name: true, type: true },
          },
          _count: {
            select: {
              assets: true,
              teams: true,
              children: true,
            },
          },
        },
      });

      return location;
    }),

  /**
   * Delete location
   */
  delete: managerProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if location has children
      const childrenCount = await ctx.db.location.count({
        where: { parentId: input.id },
      });

      if (childrenCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete location with child locations',
        });
      }

      // Check if location has assets
      const assetsCount = await ctx.db.asset.count({
        where: { locationId: input.id },
      });

      if (assetsCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete location with assets',
        });
      }

      // Check if location has teams
      const teamsCount = await ctx.db.team.count({
        where: { siteId: input.id },
      });

      if (teamsCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete location with teams',
        });
      }

      await ctx.db.location.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get location statistics
   */
  getStats: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const [
        assetsCount,
        activeAssetsCount,
        teamsCount,
        usersCount,
        openWorkOrdersCount,
        childrenCount,
      ] = await Promise.all([
        ctx.db.asset.count({
          where: { locationId: input.id },
        }),
        ctx.db.asset.count({
          where: { 
            locationId: input.id,
            lifecycleStatus: 'ACTIVE',
          },
        }),
        ctx.db.team.count({
          where: { siteId: input.id },
        }),
        ctx.db.user.count({
          where: { 
            team: { siteId: input.id },
            isActive: true,
          },
        }),
        ctx.db.workOrder.count({
          where: { 
            asset: { locationId: input.id },
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          },
        }),
        ctx.db.location.count({
          where: { parentId: input.id },
        }),
      ]);

      return {
        assetsCount,
        activeAssetsCount,
        teamsCount,
        usersCount,
        openWorkOrdersCount,
        childrenCount,
      };
    }),

  /**
   * Get locations for dropdown/select
   */
  getForSelect: protectedProcedure
    .input(z.object({
      type: z.enum(['SITE', 'BUILDING', 'FLOOR', 'ROOM']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const locations = await ctx.db.location.findMany({
        where: input.type ? { type: input.type } : undefined,
        select: {
          id: true,
          name: true,
          type: true,
          parent: {
            select: { name: true },
          },
        },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' },
        ],
      });

      return locations.map(location => ({
        id: location.id,
        name: location.parent 
          ? `${location.name} (${location.parent.name})`
          : location.name,
        type: location.type,
      }));
    }),
});