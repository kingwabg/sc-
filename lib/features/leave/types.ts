/**
 * lib/features/leave/types.ts — 휴가 도메인 타입
 */

// ─── Prisma enum values (문자열 union) ────────────────────

/** 휴가 종류 */
export type LeaveType =
  | "ANNUAL"
  | "MATERNITY"
  | "MATERNITY_MULTI"
  | "SPOUSE_CARE"
  | "FAMILY_CARE"
  | "REFRESH"
  | "EARLY_LEAVE"
  | "LATE_ARRIVAL"
  | "FAMILY_EVENT"
  | "OFFICIAL"
  | "SICK"
  | "HALF_DAY";

/** 휴가 상태 */
export type LeaveStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "USED";

// ─── View Model ─────────────────────────────────────────

export interface LeaveRequestVM {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string; // ISO datetime
  createdAt: string; // ISO datetime
  updatedAt: string;
}

// ─── Stats ──────────────────────────────────────────────

export interface LeaveStats {
  staffId: string;
  year: number;
  usedDays: number;     // APPROVED + USED 합계
  pendingDays: number;  // PENDING 합계
  remainingDays: number; // 기본付与 - used
  totalGranted: number; // 연차 기본付与 (연차만)
}
