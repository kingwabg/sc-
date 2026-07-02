"use client";

import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Calculator,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

const summaryCards = [
  { label: "이번 달 수입", value: "32,506,978", unit: "원", tone: "emerald", icon: TrendingUp },
  { label: "이번 달 지출", value: "18,240,000", unit: "원", tone: "rose", icon: TrendingDown },
  { label: "미처리 증빙", value: "7", unit: "건", tone: "amber", icon: ReceiptText },
  { label: "결재 대기", value: "3", unit: "건", tone: "blue", icon: FileCheck2 },
];

const accountingMenus = [
  {
    title: "수입 관리",
    description: "후원금, 이용료, 보조금 등 입금 내역을 정리합니다.",
    href: "/accounting/income",
    icon: Banknote,
    tone: "emerald",
  },
  {
    title: "지출 관리",
    description: "운영비, 급여, 물품 구매 지출을 증빙과 함께 관리합니다.",
    href: "/accounting/expense",
    icon: WalletCards,
    tone: "rose",
  },
  {
    title: "통장 입금",
    description: "계좌 거래 내역을 조회하고 수입 항목과 매칭합니다.",
    href: "/accounting/deposits",
    icon: Landmark,
    tone: "blue",
  },
  {
    title: "증빙 자료",
    description: "영수증, 세금계산서, 첨부 파일을 한 곳에서 확인합니다.",
    href: "/accounting/receipts",
    icon: ReceiptText,
    tone: "amber",
  },
  {
    title: "결산 리포트",
    description: "월별/연도별 수입·지출 현황과 정산 자료를 만듭니다.",
    href: "/accounting/reports",
    icon: Calculator,
    tone: "violet",
  },
  {
    title: "회계 점검",
    description: "누락 증빙, 미분류 거래, 마감 전 확인 항목을 점검합니다.",
    href: "/accounting/checklist",
    icon: ClipboardCheck,
    tone: "slate",
  },
];

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function AccountingPortalPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex flex-col gap-5 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[12px] font-extrabold text-blue-700">
                <Calculator className="h-3.5 w-3.5" />
                회계포털
              </div>
              <h1 className="m-0 text-2xl font-black tracking-tight text-slate-950">회계 업무를 한 화면에서 관리하세요.</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                수입, 지출, 통장 입금, 증빙 자료와 결산 흐름을 업무포털과 분리해서 관리합니다.
              </p>
            </div>
            <Link
              href="/portal"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-extrabold text-white transition hover:bg-slate-800"
            >
              업무포털로 이동
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-bold text-slate-500">{item.label}</span>
                    <span className={cn("grid h-8 w-8 place-items-center rounded-lg ring-1", toneClass[item.tone as keyof typeof toneClass])}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-2xl font-black tabular-nums text-slate-950">{item.value}</span>
                    <span className="pb-1 text-[12px] font-bold text-slate-500">{item.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {accountingMenus.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={cn("grid h-11 w-11 place-items-center rounded-xl ring-1", toneClass[item.tone as keyof typeof toneClass])}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="mt-1 h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
                </div>
                <h2 className="mt-4 text-base font-black text-slate-950">{item.title}</h2>
                <p className="mt-2 min-h-[44px] text-sm font-medium leading-6 text-slate-500">{item.description}</p>
              </Link>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
