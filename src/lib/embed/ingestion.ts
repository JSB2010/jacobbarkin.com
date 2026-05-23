import type { NextRequest } from "next/server";

import type { D1Database, D1PreparedStatement } from "@/lib/db/d1";
import {
  generateId,
  prepareInsertEmbedEvent,
  prepareUpsertInstallation,
  type EmbedTelemetryPayload,
} from "@/lib/embed/utils";

type PublicJsonPayload = Record<string, unknown> | Record<string, unknown>[];

export async function parsePublicJsonBody(request: NextRequest): Promise<PublicJsonPayload> {
  const raw = await request.text();
  if (!raw.trim()) return {};
  return JSON.parse(raw) as PublicJsonPayload;
}

export async function ingestTelemetryPayloads(db: D1Database, payloads: EmbedTelemetryPayload[]) {
  const ids = payloads.map(() => generateId("evt"));

  if (db.batch && payloads.length > 0) {
    const statements: D1PreparedStatement[] = [];
    payloads.forEach((payload, index) => {
      statements.push(prepareInsertEmbedEvent(db, ids[index], payload));
      statements.push(prepareUpsertInstallation(db, payload));
    });
    await db.batch(statements);
    return ids;
  }

  for (let index = 0; index < payloads.length; index += 1) {
    await prepareInsertEmbedEvent(db, ids[index], payloads[index]).run();
    await prepareUpsertInstallation(db, payloads[index]).run();
  }

  return ids;
}
