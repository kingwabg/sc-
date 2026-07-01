/**
 * scripts/seed-leave.ts
 * P12-1 — 휴가 시드 데이터
 *
 * 실행:
 *   npx tsx scripts/seed-leave.ts
 *
 * 특징:
 *   - Prisma 7 + @prisma/adapter-pg (Supabase Transaction pooler 호환)
 *   - upsert 패턴 → idempotent
 *   - 10건 시드 (PENDING 3, APPROVED 4, USED 3)
 *   - 다가오는 휴가 포함 (2026-07-10, 2026-08-15 등)
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL 환경변수가 설정되지 않음.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const TENANT_ID = "t_acme";

// staff IDs (기존 staff 시드 기준 — staffId로 교체 필요)
// s_1=김선영, s_2=박은수, s_3=왕준하 (所长)
const CASES = [
  // ── PENDING 3건 ───────────────────────────────────────
  {
    id: "lv-seed-01",
    staffId: "s_1",
    type: "ANNUAL" as const,
    startDate: "2026-07-10",
    endDate: "2026-07-11",
    days: 2,
    reason: "개인 사정",
    status: "PENDING" as const,
  },
  {
    id: "lv-seed-02",
    staffId: "s_1",
    type: "ANNUAL" as const,
    startDate: "2026-08-15",
    endDate: "2026-08-17",
    days: 3,
    reason: "여름휴가",
    status: "PENDING" as const,
  },
  {
    id: "lv-seed-03",
    staffId: "s_2",
    type: "SICK" as const,
    startDate: "2026-07-02",
    endDate: "2026-07-02",
    days: 1,
    reason: "감기",
    status: "PENDING" as const,
  },
  // ── APPROVED 4건 ───────────────────────────────────────
  {
    id: "lv-seed-04",
    staffId: "s_1",
    type: "ANNUAL" as const,
    startDate: "2026-05-01",
    endDate: "2026-05-02",
    days: 2,
    reason: "봄휴가",
    status: "APPROVED" as const,
    approvedBy: "所长",
    approvedAt: new Date("2026-04-28T01:00:00Z"),
  },
  {
    id: "lv-seed-05",
    staffId: "s_2",
    type: "ANNUAL" as const,
    startDate: "2026-04-29",
    endDate: "2026-04-30",
    days: 2,
    reason: "결혼기념 여행",
    status: "APPROVED" as const,
    approvedBy: "所长",
    approvedAt: new Date("2026-04-20T05:00:00Z"),
  },
  {
    id: "lv-seed-06",
    staffId: "s_3",
    type: "FAMILY_EVENT" as const,
    startDate: "2026-06-15",
    endDate: "2026-06-15",
    days: 1,
    reason: "조상回歸",
    status: "APPROVED" as const,
    approvedBy: "所长",
    approvedAt: new Date("2026-06-10T00:00:00Z"),
  },
  {
    id: "lv-seed-07",
    staffId: "s_1",
    type: "OFFICIAL" as const,
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    days: 3,
    reason: "교육",
    status: "APPROVED" as const,
    approvedBy: "所长",
    approvedAt: new Date("2026-07-15T01:00:00Z"),
  },
  // ── USED 3건 ─────────────────────────────────────────
  {
    id: "lv-seed-08",
    staffId: "s_1",
    type: "ANNUAL" as const,
    startDate: "2026-03-01",
    endDate: "2026-03-01",
    days: 1,
    reason: "개인 사정",
    status: "USED" as const,
    approvedBy: "所长",
    approvedAt: new Date("2026-02-25T02:00:00Z"),
  },
  {
    id: "lv-seed-09",
    staffId: "s_2",
    type: "HALF_DAY" as const,
    startDate: "2026-04-15",
    endDate: "2026-04-15",
    days: 0.5,
    reason: "병원 방문",
    status: "USED" as const,
    approvedBy: "所长",
    approvedAt: new Date("2026-04-14T06:00:00Z"),
  },
  {
    id: "lv-seed-10",
    staffId: "s_3",
    type: "SICK" as const,
    startDate: "2026-05-10",
    endDate: "2026-05-11",
    days: 2,
    reason: "과로",
    status: "USED" as const,
    approvedBy: "所长",
    approvedAt: new Date("2026-05-10T08:30:00Z"),
  },
];

async function upsertLeave(c: (typeof CASES)[number]) {
  await prisma.leaveRequest.upsert({
    where: { id: c.id },
    update: {
      type: c.type,
      startDate: c.startDate,
      endDate: c.endDate,
      days: c.days,
      reason: c.reason,
      status: c.status,
      approvedBy: c.approvedBy ?? null,
      approvedAt: c.approvedAt ?? null,
    },
    create: {
      id: c.id,
      tenantId: TENANT_ID,
      staffId: c.staffId,
      type: c.type,
      startDate: c.startDate,
      endDate: c.endDate,
      days: c.days,
      reason: c.reason,
      status: c.status,
      approvedBy: c.approvedBy ?? null,
      approvedAt: c.approvedAt ?? null,
    },
  });
}

async function main() {
  console.log("\n🌿  휴가 시드 — 10건\n");

  for (const c of CASES) {
    await upsertLeave(c);
    console.log(`  [${c.status.padEnd(10)}] ${c.id} — ${c.type} / ${c.startDate}~${c.endDate} (${c.days}일)`);
  }

  // 검증
  console.log("\n✅ 검증 — 전체 휴가 목록:");
  const leaves = await prisma.leaveRequest.findMany({
    where: { tenantId: TENANT_ID },
    include: { staff: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const byStatus = (s: string) => leaves.filter((l) => l.status === s).length;
  console.log(`   전체: ${leaves.length}건`);
  console.log(`   PENDING=${byStatus("PENDING")} APPROVED=${byStatus("APPROVED")} USED=${byStatus("USED")} REJECTED=${byStatus("REJECTED")} CANCELLED=${byStatus("CANCELLED")}`);
  console.log("\n   상세:");
  for (const l of leaves) {
    console.log(`   ${l.status.padEnd(10)} ${l.type.padEnd(18)} ${l.staff?.name ?? "?"} ${l.startDate} ~ ${l.endDate} (${l.days}일)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
