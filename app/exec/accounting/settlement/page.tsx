"use client";

/**
 * app/exec/accounting/settlement/page.tsx
 *
 * P13 — 월별 결산 페이지
 * - 월별 손익 (수입 - 지출 = 순이익)
 * - 12개월 추이 막대 그래프
 */

import { MOCK_BUDGETS } from "@/lib/features/accounting/data";
import { MOCK_DONATIONS } from "@/lib/features/donation/mock";
import { formatKRW, barHeight } from "@/lib/features/accounting/utils";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function SettlementPage() {
  // 월별 수입 (후원금)
  const byMonth: Record<number, number> = {};
  MONTHS.forEach((m) => { byMonth[m] = 0; });
  MOCK_DONATIONS.forEach((d) => {
    if (d.type === "CASH" && d.amount != null) {
      const m = d.receivedAt.getMonth() + 1;
      byMonth[m] = (byMonth[m] ?? 0) + d.amount;
    }
  });

  // 월별 지출
  const expensesByMonth: Record<number, number> = {};
  MONTHS.forEach((m) => { expensesByMonth[m] = 0; });
  MOCK_BUDGETS.forEach((b) => {
    expensesByMonth[b.month] = (expensesByMonth[b.month] ?? 0) + b.used;
  });

  // 손익 데이터
  const pnl = MONTHS.map((m) => ({
    month: m,
    income: byMonth[m] ?? 0,
    expense: expensesByMonth[m] ?? 0,
    net: (byMonth[m] ?? 0) - (expensesByMonth[m] ?? 0),
  }));

  const maxVal = Math.max(
    ...pnl.map((p) => Math.max(p.income, p.expense)),
    1,
  );

  const totalIncome = pnl.reduce((s, p) => s + p.income, 0);
  const totalExpense = pnl.reduce((s, p) => s + p.expense, 0);
  const totalNet = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">월별 결산</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          2026년 월별 수입 · 지출 · 순이익 추이
        </p>
      </div>

      {/* 전체 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <p className="text-xs font-semibold text-slate-500 mb-1">총 수입</p>
          <p className="text-2xl font-bold text-green-600">{formatKRW(totalIncome)}</p>
          <p className="text-xs text-slate-400 mt-1">후원금 합계</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <p className="text-xs font-semibold text-slate-500 mb-1">총 지출</p>
          <p className="text-2xl font-bold text-red-600">{formatKRW(totalExpense)}</p>
          <p className="text-xs text-slate-400 mt-1">예산 실행 합계</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <p className="text-xs font-semibold text-slate-500 mb-1">순이익</p>
          <p
            className={`text-2xl font-bold ${
              totalNet >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {formatKRW(Math.abs(totalNet))}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {totalNet >= 0 ? " 흑자" : " 적자"}
          </p>
        </div>
      </div>

      {/* 월별 추이 막대 차트 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-400 inline-block" />
            <span className="text-xs text-slate-500">수입</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-400 inline-block" />
            <span className="text-xs text-slate-500">지출</span>
          </div>
        </div>

        <div className="flex items-end gap-2 h-56">
          {pnl.map((p) => {
            const incH = barHeight(p.income, maxVal);
            const expH = barHeight(p.expense, maxVal);
            return (
              <div key={p.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="relative w-full h-full flex items-end justify-center gap-0.5">
                  {/* 수입 */}
                  <div
                    className="w-[calc(50%-2px)] rounded-t bg-indigo-400 hover:bg-indigo-500 transition-all"
                    style={{ height: `${incH}%` }}
                    title={`${p.month}월 수입: ${formatKRW(p.income)}`}
                  />
                  {/* 지출 */}
                  <div
                    className="w-[calc(50%-2px)] rounded-t bg-rose-400 hover:bg-rose-500 transition-all"
                    style={{ height: `${expH}%` }}
                    title={`${p.month}월 지출: ${formatKRW(p.expense)}`}
                  />
                </div>
                <span className="text-xs text-slate-500">{p.month}월</span>
                {/* 순이익 라벨 */}
                <span
                  className={`text-[10px] font-semibold ${
                    p.net >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {p.net >= 0 ? "+" : ""}
                  {p.net >= 1_000_000
                    ? `${(p.net / 1_000_000).toFixed(1)}M`
                    : `${(p.net / 1_000).toFixed(0)}K`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 월별 손익 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">월별 손익 내역</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">월</th>
                <th className="px-5 py-3 text-right">수입</th>
                <th className="px-5 py-3 text-right">지출</th>
                <th className="px-5 py-3 text-right">순이익</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pnl.map((p) => (
                <tr key={p.month} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-semibold text-slate-700">{p.month}월</td>
                  <td className="px-5 py-3 text-right text-green-700 font-medium">
                    {p.income > 0 ? formatKRW(p.income) : "-"}
                  </td>
                  <td className="px-5 py-3 text-right text-red-600">
                    {p.expense > 0 ? formatKRW(p.expense) : "-"}
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-bold ${
                      p.net >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {p.net >= 0 ? "+" : ""}
                    {formatKRW(p.net)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 text-slate-800 font-bold">
                <td className="px-5 py-3">합계</td>
                <td className="px-5 py-3 text-right text-green-700">{formatKRW(totalIncome)}</td>
                <td className="px-5 py-3 text-right text-red-600">{formatKRW(totalExpense)}</td>
                <td
                  className={`px-5 py-3 text-right ${
                    totalNet >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {totalNet >= 0 ? "+" : ""}
                  {formatKRW(totalNet)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
