import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getD1Database } from "@/lib/db/d1";

interface EmbedAnalyticsRow {
  id: string;
  page_url: string;
  page_host: string | null;
  page_path: string | null;
  page_title: string | null;
  referrer: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  user_agent: string | null;
  ip_address: string | null;
  event_type: string;
  embed_version: string | null;
  embed_variant: string | null;
  embed_size: string | null;
  embed_theme: string | null;
  embed_position: string | null;
  embed_align: string | null;
  embed_instance_id: string | null;
  is_auto: number | null;
  language: string | null;
  timezone_offset: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  device_type: string | null;
  connection_type: string | null;
  created_at: string;
}

interface EmbedStats {
  impressions: number;
  clicks: number;
  unique_pages: number;
  unique_visitors: number;
  unique_domains: number;
  ctr: number;
  auto_impressions: number;
  auto_clicks: number;
}

interface TopPageRow {
  page_url: string;
  impressions: number;
  clicks: number;
}

interface TopReferrerRow {
  referrer: string;
  impressions: number;
  clicks: number;
}

interface TopDomainRow {
  page_host: string;
  impressions: number;
  clicks: number;
}

interface TopVariantRow {
  embed_variant: string;
  impressions: number;
  clicks: number;
}

interface TopDeviceRow {
  device_type: string;
  impressions: number;
  clicks: number;
}

interface TopCampaignRow {
  utm_campaign: string;
  impressions: number;
  clicks: number;
}

interface TopVersionRow {
  embed_version: string;
  impressions: number;
  clicks: number;
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
  return `emb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Vary"] = "Origin";
  } else {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get("origin")),
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
        { status: 500, headers: getCorsHeaders(request.headers.get("origin")) }
      );
    }

    const body = await request.json();
    const { page_url, referrer, event_type } = body;

    const pageUrl = truncateText(page_url, 2048);
    if (!pageUrl) {
      return NextResponse.json(
        { success: false, error: "page_url is required" },
        { status: 400, headers: getCorsHeaders(request.headers.get("origin")) }
      );
    }

    // Get client info from headers
    const ipAddress = request.headers.get("cf-connecting-ip") || 
                      request.headers.get("x-forwarded-for")?.split(",")[0] || 
                      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const id = generateId();
    const now = new Date().toISOString();

    const pageParts = getUrlParts(pageUrl);
    const referrerValue = truncateText(referrer, 2048);
    const referrerParts = getUrlParts(referrerValue);

    const resolvedPageHost = truncateText(body.page_host, 255) || pageParts?.host || null;
    const resolvedPagePath = truncateText(body.page_path, 1024) || pageParts?.path || null;
    const resolvedPageTitle = truncateText(body.page_title, 512);

    const resolvedReferrerHost = truncateText(body.referrer_host, 255) || referrerParts?.host || null;

    const resolvedUtmSource = truncateText(body.utm_source, 128) || pageParts?.utm_source || null;
    const resolvedUtmMedium = truncateText(body.utm_medium, 128) || pageParts?.utm_medium || null;
    const resolvedUtmCampaign = truncateText(body.utm_campaign, 128) || pageParts?.utm_campaign || null;
    const resolvedUtmTerm = truncateText(body.utm_term, 128) || pageParts?.utm_term || null;
    const resolvedUtmContent = truncateText(body.utm_content, 128) || pageParts?.utm_content || null;

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

    await db.prepare(
      `INSERT INTO embed_analytics (
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
         user_agent,
         ip_address,
         event_type,
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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      pageUrl,
      resolvedPageHost,
      resolvedPagePath,
      resolvedPageTitle,
      referrerValue,
      resolvedReferrerHost,
      resolvedUtmSource,
      resolvedUtmMedium,
      resolvedUtmCampaign,
      resolvedUtmTerm,
      resolvedUtmContent,
      userAgent,
      ipAddress,
      event_type || "impression",
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

    return NextResponse.json(
      { success: true, id },
      { status: 200, headers: getCorsHeaders(request.headers.get("origin")) }
    );
  } catch (error) {
    console.error("Error recording embed analytics:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to record analytics" },
      { status: 500, headers: getCorsHeaders(request.headers.get("origin")) }
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
         SUM(CASE WHEN event_type IN ('impression', 'view') THEN 1 ELSE 0 END) as impressions,
         SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks,
         COUNT(DISTINCT page_url) as unique_pages,
         COUNT(DISTINCT page_host) as unique_domains,
         COUNT(DISTINCT ip_address) as unique_visitors,
         SUM(CASE WHEN is_auto = 1 AND event_type IN ('impression', 'view') THEN 1 ELSE 0 END) as auto_impressions,
         SUM(CASE WHEN is_auto = 1 AND event_type = 'click' THEN 1 ELSE 0 END) as auto_clicks
       FROM embed_analytics 
       WHERE created_at >= ?`
    ).bind(startDateStr).first<{
      impressions: number;
      clicks: number;
      unique_pages: number;
      unique_domains: number;
      unique_visitors: number;
      auto_impressions: number;
      auto_clicks: number;
    }>();

    // Top pages by impressions
    const topPagesResult = await db.prepare(
      `SELECT 
         page_url,
         SUM(CASE WHEN event_type IN ('impression', 'view') THEN 1 ELSE 0 END) as impressions,
         SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks
       FROM embed_analytics
       WHERE created_at >= ?
       GROUP BY page_url
       ORDER BY impressions DESC, clicks DESC
       LIMIT 10`
    ).bind(startDateStr).all<TopPageRow>();

    // Top referrers by impressions
    const topReferrersResult = await db.prepare(
      `SELECT 
         COALESCE(NULLIF(referrer, ''), '(direct)') as referrer,
         SUM(CASE WHEN event_type IN ('impression', 'view') THEN 1 ELSE 0 END) as impressions,
         SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks
       FROM embed_analytics
       WHERE created_at >= ?
       GROUP BY COALESCE(NULLIF(referrer, ''), '(direct)')
       ORDER BY impressions DESC, clicks DESC
       LIMIT 10`
    ).bind(startDateStr).all<TopReferrerRow>();

    const topDomainsResult = await db.prepare(
      `SELECT 
         COALESCE(NULLIF(page_host, ''), '(unknown)') as page_host,
         SUM(CASE WHEN event_type IN ('impression', 'view') THEN 1 ELSE 0 END) as impressions,
         SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks
       FROM embed_analytics
       WHERE created_at >= ?
       GROUP BY COALESCE(NULLIF(page_host, ''), '(unknown)')
       ORDER BY impressions DESC, clicks DESC
       LIMIT 10`
    ).bind(startDateStr).all<TopDomainRow>();

    const topVariantsResult = await db.prepare(
      `SELECT 
         COALESCE(NULLIF(embed_variant, ''), '(unknown)') as embed_variant,
         SUM(CASE WHEN event_type IN ('impression', 'view') THEN 1 ELSE 0 END) as impressions,
         SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks
       FROM embed_analytics
       WHERE created_at >= ?
       GROUP BY COALESCE(NULLIF(embed_variant, ''), '(unknown)')
       ORDER BY impressions DESC, clicks DESC
       LIMIT 10`
    ).bind(startDateStr).all<TopVariantRow>();

    const topDevicesResult = await db.prepare(
      `SELECT 
         COALESCE(NULLIF(device_type, ''), '(unknown)') as device_type,
         SUM(CASE WHEN event_type IN ('impression', 'view') THEN 1 ELSE 0 END) as impressions,
         SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks
       FROM embed_analytics
       WHERE created_at >= ?
       GROUP BY COALESCE(NULLIF(device_type, ''), '(unknown)')
       ORDER BY impressions DESC, clicks DESC
       LIMIT 10`
    ).bind(startDateStr).all<TopDeviceRow>();

    const topCampaignsResult = await db.prepare(
      `SELECT 
         COALESCE(NULLIF(utm_campaign, ''), '(none)') as utm_campaign,
         SUM(CASE WHEN event_type IN ('impression', 'view') THEN 1 ELSE 0 END) as impressions,
         SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks
       FROM embed_analytics
       WHERE created_at >= ?
       GROUP BY COALESCE(NULLIF(utm_campaign, ''), '(none)')
       ORDER BY impressions DESC, clicks DESC
       LIMIT 10`
    ).bind(startDateStr).all<TopCampaignRow>();

    const topVersionsResult = await db.prepare(
      `SELECT 
         COALESCE(NULLIF(embed_version, ''), '(unknown)') as embed_version,
         SUM(CASE WHEN event_type IN ('impression', 'view') THEN 1 ELSE 0 END) as impressions,
         SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks
       FROM embed_analytics
       WHERE created_at >= ?
       GROUP BY COALESCE(NULLIF(embed_version, ''), '(unknown)')
       ORDER BY impressions DESC, clicks DESC
       LIMIT 10`
    ).bind(startDateStr).all<TopVersionRow>();

    const impressions = Number(statsResult?.impressions || 0);
    const clicks = Number(statsResult?.clicks || 0);
    const stats: EmbedStats = {
      impressions,
      clicks,
      unique_pages: Number(statsResult?.unique_pages || 0),
      unique_domains: Number(statsResult?.unique_domains || 0),
      unique_visitors: Number(statsResult?.unique_visitors || 0),
      ctr: impressions > 0 ? clicks / impressions : 0,
      auto_impressions: Number(statsResult?.auto_impressions || 0),
      auto_clicks: Number(statsResult?.auto_clicks || 0),
    };

    const analytics = (result.results as EmbedAnalyticsRow[] | undefined || []).map((entry) => ({
      ...entry,
      event_type: entry.event_type === "view" ? "impression" : entry.event_type,
    }));

    const topPages = (topPagesResult.results || []).map((row) => ({
      ...row,
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
    }));

    const topReferrers = (topReferrersResult.results || []).map((row) => ({
      ...row,
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
    }));

    const topDomains = (topDomainsResult.results || []).map((row) => ({
      ...row,
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
    }));

    const topVariants = (topVariantsResult.results || []).map((row) => ({
      ...row,
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
    }));

    const topDevices = (topDevicesResult.results || []).map((row) => ({
      ...row,
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
    }));

    const topCampaigns = (topCampaignsResult.results || []).map((row) => ({
      ...row,
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
    }));

    const topVersions = (topVersionsResult.results || []).map((row) => ({
      ...row,
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
    }));

    return NextResponse.json({
      success: true,
      analytics,
      total: Number(countResult?.count || 0),
      stats,
      top_pages: topPages,
      top_referrers: topReferrers,
      top_domains: topDomains,
      top_variants: topVariants,
      top_devices: topDevices,
      top_campaigns: topCampaigns,
      top_versions: topVersions,
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
