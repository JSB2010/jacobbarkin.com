import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Type for D1 database
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
}

// Cloudflare env type
interface CloudflareEnv {
  DB: D1Database;
}

// Store start time when module is loaded
const START_TIME = Date.now();

// CORS headers for cross-origin requests
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Health check result type
type HealthStatus = "healthy" | "degraded" | "unhealthy";

interface HealthCheckResult {
  status: HealthStatus;
  statusCode: number;
  data: {
    status: HealthStatus;
    timestamp: string;
    uptime: number;
    responseTime: number;
    version: string;
    environment: {
      runtime: string;
      nodeVersion?: string;
      platform?: string;
    };
    checks: {
      database: {
        status: "ok" | "error" | "unavailable";
        message?: string;
        responseTime?: number;
      };
    };
    metrics?: {
      memoryUsage?: NodeJS.MemoryUsage;
    };
    error?: string;
  };
}

/**
 * Perform health check and return result with status code
 * This shared logic ensures GET and HEAD return consistent status codes
 */
async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  // Initialize health check response
  const health: HealthCheckResult["data"] = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Date.now() - START_TIME,
    responseTime: 0,
    version: (typeof process !== 'undefined' && process.env?.npm_package_version) || "unknown",
    environment: {
      runtime: "Cloudflare Workers",
      // These may not be available in all Workers environments
      ...(typeof process !== 'undefined' && process.version && { nodeVersion: process.version }),
      ...(typeof process !== 'undefined' && process.platform && { platform: process.platform }),
    },
    checks: {
      database: {
        status: "ok",
      },
    },
  };

  try {
    // Get Cloudflare context once for all checks
    let context;
    let env: CloudflareEnv | undefined;
    
    try {
      context = await getCloudflareContext({ async: true });
      env = (context as unknown as { env: CloudflareEnv }).env;
    } catch {
      // Context not available - likely in development mode
    }

    // Check database connectivity
    const dbStartTime = Date.now();
    try {
      if (env?.DB) {
        // Simple query to test database connectivity
        await env.DB.prepare("SELECT 1").first();
        health.checks.database.status = "ok";
        health.checks.database.responseTime = Date.now() - dbStartTime;
      } else {
        // Database is critical infrastructure - mark as unhealthy if unavailable
        health.checks.database.status = "unavailable";
        health.checks.database.message = "Database binding not found";
        health.status = "unhealthy";
      }
    } catch (dbError) {
      // Database is critical infrastructure - mark as unhealthy on error
      health.checks.database.status = "error";
      health.checks.database.message = dbError instanceof Error ? dbError.message : "Database check failed";
      health.checks.database.responseTime = Date.now() - dbStartTime;
      health.status = "unhealthy";
    }

    // Add memory usage if available
    if (typeof process !== 'undefined' && process.memoryUsage) {
      health.metrics = {
        memoryUsage: process.memoryUsage(),
      };
    }

    // Calculate total response time
    health.responseTime = Date.now() - startTime;

    // Return appropriate status code based on health
    const statusCode = health.status === "unhealthy" ? 503 : 200;

    return {
      status: health.status,
      statusCode,
      data: health,
    };
  } catch (error) {
    // If we hit a critical error, return unhealthy status
    health.status = "unhealthy";
    health.responseTime = Date.now() - startTime;
    health.error = error instanceof Error ? error.message : "Health check failed";
    
    return {
      status: "unhealthy",
      statusCode: 503,
      data: health,
    };
  }
}

/**
 * Health check endpoint for monitoring
 * 
 * This endpoint provides a fast, lightweight health check that:
 * - Returns 200 status when the service is healthy
 * - Includes minimal diagnostics to avoid false positives
 * - Tests critical dependencies (database)
 * - Provides useful debugging information
 * 
 * Perfect for use with Uptime Kuma or other monitoring tools
 */
export async function GET() {
  const result = await performHealthCheck();
  
  return NextResponse.json(result.data, {
    status: result.statusCode,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}

// Handle HEAD requests (some monitoring tools use HEAD for efficiency)
// Uses the same health check logic as GET to ensure consistent status codes
export async function HEAD() {
  const result = await performHealthCheck();
  
  return new NextResponse(null, {
    status: result.statusCode,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
