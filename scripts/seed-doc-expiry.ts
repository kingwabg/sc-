/**
 * scripts/seed-doc-expiry.ts
 * P6 — 문서 만료 추적용 샘플 데이터 시드
 *
 * 실행:
 *   npx tsx scripts/seed-doc-expiry.ts
 *
 * 특징:
 *   - prisma db seed 와 독립적으로 실행 (기존 데이터 보존)
 *   - upsert 패턴 → idempotent (여러 번 실행해도 안전)
 *   - Doc 모델의 expiryDate / category / sourceType / sourceId 컬럼 사용
 *   - STAFF 카테고리 4대 폭력/범죄경력/이수증 3건 시드:
 *     1. d-exp-staff-violence — 4대 폭력 갱신, +7일 후 만료 (EXPIRING_SOON)
 *     2. d-exp-staff-crime   — 범죄경력, -5일 전 만료 (EXPIRED)
 *     3. d-exp-staff-cert    — 이수증, +60일 후 만료 (VALID)
 *
 * 검증:
 *   npx tsx scripts/seed-doc-expiry.ts
 *   GET /documents/expiry → 신호등 카드 + 3행 표시
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

/** 오늘 기준 N일 후/전 Date */
function dayOffset(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  // KST 자정 (UTC 자정 + 9h)
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) + 9 * 3600 * 1000);
}

// ─── 시드 케이스 3건 ─────────────────────────────────────────

const CASE_1 = {
  id:         "d-exp-staff-violence",
  title:      "4대 폭력 예방 교육 이수 (박은수)",
  category:   "STAFF" as const,
  sourceType: "staff",
  sourceId:   "u_2",
  expiryDate: dayOffset(7),   // 7일 후 만료 → EXPIRING_SOON
  authorId:   "u_1",
  authorName: "왕준하",
};

const CASE_2 = {
  id:         "d-exp-staff-crime",
  title:      "범죄경력 조회 확인서 (박은수)",
  category:   "STAFF" as const,
  sourceType: "staff",
  sourceId:   "u_2",
  expiryDate: dayOffset(-5),  // 5일 전 만료 → EXPIRED
  authorId:   "u_1",
  authorName: "왕준하",
};

const CASE_3 = {
  id:         "d-exp-staff-cert",
  title:      "아동권리 교육 이수증 (김선영)",
  category:   "STAFF" as const,
  sourceType: "staff",
  sourceId:   "u_3",
  expiryDate: dayOffset(60),  // 60일 후 만료 → VALID
  authorId:   "u_1",
  authorName: "왕준하",
};

async function upsertDoc(c: typeof CASE_1) {
  await prisma.doc.upsert({
    where: { id: c.id },
    update: {
      title:      c.title,
      category:   c.category,
      sourceType: c.sourceType,
      sourceId:   c.sourceId,
      expiryDate: c.expiryDate,
    },
    create: {
      id:         c.id,
      tenantId:   TENANT_ID,
      title:      c.title,
      content:    `<p>${c.title} — P6 만료 추적용 시드 데이터</p>`,
      kind:       "html",
      category:   c.category,
      sourceType: c.sourceType,
      sourceId:   c.sourceId,
      expiryDate: c.expiryDate,
      authorId:   c.authorId,
      authorName: c.authorName,
    },
  });
  console.log(
    `  [Doc] ${c.id} → ${c.title} (만료 ${c.expiryDate.toISOString().slice(0, 10)})`,
  );
}

async function main() {
  console.log("📋  Seeding doc expiry samples...\n");

  console.log(`[케이스 1] 4대 폭력 갱신 — 7일 후 만료 (EXPIRING_SOON)`);
  await upsertDoc(CASE_1);

  console.log(`[케이스 2] 범죄경력 — 5일 전 만료 (EXPIRED)`);
  await upsertDoc(CASE_2);

  console.log(`[케이스 3] 이수증 — 60일 후 만료 (VALID)`);
  await upsertDoc(CASE_3);

  // ─── 검증 쿼리 ──────────────────────────────────────────────
  console.log("\n✅  검증 — 생성된 Doc 만료 추적 대상:");
  const docs = await prisma.doc.findMany({
    where: { expiryDate: { not: null } },
    orderBy: { expiryDate: "asc" },
  });
  for (const d of docs) {
    const status =
      !d.expiryDate
        ? "—"
        : d.expiryDate.getTime() < Date.now()
        ? "🔴 EXPIRED"
        : d.expiryDate.getTime() < Date.now() + 30 * 86_400_000
        ? "🟡 EXPIRING_SOON"
        : "🟢 VALID";
    console.log(
      `   ${d.id} · ${d.expiryDate!.toISOString().slice(0, 10)} · ${status} · ${d.title}`,
    );
  }

  console.log(`
📊  시드 요약:
   - 만료 추적 대상 ${docs.length}건
   - EXPIRING_SOON 1건 (7일 후) · EXPIRED 1건 (5일 지남) · VALID 1건 (60일 후)

🧭  확인 URL: http://localhost:3001/documents/expiry
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