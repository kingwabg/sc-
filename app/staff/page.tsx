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
} from "@/lib/staff";
import {
  getExtraStaff,
  addExtraStaff,
  getStaffAttendanceOverrides,
} from "@/lib/store";
import {
  Button, Input, InputGroup
} from "rsuite";
import { Search, Plus, SlidersHorizontal, ListFilter, FileDown } from "lucide-react";
import { StaffSidebar } from "./_components/StaffSidebar";
import { StaffTable } from "./_components/StaffTable";
import { StaffFormModal } from "./_components/AddStaffModal";
import { StaffFilterDrawer, type StaffFilter } from "./_components/StaffFilterDrawer";
import { TableOptionsDrawer, DEFAULT_TABLE_OPTIONS, type TableOptions } from "@/components/ui/TableOptionsDrawer";
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
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<StaffPosition | "all">("all");
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
  const today = new Date().toISOString().slice(0, 10);

  const [extraStaff, setExtraStaff] = useState<Staff[]>([]);
  const [attOverrides, setAttOverrides] = useState<Record<string, StaffAttendance>>({});

  useEffect(() => {
    setExtraStaff(getExtraStaff());
    setAttOverrides(getStaffAttendanceOverrides());
  }, []);

  const allStaff = useMemo(() => [...MOCK_STAFF, ...extraStaff], [extraStaff]);
  const allPositions: StaffPosition[] = Object.keys(POSITION_LABELS) as StaffPosition[];

  const positionCounts = useMemo(() => {
    const counts = { all: allStaff.length } as Record<StaffPosition | "all", number>;
    for (const p of allPositions) counts[p] = 0;
    for (const s of allStaff) {
      if (counts[s.position] !== undefined) counts[s.position]++;
    }
    return counts;
  }, [allStaff, allPositions]);

  const filtered = useMemo(() => {
    let list =
      positionFilter === "all"
        ? allStaff
        : allStaff.filter((s) => s.position === positionFilter);
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
  }, [allStaff, positionFilter, query, filter]);

  const attendanceMap = useMemo<Record<string, StaffAttendance>>(() => {
    const m: Record<string, StaffAttendance> = {};
    for (const s of allStaff) {
      const att = attOverrides[s.id] ?? getStaffAttendanceByDate(s.id, today);
      if (att) m[s.id] = att;
    }
    return m;
  }, [allStaff, attOverrides, today]);

  function handleAdd(staff: Staff) {
    setExtraStaff(addExtraStaff(staff));
    setShowAddModal(false);
    toast.success(`${staff.name} 종사자가 등록되었습니다`);
  }

  function handleEdit(staff: Staff) {
    const isExtra = extraStaff.some((x) => x.id === staff.id);
    if (!isExtra) {
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

  function handleExportCSV() {
    if (filtered.length === 0) {
      toast.warning("내보낼 데이터가 없습니다");
      return;
    }
    const header = ["ID", "이름", "직위", "연락처", "이메일", "입사일", "상태"];
    const rows = filtered.map((s) =>
      [
        s.id,
        s.name,
        POSITION_LABELS[s.position],
        s.phone,
        s.email ?? "",
        s.joinDate,
        s.status === "active" ? "재직" : s.status === "leave" ? "휴직" : "퇴직",
      ].join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `staff_${today}.csv`;
    a.click();
    toast.success(`${filtered.length}명 CSV 다운로드`);
  }

  const filterActive =
    filter.joinRange != null ||
    filter.positions.length > 0 ||
    filter.statuses.length > 0;

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
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                  {positionFilter === "all"
                    ? "전체 종사자"
                    : POSITION_LABELS[positionFilter] ?? positionFilter}
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
                  종사자 추가
                </Button>
              </div>
            </div>
          </div>

          {/* 툴바 */}
          <div className="flex items-center gap-2 flex-wrap">
            <InputGroup style={{ flex: 1, minWidth: 200 }}>
              <InputGroup.Addon>
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </InputGroup.Addon>
              <Input value={query} onChange={setQuery} placeholder="이름 또는 연락처 검색" />
            </InputGroup>
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
