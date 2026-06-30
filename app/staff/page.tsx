"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  MOCK_STAFF,
  POSITION_LABELS,
  getStaffAttendanceByDate,
  type Staff,
  type StaffPosition,
  type StaffAttendance,
} from "@/lib/features/staff";
import { getExtraStaff, getStaffAttendanceOverrides, addExtraStaff } from "@/lib/store";
import { StaffSidebar } from "./_components/StaffSidebar";
import { StaffTable } from "./_components/StaffTable";
import { StaffFormModal } from "./_components/AddStaffModal";
import { StaffFilterDrawer, type StaffFilter } from "./_components/StaffFilterDrawer";
import { StaffPageHeader } from "./_components/StaffPageHeader";
import { StaffListToolbar, type StaffAttendanceChip } from "./_components/StaffListToolbar";
import { TableOptionsDrawer, DEFAULT_TABLE_OPTIONS, type TableOptions } from "@/components/ui/TableOptionsDrawer";
import { exportStaffCSV } from "@/lib/features/staff/export";
import { useToast } from "@/components/ui/Toast";

export default function StaffPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <StaffBody />
      </Suspense>
    </AppShell>
  );
}

function StaffBody() {
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);

  // ── State ─────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<StaffPosition | "all">("all");
  const [attendanceChip, setAttendanceChip] = useState<StaffAttendanceChip>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<StaffFilter>({
    joinRange: null,
    positions: [],
    statuses: [],
  });
  const [tableOptions, setTableOptions] = useState<TableOptions>(DEFAULT_TABLE_OPTIONS);
  const [tableOptionsOpen, setTableOptionsOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [extraStaff, setExtraStaff] = useState<Staff[]>([]);
  const [attOverrides, setAttOverrides] = useState<Record<string, StaffAttendance>>({});

  useEffect(() => {
    setExtraStaff(getExtraStaff());
    setAttOverrides(getStaffAttendanceOverrides());
  }, []);

  // ── Derived ──────────────────────────────────────────────
  const allStaff = useMemo(() => [...MOCK_STAFF, ...extraStaff], [extraStaff]);
  const allPositions = Object.keys(POSITION_LABELS) as StaffPosition[];

  const positionCounts = useMemo(() => {
    const counts = { all: allStaff.length } as Record<StaffPosition | "all", number>;
    for (const p of allPositions) counts[p] = 0;
    for (const s of allStaff) {
      if (counts[s.position] !== undefined) counts[s.position]++;
    }
    return counts;
  }, [allStaff, allPositions]);

  const attendanceMap = useMemo<Record<string, StaffAttendance>>(() => {
    const m: Record<string, StaffAttendance> = {};
    for (const s of allStaff) {
      const att = attOverrides[s.id] ?? getStaffAttendanceByDate(s.id, today);
      if (att) m[s.id] = att;
    }
    return m;
  }, [allStaff, attOverrides, today]);

  // 오늘 출근/외출/미출근 통계
  const todayStats = useMemo(() => {
    let present = 0, clockedOut = 0, outside = 0;
    for (const s of allStaff) {
      const att = attendanceMap[s.id];
      if (att?.clockIn) {
        present++;
        if (att.clockOut) clockedOut++;
        if (att.note?.includes("외출")) outside++;
      }
    }
    return { present, clockedOut, outside, absent: allStaff.length - present };
  }, [allStaff, attendanceMap]);

  const fillPct = allStaff.length > 0
    ? Math.round((todayStats.present / allStaff.length) * 100)
    : 0;

  const filtered = useMemo(() => {
    let list =
      positionFilter === "all"
        ? allStaff
        : allStaff.filter((s) => s.position === positionFilter);
    if (attendanceChip !== "all") {
      list = list.filter((s) => {
        const att = attendanceMap[s.id];
        if (attendanceChip === "present") return !!att?.clockIn;
        if (attendanceChip === "absent") return !att?.clockIn;
        return true;
      });
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.phone.includes(q),
      );
    }
    if (filter.joinRange) {
      const [a, b] = filter.joinRange;
      const aStr = a.toISOString().slice(0, 10);
      const bStr = b.toISOString().slice(0, 10);
      list = list.filter((s) => s.joinDate >= aStr && s.joinDate <= bStr);
    }
    if (filter.positions.length > 0) {
      list = list.filter((s) => filter.positions.includes(s.position));
    }
    if (filter.statuses.length > 0) {
      list = list.filter((s) => filter.statuses.includes(s.status));
    }
    return list;
  }, [allStaff, positionFilter, attendanceChip, attendanceMap, query, filter]);

  // ── Handlers ─────────────────────────────────────────────
  function handleAdd(staff: Staff) {
    setExtraStaff(addExtraStaff(staff));
    setShowAddModal(false);
    toast.success(`${staff.name} 종사자가 등록되었습니다`);
  }

  function handleEdit(staff: Staff) {
    if (!extraStaff.some((x) => x.id === staff.id)) {
      toast.warning("데모 데이터는 수정할 수 없어요 (등록된 종사자만 수정 가능)");
      setEditing(null);
      return;
    }
    const next = extraStaff.map((x) => (x.id === staff.id ? staff : x));
    setExtraStaff(next);
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("officex:extra-staff") || "[]") as Staff[];
        const updated = stored.map((x) => (x.id === staff.id ? staff : x));
        localStorage.setItem("officex:extra-staff", JSON.stringify(updated));
      } catch {
        /* ignore */
      }
    }
    setEditing(null);
    toast.success(`${staff.name} 정보가 저장되었습니다`);
  }

  function handleRemove(staff: Staff) {
    if (typeof window !== "undefined" && !window.confirm(`"${staff.name}" 종사자를 삭제할까요?`)) return;
    const next = extraStaff.filter((x) => x.id !== staff.id);
    setExtraStaff(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex:extra-staff", JSON.stringify(next));
    }
    toast.info(`${staff.name} 종사자가 삭제되었습니다`);
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.warning("내보낼 데이터가 없습니다");
      return;
    }
    exportStaffCSV(filtered, today);
    toast.success(`${filtered.length}명 CSV 다운로드`);
  }

  const filterActive =
    filter.joinRange != null ||
    filter.positions.length > 0 ||
    filter.statuses.length > 0;
  const tableOptionsChanged = tableOptions !== DEFAULT_TABLE_OPTIONS;

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">
        <div className="h-[calc(100vh-100px)] sticky top-[80px]">
          <StaffSidebar
            selectedPosition={positionFilter}
            counts={positionCounts}
            onSelect={setPositionFilter}
            onAdd={() => setShowAddModal(true)}
          />
        </div>

        <div className="min-w-0 space-y-3">
          <StaffPageHeader
            positionFilter={positionFilter}
            filteredCount={filtered.length}
            totalCount={allStaff.length}
            fillPct={fillPct}
            stats={todayStats}
            onAdd={() => setShowAddModal(true)}
            onExport={handleExport}
          />
          <StaffListToolbar
            query={query}
            onQueryChange={setQuery}
            attendanceChip={attendanceChip}
            onAttendanceChipChange={setAttendanceChip}
            filterActive={filterActive}
            onOpenFilter={() => setFilterOpen(true)}
            tableOptions={tableOptions}
            tableOptionsChanged={tableOptionsChanged}
            onOpenTableOptions={() => setTableOptionsOpen(true)}
          />
          <StaffTable
            staff={filtered}
            attendanceMap={attendanceMap}
            options={tableOptions}
            onEdit={(s) => setEditing(s)}
            onDelete={(s) => handleRemove(s)}
          />
        </div>
      </div>

      {showAddModal && (
        <StaffFormModal onClose={() => setShowAddModal(false)} onSubmit={handleAdd} />
      )}
      {editing && (
        <StaffFormModal initial={editing} onClose={() => setEditing(null)} onSubmit={handleEdit} />
      )}

      <StaffFilterDrawer
        open={filterOpen}
        value={filter}
        onChange={setFilter}
        onClose={() => setFilterOpen(false)}
        matched={filtered.length}
        total={allStaff.length}
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