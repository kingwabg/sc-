"use client";

/**
 * app/exec/dashboard/page.tsx
 *
 * P13 — 임원 포털 대시보드
 * - KPI 4카드 (후원금 총액 / 미수 보조금 / 예산 대비 지출률 / 미결재 결재)
 * - 최근 지출 5건
 * - 리스크 알림 (예산 80%+ 항목)
 */

import { Crown, TrendingUp, AlertTriangle, FileCheck2, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  MOCK_BUDGETS,
  MOCK_EXPENSES,
} from "@/lib/features/accounting/data";
import { MOCK_DONATIONS } from "@/lib/features/donation/mock";
import { formatKRW, calcBudgetUsagePct, usageColor } from "@/lib/features/accounting/utils";

export default function ExecDashboardPage() {
  // ─── KPI 계산 ────────────────────────────────────────────
  const donationsTotal = MOCK_DONATIONS.reduce((s: number, d) => s + (d.amount ?? 0), 0);
  const unpaidSubsidy = MOCK_BUDGETS.filter((b) => b.category === "보조금" && b.month <= 6)
    .reduce((s, b) => s + (b.limit - b.used), 0);

  const avgUsagePct = Math.round(
    MOCK_BUDGETS.reduce((s, b) => s + calcBudgetUsagePct(b.used, b.limit), 0) /
      MOCK_BUDGETS.length,
  );

  const pendingCount = MOCK_EXPENSES.filter((e) => e.status === "대기").length;

  // ─── 최근 지출 5건 ──────────────────────────────────────
  const recentExpenses = [...MOCK_EXPENSES]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  // ─── 리스크 알림 (예산 사용률 80%+) ────────────────────
  const risks = MOCK_BUDGETS.filter(
    (b) => calcBudgetUsagePct(b.used, b.limit) >= 80,
  ).slice(0, 5);

  const KPI_CARDS = [
    {
      label: "후원금 총액",
      value: formatKRW(donationsTotal),
      sub: `${MOCK_DONATIONS.length}건`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "미수 보조금 잔여",
      value: formatKRW(unpaidSubsidy),
      sub: "상반기 기준",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "예산 대비 지출률",
      value: `${avgUsagePct}%`,
      sub: "전체 항목 평균",
      icon: Crown,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "미결재 지출",
      value: `${pendingCount}건`,
      sub: "확인 필요",
      icon: FileCheck2,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">임원 대시보드</h1>
        <p className="text-sm text-slate-500 mt-0.5">2026년 회계연도 — 양산가족친화기업</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} grid place-items-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900">{card.value}</span>
              <span className="text-xs text-slate-400">{card.sub}</span>
            </div>
          );
        })}
      </div>

      {/* 최근 지출 + 리스크 알림 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 최근 지출 5건 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">최근 지출</h2>
            <Link
              href="/exec/accounting/expenses"
              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
            >
              전체 보기 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{exp.vendor ?? exp.category}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {exp.date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} ·{" "}
                    {exp.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">{formatKRW(exp.amount)}</p>
                  <span
                    className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      exp.status === "확정"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {exp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 리스크 알림 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-800">리스크 알림</h2>
            </div>
            <span className="text-xs text-slate-400">예산 80% 이상</span>
          </div>
          {risks.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              현재 리스크 항목이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {risks.map((b) => {
                const pct = calcBudgetUsagePct(b.used, b.limit);
                const col = usageColor(pct);
                return (
                  <div key={b.id} className="px-5 py-3 flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        col === "red"
                          ? "bg-red-500"
                          : col === "yellow"
                          ? "bg-amber-400"
                          : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {b.fiscalYear}년 {b.month}월 · {b.category}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatKRW(b.used)} / {formatKRW(b.limit)} (사용 {pct}%)
                      </p>
                    </div>
                    <Link
                      href="/exec/accounting/budget"
                      className="text-xs text-brand-600 hover:text-brand-700 shrink-0"
                    >
                      보기
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
