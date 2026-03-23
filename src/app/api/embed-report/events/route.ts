import { NextRequest, NextResponse } from "next/server";

import { getD1Database } from "@/lib/db/d1";
import { buildEventWhereClause, getReportFilters, requireAdmin } from "@/lib/embed/reporting";

export async function GET(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ success: true, events: [] });
  }

  const filters = getReportFilters(request);
  const { clause, bindings } = buildEventWhereClause(filters);

  const events = await db.prepare(
    `SELECT *
     FROM embed_events
     WHERE ${clause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...bindings, filters.limit, filters.offset).all();

  const total = await db.prepare(
    `SELECT COUNT(*) AS count
     FROM embed_events
     WHERE ${clause}`
  ).bind(...bindings).first<{ count: number }>();

  return NextResponse.json({
    success: true,
    events: events.results || [],
    total: Number(total?.count || 0),
  });
}
