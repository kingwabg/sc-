/**
 * scripts/db-apply.mjs — Supabase Transaction Pooler에 직접 DDL 적용
 *
 * Transaction pooler는 prepared statements를 지원하지 않음.
 * pg 드라이버는 옵션으로 끌 수 있어 여기서 raw text protocol로 실행.
 *
 *   node scripts/db-apply.mjs
 */
import { readFileSync } from "node:fs";
import pg from "pg";

const { Client } = pg;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL env var");
  process.exit(1);
}

// pgbouncer 옵션: prepared statements 비활성화
const client = new Client({
  connectionString: url + (url.includes("?") ? "&" : "?") + "pgbouncer=true&connection_limit=1",
  // query 옵션 켜기 (raw SQL, no prepared statements)
  query_timeout: 60000,
});

await client.connect();

const sql = readFileSync("migration-clean.sql", "utf-8");

console.log("Applying schema...");
try {
  await client.query(sql);
  console.log("✅ Schema applied");
} catch (e) {
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
