import { createHash } from "node:crypto";

import type { D1Database } from "@/lib/db/d1";
import type { EmbedEventName } from "@/lib/embed/types";

export type EmbedTelemetryPayload = {
  page_url: string;
  page_host: string | null;
  page_path: string | null;
  page_title: string | null;
  referrer: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  event_name: EmbedEventName;
  event_type: string;
  embed_version: string | null;
  embed_variant: string | null;
  embed_size: string | null;
  embed_theme: string | null;
  embed_position: string | null;
  embed_align: string | null;
  embed_instance_id: string | null;
  is_auto: number;
  language: string | null;
  timezone_offset: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  device_type: string | null;
  connection_type: string | null;
  installation_id: string;
  site_key: string | null;
  session_id: string;
  page_view_id: string;
  page_group: string | null;
  experiment_id: string | null;
  variant_key: string | null;
  rule_id: string | null;
  template_id: string | null;
  action_type: string | null;
  error_code: string | null;
  load_ms: number | null;
  render_ms: number | null;
  session_fingerprint: string | null;
  created_at: string;
};

export type DailyMetricKey = {
  metric_date: string;
  installation_id: string;
  page_host: string;
  page_group: string;
  embed_variant: string;
  embed_version: string;
  device_type: string;
  is_auto: number;
  rule_id: string;
  template_id: string;
  experiment_id: string;
  variant_key: string;
};

export type DailyMetricIncrement = DailyMetricKey & {
  loads?: number;
  impressions?: number;
  clicks?: number;
  heartbeats?: number;
  errors?: number;
  replacement_applied?: number;
  replacement_skipped?: number;
};

export function truncateText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function parseBooleanInt(value: unknown): number | null {
  if (value === true || value === "true" || value === 1 || value === "1") return 1;
  if (value === false || value === "false" || value === 0 || value === "0") return 0;
  return null;
}

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getUrlParts(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return {
      host: url.hostname,
      path: url.pathname || "/",
      utm_source: url.searchParams.get("utm_source"),
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      utm_term: url.searchParams.get("utm_term"),
      utm_content: url.searchParams.get("utm_content"),
    };
  } catch {
    return null;
  }
}

export function normalizeEventName(value: unknown): EmbedEventName {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  switch (normalized) {
    case "load":
    case "impression":
    case "click":
    case "heartbeat":
    case "error":
    case "replacement_applied":
    case "replacement_skipped":
      return normalized;
    case "view":
      return "impression";
    default:
      return "impression";
  }
}

export function deriveInstallationId(siteKey: string | null, pageHost: string | null) {
  const base = siteKey || pageHost || "unknown-site";
  return base.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
}

export function buildSessionFingerprint(ipAddress: string, userAgent: string, pageHost: string | null) {
  const shortWindow = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update([ipAddress, userAgent, pageHost || "", shortWindow].join("|"))
    .digest("hex");
}

export async function upsertInstallation(db: D1Database, payload: EmbedTelemetryPayload) {
  const impressionIncrement = payload.event_name === "impression" ? 1 : 0;
  const clickIncrement = payload.event_name === "click" ? 1 : 0;
  const heartbeatIncrement = payload.event_name === "heartbeat" ? 1 : 0;

  await db.prepare(
    `INSERT INTO embed_installations (
       installation_id,
       site_key,
       page_host,
       label,
       environment,
       notes,
       first_seen,
       last_seen,
       last_page_url,
       last_page_title,
       last_referrer,
       last_referrer_host,
       last_embed_version,
       last_embed_variant,
       last_embed_size,
       last_embed_theme,
       last_embed_position,
       last_embed_align,
       last_is_auto,
       last_language,
       last_timezone_offset,
       last_viewport_width,
       last_viewport_height,
       last_device_type,
       last_connection_type,
       last_session_id,
       event_count,
       impression_count,
       click_count,
       heartbeat_count,
       last_rule_id,
       last_template_id,
       created_at,
       updated_at
     )
     VALUES (
       ?, ?, ?, NULL, 'prod', NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
       ?, ?, ?, ?, ?, ?, ?, ?
     )
     ON CONFLICT(installation_id) DO UPDATE SET
       site_key = excluded.site_key,
       page_host = excluded.page_host,
       last_seen = excluded.last_seen,
       last_page_url = excluded.last_page_url,
       last_page_title = excluded.last_page_title,
       last_referrer = excluded.last_referrer,
       last_referrer_host = excluded.last_referrer_host,
       last_embed_version = excluded.last_embed_version,
       last_embed_variant = excluded.last_embed_variant,
       last_embed_size = excluded.last_embed_size,
       last_embed_theme = excluded.last_embed_theme,
       last_embed_position = excluded.last_embed_position,
       last_embed_align = excluded.last_embed_align,
       last_is_auto = excluded.last_is_auto,
       last_language = excluded.last_language,
       last_timezone_offset = excluded.last_timezone_offset,
       last_viewport_width = excluded.last_viewport_width,
       last_viewport_height = excluded.last_viewport_height,
       last_device_type = excluded.last_device_type,
       last_connection_type = excluded.last_connection_type,
       last_session_id = excluded.last_session_id,
       event_count = embed_installations.event_count + 1,
       impression_count = embed_installations.impression_count + ?,
       click_count = embed_installations.click_count + ?,
       heartbeat_count = embed_installations.heartbeat_count + ?,
       last_rule_id = excluded.last_rule_id,
       last_template_id = excluded.last_template_id,
       updated_at = excluded.updated_at`
  ).bind(
    payload.installation_id,
    payload.site_key,
    payload.page_host || "unknown",
    payload.created_at,
    payload.created_at,
    payload.page_url,
    payload.page_title,
    payload.referrer,
    payload.referrer_host,
    payload.embed_version,
    payload.embed_variant,
    payload.embed_size,
    payload.embed_theme,
    payload.embed_position,
    payload.embed_align,
    payload.is_auto,
    payload.language,
    payload.timezone_offset,
    payload.viewport_width,
    payload.viewport_height,
    payload.device_type,
    payload.connection_type,
    payload.session_id,
    1,
    impressionIncrement,
    clickIncrement,
    heartbeatIncrement,
    payload.rule_id,
    payload.template_id,
    payload.created_at,
    payload.created_at,
    impressionIncrement,
    clickIncrement,
    heartbeatIncrement
  ).run();
}

export async function insertEmbedEvent(db: D1Database, id: string, payload: EmbedTelemetryPayload) {
  await db.prepare(
    `INSERT INTO embed_events (
       id,
       installation_id,
       session_id,
       page_view_id,
       page_url,
       page_host,
       page_path,
       page_title,
       referrer,
       referrer_host,
       utm_source,
       utm_medium,
       utm_campaign,
       utm_term,
       utm_content,
       event_name,
       event_type,
       embed_version,
       embed_variant,
       embed_size,
       embed_theme,
       embed_position,
       embed_align,
       embed_instance_id,
       is_auto,
       site_key,
       page_group,
       experiment_id,
       variant_key,
       rule_id,
       template_id,
       action_type,
       error_code,
       load_ms,
       render_ms,
       device_type,
       language,
       timezone_offset,
       viewport_width,
       viewport_height,
       connection_type,
       session_fingerprint,
       created_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    payload.installation_id,
    payload.session_id,
    payload.page_view_id,
    payload.page_url,
    payload.page_host,
    payload.page_path,
    payload.page_title,
    payload.referrer,
    payload.referrer_host,
    payload.utm_source,
    payload.utm_medium,
    payload.utm_campaign,
    payload.utm_term,
    payload.utm_content,
    payload.event_name,
    payload.event_type,
    payload.embed_version,
    payload.embed_variant,
    payload.embed_size,
    payload.embed_theme,
    payload.embed_position,
    payload.embed_align,
    payload.embed_instance_id,
    payload.is_auto,
    payload.site_key,
    payload.page_group,
    payload.experiment_id,
    payload.variant_key,
    payload.rule_id,
    payload.template_id,
    payload.action_type,
    payload.error_code,
    payload.load_ms,
    payload.render_ms,
    payload.device_type,
    payload.language,
    payload.timezone_offset,
    payload.viewport_width,
    payload.viewport_height,
    payload.connection_type,
    payload.session_fingerprint,
    payload.created_at
  ).run();
}

export async function incrementDailyMetric(db: D1Database, metric: DailyMetricIncrement) {
  await db.prepare(
    `INSERT INTO embed_daily_metrics (
       metric_date,
       installation_id,
       page_host,
       page_group,
       embed_variant,
       embed_version,
       device_type,
       is_auto,
       rule_id,
       template_id,
       experiment_id,
       variant_key,
       loads,
       impressions,
       clicks,
       heartbeats,
       errors,
       replacement_applied,
       replacement_skipped,
       updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(
       metric_date,
       installation_id,
       page_host,
       page_group,
       embed_variant,
       embed_version,
       device_type,
       is_auto,
       rule_id,
       template_id,
       experiment_id,
       variant_key
     ) DO UPDATE SET
       loads = embed_daily_metrics.loads + excluded.loads,
       impressions = embed_daily_metrics.impressions + excluded.impressions,
       clicks = embed_daily_metrics.clicks + excluded.clicks,
       heartbeats = embed_daily_metrics.heartbeats + excluded.heartbeats,
       errors = embed_daily_metrics.errors + excluded.errors,
       replacement_applied = embed_daily_metrics.replacement_applied + excluded.replacement_applied,
       replacement_skipped = embed_daily_metrics.replacement_skipped + excluded.replacement_skipped,
       updated_at = datetime('now')`
  ).bind(
    metric.metric_date,
    metric.installation_id,
    metric.page_host,
    metric.page_group,
    metric.embed_variant,
    metric.embed_version,
    metric.device_type,
    metric.is_auto,
    metric.rule_id,
    metric.template_id,
    metric.experiment_id,
    metric.variant_key,
    metric.loads || 0,
    metric.impressions || 0,
    metric.clicks || 0,
    metric.heartbeats || 0,
    metric.errors || 0,
    metric.replacement_applied || 0,
    metric.replacement_skipped || 0
  ).run();
}

export function createMetricIncrement(payload: EmbedTelemetryPayload): DailyMetricIncrement {
  return {
    metric_date: payload.created_at.slice(0, 10),
    installation_id: payload.installation_id,
    page_host: payload.page_host || "",
    page_group: payload.page_group || "",
    embed_variant: payload.embed_variant || "",
    embed_version: payload.embed_version || "",
    device_type: payload.device_type || "",
    is_auto: payload.is_auto,
    rule_id: payload.rule_id || "",
    template_id: payload.template_id || "",
    experiment_id: payload.experiment_id || "",
    variant_key: payload.variant_key || "",
    loads: payload.event_name === "load" ? 1 : 0,
    impressions: payload.event_name === "impression" ? 1 : 0,
    clicks: payload.event_name === "click" ? 1 : 0,
    heartbeats: payload.event_name === "heartbeat" ? 1 : 0,
    errors: payload.event_name === "error" ? 1 : 0,
    replacement_applied: payload.event_name === "replacement_applied" ? 1 : 0,
    replacement_skipped: payload.event_name === "replacement_skipped" ? 1 : 0,
  };
}
