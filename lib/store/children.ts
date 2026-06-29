/**
 * Children (아동) 저장소
 */
import type { Child, Attendance, CareLog, ChildGroup } from "../features/children/types";
import { readLS, writeLS } from "./_ls";

const CHILDREN_KEY = "officex:extra-children";
const ATTENDANCE_KEY = "officex:attendance-overrides";
const CARELOG_KEY = "officex:extra-carelogs";
const GROUPS_KEY = "officex:child-groups";

const DEFAULT_GROUPS: ChildGroup[] = [
  { id: "all",   label: "전체",      parentId: null, capacity: null, order: 0 },
  { id: "30",    label: "30명 그룹", parentId: null, capacity: 30,  order: 1 },
  { id: "40",    label: "40명 그룹", parentId: null, capacity: 40,  order: 2 },
  { id: "50",    label: "50명 그룹", parentId: null, capacity: 50,  order: 3 },
];

export function getChildGroups(): ChildGroup[] {
  const stored = readLS<ChildGroup[] | null>(GROUPS_KEY, null);
  if (stored && stored.length > 0) return [...stored].sort((a, b) => a.order - b.order);
  return DEFAULT_GROUPS;
}

export function setChildGroups(groups: ChildGroup[]): void {
  writeLS(GROUPS_KEY, groups);
}

export function addChildGroup(label: string, parentId: string | null = null, capacity: number | null = null): ChildGroup {
  const groups = getChildGroups();
  const maxOrder = groups.reduce((m, g) => Math.max(m, g.order), 0);
  const newGroup: ChildGroup = {
    id: `g-${Date.now()}`,
    label,
    parentId,
    capacity,
    order: maxOrder + 1,
  };
  const next = [...groups, newGroup];
  setChildGroups(next);
  return newGroup;
}

export function updateChildGroup(id: string, updates: Partial<Pick<ChildGroup, "label">>): ChildGroup | null {
  const groups = getChildGroups();
  const idx = groups.findIndex((g) => g.id === id);
  if (idx < 0) return null;
  const updated = { ...groups[idx], ...updates };
  const next = groups.map((g) => (g.id === id ? updated : g));
  setChildGroups(next);
  return updated;
}

export function removeChildGroup(id: string): void {
  if (id === "all") return; // 전체는 삭제 불가
  const groups = getChildGroups();
  // 하위 폴더도 함께 삭제
  const idsToRemove = new Set<string>([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const g of groups) {
      if (g.parentId && idsToRemove.has(g.parentId) && !idsToRemove.has(g.id)) {
        idsToRemove.add(g.id);
        changed = true;
      }
    }
  }
  setChildGroups(groups.filter((g) => !idsToRemove.has(g.id)));
}

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