import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Type for D1 database
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}

// Cloudflare env type
interface CloudflareEnv {
  DB: D1Database;
}

// Helper to get D1 database from Cloudflare context
async function getD1Database(): Promise<D1Database | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context as unknown as { env: CloudflareEnv }).env;
    return env?.DB || null;
  } catch {
    return null;
  }
}

// Generate a unique ID
function generateId(): string {
  return `emb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// CORS headers for cross-origin requests (embed can be on any site)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// POST - Record a new embed view/event
export async function POST(request: NextRequest) {
  try {
    const db = await getD1Database();

    if (!db) {
      console.error("D1 database not available");
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { page_url, referrer, event_type } = body;

    if (!page_url) {
      return NextResponse.json(
        { success: false, error: "page_url is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get client info from headers
    const ipAddress = request.headers.get("cf-connecting-ip") || 
                      request.headers.get("x-forwarded-for")?.split(",")[0] || 
                      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const id = generateId();
    const now = new Date().toISOString();

    await db.prepare(
      `INSERT INTO embed_analytics (id, page_url, referrer, user_agent, ip_address, event_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      page_url,
      referrer || null,
      userAgent,
      ipAddress,
      event_type || "view",
      now
    ).run();

    return NextResponse.json(
      { success: true, id },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error recording embed analytics:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to record analytics" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET - Retrieve embed analytics (admin only)
export async function GET(request: NextRequest) {
  // Check authentication for reading analytics
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getD1Database();

    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const days = parseInt(searchParams.get("days") || "30");

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Get analytics with pagination
    const result = await db.prepare(
      `SELECT * FROM embed_analytics 
       WHERE created_at >= ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`
    ).bind(startDateStr, limit, offset).all();

    // Get total count
    const countResult = await db.prepare(
      `SELECT COUNT(*) as count FROM embed_analytics WHERE created_at >= ?`
    ).bind(startDateStr).first<{ count: number }>();

    // Get aggregated stats
    const statsResult = await db.prepare(
      `SELECT 
         COUNT(*) as total_views,
         COUNT(DISTINCT page_url) as unique_pages,
         COUNT(DISTINCT ip_address) as unique_visitors
       FROM embed_analytics 
       WHERE created_at >= ?`
    ).bind(startDateStr).first<{ total_views: number; unique_pages: number; unique_visitors: number }>();

    return NextResponse.json({
      success: true,
      analytics: result.results || [],
      total: countResult?.count || 0,
      stats: statsResult || { total_views: 0, unique_pages: 0, unique_visitors: 0 },
      limit,
      offset,
      days,
    });
  } catch (error) {
    console.error("Error fetching embed analytics:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

