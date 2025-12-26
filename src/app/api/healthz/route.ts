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
  SITE_URL?: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
}

// Store start time when module is loaded
const START_TIME = Date.now();

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
  const startTime = Date.now();
  
  // Initialize health check response
  const health: {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime: number;
    responseTime?: number;
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
      config: {
        status: "ok" | "error";
        message?: string;
      };
    };
    metrics?: {
      memoryUsage?: NodeJS.MemoryUsage;
    };
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Date.now() - START_TIME,
    version: process.env.npm_package_version || "unknown",
    environment: {
      runtime: "Cloudflare Workers",
      // These may not be available in all Workers environments
      ...(process.version && { nodeVersion: process.version }),
      ...(process.platform && { platform: process.platform }),
    },
    checks: {
      database: {
        status: "ok",
      },
      config: {
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
        health.checks.database.status = "unavailable";
        health.checks.database.message = "Database binding not found";
        health.status = "degraded";
      }
    } catch (dbError) {
      health.checks.database.status = "error";
      health.checks.database.message = dbError instanceof Error ? dbError.message : "Database check failed";
      health.checks.database.responseTime = Date.now() - dbStartTime;
      health.status = "degraded";
    }

    // Check environment configuration
    try {
      const requiredVars = [
        "SITE_URL",
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      ];
      
      const missingVars = requiredVars.filter(varName => !env?.[varName as keyof CloudflareEnv]);
      
      if (missingVars.length > 0) {
        health.checks.config.status = "error";
        health.checks.config.message = `Missing environment variables: ${missingVars.join(", ")}`;
        health.status = "degraded";
      }
    } catch (configError) {
      health.checks.config.status = "error";
      health.checks.config.message = configError instanceof Error ? configError.message : "Config check failed";
      health.status = "degraded";
    }

    // Add memory usage if available
    if (process.memoryUsage) {
      health.metrics = {
        memoryUsage: process.memoryUsage(),
      };
    }

    // Calculate total response time
    health.responseTime = Date.now() - startTime;

    // Return appropriate status code based on health
    const statusCode = health.status === "unhealthy" ? 503 : 200;

    return NextResponse.json(health, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // If we hit a critical error, return unhealthy status
    health.status = "unhealthy";
    health.responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        ...health,
        error: error instanceof Error ? error.message : "Health check failed",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// Handle HEAD requests (some monitoring tools use HEAD for efficiency)
export async function HEAD() {
  try {
    // Quick check - just verify we can respond
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
