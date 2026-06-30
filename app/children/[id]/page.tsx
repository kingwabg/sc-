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
} from "@/lib/store";
import {
  ArrowLeft,
  Phone,
  AlertTriangle,
  Edit3,
  ChevronRight,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CareLogFormModal } from "./_components/CareLogFormModal";
import { CareLogRow } from "./_components/CareLogRow";

const AVAILABLE_YEARS = [2026, 2025, 2024];
const CATEGORIES: CareLogCategory[] = ["식사", "학습", "놀이", "투약", "관찰", "특별활동", "기타"];

type TabKey = "basic" | "health" | "attendance" | "documents";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "basic", label: "기본정보", icon: User },
  { key: "health", label: "건강", icon: Heart },
  { key: "attendance", label: "출석", icon: CalendarDays },
  { key: "documents", label: "문서", icon: FileText },
];

export default function ChildDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const child = useMemo<Child | undefined>(() => {
    const fromMock = getChildById(id);
    if (fromMock) return fromMock;
    if (typeof window === "undefined") return undefined;
    return getExtraChildren().find((c) => c.id === id);
  }, [id, mounted]);

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
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 font-semibold">{child.name}</span>
        </div>

        {/* HERO — 큰 프로필 + 출석률 + 액션 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-6 py-5 mb-4">
          <div className="flex items-center gap-5 flex-wrap">
            <div className={cn("w-20 h-20 rounded-2xl grid place-items-center text-3xl font-bold shrink-0 shadow-md", childTone)}>
              {child.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-slate-900 m-0">{child.name}</h1>
                <span className={cn("text-[11px] px-2 py-0.5 rounded font-semibold",
                  child.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                  {child.status === "active" ? "재원" : "휴원"}
                </span>
                {todayAttendance && (
                  <span className={cn("text-[11px] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1",
                    statusTone(todayAttendance.status).bg, statusTone(todayAttendance.status).text)}>
                    오늘 {todayAttendance.status}
                    {todayAttendance.arrivedAt && <span className="opacity-70 font-normal">{todayAttendance.arrivedAt}</span>}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap text-[13px] text-slate-600">
                <span><span className="font-semibold text-slate-900">{child.grade}</span> · 만 {ageFromBirthDate(child.birthDate)}세 · {child.gender === "M" ? "남아" : "여아"}</span>
                {child.school && (
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    {child.school}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-900">{child.guardian.name}</span>
                  <span className="text-slate-500">({child.guardian.relation})</span>
                  <a href={`tel:${child.guardian.phone}`} className="text-brand-600 hover:underline font-medium">
                    {child.guardian.phone}
                  </a>
                </span>
              </div>
              {child.health.allergies.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[11px] text-slate-500 font-medium">알레르기:</span>
                  {child.health.allergies.map((a) => (
                    <span key={a} className="inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="h-9 px-3 bg-white border border-slate-200 rounded-[10px] text-[13px] font-medium text-slate-700 hover:border-brand-600 hover:text-brand-700 transition inline-flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                정보 수정
              </button>
            </div>
          </div>
        </div>

        {/* TABS + CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
          {/* 좌측 탭 네비 */}
          <aside className="lg:sticky lg:top-[80px] lg:self-start">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-1.5 flex lg:flex-col gap-1 overflow-x-auto">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={cn(
                      "flex items-center gap-2 px-3 h-9 rounded-[10px] text-[13px] font-semibold transition shrink-0 lg:shrink lg:w-full text-left whitespace-nowrap",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* 우측 탭 컨텐츠 */}
          <div className="min-w-0 space-y-4">
            {activeTab === "basic" && <BasicTab child={child} childTone={childTone} />}
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

// ─── Tab: 기본 정보 (기본 + 보호자 + 추가 정보 통합) ─────────

function BasicTab({ child, childTone }: { child: Child; childTone: string }) {
  return (
    <>
      {/* 기본 정보 */}
      <SideCard title="기본 정보">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-1">
          <div className={cn("w-12 h-12 rounded-xl grid place-items-center text-lg font-bold shrink-0", childTone)}>
            {child.name[0]}
          </div>
          <div>
            <div className="font-bold text-[15px] text-slate-900">{child.name}</div>
            <div className="text-[12px] text-slate-500">{child.grade} · 만 {ageFromBirthDate(child.birthDate)}세</div>
          </div>
        </div>
        <SideRow label="생년월일">{child.birthDate}</SideRow>
        <SideRow label="성별">{child.gender === "M" ? "남아" : "여아"}</SideRow>
        <SideRow label="학년">{child.grade}</SideRow>
        {child.school && <SideRow label="학교">{child.school}</SideRow>}
        {child.phone && <SideRow label="휴대폰">{child.phone}</SideRow>}
        <SideRow label="정원">{child.capacityGroup}명 그룹</SideRow>
        <SideRow label="입소일">{child.enrolledAt}</SideRow>
        {child.previousEnrolledAt && (
          <SideRow label="이전 입소일" muted>{child.previousEnrolledAt}</SideRow>
        )}
        {child.leftAt && (
          <SideRow label="퇴소일" muted>{child.leftAt}</SideRow>
        )}
      </SideCard>

      {/* 보호자 */}
      <SideCard title="보호자">
        <SideRow label="이름">{child.guardian.name}</SideRow>
        <SideRow label="관계">{child.guardian.relation}</SideRow>
        {child.guardian.type && <SideRow label="유형">{child.guardian.type}</SideRow>}
        <SideRow label="연락처">
          <a href={`tel:${child.guardian.phone}`} className="text-brand-600 hover:underline">
            {child.guardian.phone}
          </a>
        </SideRow>
        {child.guardian.job && <SideRow label="직업">{child.guardian.job}</SideRow>}
        {child.guardian.notes && <SideRow label="비고">{child.guardian.notes}</SideRow>}
        {child.emergencyContact && (
          <SideRow label="긴급연락처" muted>
            {child.emergencyContact.name} · {child.emergencyContact.phone}
          </SideRow>
        )}
      </SideCard>

      {/* 추가 정보 */}
      <SideCard title="추가 정보">
        {child.address && <SideRow label="주소">{child.address}</SideRow>}
        {child.serviceType && <SideRow label="이용유형">{child.serviceType}</SideRow>}
        {child.medianIncomePct != null && (
          <SideRow label="함수기준 중위소득">{child.medianIncomePct}%</SideRow>
        )}
        {child.kidsCallId && <SideRow label="키즈콜ID">{child.kidsCallId}</SideRow>}
        {!child.address && !child.serviceType && child.medianIncomePct == null && !child.kidsCallId && (
          <div className="text-center py-3 text-slate-400 text-sm">등록된 추가 정보가 없습니다.</div>
        )}
      </SideCard>
    </>
  );
}

// ─── Tab: 건강 ────────────────────────────────────────────────

function HealthTab({ child }: { child: Child }) {
  return (
    <SideCard title="건강 정보">
      <SideRow label="알레르기">
        {child.health.allergies.length === 0 ? (
          <span className="text-slate-400">없음</span>
        ) : (
          <div className="flex items-center gap-1 flex-wrap">
            {child.health.allergies.map((a) => (
              <span key={a} className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">
                <AlertTriangle className="w-3 h-3" />
                {a}
              </span>
            ))}
          </div>
        )}
      </SideRow>
      {child.health.medications.length > 0 && (
        <SideRow label="복용약">
          {child.health.medications.map((m) => (
            <div key={m} className="text-[12px]">💊 {m}</div>
          ))}
        </SideRow>
      )}
      {child.health.notes && (
        <SideRow label="특이사항">
          <div className="text-[12px] text-slate-700 leading-relaxed">{child.health.notes}</div>
        </SideRow>
      )}
    </SideCard>
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-2 mb-3">
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-4">
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-2 mb-3">
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

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <h3 className="text-[12px] font-bold text-slate-700 uppercase tracking-wide m-0">{title}</h3>
      </div>
      <div className="px-4 py-3.5 space-y-3">{children}</div>
    </div>
  );
}

function SideRow({ label, children, muted }: { label: string; children: React.ReactNode; muted?: boolean }) {
  return (
    <div className="text-[13px]">
      <div className="text-[11px] font-semibold text-slate-400 mb-0.5">{label}</div>
      <div className={cn("font-semibold", muted ? "text-slate-500 text-[12px]" : "text-slate-900 text-[14px]")}>
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
    <div className={cn("rounded-lg px-2.5 py-2 flex items-center gap-2", tone)}>
      <Icon className="w-4 h-4 shrink-0" />
      <div className="leading-tight">
        <div className="text-[10.5px] font-medium opacity-80">{label}</div>
        <div className="text-base font-bold tabular-nums">{count}</div>
      </div>
    </div>
  );
}

function YearAction({ icon, label, sub, href }: { icon: React.ReactNode; label: string; sub?: string; href?: string }) {
  const tone = "flex items-center gap-2.5 px-3 py-2.5 bg-white border border-slate-200 rounded-[10px] hover:border-brand-500 hover:bg-brand-50/40 transition text-left";
  return (
    <Link href={href ?? "#"} className={cn(tone, "block")}>
      <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 grid place-items-center shrink-0">{icon}</span>
      <span className="leading-tight min-w-0">
        <span className="block text-[13px] font-semibold text-slate-900 truncate">{label}</span>
        {sub && <span className="block text-[11px] text-slate-500 truncate">{sub}</span>}
      </span>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto shrink-0" />
    </Link>
  );
}