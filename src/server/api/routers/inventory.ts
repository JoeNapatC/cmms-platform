import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const inventoryRouter = createTRPCRouter({
  // Spare Parts Management
  getSpareParts: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        supplierId: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, supplierId, page, limit } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { partNumber: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(supplierId && { supplierId }),
      };

      const [spareParts, total] = await Promise.all([
        ctx.db.sparePart.findMany({
          where,
          include: {
            inventory: {
              include: {
                location: true,
              },
            },
            usage: {
              include: {
                workOrder: {
                  select: {
                    id: true,
                    title: true,
                    status: true,
                  },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy: { name: "asc" },
        }),
        ctx.db.sparePart.count({ where }),
      ]);

      return {
        spareParts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  getSparePartById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.sparePart.findUnique({
        where: { id: input.id },
        include: {
          inventory: {
            include: {
              location: true,
            },
          },
          usage: {
            include: {
              workOrder: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  createdAt: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  createSparePart: protectedProcedure
    .input(
      z.object({
        partNumber: z.string().min(1),
        name: z.string().min(1),
        description: z.string().optional(),
        unitCost: z.number().min(0),
        supplierId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.sparePart.create({
        data: input,
      });
    }),

  updateSparePart: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        partNumber: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        unitCost: z.number().min(0).optional(),
        supplierId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.sparePart.update({
        where: { id },
        data,
      });
    }),

  deleteSparePart: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.sparePart.delete({
        where: { id: input.id },
      });
    }),

  // Inventory Records Management
  getInventoryRecords: protectedProcedure
    .input(
      z.object({
        locationId: z.string().optional(),
        lowStock: z.boolean().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { locationId, lowStock, page, limit } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(locationId && { locationId }),
        ...(lowStock && {
          quantityOnHand: {
            lte: ctx.db.inventoryRecord.fields.reorderPoint,
          },
        }),
      };

      const [records, total] = await Promise.all([
        ctx.db.inventoryRecord.findMany({
          where,
          include: {
            part: true,
            location: true,
          },
          skip,
          take: limit,
          orderBy: { part: { name: "asc" } },
        }),
        ctx.db.inventoryRecord.count({ where }),
      ]);

      return {
        records,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  updateInventoryRecord: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        quantityOnHand: z.number().min(0).optional(),
        reorderPoint: z.number().min(0).optional(),
        safetyStock: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.inventoryRecord.update({
        where: { id },
        data,
      });
    }),

  createInventoryRecord: protectedProcedure
    .input(
      z.object({
        partId: z.string(),
        locationId: z.string(),
        quantityOnHand: z.number().min(0),
        reorderPoint: z.number().min(0),
        safetyStock: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inventoryRecord.create({
        data: input,
      });
    }),

  // Inventory Statistics
  getInventoryStats: protectedProcedure.query(async ({ ctx }) => {
    const [
      totalParts,
      totalLocations,
      lowStockCount,
      totalValue,
    ] = await Promise.all([
      ctx.db.sparePart.count(),
      ctx.db.inventoryRecord.groupBy({
        by: ["locationId"],
        _count: true,
      }).then((result) => result.length),
      ctx.db.inventoryRecord.count({
        where: {
          quantityOnHand: {
            lte: ctx.db.inventoryRecord.fields.reorderPoint,
          },
        },
      }),
      ctx.db.inventoryRecord.aggregate({
        _sum: {
          quantityOnHand: true,
        },
      }).then(async (result) => {
        // Calculate total value by joining with spare parts
        const records = await ctx.db.inventoryRecord.findMany({
          include: {
            part: {
              select: {
                unitCost: true,
              },
            },
          },
        });
        
        return records.reduce((sum, record) => {
          return sum + (record.quantityOnHand * Number(record.part.unitCost));
        }, 0);
      }),
    ]);

    return {
      totalParts,
      totalLocations,
      lowStockCount,
      totalValue,
    };
  }),

  // Part Usage History
  getPartUsageHistory: protectedProcedure
    .input(
      z.object({
        partId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { partId, startDate, endDate } = input;

      return ctx.db.workOrderPartUsage.findMany({
        where: {
          partId,
          ...(startDate && endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        },
        include: {
          workOrder: {
            select: {
              id: true,
              title: true,
              status: true,
              asset: {
                select: {
                  name: true,
                  location: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Low Stock Alert
  getLowStockItems: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.inventoryRecord.findMany({
      where: {
        quantityOnHand: {
          lte: ctx.db.inventoryRecord.fields.reorderPoint,
        },
      },
      include: {
        part: true,
        location: true,
      },
      orderBy: {
        quantityOnHand: "asc",
      },
    });
  }),

  // Bulk Operations
  bulkUpdateStock: protectedProcedure
    .input(
      z.object({
        updates: z.array(
          z.object({
            recordId: z.string(),
            quantityChange: z.number(),
            reason: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const results = await Promise.all(
        input.updates.map(async (update) => {
          const record = await ctx.db.inventoryRecord.findUnique({
            where: { id: update.recordId },
          });

          if (!record) {
            throw new Error(`Inventory record ${update.recordId} not found`);
          }

          const newQuantity = record.quantityOnHand + update.quantityChange;
          
          if (newQuantity < 0) {
            throw new Error(`Insufficient stock for record ${update.recordId}`);
          }

          return ctx.db.inventoryRecord.update({
            where: { id: update.recordId },
            data: {
              quantityOnHand: newQuantity,
            },
          });
        })
      );

      return results;
    }),
});