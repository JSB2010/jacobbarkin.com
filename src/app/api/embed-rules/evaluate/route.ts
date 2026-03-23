import { NextRequest, NextResponse } from "next/server";

import { getD1Database } from "@/lib/db/d1";
import { evaluateRules } from "@/lib/embed/rules";
import { deriveInstallationId, getUrlParts, parseNumber, truncateText } from "@/lib/embed/utils";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const db = await getD1Database();
  if (!db) {
    return NextResponse.json({ matched: false }, { headers: corsHeaders });
  }

  const body = await request.json();
  const url = truncateText(body.url || body.page_url, 2048);
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400, headers: corsHeaders });
  }

  const pageParts = getUrlParts(url);
  const host = truncateText(body.host || body.page_host, 255) || pageParts?.host || "unknown";
  const path = truncateText(body.path || body.page_path, 1024) || pageParts?.path || "/";
  const siteKey = truncateText(body.site_key || body.site || body.data_site, 128);
  const installationId = truncateText(body.installation_id, 128) || deriveInstallationId(siteKey, host);

  const result = await evaluateRules(
    db,
    {
      url,
      host,
      path,
      referrer: truncateText(body.referrer, 2048),
      referrer_host: truncateText(body.referrer_host, 255),
      utm_source: truncateText(body.utm_source, 128) || pageParts?.utm_source || null,
      utm_medium: truncateText(body.utm_medium, 128) || pageParts?.utm_medium || null,
      utm_campaign: truncateText(body.utm_campaign, 128) || pageParts?.utm_campaign || null,
      language: truncateText(body.language, 32),
      device_type: truncateText(body.device_type, 16),
      timezone_offset: parseNumber(body.timezone_offset),
      installation_id: installationId,
      site_key: siteKey,
    },
    body.debug === true || body.debug === "true"
  );

  return NextResponse.json(result, { headers: corsHeaders });
}
