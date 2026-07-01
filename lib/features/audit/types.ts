/**
 * lib/features/audit/types.ts
 * 평가 대비 크로스체크 타입 정의
 */

// ─── Conflict 타입 ─────────────────────────────────────────
export type ConflictType =
  | "ATTENDANCE_NO_LOG"   // 출석부 등재됐으나 해당 날짜 일지(돌봄기록) 없음
  | "LOG_NO_ATTENDANCE"   // 일지(돌봄기록)里有但 출석부 결석
  | "ATTENDANCE_NO_PROGRAM" // 출석부 등재됐으나 프로그램 운영기록 없음
  | "PROGRAM_NO_ATTENDANCE"; // 프로그램 기록里有但 출석부 결석

export type SignalLight = "GREEN" | "YELLOW" | "RED";

// ─── 개별 충돌 항목 ─────────────────────────────────────────
export interface ConflictItem {
  childId: string;
  childName: string;
  date: string;          // YYYY-MM-DD
  attendanceStatus: string | null; // null = 출석 기록 없음
  careLogExists: boolean;
  conflictType: ConflictType;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

// ─── 신호등 카드 ─────────────────────────────────────────────
export interface SignalCard {
  key: "consultation" | "document" | "consistency" | "sponsorship";
  label: string;
  description: string;
  light: SignalLight;
  value: number | string;
  unit?: string;
}

// ─── 평가 요약 ──────────────────────────────────────────────
export interface AuditSummary {
  consultation: { rate: number; light: SignalLight };
  document: { rate: number; light: SignalLight };
  consistency: { conflictCount: number; light: SignalLight };
  sponsorship: { rate: number; light: SignalLight };
  /// P6 — 문서 만료 알림 (Doc.expiryDate 기반)
  docExpiry?: {
    expiringSoonCount: number;
    expiredCount: number;
    light: SignalLight;
  };
}

// ─── 평가 항목 체크 ────────────────────────────────────────
export interface EvalItem {
  id: string;
  label: string;
  threshold: string;
  current: number | string;
  unit?: string;
  passed: boolean;
  note?: string;
}

// ─── 평가 통보서 ───────────────────────────────────────────
export interface AuditNotice {
  id: string; // tenantId|from|to hash
  tenantName: string;
  generatedAt: string; // ISO
  rangeFrom: string;
  rangeTo: string;
  summary: AuditSummary;
  conflicts: ConflictItem[];
  evalItems: EvalItem[];
  /** 순수 텍스트 (인쇄/纸上용) */
  plainText: string;
  /** 간이 HTML 미리보기용 */
  previewHtml: string;
}

// ─── 전체 크로스체크 결과 ────────────────────────────────────
export interface CrossCheckResult {
  summary: AuditSummary;
  conflicts: ConflictItem[];
  checkedRange: { from: string; to: string };
}
