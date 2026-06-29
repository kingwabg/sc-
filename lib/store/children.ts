/**
 * Children (아동) 저장소
 */
import type { Child, Attendance, CareLog } from "../features/children/types";
import { readLS, writeLS } from "./_ls";

const CHILDREN_KEY = "officex:extra-children";
const ATTENDANCE_KEY = "officex:attendance-overrides";
const CARELOG_KEY = "officex:extra-carelogs";

export function getExtraChildren(): Child[] {
  return readLS<Child[]>(CHILDREN_KEY, []);
}

export function addExtraChild(child: Child): Child[] {
  const next = [...getExtraChildren(), child];
  writeLS(CHILDREN_KEY, next);
  return next;
}

export function removeExtraChild(id: string): Child[] {
  const next = getExtraChildren().filter((c) => c.id !== id);
  writeLS(CHILDREN_KEY, next);
  return next;
}

// ─── Attendance ───────────────────────────────────────────
export type AttendanceMap = Record<string, Attendance>;

export function getAttendanceOverrides(): AttendanceMap {
  return readLS<AttendanceMap>(ATTENDANCE_KEY, {});
}

export function setAttendanceOverride(childId: string, att: Attendance): AttendanceMap {
  const next = { ...getAttendanceOverrides(), [childId]: att };
  writeLS(ATTENDANCE_KEY, next);
  return next;
}

export function clearAttendanceOverrides(): void {
  if (typeof window !== "undefined") localStorage.removeItem(ATTENDANCE_KEY);
}

// ─── Care Logs ────────────────────────────────────────────
export function getExtraCareLogs(): CareLog[] {
  return readLS<CareLog[]>(CARELOG_KEY, []);
}

export function addExtraCareLog(log: CareLog): CareLog[] {
  const next = [...getExtraCareLogs(), log];
  writeLS(CARELOG_KEY, next);
  return next;
}