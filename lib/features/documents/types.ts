/**
 * lib/features/documents/types.ts
 *
 * P6 — 문서 만료 추적 도메인 타입
 * - Prisma DocCategory enum 재노출 (의존성 격리)
 * - ExpiryWarning: 만료 임박/만료된 문서 + D-day 라벨
 * - DocWithExpiry: 도메인 가공 후 라벨·D-day 포함된 view-model
 */

import type { DocCategory } from "@prisma/client";

export type { DocCategory };

/** 만료 상태 분류 */
export type ExpiryStatus = "EXPIRED" | "EXPIRING_SOON" | "VALID";

/** 단일 만료 알림 항목 (UI 전달용) */
export interface ExpiryWarning {
  id: string;
  tenantId: string;
  title: string;
  category: DocCategory | null;
  sourceType: string | null;
  sourceId: string | null;
  expiryDate: Date;
  /** 양수 = N일 남음, 0 = 오늘 만료, 음수 = N일 지남 */
  daysUntilExpiry: number;
  status: ExpiryStatus;
  authorName: string;
  /** 한국어 라벨 — "만료됨" / "3일 후 만료" / "여유 (45일)" */
  statusLabel: string;
  /** 한국어 D-day 표기 — "D-3", "D+0 (오늘)", "D+5 (지남 5일)" */
  ddayLabel: string;
}

/** 만료 임박 윈도우 결과 + 집계 */
export interface ExpiringDocsResult {
  /** EXPIRING_SOON 상태 (만료 안 됐지만 daysAhead 이내) */
  expiringSoon: ExpiryWarning[];
  /** EXPIRED 상태 (이미 만료) */
  expired: ExpiryWarning[];
  /** 전체 만료 추적 대상 (valid 포함) */
  total: number;
  /** EXPIRING_SOON 만 카운트 — 신호등 계산에 사용 */
  expiringSoonCount: number;
  /** EXPIRED 만 카운트 */
  expiredCount: number;
  /** 윈도우 기준일 (계산 시점 today) */
  computedAt: string; // YYYY-MM-DD
}

/** 신호등 결과 — AuditSummary 신호등 카드에 표시 */
export interface DocExpiryLight {
  expiringSoonCount: number;
  expiredCount: number;
  /** 🟢 < 5, 🟡 5..9, 🔴 ≥ 10 (만료 임박 기준) */
  light: "GREEN" | "YELLOW" | "RED";
}