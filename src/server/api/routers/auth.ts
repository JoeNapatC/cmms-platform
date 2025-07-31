/**
 * Authentication Router
 * tRPC router for user authentication and authorization operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '@/server/api/trpc';
import { env } from '@/env.mjs';

// Input validation schemas
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleId: z.string().cuid(),
  teamId: z.string().cuid().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export const authRouter = createTRPCRouter({
  /**
   * Sign in user
   */
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      // Find user with role information
      const user = await ctx.db.user.findUnique({
        where: { email },
        include: {
          role: true,
          team: {
            include: {
              site: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      if (!user.isActive) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Account is deactivated',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role.name,
        },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
      };
    }),

  /**
   * Sign up new user (admin only)
   */
  signUp: adminProcedure
    .input(signUpSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, name, roleId, teamId } = input;

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User with this email already exists',
        });
      }

      // Verify role exists
      const role = await ctx.db.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid role specified',
        });
      }

      // Verify team exists if provided
      if (teamId) {
        const team = await ctx.db.team.findUnique({
          where: { id: teamId },
        });

        if (!team) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid team specified',
          });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await ctx.db.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          roleId,
          teamId,
        },
        include: {
          role: true,
          team: {
            include: {
              site: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return userWithoutPassword;
    }),

  /**
   * Get current user profile
   */
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          role: true,
          team: {
            include: {
              site: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // If email is being updated, check if it's already taken
      if (input.email) {
        const existingUser = await ctx.db.user.findFirst({
          where: {
            email: input.email,
            id: { not: userId },
          },
        });

        if (existingUser) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Email is already taken',
          });
        }
      }

      const user = await ctx.db.user.update({
        where: { id: userId },
        data: input,
        include: {
          role: true,
          team: {
            include: {
              site: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  /**
   * Change password
   */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { currentPassword, newPassword } = input;

      // Get current user with password
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await ctx.db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),

  /**
   * Get all users (admin only)
   */
  getAllUsers: adminProcedure
    .input(z.object({
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
      search: z.string().optional(),
      roleId: z.string().cuid().optional(),
      teamId: z.string().cuid().optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, search, roleId, teamId, isActive } = input;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (roleId) where.roleId = roleId;
      if (teamId) where.teamId = teamId;
      if (isActive !== undefined) where.isActive = isActive;

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            role: {
              select: { id: true, name: true },
            },
            team: {
              select: { 
                id: true, 
                name: true,
                site: {
                  select: { id: true, name: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  /**
   * Deactivate user (admin only)
   */
  deactivateUser: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: input.userId },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      });

      return user;
    }),

  /**
   * Activate user (admin only)
   */
  activateUser: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: input.userId },
        data: { isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      });

      return user;
    }),
});