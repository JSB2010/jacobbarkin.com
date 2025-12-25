/**
 * Environment variable validation
 * 
 * This module provides a centralized way to validate and access environment variables.
 * It ensures that all required environment variables are present and correctly typed.
 */

import { z } from 'zod';

// Schema for client-side environment variables (NEXT_PUBLIC_*)
const clientEnvSchema = z.object({
  // Appwrite configuration
  NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url().default('https://nyc.cloud.appwrite.io/v1'),
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: z.string().min(1).default('6816ef35001da24d113d'),
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: z.string().min(1).default('contact-form-db'),
  NEXT_PUBLIC_APPWRITE_CONTACT_COLLECTION_ID: z.string().min(1).default('contact-submissions'),
  
  // Logging configuration
  NEXT_PUBLIC_ENABLE_APPWRITE_LOGGING: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  NEXT_PUBLIC_APPWRITE_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('error'),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Schema for server-side environment variables
const serverEnvSchema = z.object({
  // Appwrite server configuration
  APPWRITE_ENDPOINT: z.string().url().default('https://nyc.cloud.appwrite.io/v1'),
  APPWRITE_PROJECT_ID: z.string().min(1).default('6816ef35001da24d113d'),
  APPWRITE_API_KEY: z.string().min(1).optional(),
  APPWRITE_DATABASE_ID: z.string().min(1).default('contact-form-db'),
  APPWRITE_CONTACT_COLLECTION_ID: z.string().min(1).default('contact-submissions'),
  
  // Email configuration
  EMAIL_USER: z.string().email().default('jacobsamuelbarkin@gmail.com'),
  EMAIL_PASSWORD: z.string().min(1).optional(),
  
  // Admin configuration
  ADMIN_API_KEY: z.string().min(1).default('admin-secret-key'),
  
  // GitHub configuration
  GITHUB_TOKEN: z.string().min(1).optional(),
});

// Process client-side environment variables
const processClientEnv = () => {
  // In server components, we can access process.env directly
  // In client components, we can only access NEXT_PUBLIC_* variables
  const clientEnv = {
    NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    NEXT_PUBLIC_APPWRITE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    NEXT_PUBLIC_APPWRITE_CONTACT_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_CONTACT_COLLECTION_ID,
    NEXT_PUBLIC_ENABLE_APPWRITE_LOGGING: process.env.NEXT_PUBLIC_ENABLE_APPWRITE_LOGGING,
    NEXT_PUBLIC_APPWRITE_LOG_LEVEL: process.env.NEXT_PUBLIC_APPWRITE_LOG_LEVEL,
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    return clientEnvSchema.parse(clientEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError<unknown>;
      const missingVars = zodError.issues
        .filter(err => err.code === 'invalid_type' && (err as { received?: string }).received === 'undefined')
        .map(err => err.path.join('.'));

      const invalidVars = zodError.issues
        .filter(err => err.code !== 'invalid_type' || (err as { received?: string }).received !== 'undefined')
        .map(err => `${err.path.join('.')}: ${err.message}`);
      
      console.error('❌ Invalid client environment variables:');
      if (missingVars.length > 0) {
        console.error('Missing variables:', missingVars.join(', '));
      }
      if (invalidVars.length > 0) {
        console.error('Invalid variables:', invalidVars.join(', '));
      }
    } else {
      console.error('❌ Error validating client environment variables:', error);
    }
    
    // Return default values for client-side env vars
    return clientEnvSchema.parse({});
  }
};

// Process server-side environment variables
const processServerEnv = () => {
  // Only process server-side variables in a server context
  if (typeof window !== 'undefined') {
    return {} as z.infer<typeof serverEnvSchema>;
  }
  
  const serverEnv = {
    APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
    APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID,
    APPWRITE_CONTACT_COLLECTION_ID: process.env.APPWRITE_CONTACT_COLLECTION_ID,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    ADMIN_API_KEY: process.env.ADMIN_API_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  };

  try {
    return serverEnvSchema.parse(serverEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError<unknown>;
      const missingVars = zodError.issues
        .filter(err => err.code === 'invalid_type' && (err as { received?: string }).received === 'undefined')
        .map(err => err.path.join('.'));

      const invalidVars = zodError.issues
        .filter(err => err.code !== 'invalid_type' || (err as { received?: string }).received !== 'undefined')
        .map(err => `${err.path.join('.')}: ${err.message}`);

      console.error('❌ Invalid server environment variables:');
      if (missingVars.length > 0) {
        console.error('Missing variables:', missingVars.join(', '));
      }
      if (invalidVars.length > 0) {
        console.error('Invalid variables:', invalidVars.join(', '));
      }
    } else {
      console.error('❌ Error validating server environment variables:', error);
    }
    
    // Return default values for server-side env vars
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