"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  getChildById,
  ageFromBirthDate,
  statusTone,
  careLogCategoryTone,
  getCareLogsByYear,
  getAttendancesByYear,
} from "@/lib/children";
import type { Attendance, CareLog, CareLogCategory, Child } from "@/lib/features/children/types";
import {
  getExtraChildren,
  addExtraCareLog,
  getAttendanceOverrides,
  updateExtraChild,
} from "@/lib/store";
import { documentService } from "@/lib/documents/service";
import {
  ArrowLeft,
  Phone,
  AlertTriangle,
  Edit3,
  CheckCircle2,
  Clock,
  Stethoscope,
  CalendarDays,
  IdCard,
  MessageCircle,
  Users,
  Briefcase,
  Plus,
  TrendingUp,
  User,
  Heart,
  BookOpen,
  FileText,
  School,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CareLogFormModal } from "./_components/CareLogFormModal";
import { CareLogRow } from "./_components/CareLogRow";
import { ChildCardTab } from "./_components/ChildCardTab";
import { GRADE_ORDER } from "./_components/gradeForYear";

const AVAILABLE_YEARS = [2026, 2025, 2024];
const CATEGORIES: CareLogCategory[] = ["식사", "학습", "놀이", "투약", "관찰", "특별활동", "기타"];

type TabKey = "basic" | "health" | "attendance" | "documents";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "basic", label: "아동 카드", icon: IdCard },
  { key: "health", label: "건강", icon: Heart },
  { key: "attendance", label: "출석", icon: CalendarDays },
  { key: "documents", label: "문서", icon: FileText },
];

export default function ChildDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [child, setChild] = useState<Child | undefined>(() => {
    const fromMock = getChildById(id);
    if (fromMock) return fromMock;
    if (typeof window === "undefined") return undefined;
    return getExtraChildren().find((c) => c.id === id);
  });
  // Re-load on id change
  useEffect(() => {
    const fromMock = getChildById(id);
    if (fromMock) setChild(fromMock);
    else if (typeof window !== "undefined") {
      setChild(getExtraChildren().find((c) => c.id === id));
    }
  }, [id, mounted]);

  // 인라인 편집
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    grade: "",
    school: "",
    phone: "",
    guardianName: "",
    guardianPhone: "",
    guardianJob: "",
    address: "",
  });

  function startEdit() {
    if (!child) return;
    setEditForm({
      name: child.name,
      grade: child.grade ?? "",
      school: child.school ?? "",
      phone: child.phone ?? "",
      guardianName: child.guardian.name,
      guardianPhone: child.guardian.phone,
      guardianJob: child.guardian.job ?? "",
      address: child.address ?? "",
    });
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
  }

  function saveEdit() {
    if (!child) return;
    const isExtra = typeof window !== "undefined" && getExtraChildren().some((c) => c.id === child.id);
    if (!isExtra) {
      window.alert("데모 데이터는 수정할 수 없어요 (등록한 아동만 수정 가능)");
      return;
    }
    const updates: Partial<Child> = {
      name: editForm.name || child.name,
      grade: editForm.grade || child.grade,
      school: editForm.school || undefined,
      phone: editForm.phone || undefined,
      guardian: {
        ...child.guardian,
        name: editForm.guardianName || child.guardian.name,
        phone: editForm.guardianPhone || child.guardian.phone,
        job: editForm.guardianJob || undefined,
      },
      address: editForm.address || undefined,
    };
    const updated = updateExtraChild(child.id, updates);
    if (updated) {
      setChild(updated);
      setEditMode(false);
      // write-through: 아동카드 인덱스 갱신
      documentService.upsert({
        id: `child-card-${child.id}`,
        kind: "child-card",
        title: `${updated.name} 아동카드`,
        snippet: `이름 ${updated.name} · 학년 ${updated.grade ?? "-"} · 학교 ${updated.school ?? "-"}`,
        sourceUrl: `/children/${updated.id}?tab=basic`,
        childId: updated.id,
        authorId: "u_current",
        authorName: "나",
        meta: { lastEditedField: "기본정보" },
      });
    }
  }

  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);

  useEffect(() => {
    if (!mounted || !child) return;
    const overrides = getAttendanceOverrides();
    setTodayAttendance(overrides[child.id] ?? null);
  }, [mounted, child]);

  const careLogs = useMemo(
    () => (child ? getCareLogsByYear(child.id, year) : []),
    [child?.id, year, mounted],
  );

  const attendances = useMemo(
    () => (child ? getAttendancesByYear(child.id, year) : []),
    [child?.id, year, mounted],
  );

  const monthlyStats = useMemo(() => {
    const stats: Record<string, { present: number; absent: number; leave: number; sick: number }> = {};
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, "0")}`;
      stats[key] = { present: 0, absent: 0, leave: 0, sick: 0 };
    }
    for (const a of attendances) {
      const m = a.date.slice(0, 7);
      if (!stats[m]) continue;
      if (a.status === "등원") stats[m].present++;
      else if (a.status === "결석" || a.status === "미등원") stats[m].absent++;
      else if (a.status === "조퇴") stats[m].leave++;
      else if (a.status === "보건휴식") stats[m].sick++;
    }
    return stats;
  }, [attendances, year]);

  const yearTotals = useMemo(() => {
    const sum = { present: 0, absent: 0, leave: 0, sick: 0 };
    for (const s of Object.values(monthlyStats)) {
      sum.present += s.present;
      sum.absent += s.absent;
      sum.leave += s.leave;
      sum.sick += s.sick;
    }
    const validDays = sum.present + sum.leave * 0.5;
    const totalMarked = sum.present + sum.absent + sum.leave + sum.sick;
    const rate = totalMarked > 0 ? Math.round((validDays / totalMarked) * 100) : 0;
    return { ...sum, rate };
  }, [monthlyStats]);

  const categoryStats = useMemo(() => {
    const map: Partial<Record<CareLogCategory, number>> = {};
    for (const log of careLogs) {
      map[log.category] = (map[log.category] ?? 0) + 1;
    }
    return map;
  }, [careLogs]);

  if (!child) {
    return (
      <AppShell>
        <div className="text-center py-20 text-slate-500">
          아동을 찾을 수 없습니다.{" "}
          <Link href="/children" className="text-brand-600 underline">목록으로</Link>
        </div>
      </AppShell>
    );
  }

  function handleAddCareLog(log: Omit<CareLog, "id" | "createdAt">) {
    addExtraCareLog({ ...log, id: `cl-${Date.now()}`, createdAt: Date.now() });
    setShowLogForm(false);
    setYear((y) => y);
  }

  const childTone = child.gender === "M"
    ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
    : "bg-gradient-to-br from-pink-400 to-pink-600 text-white";

  return (
    <AppShell>
      <div className="w-full max-w-[1100px] lg:max-w-[1280px] xl:max-w-[1400px]">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link href="/children" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            아동 목록
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">{child.name}</span>
        </div>

        {/* HERO — 간소화: 아바타 + 이름 + 학년·나이 + 출석 + 정보수정 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4 mb-3">
          {editMode ? (
            /* === EDIT MODE === */
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn("w-12 h-12 rounded-2xl grid place-items-center text-lg font-bold shrink-0", childTone)}>
                    {editForm.name?.[0] || child.name[0]}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="이름"
                      className="h-9 px-3 bg-white border border-slate-200 rounded-md text-[15px] font-semibold focus:outline-none focus:border-blue-500"
                    />
                    <select
                      value={editForm.grade}
                      onChange={(e) => setEditForm((f) => ({ ...f, grade: e.target.value }))}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-blue-500"
                    >
                      {GRADE_ORDER.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                  <button
                    onClick={cancelEdit}
                    className="h-9 px-3 bg-white border border-slate-200 text-slate-700 text-[13px] font-medium rounded-[10px] hover:bg-slate-50 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={saveEdit}
                    className="h-9 px-3.5 bg-blue-600 text-white text-[13px] font-semibold rounded-[10px] hover:bg-blue-700 transition inline-flex items-center gap-1.5"
                  >
                    저장
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12.5px]">
                <div className="flex items-center gap-2">
                  <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    value={editForm.school}
                    onChange={(e) => setEditForm((f) => ({ ...f, school: e.target.value }))}
                    placeholder="학교"
                    className="flex-1 h-8 px-2.5 bg-white border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="아동 휴대폰"
                    className="flex-1 h-8 px-2.5 bg-white border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    value={editForm.guardianName}
                    onChange={(e) => setEditForm((f) => ({ ...f, guardianName: e.target.value }))}
                    placeholder="보호자명"
                    className="flex-1 h-8 px-2.5 bg-white border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    value={editForm.guardianPhone}
                    onChange={(e) => setEditForm((f) => ({ ...f, guardianPhone: e.target.value }))}
                    placeholder="보호자 연락처"
                    className="flex-1 h-8 px-2.5 bg-white border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    value={editForm.guardianJob}
                    onChange={(e) => setEditForm((f) => ({ ...f, guardianJob: e.target.value }))}
                    placeholder="보호자 직업"
                    className="flex-1 h-8 px-2.5 bg-white border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    value={editForm.address}
                    onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="주소"
                    className="flex-1 h-8 px-2.5 bg-white border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          ) : (
            /* === VIEW MODE === */
            <>
              <div className="flex items-center gap-4 flex-wrap">
                <div className={cn("w-14 h-14 rounded-2xl grid place-items-center text-xl font-bold shrink-0 shadow-sm", childTone)}>
                  {child.name[0]}
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <h1 className="text-[22px] font-bold text-slate-900 m-0 leading-none">{child.name}</h1>
                  <span className={cn("text-[11px] px-2 py-0.5 rounded font-semibold",
                    child.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                    {child.status === "active" ? "재원" : "휴원"}
                  </span>
                  <span className="text-[13px] text-slate-500">
                    {child.grade} · 만 {ageFromBirthDate(child.birthDate)}세 · {child.gender === "M" ? "남아" : "여아"}
                  </span>
                  {todayAttendance && (
                    <span className={cn("text-[11px] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1",
                      statusTone(todayAttendance.status).bg, statusTone(todayAttendance.status).text)}>
                      오늘 {todayAttendance.status}
                      {todayAttendance.arrivedAt && <span className="opacity-70 font-normal">{todayAttendance.arrivedAt}</span>}
                    </span>
                  )}
                </div>
                <button
                  onClick={startEdit}
                  className="h-9 px-3.5 bg-blue-600 text-white text-[13px] font-semibold rounded-[10px] hover:bg-blue-700 transition inline-flex items-center gap-1.5 shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  정보 수정
                </button>
              </div>

              {/* 메타 줄: 학교 / 보호자 / 알레르기 (작게, 회색) */}
              <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-3 pt-3 border-t border-slate-100 text-[12.5px] text-slate-500">
                {child.school && (
                  <span className="inline-flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-slate-400" />
                    {child.school}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">{child.guardian.name}</span>
                  <span className="text-slate-400">({child.guardian.relation})</span>
                  <a href={`tel:${child.guardian.phone}`} className="text-brand-600 hover:underline font-medium">
                    {child.guardian.phone}
                  </a>
                </span>
                {child.health.allergies.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    {child.health.allergies.map((a) => (
                      <span key={a} className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">
                        {a}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* TABS (상단 가로) + CONTENT */}
        <div className="space-y-4">
          {/* 상단 탭 바 — 가로, 밑줄 indicator */}
          <div className="border-b border-slate-200">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={cn(
                      "relative flex items-center gap-2 px-4 h-11 text-[14px] font-semibold transition shrink-0 whitespace-nowrap",
                      isActive
                        ? "text-brand-700"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-brand-600" : "text-slate-400")} />
                    {t.label}
                    {isActive && (
                      <span className="absolute -bottom-px left-2 right-2 h-0.5 bg-brand-600 rounded-t" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="min-w-0 space-y-4">
            {activeTab === "basic" && (
              <ChildCardTab
                child={child}
                childTone={childTone}
                year={year}
                setYear={setYear}
                yearTotals={yearTotals}
                careLogs={careLogs}
              />
            )}
            {activeTab === "health" && <HealthTab child={child} />}
            {activeTab === "attendance" && (
              <AttendanceTab
                year={year}
                setYear={setYear}
                careLogs={careLogs}
                monthlyStats={monthlyStats}
                yearTotals={yearTotals}
                categoryStats={categoryStats}
                onWriteLog={() => setShowLogForm(true)}
              />
            )}
            {activeTab === "documents" && (
              <DocumentsTab
                year={year}
                careLogs={careLogs}
                childId={child.id}
                onWriteLog={() => setShowLogForm(true)}
              />
            )}
          </div>
        </div>
      </div>

      {showLogForm && (
        <CareLogFormModal
          childId={child.id}
          onClose={() => setShowLogForm(false)}
          onSubmit={handleAddCareLog}
        />
      )}
    </AppShell>
  );
}

// ─── Tab: 건강 ────────────────────────────────────────────────

function HealthTab({ child }: { child: Child }) {
  const hasAny = child.health.allergies.length > 0 ||
                 child.health.medications.length > 0 ||
                 !!child.health.notes;
  if (!hasAny) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-8 text-center text-slate-400 text-sm">
        등록된 건강 정보가 없습니다.
      </div>
    );
  }
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
      <h2 className="text-[15px] font-bold text-slate-900 m-0 mb-4">건강 정보</h2>
      <div className="space-y-5">
        {child.health.allergies.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">알레르기</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {child.health.allergies.map((a) => (
                <span key={a} className="inline-flex items-center gap-1 text-[13px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
        {child.health.medications.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">복용약</div>
            <div className="space-y-1">
              {child.health.medications.map((m) => (
                <div key={m} className="flex items-center gap-2 text-[14px] text-slate-700">
                  <span className="w-5 h-5 rounded bg-violet-50 text-violet-600 grid place-items-center text-[12px]">💊</span>
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}
        {child.health.notes && (
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">특이사항</div>
            <div className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {child.health.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: 출석 (연도 + 출석 통계 + 카테고리 통계) ─────────────

function AttendanceTab({
  year,
  setYear,
  careLogs,
  monthlyStats,
  yearTotals,
  categoryStats,
  onWriteLog,
}: {
  year: number;
  setYear: (y: number) => void;
  careLogs: CareLog[];
  monthlyStats: Record<string, { present: number; absent: number; leave: number; sick: number }>;
  yearTotals: { present: number; absent: number; leave: number; sick: number; rate: number };
  categoryStats: Partial<Record<CareLogCategory, number>>;
  onWriteLog: () => void;
}) {
  return (
    <>
      {/* Year tabs + write button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-0.5 shadow-sm text-xs">
          {AVAILABLE_YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={cn(
                "px-3 h-8 rounded-md font-medium transition",
                year === y ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50",
              )}
            >
              {y}년
            </button>
          ))}
        </div>
        <button
          onClick={onWriteLog}
          className="h-9 px-3 bg-brand-600 text-white text-[13px] font-semibold rounded-[10px] hover:bg-brand-700 transition inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          관찰일지 작성
        </button>
      </div>

      {/* Attendance stats */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900 m-0">{year}년 출석</h2>
          <span className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
            출석률 {yearTotals.rate}%
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <AttendanceCount icon={CheckCircle2} color="emerald" label="등원" count={yearTotals.present} />
          <AttendanceCount icon={Clock} color="amber" label="조퇴" count={yearTotals.leave} />
          <AttendanceCount icon={Stethoscope} color="blue" label="보건" count={yearTotals.sick} />
          <AttendanceCount icon={Clock} color="red" label="결석/미등원" count={yearTotals.absent} />
        </div>
        <div className="space-y-1.5">
          {Object.entries(monthlyStats).map(([month, stat]) => {
            const m = parseInt(month.split("-")[1], 10);
            const total = stat.present + stat.absent + stat.leave + stat.sick;
            if (total === 0) return null;
            return (
              <div key={month} className="flex items-center gap-2 text-[11px]">
                <span className="w-8 text-slate-500 font-medium">{m}월</span>
                <div className="flex-1 h-4 rounded bg-slate-100 overflow-hidden flex">
                  {stat.present > 0 && <div className="bg-emerald-400 h-full" style={{ width: `${(stat.present / total) * 100}%` }} />}
                  {stat.sick > 0 && <div className="bg-blue-400 h-full" style={{ width: `${(stat.sick / total) * 100}%` }} />}
                  {stat.leave > 0 && <div className="bg-amber-400 h-full" style={{ width: `${(stat.leave / total) * 100}%` }} />}
                  {stat.absent > 0 && <div className="bg-red-400 h-full" style={{ width: `${(stat.absent / total) * 100}%` }} />}
                </div>
                <span className="w-12 text-right text-slate-600 tabular-nums">{total}일</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category stats */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900 m-0">관찰일지 카테고리</h2>
          <span className="text-[12px] text-slate-500">총 {careLogs.length}건</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const tone = careLogCategoryTone(cat);
            const count = categoryStats[cat] ?? 0;
            return (
              <div key={cat} className={cn("rounded-lg p-3", tone.bg)}>
                <div className={cn("text-xs font-semibold", tone.text)}>{cat}</div>
                <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                  {count}<span className="text-xs font-normal text-slate-500 ml-1">건</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Tab: 문서 (문서 카드 + 관찰일지 타임라인) ────────────────

function DocumentsTab({
  year,
  careLogs,
  childId,
  onWriteLog,
}: {
  year: number;
  careLogs: CareLog[];
  childId: string;
  onWriteLog: () => void;
}) {
  return (
    <>
      {/* Document links */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900 m-0">아동 문서</h2>
          <span className="text-[11px] text-slate-400 ml-1">{year}년 기준</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <YearAction icon={<IdCard className="w-4 h-4" />} label="아동카드" sub="인쇄용" href={`/children/${childId}/card?year=${year}`} />
          <YearAction icon={<MessageCircle className="w-4 h-4" />} label="아동 상담일지" sub="0건" href="#" />
          <YearAction icon={<Users className="w-4 h-4" />} label="보호자 상담일지" sub="0건" href="#" />
          <YearAction icon={<Briefcase className="w-4 h-4" />} label="사례관리" sub="0건" href="#" />
        </div>
      </div>

      {/* Care log timeline */}
      <div id="care-log-timeline" className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 m-0">{year}년 관찰일지</h2>
          <span className="text-xs text-slate-500">총 {careLogs.length}건</span>
        </div>
        {careLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            {year}년에 기록된 관찰일지가 없습니다.
            <br />
            <button onClick={onWriteLog} className="mt-2 text-brand-600 hover:underline font-semibold">
              + 첫 일지 작성하기
            </button>
          </div>
        ) : (
          <ol className="relative border-l-2 border-slate-100 ml-2 space-y-4">
            {[...careLogs].sort((a, b) => (a.date < b.date ? 1 : -1)).map((log) => (
              <CareLogRow key={log.id} log={log} />
            ))}
          </ol>
        )}
      </div>
    </>
  );
}

// ─── Shared sub-components ───────────────────────────────────

function BigField({
  label,
  icon: Icon,
  children,
  muted,
  className,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </div>
      <div
        className={cn(
          "flex items-center gap-1.5 text-[15px] font-semibold",
          muted ? "text-slate-500" : "text-slate-900",
        )}
      >
        {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
        {children}
      </div>
    </div>
  );
}

function AttendanceCount({
  icon: Icon,
  color,
  label,
  count,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "amber" | "blue" | "red";
  label: string;
  count: number;
}) {
  const tone = { emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", blue: "bg-blue-50 text-blue-700", red: "bg-red-50 text-red-700" }[color];
  return (
    <div className={cn("rounded-xl px-3 py-2.5 flex items-center gap-2", tone)}>
      <Icon className="w-4 h-4 shrink-0" />
      <div className="leading-tight">
        <div className="text-[10.5px] font-medium opacity-80">{label}</div>
        <div className="text-lg font-bold tabular-nums leading-tight">{count}</div>
      </div>
    </div>
  );
}

function YearAction({ icon, label, sub, href }: { icon: React.ReactNode; label: string; sub?: string; href?: string }) {
  return (
    <Link href={href ?? "#"} className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-slate-200 rounded-[10px] hover:border-brand-500 hover:bg-brand-50/40 transition text-left">
      <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 grid place-items-center shrink-0">{icon}</span>
      <span className="leading-tight min-w-0">
        <span className="block text-[13px] font-semibold text-slate-900 truncate">{label}</span>
        {sub && <span className="block text-[11px] text-slate-500 truncate">{sub}</span>}
      </span>
    </Link>
  );
}