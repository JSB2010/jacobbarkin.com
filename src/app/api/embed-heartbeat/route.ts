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

interface EmbedHeartbeatSite {
  page_host: string;
  first_seen: string;
  last_seen: string;
  last_page_url: string | null;
  last_page_title: string | null;
  last_referrer: string | null;
  last_referrer_host: string | null;
  last_embed_version: string | null;
  last_embed_variant: string | null;
  last_embed_size: string | null;
  last_embed_theme: string | null;
  last_embed_position: string | null;
  last_embed_align: string | null;
  last_embed_instance_id: string | null;
  last_is_auto: number | null;
  last_language: string | null;
  last_timezone_offset: number | null;
  last_viewport_width: number | null;
  last_viewport_height: number | null;
  last_device_type: string | null;
  last_connection_type: string | null;
  heartbeat_count: number;
}

interface HeartbeatStats {
  total_sites: number;
  new_sites: number;
  active_24h: number;
  active_7d: number;
  active_30d: number;
  active_90d: number;
}

interface UrlParts {
  host: string;
  path: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
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

function truncateText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseBooleanInt(value: unknown): number | null {
  if (value === true || value === "true" || value === 1 || value === "1") return 1;
  if (value === false || value === "false" || value === 0 || value === "0") return 0;
  return null;
}

function getUrlParts(value: string | null): UrlParts | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return {
      host: url.hostname,
      path: url.pathname || "/",
      utm_source: url.searchParams.get("utm_source"),
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      utm_term: url.searchParams.get("utm_term"),
      utm_content: url.searchParams.get("utm_content"),
    };
  } catch {
    return null;
  }
}

// Generate a unique ID
function generateId(): string {
  return `hb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// CORS headers for cross-origin requests (embed can be on any site)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// POST - Record a heartbeat event
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
    const pageUrl = truncateText(body.page_url, 2048);

    if (!pageUrl) {
      return NextResponse.json(
        { success: false, error: "page_url is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const pageParts = getUrlParts(pageUrl);
    const referrerValue = truncateText(body.referrer, 2048);
    const referrerParts = getUrlParts(referrerValue);

    const pageHost = truncateText(body.page_host, 255) || pageParts?.host || "unknown";
    const pagePath = truncateText(body.page_path, 1024) || pageParts?.path || null;
    const pageTitle = truncateText(body.page_title, 512);

    const referrerHost = truncateText(body.referrer_host, 255) || referrerParts?.host || null;

    const utmSource = truncateText(body.utm_source, 128) || pageParts?.utm_source || null;
    const utmMedium = truncateText(body.utm_medium, 128) || pageParts?.utm_medium || null;
    const utmCampaign = truncateText(body.utm_campaign, 128) || pageParts?.utm_campaign || null;
    const utmTerm = truncateText(body.utm_term, 128) || pageParts?.utm_term || null;
    const utmContent = truncateText(body.utm_content, 128) || pageParts?.utm_content || null;

    const embedVersion = truncateText(body.embed_version, 32);
    const embedVariant = truncateText(body.embed_variant, 32);
    const embedSize = truncateText(body.embed_size, 32);
    const embedTheme = truncateText(body.embed_theme, 16);
    const embedPosition = truncateText(body.embed_position, 16);
    const embedAlign = truncateText(body.embed_align, 16);
    const embedInstanceId = truncateText(body.embed_instance_id, 64);

    const isAuto = parseBooleanInt(body.is_auto) ?? 0;
    const language = truncateText(body.language, 32);
    const timezoneOffset = parseNumber(body.timezone_offset);
    const viewportWidth = parseNumber(body.viewport_width);
    const viewportHeight = parseNumber(body.viewport_height);
    const deviceType = truncateText(body.device_type, 16);
    const connectionType = truncateText(body.connection_type, 16);

    const id = generateId();
    const now = new Date().toISOString();

    await db.prepare(
      `INSERT INTO embed_heartbeat (
         id,
         page_url,
         page_host,
         page_path,
         page_title,
         referrer,
         referrer_host,
         utm_source,
         utm_medium,
         utm_campaign,
         utm_term,
         utm_content,
         embed_version,
         embed_variant,
         embed_size,
         embed_theme,
         embed_position,
         embed_align,
         embed_instance_id,
         is_auto,
         language,
         timezone_offset,
         viewport_width,
         viewport_height,
         device_type,
         connection_type,
         created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      pageUrl,
      pageHost,
      pagePath,
      pageTitle,
      referrerValue,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      embedVersion,
      embedVariant,
      embedSize,
      embedTheme,
      embedPosition,
      embedAlign,
      embedInstanceId,
      isAuto,
      language,
      timezoneOffset,
      viewportWidth,
      viewportHeight,
      deviceType,
      connectionType,
      now
    ).run();

    await db.prepare(
      `INSERT INTO embed_sites (
         page_host,
         first_seen,
         last_seen,
         last_page_url,
         last_page_title,
         last_referrer,
         last_referrer_host,
         last_embed_version,
         last_embed_variant,
         last_embed_size,
         last_embed_theme,
         last_embed_position,
         last_embed_align,
         last_embed_instance_id,
         last_is_auto,
         last_language,
         last_timezone_offset,
         last_viewport_width,
         last_viewport_height,
         last_device_type,
         last_connection_type,
         heartbeat_count
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(page_host) DO UPDATE SET
         last_seen = excluded.last_seen,
         last_page_url = excluded.last_page_url,
         last_page_title = excluded.last_page_title,
         last_referrer = excluded.last_referrer,
         last_referrer_host = excluded.last_referrer_host,
         last_embed_version = excluded.last_embed_version,
         last_embed_variant = excluded.last_embed_variant,
         last_embed_size = excluded.last_embed_size,
         last_embed_theme = excluded.last_embed_theme,
         last_embed_position = excluded.last_embed_position,
         last_embed_align = excluded.last_embed_align,
         last_embed_instance_id = excluded.last_embed_instance_id,
         last_is_auto = excluded.last_is_auto,
         last_language = excluded.last_language,
         last_timezone_offset = excluded.last_timezone_offset,
         last_viewport_width = excluded.last_viewport_width,
         last_viewport_height = excluded.last_viewport_height,
         last_device_type = excluded.last_device_type,
         last_connection_type = excluded.last_connection_type,
         heartbeat_count = embed_sites.heartbeat_count + 1`
    ).bind(
      pageHost,
      now,
      now,
      pageUrl,
      pageTitle,
      referrerValue,
      referrerHost,
      embedVersion,
      embedVariant,
      embedSize,
      embedTheme,
      embedPosition,
      embedAlign,
      embedInstanceId,
      isAuto,
      language,
      timezoneOffset,
      viewportWidth,
      viewportHeight,
      deviceType,
      connectionType,
      1
    ).run();

    return NextResponse.json(
      { success: true, id },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error recording embed heartbeat:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to record heartbeat" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET - Retrieve heartbeat summary (admin only)
export async function GET(request: NextRequest) {
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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const days = parseInt(searchParams.get("days") || "30");

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const startDateStr = startDate.toISOString();

    const date24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const date7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const date30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const date90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const statsResult = await db.prepare(
      `SELECT
         COUNT(*) as total_sites,
         SUM(CASE WHEN last_seen >= ? THEN 1 ELSE 0 END) as active_24h,
         SUM(CASE WHEN last_seen >= ? THEN 1 ELSE 0 END) as active_7d,
         SUM(CASE WHEN last_seen >= ? THEN 1 ELSE 0 END) as active_30d,
         SUM(CASE WHEN last_seen >= ? THEN 1 ELSE 0 END) as active_90d
       FROM embed_sites`
    ).bind(date24h, date7d, date30d, date90d).first<HeartbeatStats>();

    const newSitesResult = await db.prepare(
      `SELECT COUNT(*) as new_sites FROM embed_sites WHERE first_seen >= ?`
    ).bind(startDateStr).first<{ new_sites: number }>();

    const countResult = await db.prepare(
      `SELECT COUNT(*) as count FROM embed_sites WHERE last_seen >= ?`
    ).bind(startDateStr).first<{ count: number }>();

    const sitesResult = await db.prepare(
      `SELECT * FROM embed_sites
       WHERE last_seen >= ?
       ORDER BY last_seen DESC
       LIMIT ? OFFSET ?`
    ).bind(startDateStr, limit, offset).all<EmbedHeartbeatSite>();

    const stats: HeartbeatStats = {
      total_sites: Number(statsResult?.total_sites || 0),
      new_sites: Number(newSitesResult?.new_sites || 0),
      active_24h: Number(statsResult?.active_24h || 0),
      active_7d: Number(statsResult?.active_7d || 0),
      active_30d: Number(statsResult?.active_30d || 0),
      active_90d: Number(statsResult?.active_90d || 0),
    };

    return NextResponse.json({
      success: true,
      stats,
      sites: sitesResult.results || [],
      total: Number(countResult?.count || 0),
      limit,
      offset,
      days,
    });
  } catch (error) {
    console.error("Error fetching embed heartbeat:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch heartbeat" },
      { status: 500 }
    );
  }
}
