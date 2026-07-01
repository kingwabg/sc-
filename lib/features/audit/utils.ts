/**
 * lib/features/audit/utils.ts
 * 신호등 판정 + severity 계산 헬퍼
 */

import type { SignalLight, ConflictType } from "./types";

// ─── 비율 기반 신호등 (높을수록 좋음) ────────────────────────
export function signalByRate(
  rate: number,
): SignalLight {
  if (rate >= 80) return "GREEN";
  if (rate >= 60) return "YELLOW";
  return "RED";
}

// ─── 건수 기반 신호등 (적을수록 좋음 — consistency 용) ────────
export function signalByCount(
  count: number,
): SignalLight {
  if (count === 0) return "GREEN";
  if (count <= 3) return "YELLOW";
  return "RED";
}

// ─── 충돌 심각도 판정 ────────────────────────────────────────
export function computeSeverity(
  conflictType: ConflictType,
): "LOW" | "MEDIUM" | "HIGH" {
  switch (conflictType) {
    case "ATTENDANCE_NO_LOG":
    case "LOG_NO_ATTENDANCE":
      return "HIGH"; // 출석/일지 불일치는 평가 langsung 반영
    case "ATTENDANCE_NO_PROGRAM":
    case "PROGRAM_NO_ATTENDANCE":
      return "MEDIUM"; // 프로그램 운영 미기록은 상대적
  }
}

// ─── 날짜 범위 생성 ─────────────────────────────────────────
export function dateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// ─── 최근 N일 ────────────────────────────────────────────────
export function recentDays(n: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - n);
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  };
}
