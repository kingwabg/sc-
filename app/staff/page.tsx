"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  MOCK_STAFF,
  POSITION_LABELS,
  getStaffAttendanceByDate,
  workHours,
  type Staff,
  type StaffPosition,
  type StaffAttendance,
} from "@/lib/staff";
import { getExtraStaff, addExtraStaff, getStaffAttendanceOverrides } from "@/lib/tenant-store";
import { Search, Plus, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { StaffSidebar } from "./_components/StaffSidebar";

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
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<StaffPosition | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const [extraStaff, setExtraStaff] = useState<Staff[]>([]);
  const [staffAttOverrides, setStaffAttOverrides] = useState<Record<string, StaffAttendance>>({});

  useEffect(() => {
    setExtraStaff(getExtraStaff());
    setStaffAttOverrides(getStaffAttendanceOverrides());
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
    let list = positionFilter === "all" ? allStaff : allStaff.filter((s) => s.position === positionFilter);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.phone.includes(q));
    }
    return list;
  }, [allStaff, positionFilter, query]);

  function getAtt(staffId: string) {
    return (staffAttOverrides as Record<string, { clockIn?: string; clockOut?: string }>)[staffId]
      ?? getStaffAttendanceByDate(staffId, today);
  }

  function handleAdd(staff: Staff) {
    setExtraStaff(addExtraStaff(staff));
    setShowAddModal(false);
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">

        {/* Left sidebar */}
        <div className="h-[calc(100vh-100px)] sticky top-[80px]">
          <StaffSidebar
            selectedPosition={positionFilter}
            counts={positionCounts}
            onSelect={setPositionFilter}
            onAdd={() => setShowAddModal(true)}
          />
        </div>

        {/* Right main */}
        <div className="min-w-0 space-y-3">

          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                  {positionFilter === "all" ? "전체 종사자" : POSITION_LABELS[positionFilter] ?? positionFilter}
                </h1>
                <span className="text-[12px] text-slate-400">{filtered.length}명</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center h-9 px-3 bg-white border border-slate-200 rounded-[10px] shadow-sm flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름 또는 연락처 검색"
                className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-slate-400" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <Th>이름</Th>
                    <Th>직위</Th>
                    <Th>연락처</Th>
                    <Th>입사일</Th>
                    <Th>출근</Th>
                    <Th>퇴근</Th>
                    <Th>근무시간</Th>
                    <Th>상태</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((staff) => {
                    const att = getAtt(staff.id);
                    return (
                      <tr key={staff.id} className="border-t border-slate-100 hover:bg-indigo-50/20 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-9 h-9 rounded-full grid place-items-center text-[13px] font-bold shrink-0",
                              staff.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700")}>
                              {staff.name[0]}
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-slate-900 text-[13px]">{staff.name}</div>
                              <div className="text-[11px] text-slate-400">{staff.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="inline-block text-[12px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                            {POSITION_LABELS[staff.position]}
                          </span>
                        </td>
                        <td className="text-center">
                          <a href={`tel:${staff.phone}`} className="text-[13px] text-brand-600 hover:underline inline-flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {staff.phone}
                          </a>
                        </td>
                        <td className="text-center text-slate-600 text-[13px]">{staff.joinDate}</td>
                        <td className="text-center">
                          {att?.clockIn
                            ? <span className="text-[13px] font-semibold text-emerald-600">{att.clockIn}</span>
                            : <span className="text-slate-300 text-[12px]">—</span>}
                        </td>
                        <td className="text-center">
                          {att?.clockOut
                            ? <span className="text-[13px] font-semibold text-amber-600">{att.clockOut}</span>
                            : <span className="text-slate-300 text-[12px]">—</span>}
                        </td>
                        <td className="text-center text-[13px] font-semibold text-slate-700">{workHours(att?.clockIn, att?.clockOut)}</td>
                        <td className="text-center">
                          <span className={cn("inline-block text-[11px] px-2 py-0.5 rounded font-semibold",
                            staff.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                            {staff.status === "active" ? "재직" : staff.status === "leave" ? "휴직" : "퇴직"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">검색 결과가 없습니다</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
              총 {filtered.length}명
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddStaffModal onClose={() => setShowAddModal(false)} onSubmit={handleAdd} />
      )}
    </>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide", className)}>{children}</th>;
}

// ─── Add Staff Modal ──────────────────────────────────────────
function AddStaffModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (s: Staff) => void }) {
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [gender, setGender] = useState<"M" | "F">("F");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState<StaffPosition>("支援교사");
  const [joinDate, setJoinDate] = useState(new Date().toISOString().slice(0, 10));
  const [email, setEmail] = useState("");
  const positions = Object.keys(POSITION_LABELS) as StaffPosition[];
  const isValid = name.trim().length > 0 && phone.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      id: `s-new-${Date.now()}`, tenantId: "t_acme", name: name.trim(),
      loginId: loginId.trim() || name.trim().toLowerCase(),
      gender, phone: phone.trim(), position, joinDate,
      email: email.trim() || undefined, status: "active",
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 m-0">종사자 등록</h2>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="이름" required><input value={name} onChange={(e) => setName(e.target.value)} placeholder="김영미" className={inputCls} /></Field>
            <Field label="직위" required>
              <select value={position} onChange={(e) => setPosition(e.target.value as StaffPosition)} className={inputCls}>
                {positions.map((p) => <option key={p} value={p}>{POSITION_LABELS[p]}</option>)}
              </select>
            </Field>
            <Field label="성별">
              <div className="flex gap-2">
                {(["F", "M"] as const).map((g) => (
                  <button key={g} onClick={() => setGender(g)}
                    className={cn("flex-1 h-9 rounded-[10px] text-[13px] font-semibold border transition",
                      gender === g ? "bg-brand-50 border-brand-400 text-brand-700" : "bg-white border-slate-200 text-slate-600")}>
                    {g === "F" ? "여" : "남"}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="연락처" required><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputCls} /></Field>
            <Field label="입사일"><input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className={inputCls} /></Field>
            <Field label="로그인 ID"><input value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="자동 생성" className={inputCls} /></Field>
            <Field label="이메일" className="col-span-2"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="선택" className={inputCls} /></Field>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-9 px-4 bg-white border border-slate-200 text-slate-700 text-[13px] font-medium rounded-[10px] hover:bg-slate-50">취소</button>
          <button onClick={handleSubmit} disabled={!isValid}
            className={cn("h-9 px-4 text-white text-[13px] font-semibold rounded-[10px] transition",
              isValid ? "bg-brand-600 hover:bg-brand-700" : "bg-slate-300 cursor-not-allowed")}>
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full h-9 px-3 bg-white border border-slate-200 rounded-[10px] text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[12px] font-medium text-slate-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
