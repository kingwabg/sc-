/**
 * lib/features/leave/data.ts — LeaveRequest repository (server-only)
 *
 * - Prisma LeaveRequest 쿼리 → LeaveRequestVM으로 매핑
 * - DATABASE_URL 없으면 MOCK_LEAVES로 자동 fallback (tryPrisma 패턴)
 *
 * 멀티테넌트: 모든 쿼리에서 tenantId 필터링 필수
 */

import "server-only";
import { db } from "@/lib/db";
import type { LeaveType, LeaveStatus, LeaveRequestVM, LeaveStats } from "./types";
import { calcWorkdays } from "./utils";

const DEFAULT_TENANT = process.env.DEFAULT_TENANT_ID ?? "t_acme";

// ─── Mock data ────────────────────────────────────────────

const MOCK_LEAVES: LeaveRequestVM[] = [
  {
    id: "lv_01",
    tenantId: DEFAULT_TENANT,
    staffId: "s_1",
    staffName: "김선영",
    type: "ANNUAL",
    startDate: "2026-07-10",
    endDate: "2026-07-11",
    days: 2,
    reason: "개인 사정",
    status: "PENDING",
    createdAt: "2026-06-20T09:00:00Z",
    updatedAt: "2026-06-20T09:00:00Z",
  },
  {
    id: "lv_02",
    tenantId: DEFAULT_TENANT,
    staffId: "s_1",
    staffName: "김선영",
    type: "ANNUAL",
    startDate: "2026-08-15",
    endDate: "2026-08-17",
    days: 3,
    reason: "여름휴가",
    status: "PENDING",
    createdAt: "2026-06-25T10:00:00Z",
    updatedAt: "2026-06-25T10:00:00Z",
  },
  {
    id: "lv_03",
    tenantId: DEFAULT_TENANT,
    staffId: "s_2",
    staffName: "박은수",
    type: "SICK",
    startDate: "2026-07-02",
    endDate: "2026-07-02",
    days: 1,
    reason: "감기",
    status: "PENDING",
    createdAt: "2026-07-02T08:00:00Z",
    updatedAt: "2026-07-02T08:00:00Z",
  },
  {
    id: "lv_04",
    tenantId: DEFAULT_TENANT,
    staffId: "s_1",
    staffName: "김선영",
    type: "ANNUAL",
    startDate: "2026-05-01",
    endDate: "2026-05-02",
    days: 2,
    reason: "봄휴가",
    status: "APPROVED",
    approvedBy: "所长",
    approvedAt: "2026-04-28T10:00:00Z",
    createdAt: "2026-04-25T09:00:00Z",
    updatedAt: "2026-04-28T10:00:00Z",
  },
  {
    id: "lv_05",
    tenantId: DEFAULT_TENANT,
    staffId: "s_2",
    staffName: "박은수",
    type: "ANNUAL",
    startDate: "2026-04-29",
    endDate: "2026-04-30",
    days: 2,
    reason: "결혼기념 여행",
    status: "APPROVED",
    approvedBy: "所长",
    approvedAt: "2026-04-20T14:00:00Z",
    createdAt: "2026-04-18T11:00:00Z",
    updatedAt: "2026-04-20T14:00:00Z",
  },
  {
    id: "lv_06",
    tenantId: DEFAULT_TENANT,
    staffId: "s_3",
    staffName: "왕준하",
    type: "FAMILY_EVENT",
    startDate: "2026-06-15",
    endDate: "2026-06-15",
    days: 1,
    reason: "조상回歸",
    status: "APPROVED",
    approvedBy: "所长",
    approvedAt: "2026-06-10T09:00:00Z",
    createdAt: "2026-06-08T16:00:00Z",
    updatedAt: "2026-06-10T09:00:00Z",
  },
  {
    id: "lv_07",
    tenantId: DEFAULT_TENANT,
    staffId: "s_1",
    staffName: "김선영",
    type: "ANNUAL",
    startDate: "2026-03-01",
    endDate: "2026-03-01",
    days: 1,
    reason: "개인 사정",
    status: "USED",
    approvedBy: "所长",
    approvedAt: "2026-02-25T11:00:00Z",
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "lv_08",
    tenantId: DEFAULT_TENANT,
    staffId: "s_2",
    staffName: "박은수",
    type: "HALF_DAY",
    startDate: "2026-04-15",
    endDate: "2026-04-15",
    days: 0.5,
    reason: "병원 방문",
    status: "USED",
    approvedBy: "所长",
    approvedAt: "2026-04-14T15:00:00Z",
    createdAt: "2026-04-14T09:00:00Z",
    updatedAt: "2026-04-15T13:00:00Z",
  },
  {
    id: "lv_09",
    tenantId: DEFAULT_TENANT,
    staffId: "s_1",
    staffName: "김선영",
    type: "OFFICIAL",
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    days: 3,
    reason: "교육",
    status: "APPROVED",
    approvedBy: "所长",
    approvedAt: "2026-07-15T10:00:00Z",
    createdAt: "2026-07-10T09:00:00Z",
    updatedAt: "2026-07-15T10:00:00Z",
  },
  {
    id: "lv_10",
    tenantId: DEFAULT_TENANT,
    staffId: "s_3",
    staffName: "왕준하",
    type: "SICK",
    startDate: "2026-05-10",
    endDate: "2026-05-11",
    days: 2,
    reason: "과로",
    status: "USED",
    approvedBy: "所长",
    approvedAt: "2026-05-10T08:30:00Z",
    createdAt: "2026-05-10T08:00:00Z",
    updatedAt: "2026-05-11T18:00:00Z",
  },
];

// ─── tryPrisma helper ─────────────────────────────────────

async function tryPrisma<T>(
  fn: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch {
    return await fallback();
  }
}

// ─── Mapper ───────────────────────────────────────────────

type DbLeaveRow = {
  id: string;
  tenantId: string;
  staffId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: LeaveStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  staff: { name: string } | null;
};

function toVM(row: DbLeaveRow): LeaveRequestVM {
  return {
    id: row.id,
    tenantId: row.tenantId,
    staffId: row.staffId,
    staffName: row.staff?.name ?? "不明",
    type: row.type,
    startDate: row.startDate,
    endDate: row.endDate,
    days: row.days,
    reason: row.reason ?? undefined,
    status: row.status,
    approvedBy: row.approvedBy ?? undefined,
    approvedAt: row.approvedAt?.toISOString() ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ─── Query functions ──────────────────────────────────────

/** 내 휴가 목록 */
export async function getMyLeaves(staffId: string): Promise<LeaveRequestVM[]> {
  return tryPrisma(
    async () => {
      const rows = await db.leaveRequest.findMany({
        where: { staffId, tenantId: DEFAULT_TENANT },
        include: { staff: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      return (rows as unknown as DbLeaveRow[]).map(toVM);
    },
    () => MOCK_LEAVES.filter((l) => l.staffId === staffId),
  );
}

/** 전체 대기중인 휴가 (관리자) */
export async function getPendingLeaves(): Promise<LeaveRequestVM[]> {
  return tryPrisma(
    async () => {
      const rows = await db.leaveRequest.findMany({
        where: { tenantId: DEFAULT_TENANT, status: "PENDING" },
        include: { staff: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      });
      return (rows as unknown as DbLeaveRow[]).map(toVM);
    },
    () => MOCK_LEAVES.filter((l) => l.status === "PENDING"),
  );
}

/** 특정 스태프 + 특정 연도 통계 */
export async function getYearStats(
  staffId: string,
  year: number,
): Promise<LeaveStats> {
  const startOfYear = `${year}-01-01`;
  const endOfYear = `${year}-12-31`;

  const leaves = await getMyLeaves(staffId);

  const yearLeaves = leaves.filter((l) => {
    const s = l.startDate;
    return s >= startOfYear && s <= endOfYear;
  });

  const usedDays = yearLeaves
    .filter((l) => l.status === "APPROVED" || l.status === "USED")
    .reduce((sum, l) => sum + l.days, 0);

  const pendingDays = yearLeaves
    .filter((l) => l.status === "PENDING")
    .reduce((sum, l) => sum + l.days, 0);

  const totalGranted = 15; // 연차 기본付与 (근속 1년 미만)

  return {
    staffId,
    year,
    usedDays,
    pendingDays,
    remainingDays: totalGranted - usedDays,
    totalGranted,
  };
}

/** 휴가 생성 */
export async function createLeave(input: {
  staffId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<LeaveRequestVM> {
  const days = calcWorkdays(input.startDate, input.endDate);

  return tryPrisma(
    async () => {
      const row = await db.leaveRequest.create({
        data: {
          tenantId: DEFAULT_TENANT,
          staffId: input.staffId,
          type: input.type,
          startDate: input.startDate,
          endDate: input.endDate,
          days,
          reason: input.reason,
          status: "PENDING",
        },
        include: { staff: { select: { name: true } } },
      });
      return toVM(row as unknown as DbLeaveRow);
    },
    () => {
      const mock: LeaveRequestVM = {
        id: `lv_mock_${Date.now()}`,
        tenantId: DEFAULT_TENANT,
        staffId: input.staffId,
        staffName: "김선영",
        type: input.type,
        startDate: input.startDate,
        endDate: input.endDate,
        days,
        reason: input.reason,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_LEAVES.push(mock);
      return mock;
    },
  );
}

/** 휴가 승인 */
export async function approveLeave(
  id: string,
  approverName: string,
): Promise<LeaveRequestVM | null> {
  return tryPrisma(
    async () => {
      const row = await db.leaveRequest.update({
        where: { id },
        data: { status: "APPROVED", approvedBy: approverName, approvedAt: new Date() },
        include: { staff: { select: { name: true } } },
      });
      return toVM(row as unknown as DbLeaveRow);
    },
    () => {
      const idx = MOCK_LEAVES.findIndex((l) => l.id === id);
      if (idx === -1) return null;
      MOCK_LEAVES[idx] = {
        ...MOCK_LEAVES[idx],
        status: "APPROVED",
        approvedBy: approverName,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_LEAVES[idx];
    },
  );
}

/** 휴가 반려 */
export async function rejectLeave(
  id: string,
  approverName: string,
): Promise<LeaveRequestVM | null> {
  return tryPrisma(
    async () => {
      const row = await db.leaveRequest.update({
        where: { id },
        data: { status: "REJECTED", approvedBy: approverName, approvedAt: new Date() },
        include: { staff: { select: { name: true } } },
      });
      return toVM(row as unknown as DbLeaveRow);
    },
    () => {
      const idx = MOCK_LEAVES.findIndex((l) => l.id === id);
      if (idx === -1) return null;
      MOCK_LEAVES[idx] = {
        ...MOCK_LEAVES[idx],
        status: "REJECTED",
        approvedBy: approverName,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_LEAVES[idx];
    },
  );
}

/** 휴가 취소 */
export async function cancelLeave(id: string): Promise<LeaveRequestVM | null> {
  return tryPrisma(
    async () => {
      const row = await db.leaveRequest.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: { staff: { select: { name: true } } },
      });
      return toVM(row as unknown as DbLeaveRow);
    },
    () => {
      const idx = MOCK_LEAVES.findIndex((l) => l.id === id);
      if (idx === -1) return null;
      MOCK_LEAVES[idx] = {
        ...MOCK_LEAVES[idx],
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
      };
      return MOCK_LEAVES[idx];
    },
  );
}
