import { NextRequest, NextResponse } from "next/server";

import { getD1Database } from "@/lib/db/d1";
import { requireAdmin } from "@/lib/embed/reporting";

export async function GET(_request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ success: true, rules: [] });
  }

  const rules = await db.prepare(
    `SELECT
       r.*,
       COALESCE(SUM(CASE WHEN e.event_name = 'replacement_applied' THEN 1 ELSE 0 END), 0) AS replacements_applied,
       COALESCE(SUM(CASE WHEN e.event_name = 'replacement_skipped' THEN 1 ELSE 0 END), 0) AS replacements_skipped,
       COALESCE(SUM(CASE WHEN e.event_name = 'error' THEN 1 ELSE 0 END), 0) AS errors
     FROM embed_rules r
     LEFT JOIN embed_events e ON e.rule_id = r.id
     GROUP BY r.id
     ORDER BY r.priority ASC, r.updated_at DESC`
  ).all();

  return NextResponse.json({ success: true, rules: rules.results || [] });
}
