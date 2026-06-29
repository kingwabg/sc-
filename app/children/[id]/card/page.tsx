"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { getChildById, ageFromBirthDate, getAttendancesByYear, getCareLogsByYear, careLogCategoryTone, MOCK_CARE_LOGS } from "@/lib/children";
import type { CareLogCategory } from "@/lib/children";
import {
  ArrowLeft,
  Printer,
  AlertTriangle,
  Phone,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const AVAILABLE_YEARS = [2026, 2025, 2024];

export default function ChildCardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ChildCardBody />
    </Suspense>
  );
}

function Loading() {
  return (
    <main className="min-h-screen grid place-items-center text-slate-500">
      로딩 중…
    </main>
  );
}

function ChildCardBody() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const child = getChildById(params?.id ?? "");

  const yearParam = parseInt(search.get("year") ?? "", 10);
  const year = AVAILABLE_YEARS.includes(yearParam) ? yearParam : 2026;

  if (!child) {
    return (
      <main className="min-h-screen grid place-items-center text-slate-500">
        아동을 찾을 수 없습니다
      </main>
    );
  }

  function onPickYear(y: number) {
    router.replace(`${pathname}?year=${y}`);
  }

  function onPrint() {
    window.print();
  }

  // 학년: 입소일 기준 단순 계산 (재학 중이라고 가정)
  const enrolledYear = parseInt(child.enrolledAt.slice(0, 4), 10);
  const enrolledGradeNum = parseInt((child.grade ?? "").replace(/[^0-9]/g, ""), 10) || 1;
  const diff = year - new Date().getFullYear();
  const gradeForYear = `${Math.max(1, enrolledGradeNum + diff)}학년`;

  // 해당 연도 데이터
  const attendances = getAttendancesByYear(child.id, year);
  const careLogs = getCareLogsByYear(child.id, year);
  const present = attendances.filter((a) => a.status === "등원").length;
  const total = attendances.length;

  return (
    <main className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print max-w-3xl mx-auto mb-4 flex items-center justify-between gap-3 px-2 flex-wrap">
        <Link href={`/children/${child.id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          상세로 돌아가기
        </Link>
        <div className="flex items-center gap-2">
          <YearPicker value={year} onChange={onPickYear} />
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-brand-600 text-white text-sm font-semibold rounded-[10px] hover:bg-brand-700 transition"
          >
            <Printer className="w-4 h-4" />
            인쇄
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="print-area max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        {/* Header band */}
        <div className={cn(
          "px-6 py-5 text-white relative",
          child.gender === "M"
            ? "bg-gradient-to-r from-blue-500 to-blue-700"
            : "bg-gradient-to-r from-pink-500 to-pink-700",
        )}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur grid place-items-center text-3xl font-bold border-2 border-white/40">
              {child.name[0]}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider opacity-80">
                아동카드 · {year}년
              </div>
              <div className="text-3xl font-bold mt-1">{child.name}</div>
              <div className="text-sm opacity-90 mt-0.5">
                {gradeForYear} · {child.capacityGroup}명 정원 · {child.gender === "M" ? "남" : "여"}
              </div>
            </div>
          </div>
          <div className="absolute top-3 right-3 text-[10px] opacity-70 text-right">
            <div>ID: {child.id}</div>
            <div>입소: {child.enrolledAt}</div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-2 gap-6 p-6">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">기본 정보</div>
            <dl className="space-y-1.5 text-sm">
              <Row label="생년월일" value={`${child.birthDate} (${year}년 만 ${Math.max(0, ageFromBirthDate(child.birthDate) - (new Date().getFullYear() - year))}세)`} />
              <Row label="성별" value={child.gender === "M" ? "남" : "여"} />
              <Row label="학년" value={gradeForYear} />
              <Row label="정원그룹" value={`${child.capacityGroup}명`} />
              <Row label="입소일" value={child.enrolledAt} />
              <Row label="상태" value={child.status === "active" ? "재원" : child.status === "leave" ? "휴원" : "퇴소"} />
            </dl>
          </div>

          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">보호자</div>
            <dl className="space-y-1.5 text-sm mb-4">
              <Row label="이름" value={`${child.guardian.name} (${child.guardian.relation})`} />
              <Row label="연락처" value={child.guardian.phone} />
              {child.guardian.job && <Row label="직업" value={child.guardian.job} />}
              {child.emergencyContact && (
                <>
                  <Row label="긴급연락처" value={child.emergencyContact.name} />
                  <Row label="" value={child.emergencyContact.phone} />
                </>
              )}
            </dl>

            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">건강</div>
            <dl className="space-y-1.5 text-sm">
              <Row label="알레르기" value={child.health.allergies.length ? child.health.allergies.join(", ") : "없음"} />
              <Row label="복용약" value={child.health.medications.length ? child.health.medications.join(", ") : "없음"} />
              {child.health.notes && <Row label="특이사항" value={child.health.notes} />}
            </dl>
          </div>
        </div>

        {/* Year-specific stats */}
        <div className="border-t border-slate-100 px-6 py-5 bg-slate-50/40">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-3">
            {year}년 활동 요약
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="기록된 출석" value={total ? `${present}/${total}일` : "데이터 없음"} />
            <Stat label="기록된 돌봄 일지" value={`${careLogs.length}건`} />
            <Stat
              label="주요 카테고리"
              value={
                careLogs.length
                  ? Object.entries(
                      careLogs.reduce<Record<string, number>>((acc, l) => {
                        acc[l.category] = (acc[l.category] ?? 0) + 1;
                        return acc;
                      }, {}),
                    )
                      .sort((a, b) => b[1] - a[1])[0][0]
                  : "없음"
              }
            />
          </div>

          {careLogs.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-semibold text-slate-700 mb-2">주요 돌봄 일지 (최대 3건)</div>
              <ul className="space-y-1.5">
                {careLogs
                  .slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .slice(0, 3)
                  .map((log) => {
                    const tone = careLogCategoryTone(log.category as CareLogCategory);
                    return (
                      <li key={log.id} className="text-[12px] text-slate-700 flex items-start gap-2">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0", tone.bg, tone.text)}>
                          {log.category}
                        </span>
                        <span className="font-medium">{log.date}</span>
                        <span className="text-slate-900 font-semibold">{log.title}</span>
                        <span className="text-slate-600 truncate">— {log.content}</span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Office 아동관리 시스템 · {year}년 카드 · 발급 {new Date().toLocaleDateString("ko-KR")}
          </div>
          <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 grid place-items-center text-[8px] text-slate-400 font-mono">
            <div className="grid grid-cols-5 gap-px">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={cn("w-1.5 h-1.5", i % 2 === 0 ? "bg-slate-800" : "bg-white")} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signature lines */}
      <div className="no-print max-w-3xl mx-auto mt-6 grid grid-cols-3 gap-4 px-2 text-xs text-slate-600">
        <div className="border-b border-slate-400 pb-1 text-center">보호자 서명</div>
        <div className="border-b border-slate-400 pb-1 text-center">담당 선생님</div>
        <div className="border-b border-slate-400 pb-1 text-center">센터장</div>
      </div>
    </main>
  );
}

function YearPicker({ value, onChange }: { value: number; onChange: (y: number) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="appearance-none h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-[10px] text-sm font-medium text-slate-700 hover:border-brand-600 hover:text-brand-700 transition cursor-pointer"
      >
        {AVAILABLE_YEARS.map((y) => (
          <option key={y} value={y}>{y}년 카드</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="w-20 text-[11px] text-slate-500 shrink-0 pt-0.5">{label}</dt>
      <dd className="text-slate-900 flex-1 font-medium">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900 mt-1">{value}</div>
    </div>
  );
}