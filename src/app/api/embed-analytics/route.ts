import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/auth";
import { getD1Database } from "@/lib/db/d1";
import {
  buildSessionFingerprint,
  deriveInstallationId,
  generateId,
  getUrlParts,
  insertEmbedEvent,
  normalizeEventName,
  parseBooleanInt,
  parseNumber,
  truncateText,
  upsertInstallation,
  type EmbedTelemetryPayload,
} from "@/lib/embed/utils";

type AggregateRow = {
  impressions: number;
  clicks: number;
};

const publicCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: publicCorsHeaders });
}

function toTelemetryPayload(body: Record<string, unknown>, request: NextRequest, now: string): EmbedTelemetryPayload | null {
  const pageUrl = truncateText(body?.page_url, 2048);
  if (!pageUrl) return null;

  const ipAddress = request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const pageParts = getUrlParts(pageUrl);
  const referrerValue = truncateText(body.referrer, 2048);
  const referrerParts = getUrlParts(referrerValue);
  const pageHost = truncateText(body.page_host, 255) || pageParts?.host || null;
  const siteKey = truncateText(body.site_key || body.site || body.data_site, 128);
  const installationId = truncateText(body.installation_id, 128) || deriveInstallationId(siteKey, pageHost);
  const sessionFingerprint = buildSessionFingerprint(ipAddress, userAgent, pageHost);
  const sessionId = truncateText(body.session_id, 128) || `sess_${sessionFingerprint.slice(0, 20)}`;
  const eventName = normalizeEventName(body.event_name || body.event_type);

  return {
    page_url: pageUrl,
    page_host: pageHost,
    page_path: truncateText(body.page_path, 1024) || pageParts?.path || null,
    page_title: truncateText(body.page_title, 512),
    referrer: referrerValue,
    referrer_host: truncateText(body.referrer_host, 255) || referrerParts?.host || null,
    utm_source: truncateText(body.utm_source, 128) || pageParts?.utm_source || null,
    utm_medium: truncateText(body.utm_medium, 128) || pageParts?.utm_medium || null,
    utm_campaign: truncateText(body.utm_campaign, 128) || pageParts?.utm_campaign || null,
    utm_term: truncateText(body.utm_term, 128) || pageParts?.utm_term || null,
    utm_content: truncateText(body.utm_content, 128) || pageParts?.utm_content || null,
    event_name: eventName,
    event_type: typeof body.event_type === "string" && body.event_type.trim() ? body.event_type : eventName,
    embed_version: truncateText(body.embed_version, 32),
    embed_variant: truncateText(body.embed_variant, 32),
    embed_size: truncateText(body.embed_size, 32),
    embed_theme: truncateText(body.embed_theme, 16),
    embed_position: truncateText(body.embed_position, 16),
    embed_align: truncateText(body.embed_align, 16),
    embed_instance_id: truncateText(body.embed_instance_id, 64),
    is_auto: parseBooleanInt(body.is_auto) ?? 0,
    language: truncateText(body.language, 32),
    timezone_offset: parseNumber(body.timezone_offset),
    viewport_width: parseNumber(body.viewport_width),
    viewport_height: parseNumber(body.viewport_height),
    device_type: truncateText(body.device_type, 16),
    connection_type: truncateText(body.connection_type, 16),
    installation_id: installationId,
    site_key: siteKey,
    session_id: sessionId,
    page_view_id: truncateText(body.page_view_id, 128) || `pv_${sessionId}_${Date.now()}`,
    page_group: truncateText(body.page_group, 128),
    experiment_id: truncateText(body.experiment_id, 128),
    variant_key: truncateText(body.variant_key, 128),
    rule_id: truncateText(body.rule_id, 128),
    template_id: truncateText(body.template_id, 128),
    action_type: truncateText(body.action_type, 64),
    error_code: truncateText(body.error_code, 128),
    load_ms: parseNumber(body.load_ms),
    render_ms: parseNumber(body.render_ms),
    session_fingerprint: sessionFingerprint,
    created_at: now,
  };
}

export async function POST(request: NextRequest) {
  try {
    const db = await getD1Database();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 500, headers: publicCorsHeaders }
      );
    }

    const payload = await request.json();
    const bodies = Array.isArray(payload) ? payload : Array.isArray(payload?.events) ? payload.events : [payload];
    const ids: string[] = [];
    let invalidCount = 0;

    for (const body of bodies) {
      const telemetryPayload = toTelemetryPayload(body || {}, request, new Date().toISOString());
      if (!telemetryPayload) {
        invalidCount += 1;
        continue;
      }

      const id = generateId("evt");
      await insertEmbedEvent(db, id, telemetryPayload);
      await upsertInstallation(db, telemetryPayload);
      ids.push(id);
    }

    if (!ids.length) {
      return NextResponse.json(
        { success: false, error: invalidCount ? "No valid page_url values were provided" : "page_url is required" },
        { status: 400, headers: publicCorsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, id: ids[0], ids, accepted: ids.length, rejected: invalidCount },
      { status: 200, headers: publicCorsHeaders }
    );
  } catch (error) {
    console.error("Error recording embed analytics:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to record analytics" },
      { status: 500, headers: publicCorsHeaders }
    );
  }
}

function toNumber(value: unknown) {
  return Number(value || 0);
}

export async function GET(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getD1Database();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
    }
    const database = db;

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(parseInt(searchParams.get("limit") || "100"), 250));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));
    const days = Math.max(1, Math.min(parseInt(searchParams.get("days") || "30"), 365));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    const result = await database.prepare(
      `SELECT *
       FROM embed_events
       WHERE created_at >= ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(startDateStr, limit, offset).all();

    const countResult = await database.prepare(
      `SELECT COUNT(*) as count FROM embed_events WHERE created_at >= ?`
    ).bind(startDateStr).first<{ count: number }>();

    const statsResult = await database.prepare(
      `SELECT
         SUM(CASE WHEN event_name = 'impression' THEN 1 ELSE 0 END) as impressions,
         SUM(CASE WHEN event_name = 'click' THEN 1 ELSE 0 END) as clicks,
         COUNT(DISTINCT page_url) as unique_pages,
         COUNT(DISTINCT page_host) as unique_domains,
         COUNT(DISTINCT session_id) as unique_visitors,
         SUM(CASE WHEN is_auto = 1 AND event_name = 'impression' THEN 1 ELSE 0 END) as auto_impressions,
         SUM(CASE WHEN is_auto = 1 AND event_name = 'click' THEN 1 ELSE 0 END) as auto_clicks
       FROM embed_events
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

    async function topBy(column: string, fallback: string) {
      const result = await database.prepare(
        `SELECT
           COALESCE(NULLIF(${column}, ''), ?) as value,
           SUM(CASE WHEN event_name = 'impression' THEN 1 ELSE 0 END) as impressions,
           SUM(CASE WHEN event_name = 'click' THEN 1 ELSE 0 END) as clicks
         FROM embed_events
         WHERE created_at >= ?
         GROUP BY COALESCE(NULLIF(${column}, ''), ?)
         ORDER BY impressions DESC, clicks DESC
         LIMIT 10`
      ).bind(fallback, startDateStr, fallback).all<AggregateRow & { value: string }>();
      return result.results || [];
    }

    const [topPagesRaw, topReferrersRaw, topDomainsRaw, topVariantsRaw, topDevicesRaw, topCampaignsRaw, topVersionsRaw] = await Promise.all([
      topBy("page_url", "(unknown)"),
      topBy("referrer", "(direct)"),
      topBy("page_host", "(unknown)"),
      topBy("embed_variant", "(unknown)"),
      topBy("device_type", "(unknown)"),
      topBy("utm_campaign", "(none)"),
      topBy("embed_version", "(unknown)"),
    ]);

    const impressions = toNumber(statsResult?.impressions);
    const clicks = toNumber(statsResult?.clicks);
    const mapRows = <T extends string>(rows: (AggregateRow & { value: string })[], key: T) =>
      rows.map((row) => ({
        [key]: row.value,
        impressions: toNumber(row.impressions),
        clicks: toNumber(row.clicks),
      }));

    return NextResponse.json({
      success: true,
      analytics: result.results || [],
      total: toNumber(countResult?.count),
      stats: {
        impressions,
        clicks,
        unique_pages: toNumber(statsResult?.unique_pages),
        unique_domains: toNumber(statsResult?.unique_domains),
        unique_visitors: toNumber(statsResult?.unique_visitors),
        ctr: impressions > 0 ? clicks / impressions : 0,
        auto_impressions: toNumber(statsResult?.auto_impressions),
        auto_clicks: toNumber(statsResult?.auto_clicks),
      },
      top_pages: mapRows(topPagesRaw, "page_url"),
      top_referrers: mapRows(topReferrersRaw, "referrer"),
      top_domains: mapRows(topDomainsRaw, "page_host"),
      top_variants: mapRows(topVariantsRaw, "embed_variant"),
      top_devices: mapRows(topDevicesRaw, "device_type"),
      top_campaigns: mapRows(topCampaignsRaw, "utm_campaign"),
      top_versions: mapRows(topVersionsRaw, "embed_version"),
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
