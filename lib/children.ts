/**
 * @deprecated  lib/features/children/ 을 직접 import하세요.
 *              이 파일은 하위 호환성을 위해서만 존재합니다.
 *
 * legacy import:  import { MOCK_CHILDREN, getChildById, ... } from "@/lib/children"
 * new import:     import { MOCK_CHILDREN, ... } from "@/lib/features/children"
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  호환성 보장 표                                                   │
 * │  @/lib/children          →  @/lib/features/children           │
 * │  @/lib/children          →  @/lib/features/children/store      │
 * │  @/lib/store/children   →  @/lib/features/children/store      │
 * └─────────────────────────────────────────────────────────────┘
 */
export * from "./features/children";

import type { Child, Attendance, CareLog } from "./features/children/types";
import { MOCK_CHILDREN, MOCK_ATTENDANCES, MOCK_CARE_LOGS } from "./features/children/data";
import {
  getExtraChildren,
  getAttendanceOverrides,
  getExtraCareLogs,
} from "./features/children/store";

// ─── Aggregation (mock + localStorage) ───────────────────────

export function getChildById(id: string): Child | undefined {
  if (typeof window === "undefined") {
    return MOCK_CHILDREN.find((c) => c.id === id);
  }
  return MOCK_CHILDREN.find((c) => c.id === id) ?? getExtraChildren().find((c) => c.id === id);
}

export function getAllChildren(): Child[] {
  if (typeof window === "undefined") return MOCK_CHILDREN;
  return [...MOCK_CHILDREN, ...getExtraChildren()];
}

export function getAllAttendances(): Attendance[] {
  const today = new Date().toISOString().slice(0, 10);
  if (typeof window === "undefined") return MOCK_ATTENDANCES;
  const overrides = getAttendanceOverrides();
  const overridden = MOCK_ATTENDANCES.map((a) => overrides[a.childId] ?? a);
  const mockIds = new Set(MOCK_ATTENDANCES.map((a) => a.childId));
  const extraOnly = Object.values(overrides).filter((a) => !mockIds.has(a.childId) && a.date === today);
  return [...overridden, ...extraOnly];
}

export function getAllCareLogs(): CareLog[] {
  if (typeof window === "undefined") return MOCK_CARE_LOGS;
  return [...MOCK_CARE_LOGS, ...getExtraCareLogs()];
}

// ─── Year-based filtering (standalone — backward compat) ───────

export function getCareLogsByYear(childId: string, year: number): CareLog[] {
  return getAllCareLogs().filter((l) => l.childId === childId && l.date.startsWith(`${year}-`));
}

export function getAttendancesByYear(childId: string, year: number): Attendance[] {
  return getAllAttendances().filter((a) => a.childId === childId && a.date.startsWith(`${year}-`));
}
