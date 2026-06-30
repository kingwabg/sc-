/**
 * Children (아동) 저장소
 */
import type { Child, Attendance, CareLog, ChildGroup, GroupFilter } from "../features/children/types";
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

/**
 * 폴더 이동 (드래그앤드롭).
 * 자기 자신이나 자기 하위로 이동하는 경우 (순환참조) 거부.
 */
export function moveChildGroup(id: string, newParentId: string | null): { ok: boolean; reason?: string } {
  if (id === "all") return { ok: false, reason: "전체 폴더는 이동할 수 없어요" };
  const groups = getChildGroups();
  // 자기 자신으로 이동 불가
  if (id === newParentId) return { ok: false, reason: "같은 폴더로는 이동할 수 없어요" };
  // 자기 하위로 이동 불가 (순환참조 방지)
  if (newParentId != null) {
    let cursor: string | null = newParentId;
    const visited = new Set<string>();
    while (cursor != null) {
      if (cursor === id) return { ok: false, reason: "하위 폴더로는 이동할 수 없어요" };
      if (visited.has(cursor)) break; // 무한루프 방지 (보수적)
      visited.add(cursor);
      const parent: ChildGroup | undefined = groups.find((g) => g.id === cursor);
      cursor = parent?.parentId ?? null;
    }
  }
  const next = groups.map((g) => (g.id === id ? { ...g, parentId: newParentId } : g));
  setChildGroups(next);
  return { ok: true };
}

/**
 * 스마트 폴더 필터 업데이트.
 * 빈 필터를 전달하면 filter 제거 (단순 폴더로 동작).
 */
export function updateGroupFilter(id: string, filter: GroupFilter | null): void {
  if (id === "all") return;
  const groups = getChildGroups();
  const next = groups.map((g) =>
    g.id === id ? { ...g, filter: filter ?? undefined } : g,
  );
  setChildGroups(next);
}

export function getExtraChildren(): Child[] {
  return readLS<Child[]>(CHILDREN_KEY, []);
}

export function addExtraChild(child: Child): Child[] {
  const next = [...getExtraChildren(), child];
  writeLS(CHILDREN_KEY, next);
  return next;
}

export function updateExtraChild(id: string, updates: Partial<Omit<Child, "id" | "tenantId">>): Child | null {
  const list = getExtraChildren();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next = [...list];
  next[idx] = { ...next[idx], ...updates };
  writeLS(CHILDREN_KEY, next);
  return next[idx];
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