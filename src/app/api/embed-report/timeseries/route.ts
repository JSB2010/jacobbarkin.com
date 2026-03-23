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
    return NextResponse.json({ success: true, series: [] });
  }

  const filters = getReportFilters(request);
  const { clause, bindings } = buildWhereClause(filters);

  const result = await db.prepare(
    `SELECT
       metric_date,
       SUM(loads) AS loads,
       SUM(impressions) AS impressions,
       SUM(clicks) AS clicks,
       SUM(heartbeats) AS heartbeats,
       SUM(errors) AS errors,
       COUNT(DISTINCT installation_id) AS active_installations
     FROM embed_daily_metrics
     WHERE ${clause}
     GROUP BY metric_date
     ORDER BY metric_date ASC`
  ).bind(...bindings).all<Record<string, string | number>>();

  const series = (result.results || []).map((row) => {
    const impressions = Number(row.impressions || 0);
    const clicks = Number(row.clicks || 0);
    return {
      date: row.metric_date,
      loads: Number(row.loads || 0),
      impressions,
      clicks,
      ctr: impressions > 0 ? clicks / impressions : 0,
      heartbeats: Number(row.heartbeats || 0),
      errors: Number(row.errors || 0),
      active_installations: Number(row.active_installations || 0),
    };
  });

  return NextResponse.json({ success: true, series });
}
