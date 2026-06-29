"use client";

/**
 * /annual-plan — 연간계획 카드 보드
 *
 * 1단계 골격: mock 데이터 표시 + 새 연간 만들기(현재는 alert) + 상세로 이동.
 * 상세 페이지(/annual-plan/[id])는 다음 단계에서 구현.
 */

import Link from "next/link";
import { Calendar, Plus, Target, ListChecks, ChevronRight } from "lucide-react";
import { MOCK_ANNUAL_PLANS } from "@/lib/features/annual-plan";
import type { AnnualPlan, AnnualPlanStatus } from "@/lib/features/annual-plan";

const STATUS_LABEL: Record<AnnualPlanStatus, string> = {
  draft: "초안",
  active: "진행 중",
  done: "완료",
};

const STATUS_TONE: Record<AnnualPlanStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  done: "bg-indigo-50 text-indigo-700 border border-indigo-200",
};

export default function AnnualPlanPage() {
  const plans = MOCK_ANNUAL_PLANS;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            연간계획
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            연 단위 목표와 프로그램을 등록하고, 12개월 슬롯을 자동 생성해요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            // TODO: 다음 단계 — 새 연간 생성 모달
            window.alert("새 연간 만들기는 다음 단계에서 연결됩니다");
          }}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition"
        >
          <Plus className="h-4 w-4" />
          새 연간 만들기
        </button>
      </div>

      {/* 연도 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <AnnualPlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* 비어있을 때 */}
      {plans.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">아직 연간계획이 없어요.</p>
          <p className="text-xs text-slate-400 mt-1">
            우측 상단에서 새 연간계획을 만들어 보세요.
          </p>
        </div>
      )}
    </div>
  );
}

function AnnualPlanCard({ plan }: { plan: AnnualPlan }) {
  const monthlyActive = plan.monthlyPlanIds.length;
  const programCount = plan.programs.length;

  return (
    <Link
      href={`/annual-plan/${plan.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-600/5 transition"
    >
      {/* 연도 + 상태 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-3xl font-bold tracking-tight text-slate-900">
            {plan.year}
          </div>
          <div className="text-sm text-slate-600 mt-0.5">{plan.title}</div>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_TONE[plan.status]}`}
        >
          {STATUS_LABEL[plan.status]}
        </span>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-2 my-4">
        <Stat icon={<Target className="h-3.5 w-3.5" />} label="목표" value={plan.goals.length} />
        <Stat icon={<ListChecks className="h-3.5 w-3.5" />} label="프로그램" value={programCount} />
        <Stat icon={<Calendar className="h-3.5 w-3.5" />} label="월간" value={`${monthlyActive}/12`} />
      </div>

      {/* 하단 */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
        <span>
          {plan.approvedAt
            ? `승인 ${plan.approvedAt.slice(0, 10)}`
            : `작성 ${plan.createdAt.slice(0, 10)}`}
        </span>
        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition text-slate-300 group-hover:text-brand-500" />
      </div>
    </Link>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex flex-col items-start gap-1 px-2 py-1.5 rounded-lg bg-slate-50/70">
      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
        {icon}
        {label}
      </div>
      <div className="text-base font-bold text-slate-900">{value}</div>
    </div>
  );
}