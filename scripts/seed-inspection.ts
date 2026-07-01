/**
 * scripts/seed-inspection.ts
 *
 * P7 — 디지털 안전점검 샘플 데이터 시드
 *
 * 실행:
 *   npx tsx scripts/seed-inspection.ts
 *
 * 내용:
 *   - 소방 안전 점검 템플릿 5항목 시드 (InspectionItem 5건)
 *   - 첫 점검 1건 (모든 항목 PASS, status=PASSED)
 *   - upsert 패턴 → idempotent
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
const INSPECTION_ID = "ins-fire-safety-001";

// ─── Fire Safety Template Items ─────────────────────────

const FIRE_SAFETY_ITEMS = [
  "소화기 비치 및 관리 상태 정상",
  "소화기 압력계 눈금 정상 (녹색 영역)",
  "피난 유도등 점등 상태 정상",
  "피난구 확보 및 통로 장애물 없음",
  "소방 registration 증 서류 비치",
];

async function main() {
  console.log("🔒  Seeding fire-safety inspection sample...\n");

  // Upsert inspection
  await prisma.inspection.upsert({
    where: { id: INSPECTION_ID },
    update: {
      category: "FIRE_SAFETY",
      title: "소방 안전 점검",
      checkedBy: "왕준하",
      status: "PASSED",
      notes: "전 항목 정상. 소화기 압력계 눈금 확인 완료.",
    },
    create: {
      id: INSPECTION_ID,
      tenantId: TENANT_ID,
      category: "FIRE_SAFETY",
      title: "소방 안전 점검",
      checkedBy: "왕준하",
      status: "PASSED",
      notes: "전 항목 정상. 소화기 압력계 눈금 확인 완료.",
      checkedAt: new Date(),
    },
  });

  console.log(`[Inspection] ${INSPECTION_ID} — 소방 안전 점검 (PASSED)`);

  // Upsert items
  for (let i = 0; i < FIRE_SAFETY_ITEMS.length; i++) {
    const itemId = `${INSPECTION_ID}-item-${i + 1}`;
    await prisma.inspectionItem.upsert({
      where: { id: itemId },
      update: {
        label: FIRE_SAFETY_ITEMS[i],
        result: "PASS",
        note: null,
        position: i + 1,
      },
      create: {
        id: itemId,
        inspectionId: INSPECTION_ID,
        label: FIRE_SAFETY_ITEMS[i],
        result: "PASS",
        note: null,
        position: i + 1,
      },
    });
    console.log(`  [Item] ${itemId} — PASS`);
  }

  // ─── 검증 쿼리 ─────────────────────────────────────────────
  console.log("\n✅  검증 — 생성된 점검:");
  const inspection = await prisma.inspection.findUnique({
    where: { id: INSPECTION_ID },
    include: { items: { orderBy: { position: "asc" } } },
  });

  if (inspection) {
    console.log(`\n  점검: ${inspection.title}`);
    console.log(`  카테고리: ${inspection.category}`);
    console.log(`  상태: ${inspection.status}`);
    console.log(`  점검자: ${inspection.checkedBy}`);
    console.log(`  메모: ${inspection.notes ?? "(없음)"}`);
    console.log("\n  항목:");
    for (const item of inspection.items) {
      console.log(`    ${item.position}. [${item.result}] ${item.label}`);
    }
  }

  console.log(`
🧭  확인 URL: http://localhost:3001/facility/inspection
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
