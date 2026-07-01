/**
 * scripts/seed-audit-notice.ts
 * 평가 통보서 미리보기용 추가 데이터 시드
 *
 * 실행:
 *   npx tsx scripts/seed-audit-notice.ts
 *
 * 특징:
 *   - 기존 seed 무영향 (upsert 패턴)
 *   - 평가 항목 확인용 다양한 rate 데이터 생성
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

async function main() {
  console.log("📋 seed-audit-notice: 평가 통보서 미리보기용 추가 데이터\n");

  // ── 1. 아동 상담 기록 추가 (관찰 카테고리) ──────────────────────
  const OBSERVATION_LOGS = [
    { childId: "c01", date: "2026-06-28", content: "오늘 미술 활동에 적극 참여함. 색감 표현이 뛰어남." },
    { childId: "c01", date: "2026-06-29", content: "새로운 친구와 협력하여 레고 조립 완료." },
    { childId: "c02", date: "2026-06-28", content: "말보다 행동으로 감정 표현. 신체 활동 선호." },
    { childId: "c03", date: "2026-06-27", content: "음악 시간에 손닥드럼 참여." },
    { childId: "c03", date: "2026-06-29", content: "점심 식사 시 반찬 선택에 주도적." },
  ];

  for (const log of OBSERVATION_LOGS) {
    const id = `seed_notice_${log.childId}_${log.date.replace(/-/g, "")}`;
    await prisma.careLog.upsert({
      where: { id },
      update: { category: "관찰", content: log.content },
      create: {
        id,
        childId: log.childId,
        date: log.date,
        category: "관찰",
        content: log.content,
        authorId: "u_3",
        authorName: "김선영 선생님",
      },
    }).catch(() => {/* ignore unique constraint */});
    console.log(`  [CareLog] ${log.childId} / ${log.date} — 관찰 기록 추가`);
  }

  // ── 2. ChildDocument 추가 (서류 보관율 확인용) ─────────────────
  const DOCS = [
    { childId: "c01", kind: "iep" as const, content: "개인정보제공동의서 내용" },
    { childId: "c02", kind: "iep" as const, content: "개인정보제공동의서 내용" },
    { childId: "c03", kind: "report" as const, content: "건강검진결과 서류 내용" },
  ];

  for (const doc of DOCS) {
    const id = `seed_doc_${doc.childId}_${doc.kind}`;
    await prisma.childDocument.upsert({
      where: { id },
      update: { content: doc.content },
      create: {
        id,
        childId: doc.childId,
        kind: doc.kind,
        filename: `${doc.kind}_${doc.childId}.pdf`,
        content: doc.content,
        authorId: "u_1",
      },
    }).catch(() => {/* ignore */});
    console.log(`  [ChildDocument] ${doc.childId} — kind: ${doc.kind} 추가`);
  }

  // ── 3. Attendance 추가 (최근 7일) ────────────────────────────
  const recentDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });

  const ATTENDANCES = [
    { childId: "c01", dates: recentDates.slice(0, 5) },
    { childId: "c02", dates: recentDates.slice(1, 6) },
    { childId: "c03", dates: recentDates.slice(2, 7) },
  ];

  for (const att of ATTENDANCES) {
    for (const date of att.dates) {
      const id = `seed_att_${att.childId}_${date.replace(/-/g, "")}`;
      await prisma.attendance.upsert({
        where: { id },
        update: { status: "등원" },
        create: {
          id,
          childId: att.childId,
          date,
          status: "등원",
          authorId: "u_1",
        },
      }).catch(() => {/* ignore */});
    }
    console.log(`  [Attendance] ${att.childId} — ${att.dates.length}건 추가`);
  }

  console.log(`
✅  seed-audit-notice 완료
   - 관찰 기록: ${OBSERVATION_LOGS.length}건 추가
   - ChildDocument: ${DOCS.length}건 추가
   - Attendance: ${ATTENDANCES.reduce((a, b) => a + b.dates.length, 0)}건 추가
   → /audit-prep 에서 평가 통보서 미리보기 확인 가능
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
