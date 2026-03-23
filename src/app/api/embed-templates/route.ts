import { NextRequest, NextResponse } from "next/server";

import { getD1Database } from "@/lib/db/d1";
import { SYSTEM_TEMPLATES } from "@/lib/embed/templates";
import { requireAdmin } from "@/lib/embed/reporting";
import { generateId, truncateText } from "@/lib/embed/utils";

export async function GET() {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ templates: SYSTEM_TEMPLATES });
  }

  const dbTemplates = await db.prepare(
    `SELECT * FROM embed_templates ORDER BY is_system DESC, updated_at DESC`
  ).all();

  const merged = [
    ...SYSTEM_TEMPLATES,
    ...((dbTemplates.results || []).filter((template) => !SYSTEM_TEMPLATES.some((system) => system.id === (template as { id: string }).id))),
  ];

  return NextResponse.json({ templates: merged });
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
  const id = truncateText(body.id, 128) || generateId("tpl");
  const name = truncateText(body.name, 128);
  if (!name) {
    return NextResponse.json({ error: "Template name is required" }, { status: 400 });
  }

  const category = truncateText(body.category, 64) || "custom";
  const description = truncateText(body.description, 512);
  const schemaJson = typeof body.schema_json === "string" ? body.schema_json : body.schema_json ? JSON.stringify(body.schema_json) : null;
  const renderMode = truncateText(body.render_mode, 32) || "unsafe_html";
  const htmlShell = typeof body.html_shell === "string" ? body.html_shell : null;
  const cssTheme = truncateText(body.css_theme, 32);
  const configJson = typeof body.config_json === "string" ? body.config_json : body.config_json ? JSON.stringify(body.config_json) : null;
  const version = Number.isFinite(Number(body.version)) ? Number(body.version) : 1;

  await db.prepare(
    `INSERT INTO embed_templates (
       id,
       name,
       category,
       description,
       schema_json,
       render_mode,
       html_shell,
       css_theme,
       config_json,
       is_system,
       version,
       created_at,
       updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, datetime('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       category = excluded.category,
       description = excluded.description,
       schema_json = excluded.schema_json,
       render_mode = excluded.render_mode,
       html_shell = excluded.html_shell,
       css_theme = excluded.css_theme,
       config_json = excluded.config_json,
       version = excluded.version,
       updated_at = datetime('now')`
  ).bind(
    id,
    name,
    category,
    description,
    schemaJson,
    renderMode,
    htmlShell,
    cssTheme,
    configJson,
    version
  ).run();

  return NextResponse.json({ success: true, id });
}
