"use client";

/**
 * app/exec/accounting/expenses/page.tsx
 *
 * P13 — 지출 관리 페이지
 * - 지출 테이블 + 월별/항목별 합계 + 필터 (월/항목/상태)
 */

import { useState } from "react";
import { MOCK_EXPENSES } from "@/lib/features/accounting/data";
import { formatKRW, groupBy } from "@/lib/features/accounting/utils";
import type { BudgetCategory, ExpenseStatus } from "@/lib/features/accounting/types";
import { Search } from "lucide-react";

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ALL_CATS: BudgetCategory[] = ["인건비", "운영비", "사업비", "후원금", "보조금"];
const ALL_STATUSES: ExpenseStatus[] = ["확정", "대기", "반려"];

export default function ExpensesPage() {
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [filterCat, setFilterCat] = useState<BudgetCategory | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | "all">("all");
  const [search, setSearch] = useState("");

  // 필터 적용
  const filtered = MOCK_EXPENSES.filter((e) => {
    if (filterMonth !== "all" && e.month !== filterMonth) return false;
    if (filterCat !== "all" && e.category !== filterCat) return false;
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !e.vendor?.toLowerCase().includes(q) &&
        !e.memo?.toLowerCase().includes(q) &&
        !e.category.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  // 월별 합계
  const byMonth = groupBy(filtered, "month");
  const monthSum = ALL_MONTHS.map((m) => ({
    month: m,
    total: (byMonth[String(m)] ?? []).reduce((s, e) => s + e.amount, 0),
  }));

  // 항목별 합계
  const byCat = groupBy(filtered, "category");
  const catSum = ALL_CATS.map((c) => ({
    category: c,
    total: (byCat[c] ?? []).reduce((s, e) => s + e.amount, 0),
  }));

  const grandTotal = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">지출 관리</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {filtered.length}건 · 합계 {formatKRW(grandTotal)}
        </p>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 flex flex-wrap gap-3">
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="검색 (업체/메모)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* 월 필터 */}
        <select
          value={filterMonth}
          onChange={(e) =>
            setFilterMonth(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          className="h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">전체 월</option>
          {ALL_MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </select>

        {/* 항목 필터 */}
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value as BudgetCategory | "all")}
          className="h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">전체 항목</option>
          {ALL_CATS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* 상태 필터 */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ExpenseStatus | "all")}
          className="h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">전체 상태</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 월별/항목별 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">월별 합계</h2>
          <div className="grid grid-cols-4 gap-2">
            {monthSum.map(({ month, total }) => (
              <div key={month} className="text-center">
                <p className="text-xs text-slate-400">{month}월</p>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  {total > 0 ? `${(total / 10_000).toFixed(0)}만` : "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">항목별 합계</h2>
          <div className="space-y-2">
            {catSum.map(({ category, total }) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{category}</span>
                <span className="text-sm font-semibold text-slate-800">
                  {total > 0 ? formatKRW(total) : "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 지출 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">지출 내역</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">일자</th>
                <th className="px-5 py-3">항목</th>
                <th className="px-5 py-3">업체</th>
                <th className="px-5 py-3">금액</th>
                <th className="px-5 py-3">메모</th>
                <th className="px-5 py-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">
                    조건에 맞는 지출 내역이 없습니다
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 text-slate-700">
                      {e.date.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{e.category}</td>
                    <td className="px-5 py-3 text-slate-700">{e.vendor ?? "-"}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{formatKRW(e.amount)}</td>
                    <td className="px-5 py-3 text-xs text-slate-400 max-w-[200px] truncate">
                      {e.memo ?? "-"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${
                          e.status === "확정"
                            ? "bg-green-100 text-green-700"
                            : e.status === "대기"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
