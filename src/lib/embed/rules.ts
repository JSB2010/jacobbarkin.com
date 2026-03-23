import type { D1Database } from "@/lib/db/d1";
import type {
  EmbedRule,
  EmbedRuleConditionSet,
  EmbedRuleEvaluationContext,
  EmbedRuleEvaluationResult,
  EmbedTemplate,
} from "@/lib/embed/types";
import { getSystemTemplateById, renderTemplate } from "@/lib/embed/templates";
import { safeJsonParse } from "@/lib/embed/utils";

function isStatusActive(rule: EmbedRule) {
  if (rule.status === "paused" || rule.status === "archived" || rule.status === "draft") return false;

  const now = Date.now();
  const start = rule.start_at ? Date.parse(rule.start_at) : null;
  const end = rule.end_at ? Date.parse(rule.end_at) : null;

  if (rule.status === "scheduled" && start && start > now) return false;
  if (start && start > now) return false;
  if (end && end < now) return false;

  return true;
}

function getQueryParamValue(url: string, key: string) {
  try {
    return new URL(url).searchParams.get(key);
  } catch {
    return null;
  }
}

function matchesConditions(conditions: EmbedRuleConditionSet, context: EmbedRuleEvaluationContext) {
  if (conditions.exact_url && context.url !== conditions.exact_url) return false;
  if (conditions.exact_urls?.length && !conditions.exact_urls.includes(context.url)) return false;
  if (conditions.hosts?.length && !conditions.hosts.includes(context.host)) return false;
  if (conditions.path_prefixes?.length && !conditions.path_prefixes.some((prefix) => context.path.startsWith(prefix))) {
    return false;
  }
  if (conditions.path_regex) {
    try {
      const regex = new RegExp(conditions.path_regex);
      if (!regex.test(context.path)) return false;
    } catch {
      return false;
    }
  }
  if (conditions.query_contains) {
    for (const [key, value] of Object.entries(conditions.query_contains)) {
      if (getQueryParamValue(context.url, key) !== value) return false;
    }
  }
  if (conditions.referrer_hosts?.length) {
    if (!context.referrer_host || !conditions.referrer_hosts.includes(context.referrer_host)) return false;
  }
  if (conditions.utm_sources?.length && !conditions.utm_sources.includes(context.utm_source || "")) return false;
  if (conditions.utm_mediums?.length && !conditions.utm_mediums.includes(context.utm_medium || "")) return false;
  if (conditions.utm_campaigns?.length && !conditions.utm_campaigns.includes(context.utm_campaign || "")) return false;
  if (conditions.device_types?.length && !conditions.device_types.includes(context.device_type || "")) return false;
  if (conditions.languages?.length && !conditions.languages.includes(context.language || "")) return false;
  if (conditions.installation_ids?.length && !conditions.installation_ids.includes(context.installation_id)) return false;
  if (conditions.site_keys?.length && !conditions.site_keys.includes(context.site_key || "")) return false;
  if (conditions.timezone_offsets?.length && !conditions.timezone_offsets.includes(context.timezone_offset ?? Number.NaN)) return false;
  return true;
}

async function resolveTemplate(db: D1Database, templateId: string | null) {
  const systemTemplate = getSystemTemplateById(templateId);
  if (systemTemplate) return systemTemplate;
  if (!templateId) return null;
  return (
    await db.prepare(`SELECT * FROM embed_templates WHERE id = ? LIMIT 1`).bind(templateId).first<EmbedTemplate>()
  ) || null;
}

export async function listRules(db: D1Database) {
  const result = await db.prepare(
    `SELECT * FROM embed_rules ORDER BY
       CASE status
         WHEN 'active' THEN 0
         WHEN 'scheduled' THEN 1
         WHEN 'preview' THEN 2
         WHEN 'draft' THEN 3
         WHEN 'paused' THEN 4
         ELSE 5
       END,
       priority ASC,
       updated_at DESC`
  ).all<EmbedRule>();

  return result.results || [];
}

export async function evaluateRules(
  db: D1Database,
  context: EmbedRuleEvaluationContext,
  debug = false
): Promise<EmbedRuleEvaluationResult> {
  const rules = await listRules(db);
  const explain: string[] = [];

  for (const rule of rules) {
    if (!isStatusActive(rule)) {
      if (debug) explain.push(`${rule.name}: skipped because status=${rule.status}`);
      continue;
    }

    const rolloutPercent = Math.min(Math.max(rule.rollout_percent || 100, 0), 100);
    if (rolloutPercent < 100) {
      const bucket = Math.abs(
        Array.from(`${context.installation_id}|${context.url}|${rule.id}`).reduce((acc, char) => acc + char.charCodeAt(0), 0)
      ) % 100;
      if (bucket >= rolloutPercent) {
        if (debug) explain.push(`${rule.name}: skipped because rollout bucket ${bucket} >= ${rolloutPercent}`);
        continue;
      }
    }

    const conditions = safeJsonParse<EmbedRuleConditionSet>(rule.conditions_json, {});
    if (!matchesConditions(conditions, context)) {
      if (debug) explain.push(`${rule.name}: conditions did not match`);
      continue;
    }

    const template = await resolveTemplate(db, rule.template_id);
    const configJson =
      safeJsonParse<Record<string, unknown>>(rule.config_json, {}).template_config
        ? JSON.stringify(safeJsonParse<Record<string, unknown>>(rule.config_json, {}).template_config)
        : rule.config_json;

    const html =
      rule.unsafe_html ||
      (template ? renderTemplate(template, configJson) : null);

    const config = safeJsonParse<Record<string, string>>(rule.config_json, {});
    const redirect_url = rule.action_type === "redirect" ? config.redirect_url || null : null;
    const credit_override =
      rule.action_type === "credit_variant_override"
        ? {
            variant: config.variant || "",
            theme: config.theme || "",
            size: config.size || "",
            align: config.align || "",
          }
        : null;

    explain.push(`${rule.name}: matched`);

    return {
      matched: true,
      rule_id: rule.id,
      template_id: template?.id || rule.template_id || null,
      action_type: rule.action_type,
      html,
      redirect_url,
      credit_override,
      explain,
      debug: {
        rule,
        conditions,
        template,
      },
    };
  }

  return {
    matched: false,
    rule_id: null,
    template_id: null,
    action_type: null,
    html: null,
    redirect_url: null,
    credit_override: null,
    explain,
    debug: {},
  };
}
