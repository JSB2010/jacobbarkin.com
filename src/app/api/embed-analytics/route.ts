import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getD1Database } from "@/lib/db/d1";
import {
  buildSessionFingerprint,
  createMetricIncrement,
  deriveInstallationId,
  generateId,
  getUrlParts,
  incrementDailyMetric,
  insertEmbedEvent,
  normalizeEventName,
  parseBooleanInt,
  parseNumber,
  truncateText,
  upsertInstallation,
  type EmbedTelemetryPayload,
} from "@/lib/embed/utils";

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

    const payload = await request.json();
    const bodies = Array.isArray(payload) ? payload : Array.isArray(payload?.events) ? payload.events : [payload];
    const ids: string[] = [];
    let invalidCount = 0;

    const ipAddress = request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    for (const body of bodies) {
      const pageUrl = truncateText(body?.page_url, 2048);
      if (!pageUrl) {
        invalidCount += 1;
        continue;
      }

      const id = generateId("emb");
      const now = new Date().toISOString();
      const pageParts = getUrlParts(pageUrl);
      const referrerValue = truncateText(body.referrer, 2048);
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
      const siteKey = truncateText(body.site_key || body.site || body.data_site, 128);
      const installationId = truncateText(body.installation_id, 128) || deriveInstallationId(siteKey, resolvedPageHost);
      const sessionFingerprint = buildSessionFingerprint(ipAddress, userAgent, resolvedPageHost);
      const sessionId = truncateText(body.session_id, 128) || `sess_${sessionFingerprint.slice(0, 20)}`;
      const pageViewId = truncateText(body.page_view_id, 128) || `pv_${sessionId}_${Date.now()}`;
      const eventName = normalizeEventName(body.event_name || body.event_type);
      const pageGroup = truncateText(body.page_group, 128);
      const experimentId = truncateText(body.experiment_id, 128);
      const variantKey = truncateText(body.variant_key, 128);
      const ruleId = truncateText(body.rule_id, 128);
      const templateId = truncateText(body.template_id, 128);
      const actionType = truncateText(body.action_type, 64);
      const errorCode = truncateText(body.error_code, 128);
      const loadMs = parseNumber(body.load_ms);
      const renderMs = parseNumber(body.render_ms);

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
           installation_id,
           session_id,
           page_view_id,
           event_name,
           site_key,
           page_group,
           experiment_id,
           variant_key,
           rule_id,
           template_id,
           action_type,
           load_ms,
           render_ms,
           error_code,
           language,
           timezone_offset,
           viewport_width,
           viewport_height,
           device_type,
           connection_type,
           created_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        body.event_type || eventName,
        embedVersion,
        embedVariant,
        embedSize,
        embedTheme,
        embedPosition,
        embedAlign,
        embedInstanceId,
        isAuto,
        installationId,
        sessionId,
        pageViewId,
        eventName,
        siteKey,
        pageGroup,
        experimentId,
        variantKey,
        ruleId,
        templateId,
        actionType,
        loadMs,
        renderMs,
        errorCode,
        language,
        timezoneOffset,
        viewportWidth,
        viewportHeight,
        deviceType,
        connectionType,
        now
      ).run();

      const telemetryPayload: EmbedTelemetryPayload = {
        page_url: pageUrl,
        page_host: resolvedPageHost,
        page_path: resolvedPagePath,
        page_title: resolvedPageTitle,
        referrer: referrerValue,
        referrer_host: resolvedReferrerHost,
        utm_source: resolvedUtmSource,
        utm_medium: resolvedUtmMedium,
        utm_campaign: resolvedUtmCampaign,
        utm_term: resolvedUtmTerm,
        utm_content: resolvedUtmContent,
        event_name: eventName,
        event_type: typeof body.event_type === "string" && body.event_type.trim() ? body.event_type : eventName,
        embed_version: embedVersion,
        embed_variant: embedVariant,
        embed_size: embedSize,
        embed_theme: embedTheme,
        embed_position: embedPosition,
        embed_align: embedAlign,
        embed_instance_id: embedInstanceId,
        is_auto: isAuto,
        language,
        timezone_offset: timezoneOffset,
        viewport_width: viewportWidth,
        viewport_height: viewportHeight,
        device_type: deviceType,
        connection_type: connectionType,
        installation_id: installationId,
        site_key: siteKey,
        session_id: sessionId,
        page_view_id: pageViewId,
        page_group: pageGroup,
        experiment_id: experimentId,
        variant_key: variantKey,
        rule_id: ruleId,
        template_id: templateId,
        action_type: actionType,
        error_code: errorCode,
        load_ms: loadMs,
        render_ms: renderMs,
        session_fingerprint: sessionFingerprint,
        created_at: now,
      };

      await insertEmbedEvent(db, generateId("evt"), telemetryPayload);
      await upsertInstallation(db, telemetryPayload);
      await incrementDailyMetric(db, createMetricIncrement(telemetryPayload));
      ids.push(id);
    }

    if (!ids.length) {
      return NextResponse.json(
        { success: false, error: invalidCount ? "No valid page_url values were provided" : "page_url is required" },
        { status: 400, headers: getCorsHeaders(request.headers.get("origin")) }
      );
    }

    return NextResponse.json(
      { success: true, id: ids[0], ids, accepted: ids.length, rejected: invalidCount },
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
         COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), ip_address)) as unique_visitors,
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
