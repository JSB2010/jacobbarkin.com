import { NextRequest, NextResponse } from "next/server";

import { getD1Database } from "@/lib/db/d1";
import { listRules } from "@/lib/embed/rules";
import { requireAdmin } from "@/lib/embed/reporting";
import { generateId, parseNumber, truncateText } from "@/lib/embed/utils";

export async function GET() {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ rules: [] });
  }

  const rules = await listRules(db);
  return NextResponse.json({ rules });
}

export async function POST(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const body = await request.json();
  const id = truncateText(body.id, 128) || generateId("rule");
  const name = truncateText(body.name, 128);
  if (!name) {
    return NextResponse.json({ error: "Rule name is required" }, { status: 400 });
  }

  const status = truncateText(body.status, 32) || "draft";
  const priority = parseNumber(body.priority) ?? 100;
  const matchType = truncateText(body.match_type, 32) || "conditions";
  const conditionsJson = typeof body.conditions_json === "string" ? body.conditions_json : body.conditions_json ? JSON.stringify(body.conditions_json) : "{}";
  const actionType = truncateText(body.action_type, 64) || "page_takeover";
  const templateId = truncateText(body.template_id, 128);
  const unsafeHtml = typeof body.unsafe_html === "string" ? body.unsafe_html : null;
  const configJson = typeof body.config_json === "string" ? body.config_json : body.config_json ? JSON.stringify(body.config_json) : null;
  const rolloutPercent = parseNumber(body.rollout_percent) ?? 100;
  const startAt = truncateText(body.start_at, 64);
  const endAt = truncateText(body.end_at, 64);
  const notes = truncateText(body.notes, 2000);

  await db.prepare(
    `INSERT INTO embed_rules (
       id,
       name,
       status,
       priority,
       match_type,
       conditions_json,
       action_type,
       template_id,
       unsafe_html,
       config_json,
       rollout_percent,
       start_at,
       end_at,
       notes,
       created_by,
       updated_by,
       created_at,
       updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       status = excluded.status,
       priority = excluded.priority,
       match_type = excluded.match_type,
       conditions_json = excluded.conditions_json,
       action_type = excluded.action_type,
       template_id = excluded.template_id,
       unsafe_html = excluded.unsafe_html,
       config_json = excluded.config_json,
       rollout_percent = excluded.rollout_percent,
       start_at = excluded.start_at,
       end_at = excluded.end_at,
       notes = excluded.notes,
       updated_by = excluded.updated_by,
       updated_at = datetime('now')`
  ).bind(
    id,
    name,
    status,
    priority,
    matchType,
    conditionsJson,
    actionType,
    templateId,
    unsafeHtml,
    configJson,
    rolloutPercent,
    startAt,
    endAt,
    notes,
    userId,
    userId
  ).run();

  return NextResponse.json({ success: true, id });
}

export async function PUT(request: NextRequest) {
  return POST(request);
}

export async function DELETE(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await db.prepare(`DELETE FROM embed_rules WHERE id = ?`).bind(id).run();
  return NextResponse.json({ success: true });
}
