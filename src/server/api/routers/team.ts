/**
 * Team Router
 * tRPC router for team management operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  managerProcedure,
  adminProcedure,
} from '@/server/api/trpc';

// Input validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  siteId: z.string().cuid(),
});

const updateTeamSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Team name is required').optional(),
  siteId: z.string().cuid().optional(),
});

const teamFilterSchema = z.object({
  siteId: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const assignUserSchema = z.object({
  teamId: z.string().cuid(),
  userId: z.string().cuid(),
});

export const teamRouter = createTRPCRouter({
  /**
   * Get all teams with filtering and pagination
   */
  getAll: protectedProcedure
    .input(teamFilterSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, siteId } = input;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }

      if (siteId) where.siteId = siteId;

      const [teams, total] = await Promise.all([
        ctx.db.team.findMany({
          where,
          skip,
          take: limit,
          include: {
            site: {
              select: { id: true, name: true, type: true },
            },
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                role: {
                  select: { id: true, name: true },
                },
              },
              where: { isActive: true },
            },
            _count: {
              select: {
                users: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        }),
        ctx.db.team.count({ where }),
      ]);

      return {
        teams,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  /**
   * Get team by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.team.findUnique({
        where: { id: input.id },
        include: {
          site: true,
          users: {
            include: {
              role: {
                select: { id: true, name: true },
              },
              assignedWorkOrders: {
                where: {
                  status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
                },
                select: {
                  id: true,
                  title: true,
                  status: true,
                  priority: true,
                  dueDate: true,
                },
                orderBy: { dueDate: 'asc' },
                take: 5,
              },
              _count: {
                select: {
                  assignedWorkOrders: {
                    where: {
                      status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
                    },
                  },
                },
              },
            },
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
      });

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      return team;
    }),

  /**
   * Create new team
   */
  create: managerProcedure
    .input(createTeamSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify site exists
      const site = await ctx.db.location.findUnique({
        where: { id: input.siteId },
      });

      if (!site) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Site not found',
        });
      }

      // Check if team name already exists at this site
      const existingTeam = await ctx.db.team.findFirst({
        where: {
          name: input.name,
          siteId: input.siteId,
        },
      });

      if (existingTeam) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Team with this name already exists at this site',
        });
      }

      const team = await ctx.db.team.create({
        data: input,
        include: {
          site: {
            select: { id: true, name: true, type: true },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      return team;
    }),

  /**
   * Update team
   */
  update: managerProcedure
    .input(updateTeamSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify team exists
      const existingTeam = await ctx.db.team.findUnique({
        where: { id },
      });

      if (!existingTeam) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      // Verify site exists if provided
      if (updateData.siteId) {
        const site = await ctx.db.location.findUnique({
          where: { id: updateData.siteId },
        });

        if (!site) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Site not found',
          });
        }
      }

      // Check if team name already exists at the site (if name or site is being changed)
      if (updateData.name || updateData.siteId) {
        const siteId = updateData.siteId || existingTeam.siteId;
        const name = updateData.name || existingTeam.name;

        const duplicateTeam = await ctx.db.team.findFirst({
          where: {
            name,
            siteId,
            id: { not: id },
          },
        });

        if (duplicateTeam) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Team with this name already exists at this site',
          });
        }
      }

      const team = await ctx.db.team.update({
        where: { id },
        data: updateData,
        include: {
          site: {
            select: { id: true, name: true, type: true },
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: {
                select: { id: true, name: true },
              },
            },
            where: { isActive: true },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      return team;
    }),

  /**
   * Delete team
   */
  delete: managerProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if team has users
      const usersCount = await ctx.db.user.count({
        where: { teamId: input.id },
      });

      if (usersCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete team with assigned users. Please reassign users first.',
        });
      }

      await ctx.db.team.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Assign user to team
   */
  assignUser: managerProcedure
    .input(assignUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify team exists
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
      });

      if (!team) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Team not found',
        });
      }

      // Verify user exists
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User not found',
        });
      }

      // Update user's team
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { teamId: input.teamId },
        include: {
          role: {
            select: { id: true, name: true },
          },
          team: {
            select: { id: true, name: true },
          },
        },
      });

      return updatedUser;
    }),

  /**
   * Remove user from team
   */
  removeUser: managerProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user exists
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User not found',
        });
      }

      // Remove user from team
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { teamId: null },
        include: {
          role: {
            select: { id: true, name: true },
          },
        },
      });

      return updatedUser;
    }),

  /**
   * Get team statistics
   */
  getStats: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const [
        totalUsers,
        activeUsers,
        openWorkOrders,
        completedWorkOrdersThisMonth,
        avgWorkOrdersPerUser,
      ] = await Promise.all([
        ctx.db.user.count({
          where: { teamId: input.id },
        }),
        ctx.db.user.count({
          where: { 
            teamId: input.id,
            isActive: true,
          },
        }),
        ctx.db.workOrder.count({
          where: { 
            assignee: { teamId: input.id },
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          },
        }),
        ctx.db.workOrder.count({
          where: { 
            assignee: { teamId: input.id },
            status: 'COMPLETED',
            completedAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        ctx.db.workOrder.groupBy({
          by: ['assigneeId'],
          where: { 
            assignee: { teamId: input.id },
            status: 'COMPLETED',
            completedAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _count: {
            id: true,
          },
        }).then(results => {
          if (results.length === 0) return 0;
          const total = results.reduce((sum, result) => sum + result._count.id, 0);
          return Math.round(total / results.length);
        }),
      ]);

      return {
        totalUsers,
        activeUsers,
        openWorkOrders,
        completedWorkOrdersThisMonth,
        avgWorkOrdersPerUser,
      };
    }),

  /**
   * Get teams for dropdown/select
   */
  getForSelect: protectedProcedure
    .input(z.object({
      siteId: z.string().cuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const teams = await ctx.db.team.findMany({
        where: input.siteId ? { siteId: input.siteId } : undefined,
        select: {
          id: true,
          name: true,
          site: {
            select: { name: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      return teams.map(team => ({
        id: team.id,
        name: `${team.name} (${team.site.name})`,
      }));
    }),

  /**
   * Get team workload
   */
  getWorkload: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: { 
          teamId: input.id,
          isActive: true,
        },
        include: {
          assignedWorkOrders: {
            where: {
              status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
            },
            select: {
              id: true,
              title: true,
              priority: true,
              dueDate: true,
            },
            orderBy: { dueDate: 'asc' },
          },
          _count: {
            select: {
              assignedWorkOrders: {
                where: {
                  status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        activeWorkOrders: user._count.assignedWorkOrders,
        upcomingWorkOrders: user.assignedWorkOrders.slice(0, 3),
      }));
    }),
});