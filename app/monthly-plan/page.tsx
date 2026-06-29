"use client";

/**
 * /monthly-plan — 월간계획 12월 카드 보드 (placeholder 교체)
 *
 * 연간계획에서 자동 생성된 12개 슬롯을 그리드로 보여줌.
 * 각 카드는 상태 / 진행률 / 목표 수 표시.
 */

import Link from "next/link";
import { Calendar, ChevronRight, Target } from "lucide-react";
import { MOCK_ANNUAL_PLANS } from "@/lib/features/annual-plan";
import { MOCK_MONTHLY_PLANS } from "@/lib/features/monthly-plan";
import type { MonthlyPlan, MonthlyPlanStatus } from "@/lib/features/monthly-plan";

const MONTH_LABEL = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

const STATUS_LABEL: Record<MonthlyPlanStatus, string> = {
  draft: "초안",
  active: "진행 중",
  done: "완료",
};

const STATUS_TONE: Record<MonthlyPlanStatus, string> = {
  draft: "bg-slate-100 text-slate-500",
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  done: "bg-indigo-50 text-indigo-700 border border-indigo-200",
};

export default function MonthlyPlanPage() {
  // 가장 최신/활성 연간계획을 기본으로 사용
  const activeAnnual =
    MOCK_ANNUAL_PLANS.find((p) => p.status === "active") ?? MOCK_ANNUAL_PLANS[0];
  const monthlyByAnnual = activeAnnual
    ? MOCK_MONTHLY_PLANS.filter((m) => m.annualPlanId === activeAnnual.id)
    : [];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            월간계획
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeAnnual ? (
              <>
                <span className="font-semibold text-slate-700">
                  {activeAnnual.year}년
                </span>{" "}
                · {activeAnnual.title} · 12개월 슬롯
              </>
            ) : (
              "연간계획이 먼저 필요해요."
            )}
          </p>
        </div>
        <Link
          href={activeAnnual ? `/annual-plan/${activeAnnual.id}` : "/annual-plan"}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
        >
          연간계획 보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 12월 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {MONTH_LABEL.map((label, idx) => {
          const monthNumber = idx + 1;
          const plan = monthlyByAnnual.find((m) => m.month === monthNumber);
          return (
            <MonthlyPlanCard
              key={monthNumber}
              label={label}
              plan={plan ?? null}
              annualId={activeAnnual?.id ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}

function MonthlyPlanCard({
  label,
  plan,
  annualId,
}: {
  label: string;
  plan: MonthlyPlan | null;
  annualId: string | null;
}) {
  const status = plan?.status ?? "draft";
  const goalCount = plan?.weeklyGoals.length ?? 0;
  const progress = plan?.evaluation.progressPct;

  // 슬롯이 아직 없으면 (연간 draft) — 빈 카드
  if (!plan) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-slate-400">{label}</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
            미생성
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          연간계획이 활성화되면 12개월 슬롯이 자동 생성돼요.
        </p>
      </div>
    );
  }

  const href = annualId
    ? `/monthly-plan/${plan.id}`
    : `/monthly-plan/${plan.id}`;

  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-md hover:shadow-brand-600/5 transition"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-slate-900">{label}</span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_TONE[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* 진행률 (있으면) */}
      {typeof progress === "number" && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span>진행률</span>
            <span className="font-semibold text-slate-700">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 목표/활동 */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-3">
        <Target className="h-3 w-3" />
        <span>주간 목표 {goalCount}개</span>
      </div>

      {/* 작은 일지 미리보기 */}
      {plan.programExecutions.length > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
          <Calendar className="h-3 w-3" />
          <span>프로그램 {plan.programExecutions.length}건 실행</span>
        </div>
      )}
    </Link>
  );
}