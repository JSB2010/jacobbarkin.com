import { NextRequest, NextResponse } from "next/server";

import { getD1Database } from "@/lib/db/d1";
import { getReportFilters, requireAdmin } from "@/lib/embed/reporting";

export async function GET(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ success: true, sites: [] });
  }

  const filters = getReportFilters(request);
  const clauses = ["1 = 1"];
  const bindings: (string | number)[] = [];

  if (filters.host) {
    clauses.push("page_host = ?");
    bindings.push(filters.host);
  }
  if (filters.q) {
    clauses.push("(page_host LIKE ? OR last_page_url LIKE ? OR label LIKE ?)");
    const like = `%${filters.q}%`;
    bindings.push(like, like, like);
  }
  if (filters.version) {
    clauses.push("last_embed_version = ?");
    bindings.push(filters.version);
  }
  if (filters.device) {
    clauses.push("last_device_type = ?");
    bindings.push(filters.device);
  }
  if (filters.installMethod) {
    clauses.push("last_is_auto = ?");
    bindings.push(filters.installMethod === "auto" ? 1 : 0);
  }

  const sites = await db.prepare(
    `SELECT *
     FROM embed_installations
     WHERE ${clauses.join(" AND ")}
     ORDER BY last_seen DESC
     LIMIT ? OFFSET ?`
  ).bind(...bindings, filters.limit, filters.offset).all();

  const total = await db.prepare(
    `SELECT COUNT(*) AS count FROM embed_installations WHERE ${clauses.join(" AND ")}`
  ).bind(...bindings).first<{ count: number }>();

  return NextResponse.json({
    success: true,
    sites: sites.results || [],
    total: Number(total?.count || 0),
  });
}
