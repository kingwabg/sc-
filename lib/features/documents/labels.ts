/**
 * lib/features/documents/labels.ts
 *
 * 한국어 라벨 — DocCategory 분류, ExpiryStatus 표기, 색상 토큰
 */

import type { DocCategory, ExpiryStatus } from "./types";

// ─── DocCategory 한국어 라벨 ───────────────────────────────
export const DOC_CATEGORY_LABEL: Record<DocCategory, string> = {
  STAFF:    "직원",
  CHILD:    "아동",
  FINANCE:  "재정",
  MEETING:  "회의",
  PROGRAM:  "프로그램",
  FACILITY: "시설",
};

// ─── DocCategory 색상 (tailwind) ───────────────────────────
export const DOC_CATEGORY_TONE: Record<DocCategory, { bg: string; text: string }> = {
  STAFF:    { bg: "bg-indigo-100",  text: "text-indigo-700"  },
  CHILD:    { bg: "bg-emerald-100", text: "text-emerald-700" },
  FINANCE:  { bg: "bg-amber-100",   text: "text-amber-700"   },
  MEETING:  { bg: "bg-rose-100",    text: "text-rose-700"    },
  PROGRAM:  { bg: "bg-blue-100",    text: "text-blue-700"    },
  FACILITY: { bg: "bg-violet-100",  text: "text-violet-700"  },
};

// ─── ExpiryStatus 색상 (tailwind) ──────────────────────────
export const EXPIRY_STATUS_TONE: Record<ExpiryStatus, { bg: string; text: string; border: string }> = {
  EXPIRED:       { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200"    },
  EXPIRING_SOON: { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200"  },
  VALID:         { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

// ─── 페이지 헤더 한국어 ─────────────────────────────────────
export const DOC_EXPIRY_PAGE_TITLE = "문서 만료 알림";
export const DOC_EXPIRY_PAGE_DESC = "4대 폭력 갱신, 범죄경력, 이수증 등 평가단 점검용 만료 추적";

// ─── 카드 라벨 ──────────────────────────────────────────────
export const DOC_EXPIRY_SIGNAL_LABEL = "문서 만료 알림";
export const DOC_EXPIRY_SIGNAL_DESC = "30일 내 만료 임박 + 이미 만료된 문서";

// ─── 빈 상태 ────────────────────────────────────────────────
export const DOC_EXPIRY_EMPTY_TITLE = "만료 추적 대상 없음";
export const DOC_EXPIRY_EMPTY_DESC = "신호등 🟢 · 모든 문서 유효 (30일 윈도우 기준)";