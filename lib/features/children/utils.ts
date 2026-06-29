/**
 * Children Feature — Helper Functions
 */
import type { Child, Attendance, AttendanceStatus, CareLog, CareLogCategory, CapacityGroup } from "./types";

// ─── Age ──────────────────────────────────────────────────────
export function ageFromBirthDate(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// ─── Attendance Status ────────────────────────────────────────
export function statusTone(
  status: AttendanceStatus,
): { label: string; bg: string; text: string } {
  switch (status) {
    case "등원":     return { label: "등원",     bg: "bg-emerald-100", text: "text-emerald-700" };
    case "결석":     return { label: "결석",     bg: "bg-red-100",     text: "text-red-700" };
    case "조퇴":     return { label: "조퇴",     bg: "bg-amber-100",   text: "text-amber-700" };
    case "보건휴식": return { label: "보건휴식", bg: "bg-blue-100",    text: "text-blue-700" };
    case "미등원":   return { label: "미등원",   bg: "bg-slate-200",   text: "text-slate-700" };
  }
}

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  "등원", "결석", "조퇴", "보건휴식", "미등원",
];

// ─── CareLog Category ─────────────────────────────────────────
export function careLogCategoryTone(category: CareLogCategory): { bg: string; text: string } {
  switch (category) {
    case "식사":      return { bg: "bg-orange-100", text: "text-orange-700" };
    case "학습":      return { bg: "bg-indigo-100", text: "text-indigo-700" };
    case "놀이":      return { bg: "bg-emerald-100", text: "text-emerald-700" };
    case "투약":      return { bg: "bg-red-100",    text: "text-red-700" };
    case "관찰":      return { bg: "bg-blue-100",   text: "text-blue-700" };
    case "특별활동":  return { bg: "bg-violet-100", text: "text-violet-700" };
    case "기타":      return { bg: "bg-slate-100",  text: "text-slate-700" };
  }
}

// ─── Grouping ─────────────────────────────────────────────────
export function groupByCapacity(children: Child[]): Record<CapacityGroup, Child[]> {
  return {
    30: children.filter((c) => c.capacityGroup === 30),
    40: children.filter((c) => c.capacityGroup === 40),
    50: children.filter((c) => c.capacityGroup === 50),
  };
}

// ─── Filtering ────────────────────────────────────────────────
export function getCareLogsByYear(childId: string, year: number, allLogs: CareLog[]): CareLog[] {
  return allLogs.filter((l) => l.childId === childId && l.date.startsWith(`${year}-`));
}

export function getAttendancesByYear(
  childId: string,
  year: number,
  allAttendances: Attendance[],
): Attendance[] {
  return allAttendances.filter(
    (a) => a.childId === childId && a.date.startsWith(`${year}-`),
  );
}

// ─── Attendance Map helpers ──────────────────────────────────
export function buildAttendanceMap(
  mockAttendances: Attendance[],
  overrides: Record<string, Attendance>,
): Record<string, Attendance> {
  const map: Record<string, Attendance> = {};
  for (const a of mockAttendances) {
    map[a.childId] = overrides[a.childId] ?? a;
  }
  return map;
}
