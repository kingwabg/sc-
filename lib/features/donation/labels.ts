/**
 * lib/features/donation/labels.ts
 *
 * 한국어 라벨 — DonationType, 상태, 페이지/카드 라벨
 */

import type { DonationType } from "./types";

// ─── DonationType 한국어 라벨 ────────────────────────────
export const DONATION_TYPE_LABEL: Record<DonationType, string> = {
  CASH:  "후원금",
  GOODS: "후원물품",
};

export const DONATION_TYPE_LABEL_LONG: Record<DonationType, string> = {
  CASH:  "금전 후원",
  GOODS: "물품 후원",
};

// ─── DonationType 색상 (tailwind) ────────────────────────
export const DONATION_TYPE_TONE: Record<DonationType, { bg: string; text: string; border: string }> = {
  CASH:  { bg: "bg-indigo-100",   text: "text-indigo-700",  border: "border-indigo-200"  },
  GOODS: { bg: "bg-emerald-100",  text: "text-emerald-700", border: "border-emerald-200" },
};

// ─── 영수증 상태 라벨 ─────────────────────────────────────
export const RECEIPT_LABEL = {
  ISSUED:     "발급 완료",
  ISSUED_TONE: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  PENDING:    "미발급",
  PENDING_TONE: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
};

// ─── 페이지 헤더 ─────────────────────────────────────────
export const DONATION_PAGE_TITLE = "후원금 · 후원물품 대장";
export const DONATION_PAGE_DESC = "후원자 등록 · 금전/물품 통계 · 영수증 발급";

// ─── 통계 카드 라벨 ───────────────────────────────────────
export const STATS_TOTAL_LABEL = "전체 후원";
export const STATS_CASH_LABEL = "후원금 합계";
export const STATS_GOODS_LABEL = "후원물품 건수";
export const STATS_RECEIPT_LABEL = "영수증 발급";
export const STATS_RECEIPT_PENDING = "미발급";

// ─── 인쇄용 라벨 (영수증 HTML) ────────────────────────────
export const RECEIPT_TITLE = "후원금 (물품) 영수증";
export const RECEIPT_INSTITUTION = "양산애사희적합동조합";
export const RECEIPT_FOOTER = "본 영수증은 소득세법 제24조에 따른 기부를 확인할 수 있으며, 회계 검증 자료로 활용됩니다.";

// ─── 빈 상태 ──────────────────────────────────────────────
export const DONATION_EMPTY_TITLE = "등록된 후원이 없습니다";
export const DONATION_EMPTY_DESC = "신규 후원을 등록하면 대장에 표시됩니다.";

// ─── 신규 등록 ────────────────────────────────────────────
export const NEW_DONATION_TITLE = "후원 등록";
export const NEW_DONATION_DESC = "후원자 정보 · 후원 종류 (금전/물품) · 비고 입력";

// ─── 상세 ────────────────────────────────────────────────
export const DETAIL_TITLE = "후원 상세";
export const RECEIPT_PRINT_LABEL = "영수증 인쇄";
export const RECEIPT_ISSUE_LABEL = "영수증 발급";
export const RECEIPT_VIEW_LABEL = "영수증 보기";
export const RECEIPT_ALREADY_ISSUED = "이미 발급된 영수증입니다";

// ─── 폼 필드 ──────────────────────────────────────────────
export const FIELD_DONOR_NAME = "후원자 이름";
export const FIELD_DONOR_CONTACT = "연락처";
export const FIELD_TYPE = "후원 종류";
export const FIELD_AMOUNT = "금액 (원)";
export const FIELD_ITEM_NAME = "물품명";
export const FIELD_ITEM_QTY = "수량";
export const FIELD_RECEIVED_AT = "접수일";
export const FIELD_NOTES = "비고";

// ─── 액션 ────────────────────────────────────────────────
export const SUBMIT_LABEL = "등록";
export const CANCEL_LABEL = "취소";
export const TYPE_CASH_LABEL = "금전 후원";
export const TYPE_GOODS_LABEL = "물품 후원";
