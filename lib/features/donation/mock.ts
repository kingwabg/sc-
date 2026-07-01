/**
 * lib/features/donation/mock.ts
 *
 * Fallback mock 데이터 — DATABASE_URL이 없을 때 사용.
 * - children/db.ts와 동일 패턴 (P8 신규 모듈)
 * - 3건 CASH + 2건 GOODS = 5건
 * - 영수증 1건만 발급된 상태 (RC-2026-0001)
 */

import type { Donation } from "./types";

const FIXED_DATE = "2026-06-15T09:00:00.000Z";

function asDate(s: string): Date {
  return new Date(s);
}

export const MOCK_DONATIONS: Donation[] = [
  // ─── CASH 3건 ────────────────────────────────────────
  {
    id: "don-cash-001",
    tenantId: "t_acme",
    donorName: "김영란",
    donorContact: "010-1234-5678",
    type: "CASH",
    amount: 500_000,
    itemName: null,
    itemQty: null,
    receivedAt: asDate("2026-06-10T10:00:00.000Z"),
    receiptIssued: true,
    receiptNumber: "RC-2026-0001",
    notes: "정기 후원 — 매월 10만원 × 5개월",
    createdAt: asDate(FIXED_DATE),
    updatedAt: asDate(FIXED_DATE),
  },
  {
    id: "don-cash-002",
    tenantId: "t_acme",
    donorName: "이철수",
    donorContact: "010-2345-6789",
    type: "CASH",
    amount: 1_000_000,
    itemName: null,
    itemQty: null,
    receivedAt: asDate("2026-06-15T14:30:00.000Z"),
    receiptIssued: false,
    receiptNumber: null,
    notes: "기관 운영비 지원 — 감사합니다",
    createdAt: asDate(FIXED_DATE),
    updatedAt: asDate(FIXED_DATE),
  },
  {
    id: "don-cash-003",
    tenantId: "t_acme",
    donorName: "박정화",
    donorContact: null,
    type: "CASH",
    amount: 300_000,
    itemName: null,
    itemQty: null,
    receivedAt: asDate("2026-06-20T09:00:00.000Z"),
    receiptIssued: false,
    receiptNumber: null,
    notes: null,
    createdAt: asDate(FIXED_DATE),
    updatedAt: asDate(FIXED_DATE),
  },

  // ─── GOODS 2건 ───────────────────────────────────────
  {
    id: "don-goods-001",
    tenantId: "t_acme",
    donorName: "해피마트",
    donorContact: "051-123-4567",
    type: "GOODS",
    amount: null,
    itemName: "아동 간식 (스낵팩)",
    itemQty: 30,
    receivedAt: asDate("2026-06-05T11:00:00.000Z"),
    receiptIssued: false,
    receiptNumber: null,
    notes: "6월 행사 행사 지원물품",
    createdAt: asDate(FIXED_DATE),
    updatedAt: asDate(FIXED_DATE),
  },
  {
    id: "don-goods-002",
    tenantId: "t_acme",
    donorName: "(주)교보문고",
    donorContact: "02-1234-5678",
    type: "GOODS",
    amount: null,
    itemName: "아동 도서 (한글독서 세트)",
    itemQty: 20,
    receivedAt: asDate("2026-06-18T15:00:00.000Z"),
    receiptIssued: false,
    receiptNumber: null,
    notes: "여름 독서 캠페인 지원 — 당초 30권 요청, 20권 도착",
    createdAt: asDate(FIXED_DATE),
    updatedAt: asDate(FIXED_DATE),
  },
];
