import type { NextRequest } from "next/server";

import { requireAdmin as requireConfiguredAdmin } from "@/lib/admin/auth";
import type { D1Database } from "@/lib/db/d1";

export async function requireAdmin() {
  return requireConfiguredAdmin();
}

export function getReportFilters(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") || "30");
  return {
    days: Number.isFinite(days) ? Math.max(1, Math.min(days, 365)) : 30,
    host: searchParams.get("host") || "",
    variant: searchParams.get("variant") || "",
    device: searchParams.get("device") || "",
    campaign: searchParams.get("campaign") || "",
    version: searchParams.get("version") || "",
    installMethod: searchParams.get("installMethod") || "",
    q: searchParams.get("q") || "",
    limit: Math.max(1, Math.min(Number(searchParams.get("limit") || "50"), 250)),
    offset: Math.max(0, Number(searchParams.get("offset") || "0")),
  };
}

export function buildWhereClause(filters: ReturnType<typeof getReportFilters>) {
  const clauses = ["metric_date >= ?"];
  const bindings: (string | number)[] = [daysAgo(filters.days).slice(0, 10)];

  if (filters.host) {
    clauses.push("page_host = ?");
    bindings.push(filters.host);
  }
  if (filters.variant) {
    clauses.push("embed_variant = ?");
    bindings.push(filters.variant);
  }
  if (filters.device) {
    clauses.push("device_type = ?");
    bindings.push(filters.device);
  }
  if (filters.version) {
    clauses.push("embed_version = ?");
    bindings.push(filters.version);
  }
  if (filters.installMethod) {
    clauses.push("is_auto = ?");
    bindings.push(filters.installMethod === "auto" ? 1 : 0);
  }

  return { clause: clauses.join(" AND "), bindings };
}

export function buildEventWhereClause(filters: ReturnType<typeof getReportFilters>) {
  const clauses = ["created_at >= ?"];
  const bindings: (string | number)[] = [daysAgo(filters.days)];

  if (filters.host) {
    clauses.push("page_host = ?");
    bindings.push(filters.host);
  }
  if (filters.variant) {
    clauses.push("embed_variant = ?");
    bindings.push(filters.variant);
  }
  if (filters.device) {
    clauses.push("device_type = ?");
    bindings.push(filters.device);
  }
  if (filters.campaign) {
    clauses.push("utm_campaign = ?");
    bindings.push(filters.campaign);
  }
  if (filters.version) {
    clauses.push("embed_version = ?");
    bindings.push(filters.version);
  }
  if (filters.installMethod) {
    clauses.push("is_auto = ?");
    bindings.push(filters.installMethod === "auto" ? 1 : 0);
  }
  if (filters.q) {
    clauses.push("(page_url LIKE ? OR page_host LIKE ? OR page_title LIKE ?)");
    const like = `%${filters.q}%`;
    bindings.push(like, like, like);
  }

  return { clause: clauses.join(" AND "), bindings };
}

export function daysAgo(days: number) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString();
}

export async function getDistinctValues(db: D1Database, column: string, table = "embed_daily_metrics") {
  const result = await db.prepare(
    `SELECT DISTINCT ${column} AS value FROM ${table} WHERE ${column} IS NOT NULL AND ${column} != '' ORDER BY ${column} ASC LIMIT 100`
  ).all<{ value: string }>();
  return (result.results || []).map((row) => row.value);
}
