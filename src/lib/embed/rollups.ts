type RollupPreparedStatement = {
  bind(...values: unknown[]): RollupPreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<{ meta?: { changes?: number } }>;
};

type RollupDatabase = {
  prepare(query: string): RollupPreparedStatement;
};

type EmbedRollupOptions = {
  lookbackHours?: number;
  now?: Date;
};

type RollupSummary = {
  lookbackHours: number;
  metricStartDate: string;
  sourceEvents: number;
  rebuiltRows: number;
};

function normalizeLookbackHours(value: number | undefined) {
  if (!Number.isFinite(value) || !value) {
    return 96;
  }

  return Math.max(1, Math.min(Math.floor(value), 24 * 30));
}

export async function rebuildEmbedDailyMetrics(db: RollupDatabase, options: EmbedRollupOptions = {}): Promise<RollupSummary> {
  const lookbackHours = normalizeLookbackHours(options.lookbackHours);
  const now = options.now ?? new Date();
  const windowStart = new Date(now.getTime() - lookbackHours * 60 * 60 * 1000);
  const metricStartDate = windowStart.toISOString().slice(0, 10);
  const sourceSince = windowStart.toISOString();

  const sourceEvents = await db.prepare(
    `SELECT COUNT(*) AS count
     FROM embed_events
     WHERE created_at >= ?`
  ).bind(sourceSince).first<{ count: number }>();

  await db.prepare(
    `DELETE FROM embed_daily_metrics
     WHERE metric_date >= ?`
  ).bind(metricStartDate).run();

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
     WHERE created_at >= ?
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
       COALESCE(variant_key, '')`
  ).bind(sourceSince).run();

  const rebuiltRows = await db.prepare(
    `SELECT COUNT(*) AS count
     FROM embed_daily_metrics
     WHERE metric_date >= ?`
  ).bind(metricStartDate).first<{ count: number }>();

  return {
    lookbackHours,
    metricStartDate,
    sourceEvents: Number(sourceEvents?.count || 0),
    rebuiltRows: Number(rebuiltRows?.count || 0),
  };
}
