import { NextRequest, NextResponse } from "next/server";

import { getD1Database } from "@/lib/db/d1";
import { buildEventWhereClause, buildWhereClause, getDistinctValues, getReportFilters, requireAdmin } from "@/lib/embed/reporting";

export async function GET(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ success: true, overview: null });
  }

  const filters = getReportFilters(request);
  const { clause, bindings } = buildWhereClause(filters);
  const previousStart = new Date();
  previousStart.setUTCDate(previousStart.getUTCDate() - filters.days * 2);
  const previousEnd = new Date();
  previousEnd.setUTCDate(previousEnd.getUTCDate() - filters.days);

  const current = await db.prepare(
    `SELECT
       SUM(loads) AS loads,
       SUM(impressions) AS impressions,
       SUM(clicks) AS clicks,
       SUM(heartbeats) AS heartbeats,
       SUM(errors) AS errors,
       SUM(replacement_applied) AS replacement_applied,
       SUM(replacement_skipped) AS replacement_skipped,
       COUNT(DISTINCT installation_id) AS active_installations
     FROM embed_daily_metrics
     WHERE ${clause}`
  ).bind(...bindings).first<Record<string, number>>();

  const previous = await db.prepare(
    `SELECT
       SUM(loads) AS loads,
       SUM(impressions) AS impressions,
       SUM(clicks) AS clicks,
       SUM(heartbeats) AS heartbeats,
       SUM(errors) AS errors,
       SUM(replacement_applied) AS replacement_applied,
       SUM(replacement_skipped) AS replacement_skipped,
       COUNT(DISTINCT installation_id) AS active_installations
     FROM embed_daily_metrics
     WHERE metric_date >= ? AND metric_date < ?`
  ).bind(previousStart.toISOString().slice(0, 10), previousEnd.toISOString().slice(0, 10)).first<Record<string, number>>();

  const eventFilters = buildEventWhereClause(filters);
  const uniqueSessions = await db.prepare(
    `SELECT COUNT(DISTINCT session_id) AS count
     FROM embed_events
     WHERE ${eventFilters.clause}`
  ).bind(...eventFilters.bindings).first<{ count: number }>();

  const previousSessions = await db.prepare(
    `SELECT COUNT(DISTINCT session_id) AS count
     FROM embed_events
     WHERE created_at >= ? AND created_at < ?`
  ).bind(previousStart.toISOString(), previousEnd.toISOString()).first<{ count: number }>();

  const topMovers = await db.prepare(
    `SELECT
       page_host,
       SUM(impressions) AS impressions,
       SUM(clicks) AS clicks,
       SUM(heartbeats) AS heartbeats
     FROM embed_daily_metrics
     WHERE ${clause}
     GROUP BY page_host
     ORDER BY impressions DESC, clicks DESC
     LIMIT 5`
  ).bind(...bindings).all();

  const alerts = await db.prepare(
    `SELECT
       installation_id,
       page_host,
       last_seen,
       last_embed_version,
       event_count
     FROM embed_installations
     ORDER BY last_seen ASC
     LIMIT 5`
  ).all();

  const variants = await getDistinctValues(db, "embed_variant");
  const hosts = await getDistinctValues(db, "page_host");
  const devices = await getDistinctValues(db, "device_type");
  const versions = await getDistinctValues(db, "embed_version");

  const toNumber = (value: unknown) => Number(value || 0);
  const pct = (curr: number, prev: number) => (prev > 0 ? (curr - prev) / prev : curr > 0 ? 1 : 0);

  const currentImpressions = toNumber(current?.impressions);
  const currentClicks = toNumber(current?.clicks);
  const previousImpressions = toNumber(previous?.impressions);
  const previousClicks = toNumber(previous?.clicks);

  return NextResponse.json({
    success: true,
    overview: {
      current: {
        loads: toNumber(current?.loads),
        impressions: currentImpressions,
        clicks: currentClicks,
        ctr: currentImpressions > 0 ? currentClicks / currentImpressions : 0,
        heartbeats: toNumber(current?.heartbeats),
        errors: toNumber(current?.errors),
        replacement_applied: toNumber(current?.replacement_applied),
        replacement_skipped: toNumber(current?.replacement_skipped),
        active_installations: toNumber(current?.active_installations),
        unique_sessions: toNumber(uniqueSessions?.count),
      },
      deltas: {
        loads: pct(toNumber(current?.loads), toNumber(previous?.loads)),
        impressions: pct(currentImpressions, previousImpressions),
        clicks: pct(currentClicks, previousClicks),
        ctr: pct(
          currentImpressions > 0 ? currentClicks / currentImpressions : 0,
          previousImpressions > 0 ? previousClicks / previousImpressions : 0
        ),
        unique_sessions: pct(toNumber(uniqueSessions?.count), toNumber(previousSessions?.count)),
        heartbeats: pct(toNumber(current?.heartbeats), toNumber(previous?.heartbeats)),
        errors: pct(toNumber(current?.errors), toNumber(previous?.errors)),
      },
      top_movers: topMovers.results || [],
      alerts: alerts.results || [],
    },
    filters: {
      hosts,
      variants,
      devices,
      versions,
    },
  });
}
