import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cwd = process.cwd();
const dbName = process.env.D1_DATABASE_NAME || "jacobbarkin-db";
const useRemote = !process.argv.includes("--local");
const targetFlag = useRemote ? "--remote" : "--local";
const schemaPath = path.join(cwd, "src", "lib", "db", "schema.sql");

const TABLE_COLUMN_DEFS = {
  embed_analytics: [
    ["page_host", "TEXT"],
    ["page_path", "TEXT"],
    ["page_title", "TEXT"],
    ["referrer_host", "TEXT"],
    ["utm_source", "TEXT"],
    ["utm_medium", "TEXT"],
    ["utm_campaign", "TEXT"],
    ["utm_term", "TEXT"],
    ["utm_content", "TEXT"],
    ["embed_version", "TEXT"],
    ["embed_variant", "TEXT"],
    ["embed_size", "TEXT"],
    ["embed_theme", "TEXT"],
    ["embed_position", "TEXT"],
    ["embed_align", "TEXT"],
    ["embed_instance_id", "TEXT"],
    ["is_auto", "INTEGER DEFAULT 0"],
    ["installation_id", "TEXT"],
    ["session_id", "TEXT"],
    ["page_view_id", "TEXT"],
    ["event_name", "TEXT"],
    ["site_key", "TEXT"],
    ["page_group", "TEXT"],
    ["experiment_id", "TEXT"],
    ["variant_key", "TEXT"],
    ["rule_id", "TEXT"],
    ["template_id", "TEXT"],
    ["action_type", "TEXT"],
    ["load_ms", "INTEGER"],
    ["render_ms", "INTEGER"],
    ["error_code", "TEXT"],
    ["language", "TEXT"],
    ["timezone_offset", "INTEGER"],
    ["viewport_width", "INTEGER"],
    ["viewport_height", "INTEGER"],
    ["device_type", "TEXT"],
    ["connection_type", "TEXT"],
  ],
  embed_heartbeat: [
    ["page_host", "TEXT"],
    ["page_path", "TEXT"],
    ["page_title", "TEXT"],
    ["referrer_host", "TEXT"],
    ["utm_source", "TEXT"],
    ["utm_medium", "TEXT"],
    ["utm_campaign", "TEXT"],
    ["utm_term", "TEXT"],
    ["utm_content", "TEXT"],
    ["embed_version", "TEXT"],
    ["embed_variant", "TEXT"],
    ["embed_size", "TEXT"],
    ["embed_theme", "TEXT"],
    ["embed_position", "TEXT"],
    ["embed_align", "TEXT"],
    ["embed_instance_id", "TEXT"],
    ["is_auto", "INTEGER DEFAULT 0"],
    ["installation_id", "TEXT"],
    ["session_id", "TEXT"],
    ["page_view_id", "TEXT"],
    ["event_name", "TEXT"],
    ["site_key", "TEXT"],
    ["page_group", "TEXT"],
    ["experiment_id", "TEXT"],
    ["variant_key", "TEXT"],
    ["rule_id", "TEXT"],
    ["template_id", "TEXT"],
    ["action_type", "TEXT"],
    ["load_ms", "INTEGER"],
    ["render_ms", "INTEGER"],
    ["error_code", "TEXT"],
    ["language", "TEXT"],
    ["timezone_offset", "INTEGER"],
    ["viewport_width", "INTEGER"],
    ["viewport_height", "INTEGER"],
    ["device_type", "TEXT"],
    ["connection_type", "TEXT"],
  ],
};

function runWrangler(args, { expectJson = false } = {}) {
  const result = spawnSync("bunx", ["wrangler", "d1", "execute", dbName, targetFlag, "--yes", ...args], {
    cwd,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(detail || `Wrangler command failed with exit code ${result.status ?? 1}`);
  }

  if (!expectJson) {
    return result.stdout.trim();
  }

  return JSON.parse(result.stdout);
}

function execSql(sql) {
  return runWrangler(["--json", "--command", sql], { expectJson: true });
}

function execFile(filePath) {
  return runWrangler(["--file", filePath]);
}

function tableExists(tableName) {
  const result = execSql(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${tableName.replace(/'/g, "''")}' LIMIT 1;`
  );
  return Boolean(result?.[0]?.results?.[0]?.name);
}

function getColumnNames(tableName) {
  if (!tableExists(tableName)) {
    return new Set();
  }

  const result = execSql(`PRAGMA table_info(${tableName});`);
  return new Set((result?.[0]?.results || []).map((row) => row.name));
}

function ensureColumns(tableName, columns) {
  const existingColumns = getColumnNames(tableName);

  for (const [columnName, definition] of columns) {
    if (existingColumns.has(columnName)) {
      continue;
    }

    console.log(`Adding ${tableName}.${columnName}`);
    execSql(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  }
}

function backfillLegacyAnalyticsMetadata() {
  if (!tableExists("embed_analytics")) {
    return;
  }

  execSql(`
    UPDATE embed_analytics
    SET event_type = 'impression'
    WHERE event_type IS NULL OR event_type = 'view';
  `);

  execSql(`
    UPDATE embed_analytics
    SET page_host = CASE
      WHEN page_url LIKE 'http%' THEN
        substr(
          page_url,
          instr(page_url, '://') + 3,
          CASE
            WHEN instr(substr(page_url, instr(page_url, '://') + 3), '/') = 0
              THEN length(substr(page_url, instr(page_url, '://') + 3))
            ELSE instr(substr(page_url, instr(page_url, '://') + 3), '/') - 1
          END
        )
      ELSE page_host
    END,
    page_path = CASE
      WHEN page_url LIKE 'http%' THEN
        CASE
          WHEN instr(substr(page_url, instr(page_url, '://') + 3), '/') = 0
            THEN '/'
          ELSE substr(
            page_url,
            instr(page_url, '://') + 3 + instr(substr(page_url, instr(page_url, '://') + 3), '/')
          )
        END
      ELSE page_path
    END
    WHERE page_url IS NOT NULL AND (page_host IS NULL OR page_path IS NULL);
  `);

  execSql(`
    UPDATE embed_analytics
    SET referrer_host = CASE
      WHEN referrer LIKE 'http%' THEN
        substr(
          referrer,
          instr(referrer, '://') + 3,
          CASE
            WHEN instr(substr(referrer, instr(referrer, '://') + 3), '/') = 0
              THEN length(substr(referrer, instr(referrer, '://') + 3))
            ELSE instr(substr(referrer, instr(referrer, '://') + 3), '/') - 1
          END
        )
      ELSE referrer_host
    END
    WHERE referrer IS NOT NULL AND referrer_host IS NULL;
  `);
}

function backfillEventStore() {
  execSql(`
    INSERT INTO embed_events (
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
    SELECT
      a.id,
      COALESCE(
        NULLIF(a.installation_id, ''),
        LOWER(REPLACE(REPLACE(REPLACE(COALESCE(NULLIF(a.site_key, ''), NULLIF(a.page_host, ''), 'unknown-site'), ' ', '-'), '/', '-'), ':', '-'))
      ) AS installation_id,
      COALESCE(NULLIF(a.session_id, ''), 'legacy-session-' || COALESCE(NULLIF(a.ip_address, ''), a.id)) AS session_id,
      COALESCE(NULLIF(a.page_view_id, ''), 'legacy-page-view-' || a.id) AS page_view_id,
      a.page_url,
      a.page_host,
      a.page_path,
      a.page_title,
      a.referrer,
      a.referrer_host,
      a.utm_source,
      a.utm_medium,
      a.utm_campaign,
      a.utm_term,
      a.utm_content,
      CASE
        WHEN COALESCE(NULLIF(a.event_name, ''), NULLIF(a.event_type, ''), 'impression') = 'view' THEN 'impression'
        ELSE COALESCE(NULLIF(a.event_name, ''), NULLIF(a.event_type, ''), 'impression')
      END AS event_name,
      CASE
        WHEN COALESCE(NULLIF(a.event_type, ''), NULLIF(a.event_name, ''), 'impression') = 'view' THEN 'impression'
        ELSE COALESCE(NULLIF(a.event_type, ''), NULLIF(a.event_name, ''), 'impression')
      END AS event_type,
      a.embed_version,
      a.embed_variant,
      a.embed_size,
      a.embed_theme,
      a.embed_position,
      a.embed_align,
      a.embed_instance_id,
      COALESCE(a.is_auto, 0),
      a.site_key,
      a.page_group,
      a.experiment_id,
      a.variant_key,
      a.rule_id,
      a.template_id,
      a.action_type,
      a.error_code,
      a.load_ms,
      a.render_ms,
      a.device_type,
      a.language,
      a.timezone_offset,
      a.viewport_width,
      a.viewport_height,
      a.connection_type,
      NULL,
      a.created_at
    FROM embed_analytics a
    WHERE NOT EXISTS (
      SELECT 1
      FROM embed_events e
      WHERE e.id = a.id
    );
  `);

  execSql(`
    INSERT INTO embed_events (
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
    SELECT
      h.id,
      COALESCE(
        NULLIF(h.installation_id, ''),
        LOWER(REPLACE(REPLACE(REPLACE(COALESCE(NULLIF(h.site_key, ''), NULLIF(h.page_host, ''), 'unknown-site'), ' ', '-'), '/', '-'), ':', '-'))
      ) AS installation_id,
      COALESCE(NULLIF(h.session_id, ''), 'legacy-heartbeat-session-' || COALESCE(NULLIF(h.page_host, ''), h.id)) AS session_id,
      COALESCE(NULLIF(h.page_view_id, ''), 'legacy-heartbeat-page-view-' || h.id) AS page_view_id,
      h.page_url,
      h.page_host,
      h.page_path,
      h.page_title,
      h.referrer,
      h.referrer_host,
      h.utm_source,
      h.utm_medium,
      h.utm_campaign,
      h.utm_term,
      h.utm_content,
      COALESCE(NULLIF(h.event_name, ''), 'heartbeat') AS event_name,
      'heartbeat' AS event_type,
      h.embed_version,
      h.embed_variant,
      h.embed_size,
      h.embed_theme,
      h.embed_position,
      h.embed_align,
      h.embed_instance_id,
      COALESCE(h.is_auto, 0),
      h.site_key,
      h.page_group,
      h.experiment_id,
      h.variant_key,
      h.rule_id,
      h.template_id,
      h.action_type,
      h.error_code,
      h.load_ms,
      h.render_ms,
      h.device_type,
      h.language,
      h.timezone_offset,
      h.viewport_width,
      h.viewport_height,
      h.connection_type,
      NULL,
      h.created_at
    FROM embed_heartbeat h
    WHERE NOT EXISTS (
      SELECT 1
      FROM embed_events e
      WHERE e.id = h.id
    );
  `);
}

function rebuildInstallations() {
  execSql("DELETE FROM embed_installations;");

  execSql(`
    INSERT INTO embed_installations (
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
    SELECT
      summary.installation_id,
      (
        SELECT site_key
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS site_key,
      COALESCE((
        SELECT page_host
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ), 'unknown') AS page_host,
      NULL,
      'prod',
      NULL,
      summary.first_seen,
      summary.last_seen,
      (
        SELECT page_url
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_page_url,
      (
        SELECT page_title
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_page_title,
      (
        SELECT referrer
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_referrer,
      (
        SELECT referrer_host
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_referrer_host,
      (
        SELECT embed_version
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_embed_version,
      (
        SELECT embed_variant
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_embed_variant,
      (
        SELECT embed_size
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_embed_size,
      (
        SELECT embed_theme
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_embed_theme,
      (
        SELECT embed_position
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_embed_position,
      (
        SELECT embed_align
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_embed_align,
      COALESCE((
        SELECT is_auto
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ), 0) AS last_is_auto,
      (
        SELECT language
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_language,
      (
        SELECT timezone_offset
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_timezone_offset,
      (
        SELECT viewport_width
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_viewport_width,
      (
        SELECT viewport_height
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_viewport_height,
      (
        SELECT device_type
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_device_type,
      (
        SELECT connection_type
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_connection_type,
      (
        SELECT session_id
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_session_id,
      summary.event_count,
      summary.impression_count,
      summary.click_count,
      summary.heartbeat_count,
      (
        SELECT rule_id
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_rule_id,
      (
        SELECT template_id
        FROM embed_events latest
        WHERE latest.installation_id = summary.installation_id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      ) AS last_template_id,
      summary.first_seen,
      summary.last_seen
    FROM (
      SELECT
        installation_id,
        MIN(created_at) AS first_seen,
        MAX(created_at) AS last_seen,
        COUNT(*) AS event_count,
        SUM(CASE WHEN event_name = 'impression' THEN 1 ELSE 0 END) AS impression_count,
        SUM(CASE WHEN event_name = 'click' THEN 1 ELSE 0 END) AS click_count,
        SUM(CASE WHEN event_name = 'heartbeat' THEN 1 ELSE 0 END) AS heartbeat_count
      FROM embed_events
      GROUP BY installation_id
    ) summary;
  `);
}

function rebuildDailyMetrics() {
  execSql("DELETE FROM embed_daily_metrics;");

  execSql(`
    INSERT INTO embed_daily_metrics (
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
    SELECT
      substr(created_at, 1, 10) AS metric_date,
      installation_id,
      COALESCE(page_host, '') AS page_host,
      COALESCE(page_group, '') AS page_group,
      COALESCE(embed_variant, '') AS embed_variant,
      COALESCE(embed_version, '') AS embed_version,
      COALESCE(device_type, '') AS device_type,
      COALESCE(is_auto, 0) AS is_auto,
      COALESCE(rule_id, '') AS rule_id,
      COALESCE(template_id, '') AS template_id,
      COALESCE(experiment_id, '') AS experiment_id,
      COALESCE(variant_key, '') AS variant_key,
      SUM(CASE WHEN event_name = 'load' THEN 1 ELSE 0 END) AS loads,
      SUM(CASE WHEN event_name = 'impression' THEN 1 ELSE 0 END) AS impressions,
      SUM(CASE WHEN event_name = 'click' THEN 1 ELSE 0 END) AS clicks,
      SUM(CASE WHEN event_name = 'heartbeat' THEN 1 ELSE 0 END) AS heartbeats,
      SUM(CASE WHEN event_name = 'error' THEN 1 ELSE 0 END) AS errors,
      SUM(CASE WHEN event_name = 'replacement_applied' THEN 1 ELSE 0 END) AS replacement_applied,
      SUM(CASE WHEN event_name = 'replacement_skipped' THEN 1 ELSE 0 END) AS replacement_skipped,
      datetime('now') AS updated_at
    FROM embed_events
    GROUP BY
      substr(created_at, 1, 10),
      installation_id,
      COALESCE(page_host, ''),
      COALESCE(page_group, ''),
      COALESCE(embed_variant, ''),
      COALESCE(embed_version, ''),
      COALESCE(device_type, ''),
      COALESCE(is_auto, 0),
      COALESCE(rule_id, ''),
      COALESCE(template_id, ''),
      COALESCE(experiment_id, ''),
      COALESCE(variant_key, '');
  `);
}

function printSummary() {
  const summary = execSql(`
    SELECT
      (SELECT COUNT(*) FROM embed_events) AS embed_events,
      (SELECT COUNT(*) FROM embed_installations) AS embed_installations,
      (SELECT COUNT(*) FROM embed_daily_metrics) AS embed_daily_metrics,
      (SELECT COUNT(*) FROM embed_rules) AS embed_rules,
      (SELECT COUNT(*) FROM embed_templates) AS embed_templates;
  `);

  console.log(JSON.stringify(summary[0]?.results?.[0] || {}, null, 2));
}

function main() {
  console.log(`Applying D1 schema upgrade to ${dbName} (${useRemote ? "remote" : "local"})`);

  execFile(schemaPath);

  ensureColumns("embed_analytics", TABLE_COLUMN_DEFS.embed_analytics);
  ensureColumns("embed_heartbeat", TABLE_COLUMN_DEFS.embed_heartbeat);

  backfillLegacyAnalyticsMetadata();
  backfillEventStore();
  rebuildInstallations();
  rebuildDailyMetrics();
  printSummary();
}

main();
