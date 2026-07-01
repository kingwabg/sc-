/**
 * lib/features/documents/utils.ts
 *
 * 만료일 계산·상태 분류·라벨 부착 헬퍼
 */

import type {
  ExpiryStatus,
  ExpiryWarning,
  DocCategory,
} from "./types";

/** UTC 자정 기준 오늘 날짜 (YYYY-MM-DD) — server 환경에서 안전 */
export function todayKst(): Date {
  const now = new Date();
  // KST = UTC+9 — DB는 DateTime UTC 저장, 표시는 KST 기준
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** 두 날짜 사이 일수 (b - a, 정수, KST 자정 기준) */
export function daysBetween(a: Date, b: Date): number {
  const MS_PER_DAY = 86_400_000;
  const aStart = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bStart = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bStart - aStart) / MS_PER_DAY);
}

/** 만료 상태 분류 — 윈도우 N일 안쪽이면 EXPIRING_SOON */
export function classifyExpiry(
  expiryDate: Date,
  now: Date,
  daysAhead: number,
): ExpiryStatus {
  const d = daysBetween(now, expiryDate);
  if (d < 0) return "EXPIRED";
  if (d <= daysAhead) return "EXPIRING_SOON";
  return "VALID";
}

/** D-day 라벨 — 한국어 표기 */
export function ddayLabel(daysUntilExpiry: number): string {
  if (daysUntilExpiry > 0) return `D-${daysUntilExpiry}`;
  if (daysUntilExpiry === 0) return "D-0 (오늘)";
  return `D+${Math.abs(daysUntilExpiry)} (지남 ${Math.abs(daysUntilExpiry)}일)`;
}

/** 상태 라벨 — 분류된 ExpiryStatus → 한국어 */
export function statusLabel(
  status: ExpiryStatus,
  daysUntilExpiry: number,
): string {
  if (status === "EXPIRED") {
    const abs = Math.abs(daysUntilExpiry);
    return abs === 0 ? "만료됨 (오늘)" : `만료됨 (${abs}일 지남)`;
  }
  if (status === "EXPIRING_SOON") {
    if (daysUntilExpiry === 0) return "오늘 만료";
    return `${daysUntilExpiry}일 후 만료`;
  }
  return `여유 (${daysUntilExpiry}일)`;
}

/** 단일 Doc → ExpiryWarning 변환 (label 부착 포함) */
export function buildWarning(input: {
  id: string;
  tenantId: string;
  title: string;
  category: DocCategory | null;
  sourceType: string | null;
  sourceId: string | null;
  expiryDate: Date;
  authorName: string;
  now: Date;
  daysAhead: number;
}): ExpiryWarning {
  const daysUntilExpiry = daysBetween(input.now, input.expiryDate);
  const status = classifyExpiry(input.expiryDate, input.now, input.daysAhead);
  return {
    id: input.id,
    tenantId: input.tenantId,
    title: input.title,
    category: input.category,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    expiryDate: input.expiryDate,
    daysUntilExpiry,
    status,
    authorName: input.authorName,
    statusLabel: statusLabel(status, daysUntilExpiry),
    ddayLabel: ddayLabel(daysUntilExpiry),
  };
}

/** 상태별 정렬 우선순위 — EXPIRED 먼저, EXPIRING_SOON 다음, D-day 오름차순 */
export function sortWarnings(a: ExpiryWarning, b: ExpiryWarning): number {
  const order: Record<ExpiryStatus, number> = {
    EXPIRED: 0,
    EXPIRING_SOON: 1,
    VALID: 2,
  };
  if (order[a.status] !== order[b.status]) {
    return order[a.status] - order[b.status];
  }
  return a.daysUntilExpiry - b.daysUntilExpiry;
}

/** EXPIRING_SOON 개수 기반 신호등 판정 (적은 게 좋음) */
export function docExpiryLightByCount(count: number): "GREEN" | "YELLOW" | "RED" {
  if (count < 5) return "GREEN";
  if (count < 10) return "YELLOW";
  return "RED";
}