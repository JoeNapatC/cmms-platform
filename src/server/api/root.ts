/**
 * Main tRPC Router
 * Combines all API routers into a single app router
 */

import { createTRPCRouter } from '@/server/api/trpc';
import { assetRouter } from '@/server/api/routers/asset';
import { workOrderRouter } from '@/server/api/routers/workOrder';
import { dashboardRouter } from '@/server/api/routers/dashboard';
import { maintenanceRouter } from '@/server/api/routers/maintenance';
import { inventoryRouter } from '@/server/api/routers/inventory';
import { authRouter } from '@/server/api/routers/auth';
import { locationRouter } from '@/server/api/routers/location';
import { categoryRouter } from '@/server/api/routers/category';
import { teamRouter } from '@/server/api/routers/team';
import { sensorRouter } from '@/server/api/routers/sensor';
import { reportRouter } from '@/server/api/routers/reports';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  asset: assetRouter,
  workOrder: workOrderRouter,
  dashboard: dashboardRouter,
  maintenance: maintenanceRouter,
  inventory: inventoryRouter,
  location: locationRouter,
  category: categoryRouter,
  team: teamRouter,
  sensor: sensorRouter,
  reports: reportRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;