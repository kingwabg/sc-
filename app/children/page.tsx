"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Baby, Search, Plus, CheckCircle2, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Child, AttendanceStatus, CapacityGroup } from "@/lib/features/children/types";
import { MOCK_CHILDREN, MOCK_ATTENDANCES } from "@/lib/features/children/data";
import {
  getExtraChildren,
  addExtraChild,
  getAttendanceOverrides,
  setAttendanceOverride,
  type AttendanceMap,
} from "@/lib/store/children";
import { getTenantSettings } from "@/lib/tenant-store";
import { ChildrenSidebar } from "./_components/ChildrenSidebar";
import { ChildrenTable } from "./_components/ChildrenTable";
import { AddChildModal } from "./_components/AddChildModal";

type SortKey = "name" | "grade" | "today" | "age";

// ─── Page ────────────────────────────────────────────────────
export default function ChildrenPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ChildrenPageBody />
      </Suspense>
    </AppShell>
  );
}

// ─── Body ─────────────────────────────────────────────────────
function ChildrenPageBody() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("today");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CapacityGroup | "all">(50);
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
      { id: "c-demo-001", tenantId: "t_acme", name: "박서연", birthDate: "2018-03-15", gender: "F", capacityGroup: 50, grade: "초2", guardian: { name: "박지원", relation: "모", phone: "010-2345-6789", job: "간호사" }, health: { allergies: ["새우", "게"], medications: ["알레르기약 (세티리진)"], notes: "운동 후 호흡곤란 주의" }, enrolledAt: today, status: "active" },
      { id: "c-demo-002", tenantId: "t_acme", name: "장민서", birthDate: "2019-07-22", gender: "M", capacityGroup: 50, grade: "초1", guardian: { name: "장성훈", relation: "부", phone: "010-9876-5432", job: "회사원" }, health: { allergies: [], medications: [], notes: "내성적이라 조용한 친구" }, enrolledAt: today, status: "active" },
      { id: "c-demo-003", tenantId: "t_acme", name: "한지유", birthDate: "2016-11-08", gender: "F", capacityGroup: 50, grade: "초5", guardian: { name: "한소영", relation: "모", phone: "010-5555-7777" }, health: { allergies: ["복숭아"], medications: [], notes: "리더십 활발, 친구들과 잘 어울림" }, enrolledAt: today, status: "active" },
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
    if (added > 0) console.log(`[demo] ${added}명 등록 완료`);
    const url = new URL(window.location.href);
    url.searchParams.delete("demo");
    window.history.replaceState({}, "", url.toString());
    window.location.reload();
  }, [searchParams]);

  // ── Data ──────────────────────────────────────────────────
  const allChildren = useMemo(
    () => (mounted ? [...MOCK_CHILDREN, ...extraChildren] : MOCK_CHILDREN),
    [mounted, extraChildren],
  );

  // Count by group
  const groupCounts = useMemo(() => {
    const counts: Record<CapacityGroup | "all", number> = { all: allChildren.length, 30: 0, 40: 0, 50: 0 };
    for (const c of allChildren) counts[c.capacityGroup]++;
    return counts;
  }, [allChildren]);

  const filtered = useMemo(() => {
    const gradeOrder: Record<string, number> = { "초1": 1, "초2": 2, "초3": 3, "초4": 4, "초5": 5, "초6": 6 };
    let list = selectedGroup === "all"
      ? allChildren
      : allChildren.filter((c) => c.capacityGroup === selectedGroup);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.guardian.name.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      list = list.filter((c) => attendanceState[c.id]?.status === statusFilter);
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
  }, [query, statusFilter, sortKey, sortDir, attendanceState, selectedGroup, allChildren]);

  const stats = useMemo(() => {
    const arr = filtered.map((c) => attendanceState[c.id]).filter(Boolean) as typeof MOCK_ATTENDANCES;
    return {
      present: arr.filter((a) => a.status === "등원").length,
      earlyLeave: arr.filter((a) => a.status === "조퇴").length,
      sick: arr.filter((a) => a.status === "보건휴식").length,
      absent: arr.filter((a) => a.status === "결석" || a.status === "미등원").length,
    };
  }, [filtered, attendanceState]);

  const fillPct = selectedGroup === "all"
    ? Math.round((stats.present / (groupCounts[30] + groupCounts[40] + groupCounts[50])) * 100)
    : Math.round((stats.present / selectedGroup) * 100);

  // ── Handlers ───────────────────────────────────────────────
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
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">

        {/* Left sidebar */}
        <div className="h-[calc(100vh-100px)] sticky top-[80px]">
          <ChildrenSidebar
            selectedGroup={selectedGroup}
            counts={groupCounts}
            onSelect={setSelectedGroup}
            onAdd={() => setShowAddModal(true)}
          />
        </div>

        {/* Right main */}
        <div className="min-w-0 space-y-3">

          {/* Page title + stats strip */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-0">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-amber-500" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                  {selectedGroup === "all" ? "전체 아동" : `${selectedGroup}명 그룹`}
                </h1>
                <span className="text-[12px] text-slate-400">
                  {filtered.length}명
                </span>
              </div>
            </div>

            {/* Stats row */}
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
                  <div className="text-[12px] font-semibold text-slate-900">등원 {stats.present}{selectedGroup !== "all" ? ` / ${selectedGroup}` : ""}</div>
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

          {/* Search + filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center h-9 px-3 bg-white border border-slate-200 rounded-[10px] shadow-sm flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름 또는 보호자 검색"
                className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-slate-400" />
            </div>
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>

          {/* Table */}
          <ChildrenTable children={filtered} attendanceMap={attendanceState} onStatusChange={handleStatusChange} />
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddChildModal
          capacityGroup={selectedGroup === "all" ? 50 : selectedGroup}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddChild}
        />
      )}
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
