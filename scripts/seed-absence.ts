/**
 * scripts/seed-absence.ts
 * P5-2 결석 자동 사유서 시드
 *
 * 실행:
 *   npx tsx scripts/seed-absence.ts
 *
 * 특징:
 *   - prisma db seed와 독립적으로 실행 (기존 데이터 보존)
 *   - upsert 패턴 → idempotent (여러 번 실행해도 안전)
 *   - 장민서(c02) / 2026-07-10: Attendance(결석) + CareLog(ABSENCE_REASON)
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

// ─── 결석 사유서 케이스 ─────────────────────────────────────
// 장민서(c02) / 2026-07-10: 결석 + 질병 사유서
const CASE = {
  childId:      "c02",
  childName:    "장민서",
  date:         "2026-07-10",
  attendId:     "ab_att_c02_2026-07-10",
  careLogId:    "ab_log_c02_2026-07-10",
  reasonLabel:   "질병",
  reasonNote:   "발열로 인한 병원 방문",
};

async function upsertAttendance() {
  await prisma.attendance.upsert({
    where: { id: CASE.attendId },
    update: { status: "결석", note: `[결석사유: ${CASE.reasonLabel}] ${CASE.reasonNote}` },
    create: {
      id:       CASE.attendId,
      childId:  CASE.childId,
      date:     CASE.date,
      status:   "결석",
      note:     `[결석사유: ${CASE.reasonLabel}] ${CASE.reasonNote}`,
      authorId: "u_1",
    },
  });
  console.log(`  [Attendance] ${CASE.childId} / ${CASE.date} → 결석 (id: ${CASE.attendId})`);
}

async function upsertCareLog() {
  await prisma.careLog.upsert({
    where: { id: CASE.careLogId },
    update: {
      date: CASE.date,
      content: `[결석 사유: ${CASE.reasonLabel}] ${CASE.reasonNote}`,
    },
    create: {
      id:         CASE.careLogId,
      childId:    CASE.childId,
      date:       CASE.date,
      category:   "관찰",
      content:    `[결석 사유: ${CASE.reasonLabel}] ${CASE.reasonNote}`,
      authorId:   "u_1",
      authorName: "시스템",
    },
  });
  console.log(`  [CareLog]    ${CASE.childId} / ${CASE.date} → 결석사유서 (id: ${CASE.careLogId})`);
}

async function main() {
  console.log(`\n🩺  결석 사유서 시드 — ${CASE.childName} / ${CASE.date}\n`);

  await upsertAttendance();
  await upsertCareLog();

  // 검증
  console.log("\n✅  검증 — Attendance 레코드:");
  const att = await prisma.attendance.findUnique({
    where: { id: CASE.attendId },
    include: { child: { select: { name: true } } },
  });
  if (att) {
    console.log(`   ${att.child.name} / ${att.date} — ${att.status}`);
    console.log(`   note: ${att.note}`);
  }

  console.log("\n✅  검증 — CareLog 레코드:");
  const cl = await prisma.careLog.findUnique({
    where: { id: CASE.careLogId },
    include: { child: { select: { name: true } } },
  });
  if (cl) {
    console.log(`   ${cl.child.name} / ${cl.date} — ${cl.category}`);
    console.log(`   content: ${cl.content}`);
  }

  console.log(`
📋  요약:
   ${CASE.childName} / ${CASE.date} — 결석(질병) + CareLog 결석사유서 자동 생성됨
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
