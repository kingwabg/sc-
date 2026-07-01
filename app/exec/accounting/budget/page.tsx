"use client";

/**
 * app/exec/accounting/budget/page.tsx
 *
 * P13 — 예산 관리 페이지
 * - 12개월 × 5항목 표 (한도/실적/잔여/%)
 * - 색상: 녹색 <70% · 황색 70~90% · 적색 >90%
 */

import { MOCK_BUDGETS } from "@/lib/features/accounting/data";
import { formatKRW, calcBudgetUsagePct, usageColor } from "@/lib/features/accounting/utils";
import type { BudgetCategory } from "@/lib/features/accounting/types";
import { AlertTriangle } from "lucide-react";

const CATEGORIES: BudgetCategory[] = ["인건비", "운영비", "사업비", "후원금", "보조금"];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function PctBadge({ pct }: { pct: number }) {
  const col = usageColor(pct);
  const label =
    col === "red" ? "적" : col === "yellow" ? "황" : "녹";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded ${
        col === "red"
          ? "bg-red-100 text-red-700"
          : col === "yellow"
          ? "bg-amber-100 text-amber-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {col === "red" && <AlertTriangle className="w-3 h-3" />}
      {pct}%
    </span>
  );
}

export default function BudgetPage() {
  // 행: category, 열: month
  const byCatAndMonth = MOCK_BUDGETS;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">예산 관리</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          2026년 회계연도 월별 예산 실행 현황
        </p>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-200" />
          사용률 70% 미만 (양호)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          사용률 70~90% (주의)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-200" />
          사용률 90% 이상 (위험)
        </span>
      </div>

      {/* 12개월 × 5항목 표 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left w-24">항목</th>
              {MONTHS.map((m) => (
                <th key={m} className="px-3 py-3 text-center w-24">
                  {m}월
                </th>
              ))}
              {/* 합계 열 */}
              <th className="px-3 py-3 text-center w-28 bg-slate-100">연간 합계</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {CATEGORIES.map((cat) => {
              const rows = byCatAndMonth.filter((b) => b.category === cat);
              const totalLimit = rows.reduce((s, b) => s + b.limit, 0);
              const totalUsed = rows.reduce((s, b) => s + b.used, 0);

              return (
                <tr key={cat} className="hover:bg-slate-50 transition">
                  {/* 항목명 */}
                  <td className="px-4 py-3 font-semibold text-slate-700">{cat}</td>

                  {/* 월별 셀 */}
                  {MONTHS.map((m) => {
                    const b = rows.find((r) => r.month === m);
                    if (!b) return <td key={m} className="px-3 py-3 text-center text-slate-300">-</td>;
                    const pct = calcBudgetUsagePct(b.used, b.limit);
                    const col = usageColor(pct);

                    return (
                      <td key={m} className="px-3 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[11px] text-slate-400">
                            {formatKRW(b.used)}
                          </span>
                          <div
                            className={`w-full h-1.5 rounded-full ${
                              col === "red"
                                ? "bg-red-300"
                                : col === "yellow"
                                ? "bg-amber-300"
                                : "bg-green-300"
                            }`}
                          />
                          <PctBadge pct={pct} />
                        </div>
                      </td>
                    );
                  })}

                  {/* 연간 합계 */}
                  <td className="px-3 py-3 text-center bg-slate-50">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-slate-500">
                        {formatKRW(totalUsed)}
                      </span>
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          usageColor(calcBudgetUsagePct(totalUsed, totalLimit)) === "red"
                            ? "bg-red-300"
                            : usageColor(calcBudgetUsagePct(totalUsed, totalLimit)) === "yellow"
                            ? "bg-amber-300"
                            : "bg-green-300"
                        }`}
                      />
                      <PctBadge pct={calcBudgetUsagePct(totalUsed, totalLimit)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* 합계 행 */}
          <tfoot>
            <tr className="bg-slate-900 text-white">
              <td className="px-4 py-3 font-bold text-sm">합계</td>
              {MONTHS.map((m) => {
                const monthRows = byCatAndMonth.filter((b) => b.month === m);
                const totalLimit = monthRows.reduce((s, b) => s + b.limit, 0);
                const totalUsed = monthRows.reduce((s, b) => s + b.used, 0);
                const pct = calcBudgetUsagePct(totalUsed, totalLimit);
                return (
                  <td key={m} className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-slate-300">
                        {formatKRW(totalUsed)}
                      </span>
                      <PctBadge pct={pct} />
                    </div>
                  </td>
                );
              })}
              <td className="px-3 py-3 text-center bg-slate-800">
                {(() => {
                  const tL = byCatAndMonth.reduce((s, b) => s + b.limit, 0);
                  const tU = byCatAndMonth.reduce((s, b) => s + b.used, 0);
                  return <PctBadge pct={calcBudgetUsagePct(tU, tL)} />;
                })()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
