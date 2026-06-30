import { readFileSync } from "node:fs";
import pg from "pg";

const { Client } = pg;
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const client = new Client({
  connectionString:
    url + (url.includes("?") ? "&" : "?") + "pgbouncer=true&connection_limit=1",
});
await client.connect();

// 각 테이블의 row count + 첫 row 일부 미리보기
const tables = [
  "Tenant", "User", "Staff", "StaffAttendance", "Volunteer", "VolunteerAttendance",
  "Member", "Child", "ChildCardMeta", "ChildPhysical", "ChildObservations",
  "Attendance", "CareLog", "Doc", "DocumentIndex",
  "ApprovalRequest", "ApprovalStep", "AnnualPlan", "Program",
  "MonthlyPlan", "WeeklyGoal", "DailyLog",
];

console.log("=".padEnd(50, "="));
console.log("📊  Database Row Counts (Supabase)");
console.log("=".padEnd(50, "="));

for (const t of tables) {
  const res = await client.query(`SELECT COUNT(*)::int as c FROM "${t}"`);
  const c = res.rows[0].c;
  const status = c > 0 ? "✅" : "⏸️ ";
  console.log(`${status}  ${t.padEnd(22)} ${String(c).padStart(4)} rows`);
}

console.log("\n" + "=".padEnd(50, "="));
console.log("🔍  Sample data");
console.log("=".padEnd(50, "="));

const samples = [
  ["Tenant", `SELECT id, name, emoji, "memberCount" FROM "Tenant" LIMIT 3`],
  ["Child",  `SELECT id, name, grade, school, status FROM "Child" LIMIT 5`],
  ["Staff",  `SELECT id, name, position, status FROM "Staff" ORDER BY id`],
  ["Member", `SELECT id, name, type, contribution, status FROM "Member"`],
  ["ApprovalRequest", `SELECT id, title, form, status FROM "ApprovalRequest"`],
];

for (const [name, sql] of samples) {
  console.log(`\n--- ${name} ---`);
  const res = await client.query(sql);
  for (const row of res.rows) {
    console.log("  ", JSON.stringify(row));
  }
}

await client.end();
