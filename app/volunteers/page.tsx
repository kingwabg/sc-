"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Input, InputGroup } from "rsuite";
import { Search, SlidersHorizontal, ListFilter, FileDown } from "lucide-react";
import {
  MOCK_VOLUNTEERS,
  VOLUNTEER_TYPE_LABELS,
  type Volunteer,
  type VolunteerType,
} from "@/lib/volunteer";
import { getExtraVolunteers, addExtraVolunteer } from "@/lib/tenant-store";
import { VolunteersSidebar } from "./_components/VolunteersSidebar";
import { VolunteersTable } from "./_components/VolunteersTable";
import { AddVolunteerModal } from "./_components/AddVolunteerModal";
import {
  TableOptionsDrawer,
  DEFAULT_TABLE_OPTIONS,
  type TableOptions,
} from "@/components/ui/TableOptionsDrawer";
import { useToast } from "@/components/ui/Toast";

export default function VolunteersPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <VolunteersBody />
      </Suspense>
    </AppShell>
  );
}

function VolunteersBody() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<VolunteerType | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableOptions, setTableOptions] = useState<TableOptions>(DEFAULT_TABLE_OPTIONS);
  const [tableOptionsOpen, setTableOptionsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [extraVolunteers, setExtraVolunteers] = useState<Volunteer[]>([]);

  useEffect(() => {
    setExtraVolunteers(getExtraVolunteers());
  }, []);

  const allVolunteers = useMemo(
    () => [...MOCK_VOLUNTEERS, ...extraVolunteers],
    [extraVolunteers],
  );
  const allTypes = Object.keys(VOLUNTEER_TYPE_LABELS) as VolunteerType[];

  const typeCounts = useMemo(() => {
    const counts = { all: allVolunteers.length } as Record<VolunteerType | "all", number>;
    for (const t of allTypes) counts[t] = 0;
    for (const v of allVolunteers) {
      if (counts[v.type] !== undefined) counts[v.type]++;
    }
    return counts;
  }, [allVolunteers, allTypes]);

  const filtered = useMemo(() => {
    let list = allVolunteers;
    if (typeFilter !== "all") {
      list = list.filter((v) => v.type === typeFilter);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.phone.includes(q) ||
          (v.organization ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [allVolunteers, typeFilter, query]);

  function handleAdd(vol: Volunteer) {
    const next = addExtraVolunteer(vol);
    setExtraVolunteers(next);
    setShowAddModal(false);
    toast.success(`${vol.name} 자원봉사자가 등록되었습니다`);
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.warning("내보낼 데이터가 없습니다");
      return;
    }
    const header = ["ID", "이름", "구분", "연락처", "소속", "활동시작", "활동종료", "상태"];
    const rows = filtered.map((v) => [
      v.id,
      v.name,
      v.type,
      v.phone,
      v.organization ?? "",
      v.startDate,
      v.endDate ?? "",
      v.status === "active" ? "활동중" : v.status === "completed" ? "완료" : "일시중단",
    ].join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `volunteers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success(`${filtered.length}명 CSV 다운로드`);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">
        <div className="h-[calc(100vh-100px)] sticky top-[80px]">
          <VolunteersSidebar
            selectedType={typeFilter}
            counts={typeCounts}
            onSelect={setTypeFilter}
            onAdd={() => setShowAddModal(true)}
          />
        </div>

        <div className="min-w-0 space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                  {typeFilter === "all"
                    ? "전체 자원봉사자"
                    : VOLUNTEER_TYPE_LABELS[typeFilter] ?? typeFilter}
                </h1>
                <span className="text-[12px] text-slate-400">{filtered.length}명</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  appearance="subtle"
                  onClick={handleExport}
                  startIcon={<FileDown className="w-3.5 h-3.5" />}
                >
                  내보내기
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <InputGroup style={{ flex: 1, minWidth: 200 }}>
              <InputGroup.Addon>
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </InputGroup.Addon>
              <Input
                value={query}
                onChange={setQuery}
                placeholder="이름, 연락처, 소속 검색"
              />
            </InputGroup>
            <Button
              size="sm"
              appearance="default"
              onClick={() => setFilterOpen(true)}
              startIcon={<ListFilter className="w-3.5 h-3.5" />}
            >
              필터
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

          <VolunteersTable volunteers={filtered} options={tableOptions} />
        </div>
      </div>

      {showAddModal && (
        <AddVolunteerModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      <TableOptionsDrawer
        open={tableOptionsOpen}
        value={tableOptions}
        onChange={setTableOptions}
        onClose={() => setTableOptionsOpen(false)}
      />
      {filterOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30"
          onClick={() => setFilterOpen(false)}
        />
      )}
    </>
  );
}