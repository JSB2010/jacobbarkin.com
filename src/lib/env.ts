/**
 * Environment variable validation
 *
 * This module provides a centralized way to validate and access environment variables.
 * It ensures that all required environment variables are present and correctly typed.
 */

import { z } from 'zod';

// Schema for client-side environment variables (NEXT_PUBLIC_*)
const clientEnvSchema = z.object({
  // Clerk authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/admin/dashboard'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/admin/dashboard'),

  // Site configuration
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Schema for server-side environment variables
const serverEnvSchema = z.object({
  // Clerk authentication
  CLERK_SECRET_KEY: z.string().optional(),

  // Resend email configuration
  RESEND_API_KEY: z.string().optional(),

  // Admin configuration
  ADMIN_EMAIL: z.string().email().optional(),

  // GitHub configuration
  GITHUB_TOKEN: z.string().optional(),
});

// Process client-side environment variables
const processClientEnv = () => {
  const clientEnv = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    return clientEnvSchema.parse(clientEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid client environment variables:', error.issues);
    }
    return clientEnvSchema.parse({});
  }
};

// Process server-side environment variables
const processServerEnv = () => {
  if (typeof window !== 'undefined') {
    return {} as z.infer<typeof serverEnvSchema>;
  }

  const serverEnv = {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  };

  try {
    return serverEnvSchema.parse(serverEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid server environment variables:', error.issues);
    }
    return serverEnvSchema.parse({});
  }
};

// Export validated environment variables
export const env = {
  ...processClientEnv(),
  ...processServerEnv(),
};

// Export schemas for use in other modules
export const schemas = {
  clientEnvSchema,
  serverEnvSchema,
};

// Export types
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type Env = ClientEnv & ServerEnv;