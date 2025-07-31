/**
 * IoT Sensors Router
 * tRPC router for IoT sensor management and data operations
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
const createSensorSchema = z.object({
  name: z.string().min(1, 'Sensor name is required'),
  type: z.enum(['TEMPERATURE', 'PRESSURE', 'VIBRATION', 'FLOW', 'LEVEL', 'HUMIDITY', 'VOLTAGE', 'CURRENT', 'SPEED', 'OTHER']),
  unit: z.string().min(1, 'Unit is required'),
  assetId: z.string().cuid(),
  deviceId: z.string().min(1, 'Device ID is required'),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  alertThresholdMin: z.number().optional(),
  alertThresholdMax: z.number().optional(),
  isActive: z.boolean().default(true),
});

const updateSensorSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Sensor name is required').optional(),
  type: z.enum(['TEMPERATURE', 'PRESSURE', 'VIBRATION', 'FLOW', 'LEVEL', 'HUMIDITY', 'VOLTAGE', 'CURRENT', 'SPEED', 'OTHER']).optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  assetId: z.string().cuid().optional(),
  deviceId: z.string().min(1, 'Device ID is required').optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  alertThresholdMin: z.number().optional(),
  alertThresholdMax: z.number().optional(),
  isActive: z.boolean().optional(),
});

const sensorFilterSchema = z.object({
  assetId: z.string().cuid().optional(),
  type: z.enum(['TEMPERATURE', 'PRESSURE', 'VIBRATION', 'FLOW', 'LEVEL', 'HUMIDITY', 'VOLTAGE', 'CURRENT', 'SPEED', 'OTHER']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const sensorDataSchema = z.object({
  sensorId: z.string().cuid(),
  value: z.number(),
  timestamp: z.date().optional(),
});

const sensorDataFilterSchema = z.object({
  sensorId: z.string().cuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  interval: z.enum(['MINUTE', 'HOUR', 'DAY']).default('HOUR'),
  limit: z.number().int().positive().max(1000).default(100),
});

export const sensorRouter = createTRPCRouter({
  /**
   * Get all sensors with filtering and pagination
   */
  getAll: protectedProcedure
    .input(sensorFilterSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, assetId, type, isActive } = input;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { deviceId: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (assetId) where.assetId = assetId;
      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive;

      const [sensors, total] = await Promise.all([
        ctx.db.sensorStream.findMany({
          where,
          skip,
          take: limit,
          include: {
            asset: {
              select: {
                id: true,
                name: true,
                assetTag: true,
                location: {
                  select: { name: true },
                },
              },
            },
            _count: {
              select: {
                data: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        }),
        ctx.db.sensorStream.count({ where }),
      ]);

      // Get latest reading for each sensor
      const sensorsWithLatestData = await Promise.all(
        sensors.map(async (sensor) => {
          const latestReading = await ctx.db.sensorData.findFirst({
            where: { sensorId: sensor.id },
            orderBy: { timestamp: 'desc' },
          });

          return {
            ...sensor,
            latestReading,
            status: sensor.isActive 
              ? (latestReading && new Date().getTime() - latestReading.timestamp.getTime() < 300000 ? 'ONLINE' : 'OFFLINE')
              : 'INACTIVE',
          };
        })
      );

      return {
        sensors: sensorsWithLatestData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  /**
   * Get sensor by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const sensor = await ctx.db.sensorStream.findUnique({
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

      if (!sensor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sensor not found',
        });
      }

      // Get latest reading
      const latestReading = await ctx.db.sensorData.findFirst({
        where: { sensorId: sensor.id },
        orderBy: { timestamp: 'desc' },
      });

      // Get recent readings for trend
      const recentReadings = await ctx.db.sensorData.findMany({
        where: { 
          sensorId: sensor.id,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      return {
        ...sensor,
        latestReading,
        recentReadings,
        status: sensor.isActive 
          ? (latestReading && new Date().getTime() - latestReading.timestamp.getTime() < 300000 ? 'ONLINE' : 'OFFLINE')
          : 'INACTIVE',
      };
    }),

  /**
   * Create new sensor
   */
  create: managerProcedure
    .input(createSensorSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify asset exists
      const asset = await ctx.db.asset.findUnique({
        where: { id: input.assetId },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Asset not found',
        });
      }

      // Check if device ID already exists
      const existingSensor = await ctx.db.sensorStream.findFirst({
        where: { deviceId: input.deviceId },
      });

      if (existingSensor) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Sensor with this device ID already exists',
        });
      }

      const sensor = await ctx.db.sensorStream.create({
        data: input,
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              assetTag: true,
              location: {
                select: { name: true },
              },
            },
          },
        },
      });

      return sensor;
    }),

  /**
   * Update sensor
   */
  update: managerProcedure
    .input(updateSensorSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify sensor exists
      const existingSensor = await ctx.db.sensorStream.findUnique({
        where: { id },
      });

      if (!existingSensor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sensor not found',
        });
      }

      // Verify asset exists if provided
      if (updateData.assetId) {
        const asset = await ctx.db.asset.findUnique({
          where: { id: updateData.assetId },
        });

        if (!asset) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Asset not found',
          });
        }
      }

      // Check if device ID already exists (if being changed)
      if (updateData.deviceId && updateData.deviceId !== existingSensor.deviceId) {
        const duplicateSensor = await ctx.db.sensorStream.findFirst({
          where: { 
            deviceId: updateData.deviceId,
            id: { not: id },
          },
        });

        if (duplicateSensor) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Sensor with this device ID already exists',
          });
        }
      }

      const sensor = await ctx.db.sensorStream.update({
        where: { id },
        data: updateData,
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              assetTag: true,
              location: {
                select: { name: true },
              },
            },
          },
        },
      });

      return sensor;
    }),

  /**
   * Delete sensor
   */
  delete: managerProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Delete all sensor data first
      await ctx.db.sensorData.deleteMany({
        where: { sensorId: input.id },
      });

      // Delete the sensor
      await ctx.db.sensorStream.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Add sensor data reading
   */
  addReading: protectedProcedure
    .input(sensorDataSchema)
    .mutation(async ({ ctx, input }) => {
      const { sensorId, value, timestamp = new Date() } = input;

      // Verify sensor exists
      const sensor = await ctx.db.sensorStream.findUnique({
        where: { id: sensorId },
      });

      if (!sensor) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Sensor not found',
        });
      }

      // Check if value is within thresholds and create alerts if needed
      const isOutOfRange = 
        (sensor.alertThresholdMin !== null && value < sensor.alertThresholdMin) ||
        (sensor.alertThresholdMax !== null && value > sensor.alertThresholdMax);

      const reading = await ctx.db.sensorData.create({
        data: {
          sensorId,
          value,
          timestamp,
        },
      });

      // If out of range, you could create an alert here
      // This would require an Alert model in your schema

      return {
        ...reading,
        isAlert: isOutOfRange,
      };
    }),

  /**
   * Get sensor data with filtering
   */
  getData: protectedProcedure
    .input(sensorDataFilterSchema)
    .query(async ({ ctx, input }) => {
      const { sensorId, startDate, endDate, interval, limit } = input;

      const where: any = { sensorId };

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = startDate;
        if (endDate) where.timestamp.lte = endDate;
      }

      const data = await ctx.db.sensorData.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      // Group data by interval if needed
      if (interval !== 'MINUTE' && data.length > 0) {
        const groupedData = groupDataByInterval(data, interval);
        return groupedData;
      }

      return data;
    }),

  /**
   * Get sensor statistics
   */
  getStats: protectedProcedure
    .input(z.object({ 
      sensorId: z.string().cuid(),
      period: z.enum(['24h', '7d', '30d']).default('24h'),
    }))
    .query(async ({ ctx, input }) => {
      const { sensorId, period } = input;

      const periodMap = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };

      const startDate = new Date(Date.now() - periodMap[period]);

      const data = await ctx.db.sensorData.findMany({
        where: {
          sensorId,
          timestamp: { gte: startDate },
        },
        orderBy: { timestamp: 'asc' },
      });

      if (data.length === 0) {
        return {
          count: 0,
          min: null,
          max: null,
          avg: null,
          latest: null,
        };
      }

      const values = data.map(d => d.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const latest = data[data.length - 1];

      return {
        count: data.length,
        min,
        max,
        avg: Math.round(avg * 100) / 100,
        latest,
      };
    }),

  /**
   * Get sensors for dropdown/select
   */
  getForSelect: protectedProcedure
    .input(z.object({
      assetId: z.string().cuid().optional(),
      type: z.enum(['TEMPERATURE', 'PRESSURE', 'VIBRATION', 'FLOW', 'LEVEL', 'HUMIDITY', 'VOLTAGE', 'CURRENT', 'SPEED', 'OTHER']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const sensors = await ctx.db.sensorStream.findMany({
        where: {
          isActive: true,
          ...(input.assetId && { assetId: input.assetId }),
          ...(input.type && { type: input.type }),
        },
        select: {
          id: true,
          name: true,
          type: true,
          unit: true,
          asset: {
            select: { name: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      return sensors.map(sensor => ({
        id: sensor.id,
        name: `${sensor.name} (${sensor.asset.name}) - ${sensor.type}`,
        type: sensor.type,
        unit: sensor.unit,
      }));
    }),

  /**
   * Get dashboard overview
   */
  getDashboardOverview: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalSensors,
        activeSensors,
        onlineSensors,
        alertingSensors,
      ] = await Promise.all([
        ctx.db.sensorStream.count(),
        ctx.db.sensorStream.count({ where: { isActive: true } }),
        // This would need more complex logic to determine online status
        ctx.db.sensorStream.count({ where: { isActive: true } }),
        // This would need alert logic implementation
        0,
      ]);

      // Get recent sensor data for trending
      const recentData = await ctx.db.sensorData.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        include: {
          sensor: {
            select: { name: true, type: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      return {
        totalSensors,
        activeSensors,
        onlineSensors,
        alertingSensors,
        recentData,
      };
    }),
});

// Helper function to group data by interval
function groupDataByInterval(data: any[], interval: 'HOUR' | 'DAY') {
  const grouped = new Map();

  data.forEach(reading => {
    let key: string;
    const date = new Date(reading.timestamp);

    if (interval === 'HOUR') {
      key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    } else {
      key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    if (!grouped.has(key)) {
      grouped.set(key, {
        timestamp: reading.timestamp,
        values: [],
      });
    }

    grouped.get(key).values.push(reading.value);
  });

  return Array.from(grouped.values()).map(group => ({
    timestamp: group.timestamp,
    value: group.values.reduce((sum: number, val: number) => sum + val, 0) / group.values.length,
    count: group.values.length,
  }));
}