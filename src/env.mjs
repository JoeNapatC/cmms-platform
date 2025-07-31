/**
 * Environment Variables Validation
 * Validates and types environment variables using Zod
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === 'production'
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url(),
    ),
    JWT_SECRET: z.string().min(32),
    REDIS_URL: z.string().url().optional(),
    UPLOAD_MAX_SIZE: z.string().default('10MB'),
    AI_SERVICE_URL: z.string().url().optional(),
    AI_SERVICE_API_KEY: z.string().optional(),
    ERP_API_URL: z.string().url().optional(),
    ERP_API_KEY: z.string().optional(),
    IOT_PLATFORM_URL: z.string().url().optional(),
    IOT_PLATFORM_API_KEY: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE,
    AI_SERVICE_URL: process.env.AI_SERVICE_URL,
    AI_SERVICE_API_KEY: process.env.AI_SERVICE_API_KEY,
    ERP_API_URL: process.env.ERP_API_URL,
    ERP_API_KEY: process.env.ERP_API_KEY,
    IOT_PLATFORM_URL: process.env.IOT_PLATFORM_URL,
    IOT_PLATFORM_API_KEY: process.env.IOT_PLATFORM_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  /**
   * Run `build` or `dev` with SKIP_ENV_VALIDATION to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});