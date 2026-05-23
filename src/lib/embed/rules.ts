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

type ConditionMatchResult = {
  matched: boolean;
  reason?: string;
};

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

function normalizeHostValue(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) return "";

  try {
    if (/^https?:\/\//i.test(trimmed)) return new URL(trimmed).hostname.toLowerCase();
    if (trimmed.includes("/")) return new URL(`https://${trimmed}`).hostname.toLowerCase();
    return new URL(`https://${trimmed}`).hostname.toLowerCase();
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0].toLowerCase();
  }
}

function normalizeUrlValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    url.hash = "";
    const pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
    return `${url.protocol}//${url.host.toLowerCase()}${pathname}${url.search}`;
  } catch {
    return trimmed;
  }
}

function normalizePathPrefixValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  try {
    const path = /^https?:\/\//i.test(trimmed) ? new URL(trimmed).pathname : trimmed;
    return path.startsWith("/") ? path : `/${path}`;
  } catch {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
}

function normalizeStringList(values: string[] | undefined, normalize: (value: string) => string) {
  return Array.from(new Set((values || []).map((value) => normalize(value)).filter(Boolean)));
}

function matchesConditions(conditions: EmbedRuleConditionSet, context: EmbedRuleEvaluationContext): ConditionMatchResult {
  const contextUrl = normalizeUrlValue(context.url);
  const contextHost = normalizeHostValue(context.host);
  const contextPath = context.path.startsWith("/") ? context.path : `/${context.path}`;

  if (conditions.exact_url && contextUrl !== normalizeUrlValue(conditions.exact_url)) {
    return { matched: false, reason: "exact URL did not match" };
  }

  const exactUrls = normalizeStringList(conditions.exact_urls, normalizeUrlValue);
  if (exactUrls.length && !exactUrls.includes(contextUrl)) {
    return { matched: false, reason: "exact URL list did not match" };
  }

  const hosts = normalizeStringList(conditions.hosts, normalizeHostValue);
  if (hosts.length && !hosts.includes(contextHost)) {
    return { matched: false, reason: "host did not match" };
  }

  const pathPrefixes = normalizeStringList(conditions.path_prefixes, normalizePathPrefixValue);
  if (pathPrefixes.length && !pathPrefixes.some((prefix) => contextPath.startsWith(prefix))) {
    return { matched: false, reason: "path prefix did not match" };
  }

  if (conditions.path_regex) {
    try {
      const regex = new RegExp(conditions.path_regex);
      if (!regex.test(contextPath)) return { matched: false, reason: "path regex did not match" };
    } catch {
      return { matched: false, reason: "path regex is invalid" };
    }
  }

  if (conditions.query_contains) {
    for (const [key, value] of Object.entries(conditions.query_contains)) {
      if (getQueryParamValue(context.url, key) !== value) return { matched: false, reason: `query param ${key} did not match` };
    }
  }

  if (conditions.referrer_hosts?.length) {
    const referrerHost = normalizeHostValue(context.referrer_host);
    const referrerHosts = normalizeStringList(conditions.referrer_hosts, normalizeHostValue);
    if (!referrerHost || !referrerHosts.includes(referrerHost)) return { matched: false, reason: "referrer host did not match" };
  }

  if (conditions.utm_sources?.length && !conditions.utm_sources.includes(context.utm_source || "")) return { matched: false, reason: "UTM source did not match" };
  if (conditions.utm_mediums?.length && !conditions.utm_mediums.includes(context.utm_medium || "")) return { matched: false, reason: "UTM medium did not match" };
  if (conditions.utm_campaigns?.length && !conditions.utm_campaigns.includes(context.utm_campaign || "")) return { matched: false, reason: "UTM campaign did not match" };
  if (conditions.device_types?.length && !conditions.device_types.includes(context.device_type || "")) return { matched: false, reason: "device type did not match" };
  if (conditions.languages?.length && !conditions.languages.includes(context.language || "")) return { matched: false, reason: "language did not match" };
  if (conditions.installation_ids?.length && !conditions.installation_ids.includes(context.installation_id)) return { matched: false, reason: "installation ID did not match" };
  if (conditions.site_keys?.length && !conditions.site_keys.includes(context.site_key || "")) return { matched: false, reason: "site key did not match" };
  if (conditions.require_timezone_offset === true && conditions.timezone_offsets?.length && !conditions.timezone_offsets.includes(context.timezone_offset ?? Number.NaN)) {
    return { matched: false, reason: "timezone offset did not match" };
  }

  return { matched: true };
}

async function resolveTemplate(db: D1Database, templateId: string | null) {
  if (!templateId) return null;
  const customTemplate = await db.prepare(`SELECT * FROM embed_templates WHERE id = ? LIMIT 1`).bind(templateId).first<EmbedTemplate>();
  if (customTemplate) return customTemplate;
  return getSystemTemplateById(templateId);
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

async function listEvaluableRules(db: D1Database) {
  const result = await db.prepare(
    `SELECT * FROM embed_rules
     WHERE status IN ('active', 'scheduled', 'preview')
     ORDER BY
       CASE status
         WHEN 'active' THEN 0
         WHEN 'scheduled' THEN 1
         WHEN 'preview' THEN 2
         ELSE 3
       END,
       priority ASC,
       updated_at DESC`
  ).all<EmbedRule>();

  return result.results || [];
}

function stableRolloutBucket(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) % 100;
}

export async function evaluateRules(
  db: D1Database,
  context: EmbedRuleEvaluationContext,
  debug = false
): Promise<EmbedRuleEvaluationResult> {
  const rules = await listEvaluableRules(db);
  const explain: string[] = [];

  for (const rule of rules) {
    if (!isStatusActive(rule)) {
      if (debug) explain.push(`${rule.name}: skipped because status=${rule.status}`);
      continue;
    }

    const rolloutPercent = Math.min(Math.max(rule.rollout_percent || 100, 0), 100);
    if (rolloutPercent < 100) {
      const bucket = stableRolloutBucket(`${context.installation_id}|${rule.id}`);
      if (bucket >= rolloutPercent) {
        if (debug) explain.push(`${rule.name}: skipped because rollout bucket ${bucket} >= ${rolloutPercent}`);
        continue;
      }
    }

    const conditions = safeJsonParse<EmbedRuleConditionSet>(rule.conditions_json, {});
    const conditionMatch = matchesConditions(conditions, context);
    if (!conditionMatch.matched) {
      if (debug) explain.push(`${rule.name}: ${conditionMatch.reason || "conditions did not match"}`);
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
