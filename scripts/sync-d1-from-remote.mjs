import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dbName = process.env.D1_DATABASE_NAME || "jacobbarkin-db";
const exportPath =
  process.env.D1_EXPORT_PATH ||
  path.join(process.cwd(), ".wrangler", "remote-d1.sql");
const dbPath =
  process.env.LOCAL_D1_PATH ||
  path.join(process.cwd(), ".wrangler", "local-d1.sqlite");
const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
const importRuntimeModule = (specifier) => import(specifier);

async function openLocalDatabase(filePath) {
  try {
    const { DatabaseSync } = await importRuntimeModule(["node", "sqlite"].join(":"));
    return new DatabaseSync(filePath);
  } catch {
    // Fall back to better-sqlite3 for older Node versions.
  }

  try {
    const sqliteModule = await importRuntimeModule(["better", "sqlite3"].join("-"));
    const Database =
      sqliteModule.default ||
      sqliteModule;
    return new Database(filePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`No local SQLite driver available: ${message}`);
  }
}

fs.mkdirSync(path.dirname(exportPath), { recursive: true });

const exportResult = spawnSync(
  "bunx",
  ["wrangler", "d1", "export", dbName, "--remote", "--output", exportPath, "--no-schema"],
  { stdio: "inherit" }
);

if (exportResult.status !== 0) {
  process.exit(exportResult.status ?? 1);
}

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
if (fs.existsSync(dbPath)) {
  fs.rmSync(dbPath);
}

const db = await openLocalDatabase(dbPath);
try {
  db.exec("PRAGMA journal_mode = WAL;");
} catch {
  // Non-fatal: some SQLite builds may not support this pragma.
}

const schemaSql = fs.readFileSync(schemaPath, "utf8");
db.exec(schemaSql);

const dataSql = fs.readFileSync(exportPath, "utf8");
if (dataSql.trim().length > 0) {
db.exec(dataSql);
}

db.close();

console.log(`Local D1 snapshot created at ${dbPath}`);
