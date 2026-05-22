import { NextRequest, NextResponse } from "next/server";

import { getD1Database } from "@/lib/db/d1";
import { evaluateRules } from "@/lib/embed/rules";
import { getSystemTemplateById, renderTemplate } from "@/lib/embed/templates";
import { requireAdmin } from "@/lib/embed/reporting";
import type { EmbedRule, EmbedTemplate } from "@/lib/embed/types";
import { deriveInstallationId, getUrlParts, parseNumber, safeJsonParse, truncateText } from "@/lib/embed/utils";

function getTemplateConfigJson(value: string | null) {
  if (!value) return null;
  const parsed = safeJsonParse<Record<string, unknown>>(value, {});
  const templateConfig = parsed.template_config;

  if (templateConfig && typeof templateConfig === "object" && !Array.isArray(templateConfig)) {
    return JSON.stringify(templateConfig);
  }

  return value;
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
  const url = truncateText(body.url, 2048) || "https://example.com/";
  const pageParts = getUrlParts(url);
  const host = truncateText(body.host, 255) || pageParts?.host || "example.com";
  const siteKey = truncateText(body.site_key, 128);
  const installationId = truncateText(body.installation_id, 128) || deriveInstallationId(siteKey, host);

  if (body.rule_id) {
    const result = await evaluateRules(
      db,
      {
        url,
        host,
        path: pageParts?.path || "/",
        referrer: truncateText(body.referrer, 2048),
        referrer_host: truncateText(body.referrer_host, 255),
        utm_source: pageParts?.utm_source || null,
        utm_medium: pageParts?.utm_medium || null,
        utm_campaign: pageParts?.utm_campaign || null,
        language: truncateText(body.language, 32),
        device_type: truncateText(body.device_type, 16),
        timezone_offset: parseNumber(body.timezone_offset),
        installation_id: installationId,
        site_key: siteKey,
      },
      true
    );
    return NextResponse.json(result);
  }

  const draftRule = body.rule as Partial<EmbedRule> | undefined;
  if (!draftRule) {
    return NextResponse.json({ error: "rule or rule_id is required" }, { status: 400 });
  }

  const templateId = truncateText(draftRule.template_id, 128);
  const customTemplate = templateId
    ? await db.prepare(`SELECT * FROM embed_templates WHERE id = ? LIMIT 1`).bind(templateId).first<EmbedTemplate>()
    : null;
  const systemTemplate = customTemplate ? null : getSystemTemplateById(templateId);
  const template = customTemplate || systemTemplate;
  const configJson = typeof draftRule.config_json === "string" ? getTemplateConfigJson(draftRule.config_json) : null;
  const html =
    draftRule.unsafe_html ||
    (template ? renderTemplate(template, configJson) : null);

  return NextResponse.json({
    matched: true,
    rule_id: draftRule.id || null,
    template_id: template?.id || draftRule.template_id || null,
    action_type: draftRule.action_type || "page_takeover",
    html,
    redirect_url: null,
    credit_override: null,
    explain: ["Draft preview rendered locally"],
    debug: {
      rule: draftRule,
      url,
    },
  });
}
