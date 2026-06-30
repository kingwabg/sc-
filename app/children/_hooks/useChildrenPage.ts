"use client";

/**
 * useChildrenPage — 아동 페이지의 state + derived + handlers 묶음 hook
 *
 * page.tsx 책임 축소: 합성과 이벤트 위임만.
 * 비즈니스 로직 (필터, 정렬, 그룹 CRUD, 출석 변경, CSV export)은 여기.
 */

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  MOCK_CHILDREN,
  MOCK_ATTENDANCES,
  type Child,
  type AttendanceStatus,
  type CapacityGroup,
  type ChildGroup,
  type GroupFilter,
} from "@/lib/features/children";
import {
  getExtraChildren,
  addExtraChild,
  getAttendanceOverrides,
  setAttendanceOverride,
  type AttendanceMap,
  getChildGroups,
  addChildGroup,
  updateChildGroup,
  removeChildGroup,
  moveChildGroup,
  updateGroupFilter,
} from "@/lib/store/children";
import { filterChildren, isFilterEmpty, matchesFilter } from "@/lib/features/children/utils";
import { getTenantSettings } from "@/lib/store";
import { exportChildrenCSV } from "@/lib/features/children/export";
import {
  DEFAULT_TABLE_OPTIONS,
  type TableOptions,
} from "@/components/ui/TableOptionsDrawer";
import { useToast } from "@/components/ui/Toast";
import type { ChildrenFilter } from "../_components/ChildrenFilterDrawer";

type SortKey = "name" | "grade" | "today" | "age";

export function useChildrenPage() {
  const toast = useToast();
  const searchParams = useSearchParams();

  // ── State ─────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<ChildrenFilter>({
    enrolledRange: null,
    grades: [],
    allergies: [],
    statuses: [],
  });
  const [tableOptions, setTableOptions] = useState<TableOptions>(DEFAULT_TABLE_OPTIONS);
  const [tableOptionsOpen, setTableOptionsOpen] = useState(false);
  const [sortKey] = useState<SortKey>("today");
  const [sortDir] = useState<"asc" | "desc">("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [groups, setGroups] = useState<ChildGroup[]>([]);
  const [groupOptionsId, setGroupOptionsId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [extraChildren, setExtraChildren] = useState<Child[]>([]);
  const [attendanceState, setAttendanceState] = useState<AttendanceMap>(() => {
    const m: AttendanceMap = {};
    for (const a of MOCK_ATTENDANCES) m[a.childId] = a;
    return m;
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setGroups(getChildGroups()); }, []);
  useEffect(() => { if (mounted) setExtraChildren(getExtraChildren()); }, [mounted]);
  useEffect(() => { if (mounted) setAttendanceState(getAttendanceOverrides()); }, [mounted]);

  // ── Demo seed (URL ?demo=1) ───────────────────────────────
  useEffect(() => {
    const demo = searchParams.get("demo");
    if (!demo || typeof window === "undefined") return;
    const today = new Date().toISOString().slice(0, 10);
    const demoChildren: Child[] = [
      { id: "c-demo-001", tenantId: "t_acme", name: "박서연", nameLast: "박", nameFirst: "서연", birthDate: "2018-03-15", gender: "F", capacityGroup: 50, grade: "초2", guardian: { name: "박지원", relation: "모", phone: "010-2345-6789", job: "간호사" }, health: { allergies: ["새우", "게"], medications: ["알레르기약 (세티리진)"], notes: "운동 후 호흡곤란 주의" }, enrolledAt: today, status: "active" },
      { id: "c-demo-002", tenantId: "t_acme", name: "장민서", nameLast: "장", nameFirst: "민서", birthDate: "2019-07-22", gender: "M", capacityGroup: 50, grade: "초1", guardian: { name: "장성훈", relation: "부", phone: "010-9876-5432", job: "회사원" }, health: { allergies: [], medications: [], notes: "내성적이라 조용한 친구" }, enrolledAt: today, status: "active" },
      { id: "c-demo-003", tenantId: "t_acme", name: "한지유", nameLast: "한", nameFirst: "지유", birthDate: "2016-11-08", gender: "F", capacityGroup: 50, grade: "초5", guardian: { name: "한소영", relation: "모", phone: "010-5555-7777" }, health: { allergies: ["복숭아"], medications: [], notes: "리더십 활발, 친구들과 잘 어울림" }, enrolledAt: today, status: "active" },
    ];
    const demoAttendances: AttendanceMap = {
      "c-demo-001": { id: "a-demo-001", tenantId: "t_acme", childId: "c-demo-001", date: today, status: "등원", arrivedAt: "09:05", guardianNotified: true, authorId: "u_1" },
      "c-demo-002": { id: "a-demo-002", tenantId: "t_acme", childId: "c-demo-002", date: today, status: "결석", reason: "감기 (38도)", guardianNotified: true, authorId: "u_1" },
      "c-demo-003": { id: "a-demo-003", tenantId: "t_acme", childId: "c-demo-003", date: today, status: "보건휴식", arrivedAt: "09:20", reason: "두통", guardianNotified: true, authorId: "u_1" },
    };
    const cap = getTenantSettings().capacity as CapacityGroup;
    let added = 0;
    const existingIds = new Set(getExtraChildren().map((c) => c.id));
    for (const c of demoChildren) {
      const finalChild = { ...c, capacityGroup: cap };
      if (!existingIds.has(finalChild.id)) {
        addExtraChild(finalChild);
        added++;
      }
    }
    for (const [childId, att] of Object.entries(demoAttendances)) {
      setAttendanceOverride(childId, att);
    }
    if (added > 0) toast.success(`${added}명의 데모 아동을 등록했어요`);
    const url = new URL(window.location.href);
    url.searchParams.delete("demo");
    window.history.replaceState({}, "", url.toString());
    window.location.reload();
  }, [searchParams, toast]);

  // ── Derived ──────────────────────────────────────────────
  const allChildren = useMemo(
    () => (mounted ? [...MOCK_CHILDREN, ...extraChildren] : MOCK_CHILDREN),
    [mounted, extraChildren],
  );

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of groups) counts[g.id] = 0;
    counts["all"] = allChildren.length;
    for (const g of groups) {
      if (g.id === "all") continue;
      if (!isFilterEmpty(g.filter)) {
        counts[g.id] = allChildren.filter((c) => matchesFilter(c, g.filter, attendanceState)).length;
        continue;
      }
      if (g.capacity != null && g.capacity !== 999) {
        counts[g.id] = allChildren.filter((c) => c.capacityGroup === (g.capacity as CapacityGroup)).length;
        continue;
      }
      counts[g.id] = 0;
    }
    return counts;
  }, [allChildren, groups, attendanceState]);

  const allergyOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of allChildren) for (const a of c.health.allergies) set.add(a);
    return Array.from(set).sort();
  }, [allChildren]);

  const filtered = useMemo(() => {
    const gradeOrder: Record<string, number> = { "초1": 1, "초2": 2, "초3": 3, "초4": 4, "초5": 5, "초6": 6 };
    const selectedGroup = groups.find((g) => g.id === selectedGroupId);
    let list = allChildren;
    if (selectedGroup) {
      if (!isFilterEmpty(selectedGroup.filter)) {
        list = filterChildren(allChildren, selectedGroup.filter, attendanceState);
      } else if (selectedGroup.id === "all") {
        list = allChildren;
      } else if (selectedGroup.capacity != null) {
        list = allChildren.filter((c) => c.capacityGroup === (selectedGroup.capacity as CapacityGroup));
      }
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.guardian.name.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      list = list.filter((c) => attendanceState[c.id]?.status === statusFilter);
    }
    if (filter.enrolledRange) {
      const [a, b] = filter.enrolledRange;
      const aStr = a.toISOString().slice(0, 10);
      const bStr = b.toISOString().slice(0, 10);
      list = list.filter((c) => c.enrolledAt >= aStr && c.enrolledAt <= bStr);
    }
    if (filter.grades.length > 0) {
      list = list.filter((c) => c.grade && filter.grades.includes(c.grade));
    }
    if (filter.allergies.length > 0) {
      list = list.filter((c) => filter.allergies.some((a: string) => c.health.allergies.includes(a)));
    }
    if (filter.statuses.length > 0) {
      list = list.filter((c) => {
        const s = attendanceState[c.id]?.status;
        return s ? filter.statuses.includes(s) : false;
      });
    }
    list.sort((a, b) => {
      let av: string | number = "", bv: string | number = "";
      switch (sortKey) {
        case "name":  av = a.name; bv = b.name; break;
        case "grade": av = gradeOrder[a.grade ?? ""] ?? 99; bv = gradeOrder[b.grade ?? ""] ?? 99; break;
        case "today": av = attendanceState[a.id]?.arrivedAt ?? "99:99"; bv = attendanceState[b.id]?.arrivedAt ?? "99:99"; break;
      }
      return sortDir === "asc" ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    });
    return list;
  }, [query, statusFilter, filter, attendanceState, selectedGroupId, allChildren, sortKey, sortDir, groups]);

  const stats = useMemo(() => {
    const arr = filtered.map((c) => attendanceState[c.id]).filter(Boolean) as typeof MOCK_ATTENDANCES;
    return {
      present: arr.filter((a) => a.status === "등원").length,
      earlyLeave: arr.filter((a) => a.status === "조퇴").length,
      sick: arr.filter((a) => a.status === "보건휴식").length,
      absent: arr.filter((a) => a.status === "결석" || a.status === "미등원").length,
    };
  }, [filtered, attendanceState]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const fillPct = (() => {
    if (selectedGroupId === "all") {
      const total = allChildren.length;
      return total > 0 ? Math.round((stats.present / total) * 100) : 0;
    }
    if (!selectedGroup) return 0;
    if (selectedGroup.capacity == null) {
      const childCount = groupCounts[selectedGroupId] ?? 0;
      return childCount > 0 ? Math.round((stats.present / childCount) * 100) : 0;
    }
    return Math.round((stats.present / selectedGroup.capacity) * 100);
  })();

  const title = selectedGroupId === "all" ? "전체 아동" : selectedGroup?.label ?? "그룹";

  const capacityLabel = (() => {
    if (selectedGroupId === "all" || !selectedGroup) return "";
    const cap = selectedGroup.capacity;
    if (cap != null && cap > 0) return ` / ${cap}`;
    return "";
  })();

  const filterActive =
    filter.enrolledRange != null ||
    filter.grades.length > 0 ||
    filter.allergies.length > 0 ||
    filter.statuses.length > 0;
  const tableOptionsChanged = tableOptions !== DEFAULT_TABLE_OPTIONS;

  // ── Handlers ─────────────────────────────────────────────
  function handleAddGroup(label: string, parentId: string | null) {
    addChildGroup(label, parentId, null);
    setGroups(getChildGroups());
    toast.success(`"${label}" 폴더가 추가되었습니다`);
  }
  function handleUpdateGroup(id: string, label: string) {
    updateChildGroup(id, { label });
    setGroups(getChildGroups());
  }
  function handleDeleteGroup(id: string) {
    const g = groups.find((x) => x.id === id);
    removeChildGroup(id);
    setGroups(getChildGroups());
    if (selectedGroupId === id) setSelectedGroupId("all");
    toast.info(`"${g?.label ?? ""}" 그룹이 삭제되었습니다`);
  }
  function handleMoveGroup(id: string, newParentId: string | null) {
    const result = moveChildGroup(id, newParentId);
    if (!result.ok) {
      toast.warning(result.reason ?? "이동할 수 없어요");
      return { ok: false, reason: result.reason };
    }
    setGroups(getChildGroups());
    const moved = groups.find((g) => g.id === id);
    const target = newParentId ? groups.find((g) => g.id === newParentId) : null;
    toast.success(`"${moved?.label ?? ""}" → ${target ? `"${target.label}"` : "최상위"}로 이동됨`);
    return { ok: true };
  }
  function handleUpdateGroupFilter(id: string, f: GroupFilter | null) {
    updateGroupFilter(id, f);
    setGroups(getChildGroups());
    toast.success(f && !isFilterEmpty(f) ? "폴더 조건이 저장되었어요" : "폴더 조건이 해제되었어요");
  }
  function handleStatusChange(childId: string, status: AttendanceStatus, time?: string, reason?: string) {
    setAttendanceState((prev) => {
      const cur = prev[childId];
      const now = new Date().toISOString().slice(11, 16);
      const arrived = time ?? cur?.arrivedAt ?? (status === "등원" || status === "조퇴" ? now : undefined);
      const leftAt = status === "조퇴" ? cur?.leftAt ?? now : undefined;
      const next = {
        ...(cur ?? { id: `a-${childId}`, tenantId: "t_acme", childId, date: new Date().toISOString().slice(0, 10), guardianNotified: true, authorId: "u_1", capacityGroup: 50 as CapacityGroup }),
        status, arrivedAt: arrived, leftAt,
        reason: reason ?? cur?.reason,
      };
      if (typeof window !== "undefined") setAttendanceOverride(childId, next);
      return { ...prev, [childId]: next };
    });
    toast.info(`출석 상태가 ${status}(으)로 변경되었습니다`);
  }
  function handleAddChild(child: Omit<Child, "id" | "tenantId" | "status" | "enrolledAt">) {
    const newChild: Child = {
      ...child,
      id: `c-new-${Date.now()}`,
      tenantId: "t_acme",
      enrolledAt: new Date().toISOString().slice(0, 10),
      status: "active",
    };
    setExtraChildren(addExtraChild(newChild));
    setShowAddModal(false);
    toast.success(`${newChild.name} 아동이 등록되었습니다`);
  }
  function handleExport() {
    if (filtered.length === 0) {
      toast.warning("내보낼 데이터가 없습니다");
      return;
    }
    exportChildrenCSV(filtered, attendanceState as Record<string, { childId: string; status: AttendanceStatus; arrivedAt?: string } | undefined>);
    toast.success(`${filtered.length}명 CSV 다운로드`);
  }

  return {
    // state
    query, setQuery,
    statusFilter, setStatusFilter,
    filter, setFilter, filterOpen, setFilterOpen,
    tableOptions, setTableOptions, tableOptionsOpen, setTableOptionsOpen,
    showAddModal, setShowAddModal,
    selectedGroupId, setSelectedGroupId,
    groups, groupOptionsId, setGroupOptionsId,
    attendanceState,
    // derived
    allChildren, filtered, stats, groupCounts, allergyOptions,
    fillPct, title, capacityLabel,
    filterActive, tableOptionsChanged,
    // handlers
    handleAddGroup, handleUpdateGroup, handleDeleteGroup, handleMoveGroup, handleUpdateGroupFilter,
    handleStatusChange, handleAddChild, handleExport,
  };
}