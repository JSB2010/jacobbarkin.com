import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}

interface CloudflareEnv {
  DB: D1Database;
}

let localDb: D1Database | null = null;
let localDbInitError: Error | null = null;

class LocalPreparedStatement implements D1PreparedStatement {
  private stmt: {
    get: (...values: unknown[]) => unknown;
    all: (...values: unknown[]) => unknown[];
    run: (...values: unknown[]) => { changes?: number };
  };
  private values: unknown[];

  constructor(stmt: LocalPreparedStatement["stmt"], values: unknown[] = []) {
    this.stmt = stmt;
    this.values = values;
  }

  bind(...values: unknown[]) {
    return new LocalPreparedStatement(this.stmt, values);
  }

  async first<T = unknown>() {
    const row = this.stmt.get(...this.values);
    return (row ?? null) as T | null;
  }

  async all<T = unknown>() {
    const rows = this.stmt.all(...this.values);
    return { results: (rows ?? []) as T[] };
  }

  async run() {
    const info = this.stmt.run(...this.values);
    return { meta: { changes: info?.changes ?? 0 } };
  }
}

async function getLocalD1Database(): Promise<D1Database | null> {
  if (localDb || localDbInitError) {
    return localDb;
  }

  try {
    const fs = await import("node:fs");
    const path = await import("node:path");

    type LocalDatabase = {
      exec: (sql: string) => void;
      prepare: (query: string) => {
        get: (...values: unknown[]) => unknown;
        all: (...values: unknown[]) => unknown[];
        run: (...values: unknown[]) => { changes?: number };
      };
      close?: () => void;
    };

    type LocalDatabaseConstructor = new (path: string) => LocalDatabase;

    let Database: LocalDatabaseConstructor | null = null;

    try {
      const sqliteModule = await import("node:sqlite");
      const DatabaseSync = (sqliteModule as { DatabaseSync?: unknown }).DatabaseSync;
      if (DatabaseSync) {
        Database = DatabaseSync as LocalDatabaseConstructor;
      }
    } catch {
      // Ignore and try better-sqlite3.
    }

    if (!Database) {
      try {
        const sqliteModule = await import("better-sqlite3");
        const defaultExport = (sqliteModule as { default?: unknown }).default ?? sqliteModule;
        Database = defaultExport as LocalDatabaseConstructor;
      } catch {
        throw new Error("No local SQLite driver available");
      }
    }

    const dbPath =
      process.env.LOCAL_D1_PATH ||
      path.join(process.cwd(), ".wrangler", "local-d1.sqlite");
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    const db = new Database(dbPath);
    try {
      db.exec("PRAGMA journal_mode = WAL;");
    } catch {
      // Non-fatal: some SQLite builds may not support this pragma.
    }

    const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    db.exec(schema);

    localDb = {
      prepare: (query: string) => new LocalPreparedStatement(db.prepare(query)),
    };

    return localDb;
  } catch (error) {
    localDbInitError = error instanceof Error ? error : new Error("Failed to initialize local D1");
    console.warn("Local D1 fallback unavailable:", localDbInitError.message);
    return null;
  }
}

export async function getD1Database(): Promise<D1Database | null> {
  const isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";
  if (isDev && process.env.NEXT_DEV_USE_LOCAL_D1 === "1") {
    return getLocalD1Database();
  }

  try {
    const context = await getCloudflareContext({ async: true });
    const env = (context as unknown as { env: CloudflareEnv }).env;
    if (env?.DB) {
      return env.DB;
    }
  } catch {
    // Context not available (likely local dev without Wrangler).
  }

  if (!isDev) {
    return null;
  }

  return getLocalD1Database();
}
