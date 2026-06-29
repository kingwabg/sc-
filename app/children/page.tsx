"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Baby, Search, Plus, CheckCircle2, Clock, X, SlidersHorizontal, ListFilter, FileDown } from "lucide-react";
import { Button, Input, InputGroup } from "rsuite";
import { cn } from "@/lib/utils";
import type { Child, AttendanceStatus, CapacityGroup, ChildGroup } from "@/lib/features/children/types";
import { MOCK_CHILDREN, MOCK_ATTENDANCES } from "@/lib/features/children/data";
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
} from "@/lib/store/children";
import { getTenantSettings } from "@/lib/tenant-store";
import { ChildrenSidebar } from "./_components/ChildrenSidebar";
import { ChildrenTable } from "./_components/ChildrenTable";
import { AddChildModal } from "./_components/AddChildModal";
import { ChildrenFilterDrawer, type ChildrenFilter } from "./_components/ChildrenFilterDrawer";
import { TableOptionsDrawer, DEFAULT_TABLE_OPTIONS, type TableOptions } from "@/components/ui/TableOptionsDrawer";
import { useToast } from "@/components/ui/Toast";

type SortKey = "name" | "grade" | "today" | "age";

export default function ChildrenPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ChildrenPageBody />
      </Suspense>
    </AppShell>
  );
}

function ChildrenPageBody() {
  const toast = useToast();
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
  const [sortKey, setSortKey] = useState<SortKey>("today");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [groups, setGroups] = useState<ChildGroup[]>([]);
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setGroups(getChildGroups()); }, []);

  const [extraChildren, setExtraChildren] = useState<Child[]>([]);
  useEffect(() => {
    if (mounted) setExtraChildren(getExtraChildren());
  }, [mounted]);

  const [attendanceState, setAttendanceState] = useState<AttendanceMap>(() => {
    const m: AttendanceMap = {};
    for (const a of MOCK_ATTENDANCES) m[a.childId] = a;
    return m;
  });
  useEffect(() => {
    if (mounted) setAttendanceState(getAttendanceOverrides());
  }, [mounted]);

  // ── Demo data ─────────────────────────────────────────────
  useEffect(() => {
    const demo = searchParams.get("demo");
    if (!demo || typeof window === "undefined") return;
    const today = new Date().toISOString().slice(0, 10);
    const demoChildren: Child[] = [
      { id: "c-demo-001", tenantId: "t_acme", name: "박서연", nameLast: "박", nameFirst: "서연", birthDate: "2018-03-15", gender: "F", capacityGroup: 50, grade: "초2", guardian: { name: "박지원", relation: "모", phone: "010-2345-6789", job: "간호사" }, health: { allergies: ["새우", "게"], medications: ["알레르기약 (세티리진)"], notes: "운동 후 호흡곤란 주의" }, enrolledAt: today, status: "active" },
      { id: "c-demo-002", tenantId: "t_acme", name: "장민서", nameLast: "장", nameFirst: "민서", birthDate: "2019-07-22", gender: "M", capacityGroup: 50, grade: "초1", guardian: { name: "장성훈", relation: "부", phone: "010-9876-5432", job: "회사원" }, health: { allergies: [], medications: [], notes: "내성적이라 조용한 친구" }, enrolledAt: today, status: "active" },
      { id: "c-demo-003", tenantId: "t_acme", name: "한지유", nameLast: "한", nameFirst: "지유", birthDate: "2016-11-08", gender: "F", capacityGroup: 50, grade: "초5", guardian: { name: "한소영", relation: "모", phone: "010-5555-7777" }, health: { allergies: ["복숭아"], medications: [], notes: "리더십 활발, 친구들과 잘 어울림" }, enrolledAt: today, status: "active" },
    ];
    const demoAttendances: Record<string, { id: string; tenantId: string; childId: string; date: string; status: AttendanceStatus; arrivedAt?: string; reason?: string; guardianNotified: boolean; authorId: string }> = {
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
      setAttendanceOverride(childId, { ...att, capacityGroup: cap } as Parameters<typeof setAttendanceOverride>[1]);
    }
    if (added > 0) toast.success(`${added}명의 데모 아동을 등록했어요`);
    const url = new URL(window.location.href);
    url.searchParams.delete("demo");
    window.history.replaceState({}, "", url.toString());
    window.location.reload();
  }, [searchParams, toast]);

  const allChildren = useMemo(
    () => (mounted ? [...MOCK_CHILDREN, ...extraChildren] : MOCK_CHILDREN),
    [mounted, extraChildren],
  );

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of groups) counts[g.id] = 0;
    counts["all"] = allChildren.length;
    for (const c of allChildren) {
      const key = String(c.capacityGroup);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [allChildren, groups]);

  // 알레르기 옵션 (현재 데이터에서 추출)
  const allergyOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of allChildren) for (const a of c.health.allergies) set.add(a);
    return Array.from(set).sort();
  }, [allChildren]);

  const filtered = useMemo(() => {
    const gradeOrder: Record<string, number> = { "초1": 1, "초2": 2, "초3": 3, "초4": 4, "초5": 5, "초6": 6 };
    const selectedGroup = groups.find((g) => g.id === selectedGroupId);
    let list = selectedGroupId === "all" || !selectedGroup
      ? allChildren
      : allChildren.filter((c) => c.capacityGroup === (selectedGroup.capacity as CapacityGroup));

    // 텍스트 검색
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.guardian.name.toLowerCase().includes(q));
    }
    // 출석 상단 필터 (가로 chip)
    if (statusFilter !== "all") {
      list = list.filter((c) => attendanceState[c.id]?.status === statusFilter);
    }
    // Drawer 상세 필터
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
      list = list.filter((c) =>
        filter.allergies.some((a) => c.health.allergies.includes(a)),
      );
    }
    if (filter.statuses.length > 0) {
      list = list.filter((c) => {
        const s = attendanceState[c.id]?.status;
        return s ? filter.statuses.includes(s) : false;
      });
    }
    // 정렬
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

  const fillPct = (() => {
    const selectedGroup = groups.find((g) => g.id === selectedGroupId);
    if (selectedGroupId === "all" || !selectedGroup) {
      const total = Object.entries(groupCounts)
        .filter(([k]) => k !== "all")
        .reduce((sum, [, v]) => sum + v, 0);
      return Math.round((stats.present / total) * 100);
    }
    return Math.round((stats.present / selectedGroup.capacity) * 100);
  })();

  // ── Handlers ───────────────────────────────────────────────
  function handleAddGroup(label: string, capacity: number) {
    addChildGroup(label, capacity);
    setGroups(getChildGroups());
    toast.success(`"${label}" 그룹이 추가되었습니다`);
  }

  function handleUpdateGroup(id: string, label: string, capacity: number) {
    updateChildGroup(id, { label, capacity });
    setGroups(getChildGroups());
  }

  function handleDeleteGroup(id: string) {
    const g = groups.find((x) => x.id === id);
    removeChildGroup(id);
    setGroups(getChildGroups());
    if (selectedGroupId === id) setSelectedGroupId("all");
    toast.info(`"${g?.label ?? ""}" 그룹이 삭제되었습니다`);
  }

  function handleStatusChange(childId: string, status: AttendanceStatus, time?: string, reason?: string) {
    setAttendanceState((prev) => {
      const cur = prev[childId];
      const now = new Date().toISOString().slice(11, 16);
      const arrived = time ?? cur?.arrivedAt ?? (status === "등원" || status === "조퇴" ? now : undefined);
      const leftAt = status === "조퇴" ? cur?.leftAt ?? now : undefined;
      const next = {
        ...(cur ?? { id: `a-${childId}`, tenantId: "t_acme", childId, date: new Date().toISOString().slice(0, 10), guardianNotified: true, authorId: "u_1" }),
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

  function handleExportCSV() {
    if (filtered.length === 0) {
      toast.warning("내보낼 데이터가 없습니다");
      return;
    }
    const header = ["성", "이름", "학년", "나이", "보호자", "연락처", "알레르기", "오늘"];
    const rows = filtered.map((c) => {
      const a = attendanceState[c.id];
      const age = Math.floor(
        (Date.now() - new Date(c.birthDate).getTime()) / (365.25 * 86400 * 1000),
      );
      return [
        c.nameLast,
        c.nameFirst,
        c.grade ?? "",
        age,
        c.guardian.name,
        c.guardian.phone,
        c.health.allergies.join("/"),
        a?.status ?? "",
      ].join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const today = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `children_${today}.csv`;
    a.click();
    toast.success(`${filtered.length}명 CSV 다운로드`);
  }

  const filterActive =
    filter.enrolledRange != null ||
    filter.grades.length > 0 ||
    filter.allergies.length > 0 ||
    filter.statuses.length > 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">
        <div className="h-[calc(100vh-100px)] sticky top-[80px] overflow-y-auto">
          <ChildrenSidebar
            selectedGroupId={selectedGroupId}
            groups={groups}
            counts={groupCounts}
            onSelectGroup={setSelectedGroupId}
            onAddGroup={handleAddGroup}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
            onAddChild={() => setShowAddModal(true)}
          />
        </div>

        <div className="min-w-0 space-y-3">
          {/* 페이지 헤더 + 통계 */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-0">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-amber-500" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                  {selectedGroupId === "all" ? "전체 아동" : groups.find((g) => g.id === selectedGroupId)?.label ?? "그룹"}
                </h1>
                <span className="text-[12px] text-slate-400">{filtered.length}명</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  appearance="subtle"
                  onClick={handleExportCSV}
                  startIcon={<FileDown className="w-3.5 h-3.5" />}
                >
                  내보내기
                </Button>
                <Button
                  size="sm"
                  appearance="primary"
                  onClick={() => setShowAddModal(true)}
                  startIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  아동 추가
                </Button>
              </div>
            </div>

            {/* 정원 진행률 + 출석 통계 */}
            <div className="flex items-center gap-6 mt-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none"
                      stroke={fillPct >= 90 ? "#ef4444" : fillPct >= 70 ? "#f59e0b" : "#10b981"}
                      strokeWidth="3" strokeDasharray={`${fillPct * 0.94} 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-[10px] font-bold text-slate-700">
                    {fillPct}%
                  </div>
                </div>
                <div className="leading-tight">
                  <div className="text-[12px] font-semibold text-slate-900">등원 {stats.present}{selectedGroupId !== "all" ? ` / ${groups.find((g) => g.id === selectedGroupId)?.capacity ?? ""}` : ""}</div>
                  <div className="text-[10px] text-slate-500">정원 진행률</div>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-3 text-[12px]">
                <StatusCount icon={CheckCircle2} color="emerald" label="등원" count={stats.present} />
                <StatusCount icon={Clock} color="amber" label="조퇴" count={stats.earlyLeave} />
                <StatusCount icon={Clock} color="blue" label="보건" count={stats.sick} />
                <StatusCount icon={X} color="red" label="결석" count={stats.absent} />
              </div>
            </div>
          </div>

          {/* 검색 + 출석 chip + 옵션 + 추가 */}
          <div className="flex items-center gap-2 flex-wrap">
            <InputGroup style={{ flex: 1, minWidth: 200 }}>
              <InputGroup.Addon>
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </InputGroup.Addon>
              <Input
                value={query}
                onChange={setQuery}
                placeholder="이름 또는 보호자 검색"
              />
            </InputGroup>
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
            <Button
              size="sm"
              appearance={filterActive ? "primary" : "default"}
              onClick={() => setFilterOpen(true)}
              startIcon={<ListFilter className="w-3.5 h-3.5" />}
            >
              필터{filterActive && <span className="ml-1 text-[10px]">●</span>}
            </Button>
            <Button
              size="sm"
              appearance={tableOptions !== DEFAULT_TABLE_OPTIONS ? "primary" : "default"}
              onClick={() => setTableOptionsOpen(true)}
              startIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            >
              옵션
            </Button>
          </div>

          {/* 테이블 */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
            <ChildrenTable
              children={filtered}
              attendanceMap={attendanceState}
              options={tableOptions}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddChildModal
          capacityGroup={selectedGroupId !== "all" ? (groups.find((g) => g.id === selectedGroupId)?.capacity as CapacityGroup) ?? 50 : 50}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddChild}
        />
      )}

      <ChildrenFilterDrawer
        open={filterOpen}
        value={filter}
        onChange={setFilter}
        onClose={() => setFilterOpen(false)}
        allergyOptions={allergyOptions}
        matched={filtered.length}
        total={
          selectedGroupId === "all"
            ? allChildren.length
            : allChildren.filter((c) => {
                const cap = groups.find((g) => g.id === selectedGroupId)?.capacity;
                return c.capacityGroup === cap;
              }).length
        }
      />
      <TableOptionsDrawer
        open={tableOptionsOpen}
        value={tableOptions}
        onChange={setTableOptions}
        onClose={() => setTableOptionsOpen(false)}
      />
    </>
  );
}

// ─── Shared UI ────────────────────────────────────────────────
function StatusCount({ icon: Icon, color, label, count }: {
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "amber" | "blue" | "red";
  label: string;
  count: number;
}) {
  const colorMap = { emerald: "text-emerald-600 bg-emerald-50", amber: "text-amber-600 bg-amber-50", blue: "text-blue-600 bg-blue-50", red: "text-red-600 bg-red-50" } as const;
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("w-4 h-4 rounded grid place-items-center", colorMap[color])}>
        <Icon className="w-3 h-3" />
      </span>
      <span className="text-slate-600 text-[12px]">{label}</span>
      <span className="font-bold text-slate-900 text-[12px]">{count}</span>
    </div>
  );
}

function StatusFilter({ value, onChange }: { value: AttendanceStatus | "all"; onChange: (v: AttendanceStatus | "all") => void }) {
  const STATUSES: AttendanceStatus[] = ["등원", "결석", "조퇴", "보건휴식", "미등원"];
  return (
    <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-0.5 shadow-sm text-xs">
      {[{ v: "all" as const, l: "전체" }, ...STATUSES.map((s) => ({ v: s as AttendanceStatus, l: s === "보건휴식" ? "보건" : s }))].map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={cn("px-2.5 h-8 rounded-md font-medium transition", value === o.v ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50")}>
          {o.l}
        </button>
      ))}
    </div>
  );
}
