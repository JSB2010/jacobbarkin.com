import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/auth";
import { getD1Database } from "@/lib/db/d1";
import { ingestTelemetryPayloads, parsePublicJsonBody } from "@/lib/embed/ingestion";
import {
  buildSessionFingerprint,
  deriveInstallationId,
  getUrlParts,
  normalizeEventName,
  parseBooleanInt,
  parseNumber,
  truncateText,
  type EmbedTelemetryPayload,
} from "@/lib/embed/utils";

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
  const pageHost = truncateText(body.page_host, 255) || pageParts?.host || "unknown";
  const siteKey = truncateText(body.site_key || body.site || body.data_site, 128);
  const installationId = truncateText(body.installation_id, 128) || deriveInstallationId(siteKey, pageHost);
  const sessionFingerprint = buildSessionFingerprint(ipAddress, userAgent, pageHost);
  const sessionId = truncateText(body.session_id, 128) || `sess_${sessionFingerprint.slice(0, 20)}`;

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
    event_name: normalizeEventName(body.event_name || "heartbeat"),
    event_type: "heartbeat",
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

    const payload = await parsePublicJsonBody(request);
    const bodies = Array.isArray(payload) ? payload : Array.isArray(payload?.events) ? payload.events : [payload];
    const telemetryPayloads: EmbedTelemetryPayload[] = [];
    let invalidCount = 0;

    for (const body of bodies) {
      const telemetryPayload = toTelemetryPayload(body || {}, request, new Date().toISOString());
      if (!telemetryPayload) {
        invalidCount += 1;
        continue;
      }

      telemetryPayloads.push(telemetryPayload);
    }

    const ids = await ingestTelemetryPayloads(db, telemetryPayloads);

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
    console.error("Error recording embed heartbeat:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to record heartbeat" },
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

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(parseInt(searchParams.get("limit") || "50"), 250));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));
    const days = Math.max(1, Math.min(parseInt(searchParams.get("days") || "30"), 365));
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
         SUM(CASE WHEN first_seen >= ? THEN 1 ELSE 0 END) as new_sites,
         SUM(CASE WHEN last_seen >= ? THEN 1 ELSE 0 END) as active_24h,
         SUM(CASE WHEN last_seen >= ? THEN 1 ELSE 0 END) as active_7d,
         SUM(CASE WHEN last_seen >= ? THEN 1 ELSE 0 END) as active_30d,
         SUM(CASE WHEN last_seen >= ? THEN 1 ELSE 0 END) as active_90d
       FROM embed_installations`
    ).bind(startDateStr, date24h, date7d, date30d, date90d).first<{
      total_sites: number;
      new_sites: number;
      active_24h: number;
      active_7d: number;
      active_30d: number;
      active_90d: number;
    }>();

    const countResult = await db.prepare(
      `SELECT COUNT(*) as count FROM embed_installations WHERE last_seen >= ?`
    ).bind(startDateStr).first<{ count: number }>();

    const sitesResult = await db.prepare(
      `SELECT
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
         NULL as last_embed_instance_id,
         last_is_auto,
         last_language,
         last_timezone_offset,
         last_viewport_width,
         last_viewport_height,
         last_device_type,
         last_connection_type,
         heartbeat_count
       FROM embed_installations
       WHERE last_seen >= ?
       ORDER BY last_seen DESC
       LIMIT ? OFFSET ?`
    ).bind(startDateStr, limit, offset).all();

    return NextResponse.json({
      success: true,
      stats: {
        total_sites: toNumber(statsResult?.total_sites),
        new_sites: toNumber(statsResult?.new_sites),
        active_24h: toNumber(statsResult?.active_24h),
        active_7d: toNumber(statsResult?.active_7d),
        active_30d: toNumber(statsResult?.active_30d),
        active_90d: toNumber(statsResult?.active_90d),
      },
      sites: sitesResult.results || [],
      total: toNumber(countResult?.count),
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
