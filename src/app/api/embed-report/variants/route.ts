import { NextRequest, NextResponse } from "next/server";

import { getD1Database } from "@/lib/db/d1";
import { buildWhereClause, getReportFilters, requireAdmin } from "@/lib/embed/reporting";

export async function GET(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ success: true, variants: [] });
  }

  const filters = getReportFilters(request);
  const { clause, bindings } = buildWhereClause(filters);

  const variants = await db.prepare(
    `SELECT
       COALESCE(NULLIF(embed_variant, ''), '(unknown)') AS embed_variant,
       SUM(impressions) AS impressions,
       SUM(clicks) AS clicks,
       SUM(heartbeats) AS heartbeats
     FROM embed_daily_metrics
     WHERE ${clause}
     GROUP BY COALESCE(NULLIF(embed_variant, ''), '(unknown)')
     ORDER BY impressions DESC, clicks DESC`
  ).bind(...bindings).all();

  const versions = await db.prepare(
    `SELECT
       COALESCE(NULLIF(embed_version, ''), '(unknown)') AS embed_version,
       SUM(impressions) AS impressions,
       SUM(clicks) AS clicks
     FROM embed_daily_metrics
     WHERE ${clause}
     GROUP BY COALESCE(NULLIF(embed_version, ''), '(unknown)')
     ORDER BY impressions DESC, clicks DESC`
  ).bind(...bindings).all();

  const hosts = await db.prepare(
    `SELECT
       page_host,
       SUM(impressions) AS impressions,
       SUM(clicks) AS clicks
     FROM embed_daily_metrics
     WHERE ${clause}
     GROUP BY page_host
     HAVING SUM(impressions) > 0
     ORDER BY (CAST(SUM(clicks) AS REAL) / SUM(impressions)) DESC
     LIMIT 5`
  ).bind(...bindings).all();

  const laggards = await db.prepare(
    `SELECT
       page_host,
       SUM(impressions) AS impressions,
       SUM(clicks) AS clicks
     FROM embed_daily_metrics
     WHERE ${clause}
     GROUP BY page_host
     HAVING SUM(impressions) > 0
     ORDER BY (CAST(SUM(clicks) AS REAL) / SUM(impressions)) ASC
     LIMIT 5`
  ).bind(...bindings).all();

  return NextResponse.json({
    success: true,
    variants: variants.results || [],
    versions: versions.results || [],
    best_hosts: hosts.results || [],
    worst_hosts: laggards.results || [],
  });
}
