/**
 * scripts/seed-cross-check.ts
 * 평가 대비 크로스체크 테스트용 모순 케이스 시드
 *
 * 실행:
 *   npx tsx scripts/seed-cross-check.ts
 *
 * 특징:
 *   - prisma db seed와 독립적으로 실행 (기존 데이터 보존)
 *   - upsert 패턴 → idempotent (여러 번 실행해도 안전)
 *   - Attendance + CareLog 사이에 모순 케이스 2건 삽입:
 *     1. 장민서(c02) / 2026-07-05: Attendance PRESENT + CareLog 없음 → ATTENDANCE_NO_LOG
 *     2. 박서연(c01)  / 2026-07-08: CareLog 있음 + Attendance ABSENT → LOG_NO_ATTENDANCE
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

// ─── 케이스 1: 장민서(c02) / 2026-07-05 ─────────────────────
// Attendance PRESENT but no CareLog → ATTENDANCE_NO_LOG
const CASE_1 = {
  childId:   "c02",
  childName: "장민서",
  date:      "2026-07-05",
  attendId:  "cc_att_c02_2026-07-05",
  attendStatus: "등원" as const,
  careLogId: "cc_log_c02_2026-07-05",
};

// ─── 케이스 2: 박서연(c01) / 2026-07-08 ─────────────────────
// CareLog exists but Attendance ABSENT → LOG_NO_ATTENDANCE
const CASE_2 = {
  childId:   "c01",
  childName: "박서연",
  date:      "2026-07-08",
  attendId:  "cc_att_c01_2026-07-08",
  attendStatus: "결석" as const,
  careLogId: "cc_log_c01_2026-07-08",
};

async function upsertAttendance(
  p: PrismaClient,
  childId: string,
  date: string,
  status: "등원" | "결석",
  id: string,
) {
  await p.attendance.upsert({
    where: { id },
    update: { status },
    create: { id, childId, date, status, authorId: "u_1" },
  });
  console.log(`  [Attendance] ${childId} / ${date} → ${status} (id: ${id})`);
}

async function upsertCareLog(
  p: PrismaClient,
  childId: string,
  date: string,
  id: string,
) {
  await p.careLog.upsert({
    where: { id },
    update: { date },
    create: {
      id,
      childId,
      date,
      category: "관찰",
      content: "평가 대비 모순 테스트 — 실제 상담 내용 아님",
      authorId: "u_3",
      authorName: "김선영 선생님",
    },
  });
  console.log(`  [CareLog]    ${childId} / ${date} → 있음 (id: ${id})`);
}

async function deleteCareLog(p: PrismaClient, id: string) {
  await p.careLog.deleteMany({ where: { id } }).catch(() => {/* ignore if not exists */});
  console.log(`  [CareLog]    deleted id=${id}`);
}

async function main() {
  console.log("🔍  Checking existing conflict data...\n");

  // ── 케이스 1: ATTENDANCE_NO_LOG ────────────────────────────
  console.log(`[케이스 1] 장민서 / ${CASE_1.date} — Attendance PRESENT + CareLog 없음`);
  await upsertAttendance(prisma, CASE_1.childId, CASE_1.date, CASE_1.attendStatus, CASE_1.attendId);
  await deleteCareLog(prisma, CASE_1.careLogId);
  console.log("  → ATTENDANCE_NO_LOG 충돌 생성 완료\n");

  // ── 케이스 2: LOG_NO_ATTENDANCE ───────────────────────────
  console.log(`[케이스 2] 박서연 / ${CASE_2.date} — CareLog 있음 + Attendance ABSENT`);
  await upsertAttendance(prisma, CASE_2.childId, CASE_2.date, CASE_2.attendStatus, CASE_2.attendId);
  await upsertCareLog(prisma, CASE_2.childId, CASE_2.date, CASE_2.careLogId);
  console.log("  → LOG_NO_ATTENDANCE 충돌 생성 완료\n");

  // ── 검증 쿼리 ──────────────────────────────────────────────
  console.log("✅  검증 — 생성된 Attendance 레코드:");
  const attendances = await prisma.attendance.findMany({
    where: {
      id: { in: [CASE_1.attendId, CASE_2.attendId] },
    },
    include: { child: { select: { name: true } } },
  });
  for (const a of attendances) {
    console.log(`   ${a.child.name} / ${a.date} — ${a.status}`);
  }

  console.log("\n✅  검증 — 생성된 CareLog 레코드:");
  const careLogs = await prisma.careLog.findMany({
    where: {
      id: { in: [CASE_1.careLogId, CASE_2.careLogId] },
    },
    include: { child: { select: { name: true } } },
  });
  for (const cl of careLogs) {
    console.log(`   ${cl.child.name} / ${cl.date} — ${cl.category}`);
  }

  console.log(`
📋  충돌 요약:
   1. 장민서 / 2026-07-05 — 🟡 Attendance(등원) but CareLog 없음
   2. 박서연 / 2026-07-08 — 🔴 CareLog 있음 but Attendance(결석)
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
