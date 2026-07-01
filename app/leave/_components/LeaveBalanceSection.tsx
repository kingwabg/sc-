"use client";

import Link from "next/link";
import { Palmtree, Plus, Clock, CheckCircle2, CalendarClock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MY_LEAVE_BALANCES,
  MY_LEAVE_YEAR_INFO,
  LEAVE_KIND_LABELS,
  LEAVE_KIND_EMOJIS,
} from "@/lib/features/leave-mock";
import type { LeaveBalance } from "@/lib/features/leave-mock";

// ─── 4개 연차 현황 카드 ───────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "brand" | "emerald" | "amber" | "violet";
  sub?: string;
}

const TONE = {
  brand:   { bg: "bg-brand-50",   border: "border-brand-200",   icon: "bg-brand-100   text-brand-600",   text: "text-brand-700"   },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-700" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   icon: "bg-amber-100   text-amber-600",   text: "text-amber-700"   },
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  icon: "bg-violet-100  text-violet-600",  text: "text-violet-700"  },
};

function StatCard({ label, value, icon: Icon, tone, sub }: StatCardProps) {
  const c = TONE[tone];
  return (
    <div className={cn("flex-1 min-w-0 p-4 rounded-2xl border shadow-card bg-white")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
          {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={cn("w-9 h-9 rounded-xl grid place-items-center shrink-0", c.icon)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// ─── 12종 휴가 카드 ──────────────────────────────────
interface LeaveCardProps {
  balance: LeaveBalance;
}

const KIND_TONE: Record<string, { bg: string; text: string; border: string }> = {
  annual:        { bg: "bg-brand-50",   text: "text-brand-600",   border: "border-brand-200"   },
  half:          { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200"    },
  sick:          { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200"     },
  condolence:   { bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200"   },
  public:        { bg: "bg-amber-50",  text: "text-amber-600",   border: "border-amber-200"   },
  menstrual:     { bg: "bg-pink-50",   text: "text-pink-600",   border: "border-pink-200"   },
  childcare:     { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  pregnancy:     { bg: "bg-rose-50",   text: "text-rose-600",   border: "border-rose-200"   },
  commuting:     { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200"  },
  family:        { bg: "bg-teal-50",   text: "text-teal-600",   border: "border-teal-200"   },
  reinstatement: { bg: "bg-cyan-50",   text: "text-cyan-600",   border: "border-cyan-200"   },
  etc:           { bg: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200"   },
};

function LeaveCard({ balance }: LeaveCardProps) {
  const tone = KIND_TONE[balance.kind] ?? KIND_TONE.etc;
  const emoji = LEAVE_KIND_EMOJIS[balance.kind] ?? "📋";
  const label = LEAVE_KIND_LABELS[balance.kind] ?? balance.kind;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border shadow-card bg-white",
      tone.border,
    )}>
      <span className="text-2xl shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs font-semibold mb-0.5", tone.text)}>{label}</p>
        <p className="text-[11px] text-slate-500">
          잔여 <span className="font-bold text-slate-800">{balance.remaining}</span>
          <span className="text-slate-300 mx-0.5">/</span>
          <span>{balance.total}일</span>
        </p>
      </div>
      <Link
        href="/leave/apply"
        className="shrink-0 w-7 h-7 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 grid place-items-center transition"
        title="신청"
      >
        <Plus className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ─── 연차 현황 + 휴가신청 섹션 ───────────────────────
export function LeaveBalanceSection() {
  const balances = MY_LEAVE_BALANCES;
  const info = MY_LEAVE_YEAR_INFO;

  const total = balances.reduce((s, b) => s + b.total, 0);
  const used  = balances.reduce((s, b) => s + b.used,  0);
  const remaining = balances.reduce((s, b) => s + b.remaining, 0);
  const usageRate = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <section className="space-y-4">
      {/* 제목 */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-slate-900">내 연차 현황</h2>
        <span className="text-xs text-slate-400">({info.fiscalYearStart} ~ {info.fiscalYearEnd})</span>
      </div>

      {/* 4개 stat 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="잔여"       value={remaining}  icon={CheckCircle2}  tone="emerald" sub="일" />
        <StatCard label="사용"       value={used}        icon={Clock}         tone="amber"   sub="일" />
        <StatCard label="총 일수"    value={total}       icon={CalendarClock} tone="brand"   sub="일" />
        <StatCard label="소진율"     value={`${usageRate}%`} icon={TrendingUp} tone="violet" />
      </div>

      {/* 근속연수 + 회계연도 정보 */}
      <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-xl text-xs text-slate-500">
        <span>입사일 <strong className="text-slate-700">{info.hireDate}</strong></span>
        <span>·</span>
        <span>근속 <strong className="text-slate-700">{info.tenureYears}년 {info.tenureMonths}개월</strong></span>
        <span>·</span>
        <span>회계연도 <strong className="text-slate-700">{info.fiscalYearStart.split("-")[0]}~{info.fiscalYearEnd.split("-")[0]}년</strong></span>
      </div>

      {/* 12종 휴가 카드 */}
      <div className="flex items-center gap-2 mb-2">
        <Palmtree className="w-4 h-4 text-brand-600" />
        <h2 className="text-sm font-bold text-slate-900">휴가 신청</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {balances.map((b) => (
          <LeaveCard key={b.kind} balance={b} />
        ))}
      </div>
    </section>
  );
}
