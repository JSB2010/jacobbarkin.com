import appWorker, {
  BucketCachePurge,
  DOQueueHandler,
  DOShardedTagCache,
} from "../.open-next/worker.js";
import { rebuildEmbedDailyMetrics } from "../src/lib/embed/rollups.ts";

export { BucketCachePurge, DOQueueHandler, DOShardedTagCache };

export default {
  async fetch(request, env, ctx) {
    return appWorker.fetch(request, env, ctx);
  },

  async scheduled(controller, env, ctx) {
    const parsedLookback = Number.parseInt(env.EMBED_ROLLUP_LOOKBACK_HOURS || "96", 10);
    const lookbackHours = Number.isFinite(parsedLookback) ? parsedLookback : 96;

    ctx.waitUntil(
      rebuildEmbedDailyMetrics(env.DB, {
        lookbackHours,
        now: new Date(controller.scheduledTime),
      }).then((summary) => {
        console.log(
          JSON.stringify({
            type: "embed_rollup_completed",
            cron: controller.cron,
            scheduledTime: new Date(controller.scheduledTime).toISOString(),
            ...summary,
          })
        );
      })
    );
  },
};
