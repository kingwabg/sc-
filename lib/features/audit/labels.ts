/**
 * lib/features/audit/labels.ts
 * 평가 대비 신호등 / 충돌 항목 한국어 라벨
 */

import type { ConflictType, SignalLight } from "./types";

// ─── 신호등 이모지 ───────────────────────────────────────────
export const SIGNAL_EMOJI: Record<SignalLight, string> = {
  GREEN:  "🟢",
  YELLOW: "🟡",
  RED:    "🔴",
};

// ─── 신호등 색상 클래스 ──────────────────────────────────────
export const SIGNAL_COLOR: Record<SignalLight, string> = {
  GREEN:  "text-green-600 bg-green-50 border-green-200",
  YELLOW: "text-amber-600 bg-amber-50 border-amber-200",
  RED:    "text-red-600 bg-red-50 border-red-200",
};

// ─── 충돌 타입 라벨 ──────────────────────────────────────────
export const CONFLICT_LABEL: Record<ConflictType, string> = {
  ATTENDANCE_NO_LOG:     "출석-일지 불일치",
  LOG_NO_ATTENDANCE:     "일지-출석 불일치",
  ATTENDANCE_NO_PROGRAM: "출석-프로그램 불일치",
  PROGRAM_NO_ATTENDANCE: "프로그램-출석 불일치",
};

// ─── 충돌 심각도 라벨 ────────────────────────────────────────
export const SEVERITY_LABEL: Record<"LOW" | "MEDIUM" | "HIGH", string> = {
  LOW:    "낮음",
  MEDIUM: "보통",
  HIGH:   "심각",
};

// ─── 카드 설명 문구 ─────────────────────────────────────────
export const CARD_DESCRIPTIONS: Record<string, string> = {
  consultation: "최근 30일 아동별 상담 기록률",
  document:      "필수 결재 서류 보관율",
  consistency:   "출석부-돌봄일지 간 모순 건수",
  sponsorship:   "후원금 입금-영수증 매칭율",
};
