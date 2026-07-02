"use client";

/**
 * app/console/billing/page.tsx — 요금제/결제 현황
 *
 * KPI + 요금제별 분포 + 결제 내역 테이블 (mock)
 */

import { useState } from "react";
import { TrendingUp, CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";

interface BillingRow {
  id: string;
  siteName: string;
  siteCode: string;
  plan: string;
  amount: number;
  billingDate: string;
  status: "paid" | "pending" | "failed" | "refunded";
  nextBillingDate: string;
}

const MOCK_BILLINGS: BillingRow[] = [
  { id: "b1", siteName: "서창지역아동센터", siteCode: "17000004442", plan: "pro", amount: 198000, billingDate: "2026-06-01", status: "paid", nextBillingDate: "2026-07-01" },
  { id: "b2", siteName: "금호지역아동센터", siteCode: "17000004443", plan: "basic", amount: 88000, billingDate: "2026-06-01", status: "paid", nextBillingDate: "2026-07-01" },
  { id: "b3", siteName: "반송지역아동센터", siteCode: "17000004444", plan: "basic", amount: 88000, billingDate: "2026-06-01", status: "pending", nextBillingDate: "2026-07-01" },
  { id: "b4", siteName: "광안지역아동센터", siteCode: "17000004445", plan: "enterprise", amount: 498000, billingDate: "2026-06-01", status: "failed", nextBillingDate: "2026-07-01" },
  { id: "b5", siteName: "남부지역아동센터", siteCode: "17000004446", plan: "pro", amount: 198000, billingDate: "2026-06-01", status: "paid", nextBillingDate: "2026-07-01" },
  { id: "b6", siteName: "수성지역아동센터", siteCode: "17000004447", plan: "basic", amount: 88000, billingDate: "2026-05-01", status: "paid", nextBillingDate: "2026-06-01" },
  { id: "b7", siteName: "동인지역아동센터", siteCode: "17000004448", plan: "pro", amount: 198000, billingDate: "2026-05-01", status: "refunded", nextBillingDate: "2026-06-01" },
  { id: "b8", siteName: "지산지역아동센터", siteCode: "17000004449", plan: "basic", amount: 88000, billingDate: "2026-05-01", status: "paid", nextBillingDate: "2026-06-01" },
  { id: "b9", siteName: "범어지역아동센터", siteCode: "17000004450", plan: "enterprise", amount: 498000, billingDate: "2026-05-01", status: "paid", nextBillingDate: "2026-06-01" },
  { id: "b10", siteName: "이천지역아동센터", siteCode: "17000004451", plan: "basic", amount: 88000, billingDate: "2026-05-01", status: "paid", nextBillingDate: "2026-06-01" },
];

const PLAN_COLORS: Record<string, string> = {
  basic: "bg-slate-100 text-slate-700",
  pro: "bg-indigo-50 text-indigo-700",
  enterprise: "bg-amber-50 text-amber-700",
};

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "결제 완료",
  pending: "대기",
  failed: "실패",
  refunded: "환불",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("ko-KR").format(n) + "원";

const PLAN_DIST = [
  { plan: "basic", count: 45, pct: 58 },
  { plan: "pro", count: 24, pct: 31 },
  { plan: "enterprise", count: 8, pct: 10 },
];

const PLAN_PRICES: Record<string, number> = {
  basic: 88000,
  pro: 198000,
  enterprise: 498000,
};

export default function BillingPage() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = MOCK_BILLINGS.filter(
    (b) => filter === "all" || b.status === filter,
  );

  // KPI
  const thisMonthRevenue = MOCK_BILLINGS
    .filter((b) => b.billingDate.startsWith("2026-06") && b.status === "paid")
    .reduce((s, b) => s + b.amount, 0);
  const activeSubs = MOCK_BILLINGS.filter((b) => b.status === "paid" || b.status === "pending").length;
  const overdueCount = MOCK_BILLINGS.filter((b) => b.status === "failed").length;
  const successRate = Math.round(
    (MOCK_BILLINGS.filter((b) => b.status === "paid").length / MOCK_BILLINGS.length) * 100,
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <header>
        <h1 className="text-xl font-bold text-slate-900">요금제/결제</h1>
        <p className="text-xs text-slate-500 mt-1">2026년 6월 기준 전체 센터 결제 현황</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] text-slate-500">이번달 매출</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{fmt(thisMonthRevenue)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">2026년 6월</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] text-slate-500">활성 구독</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{activeSubs}건</p>
          <p className="text-[11px] text-slate-400 mt-0.5">전체 {MOCK_BILLINGS.length}건 중</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-[11px] text-slate-500">결제 실패</span>
          </div>
          <p className="text-xl font-bold text-red-600">{overdueCount}건</p>
          <p className="text-[11px] text-slate-400 mt-0.5">즉시 확인 필요</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-slate-600" />
            <span className="text-[11px] text-slate-500">결제 성공률</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{successRate}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">이번달</p>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-bold text-slate-900 mb-3">요금제별 분포</h2>
        <div className="space-y-2.5">
          {PLAN_DIST.map((p) => (
            <div key={p.plan} className="flex items-center gap-3">
              <span className={"inline-flex px-2 py-0.5 rounded text-[11px] font-medium w-20 justify-center " + PLAN_COLORS[p.plan]}>
                {p.plan}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: p.pct + "%" }}
                />
              </div>
              <span className="text-[11px] text-slate-500 w-20">{p.count}개 ({p.pct}%)</span>
              <span className="text-[11px] text-slate-700 font-medium w-24 text-right">
                {fmt(PLAN_PRICES[p.plan])}/월
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">결제 내역</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1"
          >
            <option value="all">전체</option>
            <option value="paid">결제 완료</option>
            <option value="pending">대기</option>
            <option value="failed">실패</option>
            <option value="refunded">환불</option>
          </select>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <th className="text-left px-4 py-2.5 font-medium">사이트</th>
              <th className="text-left px-4 py-2.5 font-medium">요금제</th>
              <th className="text-right px-4 py-2.5 font-medium">금액</th>
              <th className="text-left px-4 py-2.5 font-medium">결제일</th>
              <th className="text-left px-4 py-2.5 font-medium">상태</th>
              <th className="text-left px-4 py-2.5 font-medium">다음 결제일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{b.siteName}</p>
                  <p className="text-slate-400 mt-0.5">{b.siteCode}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={"inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium " + PLAN_COLORS[b.plan]}>
                    {b.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{fmt(b.amount)}</td>
                <td className="px-4 py-3 text-slate-500">{b.billingDate}</td>
                <td className="px-4 py-3">
                  <span className={"inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium " + STATUS_COLORS[b.status]}>
                    {STATUS_LABELS[b.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{b.nextBillingDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
