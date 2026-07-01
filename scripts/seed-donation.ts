/**
 * scripts/seed-donation.ts
 * P8 — 후원금/물품 대장 시드 데이터
 *
 * 실행:
 *   npx tsx scripts/seed-donation.ts
 *
 * 특징:
 *   - Prisma 7 + @prisma/adapter-pg (Supabase Transaction pooler 호환)
 *   - upsert 패턴 → idempotent
 *   - Donation 모델 사용
 *   - CASH 3건 + GOODS 2건 = 5건 시드
 *     1. don-cash-001 — 김영란, 50만원 (정기 후원 5개월), 영수증 RC-2026-0001 발급 완료
 *     2. don-cash-002 — 이철수, 100만원 (기관 운영비)
 *     3. don-cash-003 — 박정화, 30만원
 *     4. don-goods-001 — 해피마트, 아동 간식 30개
 *     5. don-goods-002 — (주)교보문고, 아동 도서 20권
 *
 * 검증:
 *   npx tsx scripts/seed-donation.ts
 *   GET /donations → 5건 표시 + 통계 카드 (₩1,800,000 + 2건 물품 + 1건 영수증)
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL 환경변수가 설정되지 않음.");
  console.error(".env.local에 추가하거나 DATABASE_URL=... 인라인으로 실행하세요.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const TENANT_ID = "t_acme";

/** YYYY-MM-DD + 09:00 KST → UTC Date */
function dateKst(yyyyMmDd: string): Date {
  // YYYY-MM-DDTHH:mm:ss (KST 기준) → UTC 변환
  // 단순화: KST 자정 + 9h offset = UTC 자정
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - 9 * 3600 * 1000);
}

// ─── 시드 케이스 5건 ─────────────────────────────────────────

const CASE_CASH_1 = {
  id:           "don-cash-001",
  donorName:    "김영란",
  donorContact: "010-1234-5678",
  type:         "CASH" as const,
  amount:       new Prisma.Decimal(500_000),
  itemName:     null,
  itemQty:      null,
  receivedAt:   dateKst("2026-06-10"),
  notes:        "정기 후원 — 매월 10만원 × 5개월",
  receiptIssued: true,
  receiptNumber: "RC-2026-0001",
};

const CASE_CASH_2 = {
  id:           "don-cash-002",
  donorName:    "이철수",
  donorContact: "010-2345-6789",
  type:         "CASH" as const,
  amount:       new Prisma.Decimal(1_000_000),
  itemName:     null,
  itemQty:      null,
  receivedAt:   dateKst("2026-06-15"),
  notes:        "기관 운영비 지원 — 감사합니다",
  receiptIssued: false,
  receiptNumber: null,
};

const CASE_CASH_3 = {
  id:           "don-cash-003",
  donorName:    "박정화",
  donorContact: null,
  type:         "CASH" as const,
  amount:       new Prisma.Decimal(300_000),
  itemName:     null,
  itemQty:      null,
  receivedAt:   dateKst("2026-06-20"),
  notes:        null,
  receiptIssued: false,
  receiptNumber: null,
};

const CASE_GOODS_1 = {
  id:           "don-goods-001",
  donorName:    "해피마트",
  donorContact: "051-123-4567",
  type:         "GOODS" as const,
  amount:       null,
  itemName:     "아동 간식 (스낵팩)",
  itemQty:      30,
  receivedAt:   dateKst("2026-06-05"),
  notes:        "6월 행사 행사 지원물품",
  receiptIssued: false,
  receiptNumber: null,
};

const CASE_GOODS_2 = {
  id:           "don-goods-002",
  donorName:    "(주)교보문고",
  donorContact: "02-1234-5678",
  type:         "GOODS" as const,
  amount:       null,
  itemName:     "아동 도서 (한글독서 세트)",
  itemQty:      20,
  receivedAt:   dateKst("2026-06-18"),
  notes:        "여름 독서 캠페인 지원 — 당초 30권 요청, 20권 도착",
  receiptIssued: false,
  receiptNumber: null,
};

type DonationCase = {
  id: string;
  donorName: string;
  donorContact: string | null;
  type: "CASH" | "GOODS";
  amount: Prisma.Decimal | null;
  itemName: string | null;
  itemQty: number | null;
  receivedAt: Date;
  notes: string | null;
  receiptIssued: boolean;
  receiptNumber: string | null;
};

async function upsertDonation(c: DonationCase) {
  await prisma.donation.upsert({
    where: { id: c.id },
    update: {
      donorName:    c.donorName,
      donorContact: c.donorContact,
      type:         c.type,
      amount:       c.amount,
      itemName:     c.itemName,
      itemQty:      c.itemQty,
      receivedAt:   c.receivedAt,
      notes:        c.notes,
      receiptIssued: c.receiptIssued,
      receiptNumber: c.receiptNumber,
    },
    create: {
      id:            c.id,
      tenantId:      TENANT_ID,
      donorName:     c.donorName,
      donorContact:  c.donorContact,
      type:          c.type,
      amount:        c.amount,
      itemName:      c.itemName,
      itemQty:       c.itemQty,
      receivedAt:    c.receivedAt,
      notes:         c.notes,
      receiptIssued: c.receiptIssued,
      receiptNumber: c.receiptNumber,
    },
  });
  const summary =
    c.type === "CASH"
      ? `${c.amount?.toString() ?? "?"}원`
      : `${c.itemName} ×${c.itemQty}`;
  console.log(`  [Don] ${c.id} → ${c.donorName} · ${summary}`);
}

async function main() {
  console.log("💰  Seeding donation ledger samples...\n");

  console.log("[금전 후원 3건]");
  await upsertDonation(CASE_CASH_1);
  await upsertDonation(CASE_CASH_2);
  await upsertDonation(CASE_CASH_3);

  console.log("\n[물품 후원 2건]");
  await upsertDonation(CASE_GOODS_1);
  await upsertDonation(CASE_GOODS_2);

  // ─── 검증 쿼리 ──────────────────────────────────────────────
  console.log("\n✅  검증 — 생성된 Donation:");
  const donations = await prisma.donation.findMany({
    orderBy: { receivedAt: "asc" },
  });
  let cashTotal = 0;
  let cashCount = 0;
  let goodsCount = 0;
  let receiptCount = 0;
  for (const d of donations) {
    if (d.type === "CASH") {
      cashCount++;
      cashTotal += Number(d.amount?.toString() ?? "0");
    } else {
      goodsCount++;
    }
    if (d.receiptIssued) receiptCount++;
    const receiptBadge =
      d.receiptIssued && d.receiptNumber ? `✓ ${d.receiptNumber}` : "⏳ 미발급";
    const tag = d.type === "CASH" ? "💰" : "📦";
    console.log(
      `   ${tag} ${d.id} · ${d.receivedAt.toISOString().slice(0, 10)} · ${receiptBadge} · ${d.donorName}`,
    );
  }

  console.log(`
📊  시드 요약:
   - 후원 총 ${donations.length}건 (금전 ${cashCount} · 물품 ${goodsCount})
   - 후원금 합계 ${cashTotal.toLocaleString("ko-KR")}원
   - 영수증 발급 ${receiptCount}건 / 미발급 ${donations.length - receiptCount}건

🧭  확인 URL:
   - 목록:   http://localhost:3001/donations
   - 상세:   http://localhost:3001/donations/${CASE_CASH_1.id}
   - 영수증: http://localhost:3001/api/donations/${CASE_CASH_1.id}/receipt
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
