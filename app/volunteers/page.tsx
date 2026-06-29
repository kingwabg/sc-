"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  MOCK_VOLUNTEERS,
  VOLUNTEER_TYPE_LABELS,
  getVolunteerAttendanceByDate,
  type Volunteer,
  type VolunteerType,
} from "@/lib/volunteer";
import { getExtraVolunteers, addExtraVolunteer, getVolunteerAttendanceOverrides } from "@/lib/tenant-store";
import {
  Heart,
  Search,
  Plus,
  Phone,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<VolunteerType | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [extraVolunteers, setExtraVolunteers] = useState<Volunteer[]>([]);
  const [volAttOverrides] = useState<Record<string, { present: boolean }>>({});

  useEffect(() => {
    setExtraVolunteers(getExtraVolunteers());
  }, []);

  const allVolunteers = useMemo(
    () => [...MOCK_VOLUNTEERS, ...extraVolunteers],
    [extraVolunteers],
  );

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
  }

  function getAtt(volId: string) {
    return (volAttOverrides as Record<string, { present: boolean }>)[volId]
      ?? getVolunteerAttendanceByDate(volId, today);
  }

  const types = Object.keys(VOLUNTEER_TYPE_LABELS) as VolunteerType[];

  return (
    <div className="w-full max-w-[1100px] lg:max-w-[1280px] xl:max-w-[1400px]">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">비종사자 관리</h1>
          </div>
          <p className="text-sm text-slate-500 m-0">
            공익 · 자원봉사자 · 실습생 · 총 {allVolunteers.length}명
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-9 px-3 bg-brand-600 text-white text-[13px] font-semibold rounded-[10px] hover:bg-brand-700 transition inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          비종사자 등록
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center h-9 px-3 bg-white border border-slate-200 rounded-[10px] shadow-sm flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름, 연락처, 소속 검색"
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-slate-400"
          />
        </div>
        <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-0.5 shadow-sm text-xs">
          <button
            onClick={() => setTypeFilter("all")}
            className={cn(
              "px-3 h-8 rounded-md font-medium transition",
              typeFilter === "all" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50",
            )}
          >
            전체
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 h-8 rounded-md font-medium transition",
                typeFilter === t ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50",
              )}
            >
              {VOLUNTEER_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <Th>이름</Th>
                <Th>유형</Th>
                <Th>소속</Th>
                <Th>연락처</Th>
                <Th>활동 기간</Th>
                <Th className="text-center">오늘</Th>
                <Th>상태</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vol) => {
                const att = getAtt(vol.id);
                return (
                  <tr
                    key={vol.id}
                    className="border-t border-slate-100 hover:bg-brand-50/30 transition"
                  >
                    <td className="py-3 pl-4 pr-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full grid place-items-center text-[13px] font-bold shrink-0",
                            vol.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700",
                          )}
                        >
                          {vol.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-[13px]">{vol.name}</div>
                          <div className="text-[11px] text-slate-400">{vol.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-[12px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
                        {VOLUNTEER_TYPE_LABELS[vol.type]}
                      </span>
                    </td>
                    <td>
                      {vol.organization ? (
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {vol.organization}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[12px]">—</span>
                      )}
                    </td>
                    <td>
                      <a href={`tel:${vol.phone}`} className="text-[13px] text-brand-600 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {vol.phone}
                      </a>
                    </td>
                    <td className="text-slate-600 text-[13px]">
                      {vol.startDate}
                      {vol.endDate ? ` ~ ${vol.endDate}` : " ~ 진행중"}
                    </td>
                    <td className="text-center">
                      {att ? (
                        <span
                          className={cn(
                            "text-[12px] px-2 py-0.5 rounded font-semibold",
                            att.present
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700",
                          )}
                        >
                          {att.present ? "등원" : "결석"}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[12px]">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={cn(
                          "text-[11px] px-2 py-0.5 rounded font-semibold",
                          vol.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : vol.status === "completed"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {vol.status === "active" ? "활동중" : vol.status === "completed" ? "종료" : "보류"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    검색 결과가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
          총 {filtered.length}명
        </div>
      </div>

      {showAddModal && (
        <AddVolunteerModal onClose={() => setShowAddModal(false)} onSubmit={handleAdd} />
      )}
    </div>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide", className)}>
      {children}
    </th>
  );
}

function AddVolunteerModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (vol: Volunteer) => void;
}) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("F");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<VolunteerType>("자원봉사자");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [organization, setOrganization] = useState("");
  const [note, setNote] = useState("");

  const isValid = name.trim().length > 0 && phone.trim().length > 0;
  const types = Object.keys(VOLUNTEER_TYPE_LABELS) as VolunteerType[];

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      id: `v-new-${Date.now()}`,
      tenantId: "t_acme",
      name: name.trim(),
      gender,
      phone: phone.trim(),
      type,
      startDate,
      endDate: endDate || undefined,
      organization: organization.trim() || undefined,
      note: note.trim() || undefined,
      status: "active",
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 m-0">비종사자 등록</h2>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="이름" required>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="정서윤" className={inputCls} />
            </Field>
            <Field label="유형" required>
              <select value={type} onChange={(e) => setType(e.target.value as VolunteerType)} className={inputCls}>
                {types.map((t) => <option key={t} value={t}>{VOLUNTEER_TYPE_LABELS[t]}</option>)}
              </select>
            </Field>
            <Field label="성별">
              <div className="flex gap-2">
                {(["F", "M"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      "flex-1 h-9 rounded-[10px] text-[13px] font-semibold border transition",
                      gender === g ? "bg-brand-50 border-brand-400 text-brand-700" : "bg-white border-slate-200 text-slate-600",
                    )}
                  >
                    {g === "F" ? "여" : "남"}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="연락처" required>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputCls} />
            </Field>
            <Field label="활동 시작일">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="활동 종료일" hint="비워두면 계속">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="소속" className="col-span-2">
              <input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="OO대학교, OO구청 등" className={inputCls} />
            </Field>
            <Field label="비고" className="col-span-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="특이사항"
                className={inputCls + " h-20 resize-none"}
              />
            </Field>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-9 px-4 bg-white border border-slate-200 text-slate-700 text-[13px] font-medium rounded-[10px] hover:bg-slate-50">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={cn(
              "h-9 px-4 text-white text-[13px] font-semibold rounded-[10px] transition",
              isValid ? "bg-brand-600 hover:bg-brand-700" : "bg-slate-300 cursor-not-allowed",
            )}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full h-9 px-3 bg-white border border-slate-200 rounded-[10px] text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

function Field({ label, required, hint, children, className }: { label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[12px] font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
