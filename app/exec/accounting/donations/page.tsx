"use client";

/**
 * app/exec/accounting/donations/page.tsx
 *
 * P13 — 수입 (후원금) 페이지
 * - P8 후원금 mock 사용
 * - 월별 div 막대 차트 (순수 CSS, recharts 없음)
 */

import { MOCK_DONATIONS } from "@/lib/features/donation/mock";
import { formatKRW, barHeight } from "@/lib/features/accounting/utils";
import { Gift, CheckCircle, Clock } from "lucide-react";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function DonationsPage() {
  // 월별 수입 합계 (CASH만)
  const byMonth: number[] = Array(13).fill(0);
  MOCK_DONATIONS.forEach((d) => {
    if (d.type === "CASH" && d.amount != null) {
      const m = d.receivedAt.getMonth() + 1;
      byMonth[m] += d.amount;
    }
  });

  const maxIncome = Math.max(...byMonth, 1);

  const totalCash = MOCK_DONATIONS.filter((d) => d.type === "CASH").reduce(
    (s, d) => s + (d.amount ?? 0),
    0,
  );
  const totalGoods = MOCK_DONATIONS.filter((d) => d.type === "GOODS").length;
  const issuedCount = MOCK_DONATIONS.filter((d) => d.receiptIssued).length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">수입 (후원금)</h1>
        <p className="text-sm text-slate-500 mt-0.5">후원금 대장 — 월별 수입 현황</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-slate-500">금전 후원 합계</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatKRW(totalCash)}</p>
          <p className="text-xs text-slate-400 mt-1">{MOCK_DONATIONS.filter((d) => d.type === "CASH").length}건</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-500">영수증 발급</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{issuedCount}건</p>
          <p className="text-xs text-slate-400 mt-1">전체 {MOCK_DONATIONS.length}건 중</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-slate-500">물품 후원</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalGoods}건</p>
          <p className="text-xs text-slate-400 mt-1">별도 금액 미산정</p>
        </div>
      </div>

      {/* 월별 막대 차트 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">월별 후원금 수입 (단위: 원)</h2>
        <div className="flex items-end gap-2 h-48">
          {MONTHS.map((m) => {
            const val = byMonth[m];
            const h = barHeight(val, maxIncome);
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <div className="relative w-full h-full flex items-end justify-center">
                  <div
                    className="w-full max-w-[40px] rounded-t bg-indigo-400 hover:bg-indigo-500 transition-all"
                    style={{ height: `${h}%` }}
                    title={val > 0 ? formatKRW(val) : "-"}
                  />
                </div>
                <span className="text-xs text-slate-500">{m}월</span>
                {val > 0 && (
                  <span className="text-[10px] text-slate-400 leading-tight text-center">
                    {val >= 1_000_000
                      ? `${(val / 1_000_000).toFixed(1)}M`
                      : `${(val / 1_000).toFixed(0)}K`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 후원금 목록 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">후원금 내역</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">후원자</th>
                <th className="px-5 py-3">구분</th>
                <th className="px-5 py-3">금액 / 물품</th>
                <th className="px-5 py-3">수령일</th>
                <th className="px-5 py-3">영수증</th>
                <th className="px-5 py-3">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_DONATIONS.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-medium text-slate-800">{d.donorName}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${
                        d.type === "CASH"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {d.type === "CASH" ? "금전" : "물품"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-800">
                    {d.type === "CASH" && d.amount != null
                      ? formatKRW(d.amount)
                      : d.itemName ?? "-"}
                    {d.type === "GOODS" && d.itemQty ? ` × ${d.itemQty}` : null}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {d.receivedAt.toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-5 py-3">
                    {d.receiptIssued && d.receiptNumber ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {d.receiptNumber}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        미발급
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">{d.notes ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
