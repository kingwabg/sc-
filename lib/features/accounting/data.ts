/**
 * lib/features/accounting/data.ts
 *
 * P13 — 회계 포털 Mock 데이터
 * - Budget: 12개월 × 5항목 = 60건
 * - Expense: 30건
 * - AuditTrail: 10건
 */

import type {
  Budget,
  Expense,
  AuditTrailEntry,
  BudgetCategory,
} from "./types";

function asDate(s: string): Date {
  return new Date(s);
}

// ─── Budget categories ────────────────────────────────────────
const CATEGORIES: BudgetCategory[] = [
  "인건비",
  "운영비",
  "사업비",
  "후원금",
  "보조금",
];

// 월별 한도 설정 (원) — 인건비/운영비/사업비/후원금/보조금 순서
const MONTHLY_LIMITS: Record<BudgetCategory, number[]> = {
  인건비:   [5_000_000, 5_000_000, 5_000_000, 5_000_000, 5_000_000, 5_000_000, 5_000_000, 5_000_000, 5_000_000, 5_000_000, 5_000_000, 5_000_000],
  운영비:   [1_200_000, 1_200_000, 1_200_000, 1_200_000, 1_200_000, 1_200_000, 1_200_000, 1_200_000, 1_200_000, 1_200_000, 1_200_000, 1_200_000],
  사업비:   [1_500_000, 1_500_000, 1_500_000, 1_800_000, 1_800_000, 1_500_000, 1_500_000, 1_500_000, 1_500_000, 1_800_000, 1_800_000, 1_500_000],
  후원금:     [300_000,   300_000,   300_000,   300_000,   300_000,   300_000,   300_000,   300_000,   300_000,   300_000,   300_000,   300_000],
  보조금:  [2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000],
};

// 사용률 시드 (%) — 12개월 × 5항목 = 60개
const USAGE_RATES = [
  // 인건비 (항상 높음)
  [95, 98, 100, 97, 95, 99, 100, 96, 98, 97, 95, 94],
  // 운영비
  [72, 65, 80, 85, 70, 75, 68, 90, 88, 72, 65, 60],
  // 사업비
  [55, 60, 75, 92, 88, 70, 65, 80, 85, 95, 98, 50],
  // 후원금
  [30, 40, 50, 60, 70, 80, 90, 85, 75, 65, 55, 45],
  // 보조금
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
];

// ─── Budget: 60건 ─────────────────────────────────────────────
export const MOCK_BUDGETS: Budget[] = (() => {
  const FISCAL = 2026;
  const rows: Budget[] = [];
  for (let m = 1; m <= 12; m++) {
    CATEGORIES.forEach((cat, ci) => {
      const limit = MONTHLY_LIMITS[cat][m - 1];
      const rate = USAGE_RATES[ci][m - 1];
      const used = Math.round(limit * rate / 100);
      rows.push({
        id: `bud-${FISCAL}-${String(m).padStart(2, "0")}-${ci}`,
        fiscalYear: FISCAL,
        month: m,
        category: cat,
        limit,
        used,
        note: null,
        createdAt: asDate(`${FISCAL}-01-01T00:00:00.000Z`),
        updatedAt: asDate(`${FISCAL}-06-01T00:00:00.000Z`),
      });
    });
  }
  return rows;
})();

// ─── Expense: 30건 ───────────────────────────────────────────
const EXPENSE_SEEDS = [
  // 인건비
  { m: 1,  cat: "인건비",   day: 5,  amount: 1_500_000, vendor: "한국알바",         memo: "1월 단기근로 급여" },
  { m: 1,  cat: "인건비",   day: 20, amount: 3_500_000, vendor: "직원 급여 통장",    memo: "1월 상시근로자 급여" },
  { m: 2,  cat: "인건비",   day: 5,  amount: 1_500_000, vendor: "한국알바",         memo: "2월 단기근로" },
  { m: 2,  cat: "인건비",   day: 20, amount: 3_500_000, vendor: "직원 급여 통장",   memo: "2월 급여" },
  { m: 3,  cat: "인건비",   day: 20, amount: 5_000_000, vendor: "직원 급여 통장",   memo: "3월 급여 (정액)" },
  { m: 5,  cat: "인건비",   day: 20, amount: 4_800_000, vendor: "직원 급여 통장",   memo: "5월 급여" },
  // 운영비
  { m: 1,  cat: "운영비",   day: 10, amount: 350_000,  vendor: "한국전기",          memo: "1월 전기요금" },
  { m: 1,  cat: "운영비",   day: 15, amount: 180_000,  vendor: "서울수도",          memo: "1월 수도요금" },
  { m: 2,  cat: "운영비",   day: 10, amount: 380_000,  vendor: "한국전기",          memo: "2월 전기요금" },
  { m: 2,  cat: "운영비",   day: 15, amount: 200_000,  vendor: "서울수도",          memo: "2월 수도요금" },
  { m: 3,  cat: "운영비",   day: 10, amount: 360_000,  vendor: "한국전기",          memo: "3월 전기요금" },
  { m: 4,  cat: "운영비",   day: 10, amount: 400_000,  vendor: "한국전기",          memo: "4월 전기요금" },
  { m: 6,  cat: "운영비",   day: 15, amount: 250_000,  vendor: "KT",                memo: "6월 인터넷/통신비" },
  // 사업비
  { m: 3,  cat: "사업비",   day: 5,  amount: 800_000,  vendor: "文具대리점",         memo: "3월 사업용품 (문구류)" },
  { m: 4,  cat: "사업비",   day: 12, amount: 1_200_000, vendor: "행사용품 전문점",   memo: "4월 어린이날 행사 재료" },
  { m: 4,  cat: "사업비",   day: 20, amount: 450_000,  vendor: "교육용품몰",         memo: "4월 프로그램 재료" },
  { m: 5,  cat: "사업비",   day: 8,  amount: 600_000,  vendor: "교구 전문점",        memo: "5월 심리상담 프로그램 교구" },
  { m: 5,  cat: "사업비",   day: 22, amount: 750_000,  vendor: "학습지 교육센터",    memo: "5월 학습멘토링 재료비" },
  { m: 6,  cat: "사업비",   day: 10, amount: 900_000,  vendor: "체험학습 업체",      memo: "6월 체험학습 비용" },
  { m: 7,  cat: "사업비",   day: 5,  amount: 500_000,  vendor: "교육용품몰",         memo: "7월 여름방학 프로그램 재료" },
  { m: 9,  cat: "사업비",   day: 15, amount: 1_000_000, vendor: "문화체험 프로그램", memo: "9월 문화체험 프로그램" },
  { m: 10, cat: "사업비",   day: 10, amount: 1_400_000, vendor: "행사 전문업체",     memo: "10월 추석 특수 프로그램" },
  { m: 11, cat: "사업비",   day: 20, amount: 1_600_000, vendor: "교육용품몰",        memo: "11월 프로그램 재료" },
  { m: 12, cat: "사업비",   day: 5,  amount: 400_000,  vendor: "문구류 대리점",     memo: "12월 연말정리 용품" },
  // 후원금
  { m: 2,  cat: "후원금",   day: 10, amount: 100_000,  vendor: "区域内 후원자",      memo: "2월 소액 후원금 지출 (복지)" },
  { m: 4,  cat: "후원금",   day: 15, amount: 80_000,   vendor: "区域内 후원자",      memo: "4월 후원금 지출" },
  { m: 7,  cat: "후원금",   day: 20, amount: 150_000,  vendor: "区域内 후원자",      memo: "7월 여름방학 아동 위문품" },
  { m: 9,  cat: "후원금",   day: 10, amount: 120_000,  vendor: "区域内 후원자",      memo: "9월 프로그램 지원" },
  // 보조금
  { m: 1,  cat: "보조금",   day: 10, amount: 2_000_000, vendor: "관할청청 구청",    memo: "1월 운영비 보조금 지출" },
  { m: 3,  cat: "보조금",   day: 10, amount: 2_000_000, vendor: "관할청청 구청",    memo: "3월 운영비 보조금 지출" },
  { m: 6,  cat: "보조금",   day: 10, amount: 2_000_000, vendor: "관할청청 구청",    memo: "6월 상반기 보조금 지출" },
  { m: 9,  cat: "보조금",   day: 10, amount: 2_000_000, vendor: "관할청청 구청",    memo: "9월 하반기 보조금 지출" },
];

const EXPENSE_STATUSES = ["확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "확정", "대기", "대기"] as const;

export const MOCK_EXPENSES: Expense[] = EXPENSE_SEEDS.map((s, i) => ({
  id: `exp-${String(i + 1).padStart(3, "0")}`,
  approvalId: null,
  fiscalYear: 2026,
  month: s.m,
  date: asDate(`2026-${String(s.m).padStart(2, "0")}-${String(s.day).padStart(2, "0")}T09:00:00.000Z`),
  category: s.cat as BudgetCategory,
  amount: s.amount,
  vendor: s.vendor,
  memo: s.memo,
  status: EXPENSE_STATUSES[i],
  createdBy: "시설장",
  createdAt: asDate(`2026-${String(s.m).padStart(2, "0")}-${String(s.day).padStart(2, "0")}T10:00:00.000Z`),
}));

// ─── Audit Trail: 10건 ────────────────────────────────────────
export const MOCK_AUDIT_TRAIL: AuditTrailEntry[] = [
  {
    id: "aud-001",
    timestamp: asDate("2026-01-05T09:00:00.000Z"),
    actor: "시설장",
    action: "예산 항목 수정",
    target: "2026년 1월 인건비 예산",
    before: "한도 4,500,000원",
    after: "한도 5,000,000원",
    category: "budget",
  },
  {
    id: "aud-002",
    timestamp: asDate("2026-01-20T14:00:00.000Z"),
    actor: "총무",
    action: "지출 등록",
    target: "1월 급여 3,500,000원",
    before: null,
    after: "확정",
    category: "expense",
  },
  {
    id: "aud-003",
    timestamp: asDate("2026-02-10T10:00:00.000Z"),
    actor: "시설장",
    action: "후원금 수입 등록",
    target: "김영란 후원금 500,000원",
    before: null,
    after: "RC-2026-0001 영수증 발급",
    category: "donation",
  },
  {
    id: "aud-004",
    timestamp: asDate("2026-03-01T09:00:00.000Z"),
    actor: "총무",
    action: "예산 항목 수정",
    target: "2026년 3월 운영비 예산",
    before: "한도 1,000,000원",
    after: "한도 1,200,000원",
    category: "budget",
  },
  {
    id: "aud-005",
    timestamp: asDate("2026-03-15T11:00:00.000Z"),
    actor: "시설장",
    action: "지출 승인",
    target: "3월 사업비 800,000원",
    before: "대기",
    after: "확정",
    category: "expense",
  },
  {
    id: "aud-006",
    timestamp: asDate("2026-04-20T15:00:00.000Z"),
    actor: "총무",
    action: "손익 결산 등록",
    target: "2026년 1분기 결산",
    before: null,
    after: "수입 3,500,000 / 지출 7,830,000 / 순손실 -4,330,000원",
    category: "settlement",
  },
  {
    id: "aud-007",
    timestamp: asDate("2026-05-10T09:00:00.000Z"),
    actor: "시설장",
    action: "예산 항목 수정",
    target: "2026년 5월 사업비 예산",
    before: "한도 1,500,000원",
    after: "한도 1,800,000원",
    category: "budget",
  },
  {
    id: "aud-008",
    timestamp: asDate("2026-06-15T14:00:00.000Z"),
    actor: "총무",
    action: "지출 등록",
    target: "6월 보조금 지출 2,000,000원",
    before: null,
    after: "확정",
    category: "expense",
  },
  {
    id: "aud-009",
    timestamp: asDate("2026-07-01T10:00:00.000Z"),
    actor: "시설장",
    action: "후원금 수입 등록",
    target: "이철수 후원금 1,000,000원",
    before: null,
    after: "수입 확정",
    category: "donation",
  },
  {
    id: "aud-010",
    timestamp: asDate("2026-07-15T16:00:00.000Z"),
    actor: "외부감사인",
    action: "회계 감사 실시",
    target: "2026년 상반기 회계 감사",
    before: null,
    after: "감사 완료 — 지적사항 없음",
    category: "settlement",
  },
];
