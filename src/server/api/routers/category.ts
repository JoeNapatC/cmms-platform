/**
 * Category Router
 * tRPC router for category management operations
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
const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentId: z.string().cuid().optional(),
});

const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().cuid(),
});

const categoryFilterSchema = z.object({
  parentId: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

export const categoryRouter = createTRPCRouter({
  /**
   * Get all categories with filtering and pagination
   */
  getAll: publicProcedure
    .input(categoryFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const { page = 1, limit = 100, search, parentId } = input || {};
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (parentId) where.parentId = parentId;

      const [categories, total] = await Promise.all([
        ctx.db.category.findMany({
          where,
          skip,
          take: limit,
          include: {
            parent: {
              select: { id: true, name: true },
            },
            children: {
              select: { id: true, name: true },
            },
            _count: {
              select: {
                assets: true,
                children: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        }),
        ctx.db.category.count({ where }),
      ]);

      return {
        categories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  /**
   * Get category hierarchy tree
   */
  getHierarchy: protectedProcedure
    .query(async ({ ctx }) => {
      const categories = await ctx.db.category.findMany({
        include: {
          children: {
            include: {
              children: true,
            },
          },
          _count: {
            select: {
              assets: true,
            },
          },
        },
        where: {
          parentId: null, // Start with root categories
        },
        orderBy: { name: 'asc' },
      });

      return categories;
    }),

  /**
   * Get category by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
        include: {
          parent: true,
          children: {
            include: {
              _count: {
                select: {
                  assets: true,
                },
              },
            },
          },
          assets: {
            include: {
              location: {
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
          _count: {
            select: {
              assets: true,
              children: true,
            },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      return category;
    }),

  /**
   * Create new category
   */
  create: managerProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      // Verify parent category exists if provided
      if (input.parentId) {
        const parentCategory = await ctx.db.category.findUnique({
          where: { id: input.parentId },
        });

        if (!parentCategory) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Parent category not found',
          });
        }
      }

      const category = await ctx.db.category.create({
        data: input,
        include: {
          parent: true,
          _count: {
            select: {
              assets: true,
              children: true,
            },
          },
        },
      });

      return category;
    }),

  /**
   * Update existing category
   */
  update: managerProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify category exists
      const existingCategory = await ctx.db.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      // Verify parent category exists if provided
      if (updateData.parentId) {
        const parentCategory = await ctx.db.category.findUnique({
          where: { id: updateData.parentId },
        });

        if (!parentCategory) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Parent category not found',
          });
        }

        // Prevent circular references
        if (updateData.parentId === id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Category cannot be its own parent',
          });
        }
      }

      const category = await ctx.db.category.update({
        where: { id },
        data: updateData,
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              assets: true,
              children: true,
            },
          },
        },
      });

      return category;
    }),

  /**
   * Delete category
   */
  delete: managerProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if category has assets
      const categoryWithAssets = await ctx.db.category.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              assets: true,
              children: true,
            },
          },
        },
      });

      if (!categoryWithAssets) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      if (categoryWithAssets._count.assets > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete category with existing assets',
        });
      }

      if (categoryWithAssets._count.children > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete category with child categories',
        });
      }

      await ctx.db.category.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});