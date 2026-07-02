"use client";

import { notFound, useParams } from "next/navigation";
import {
  Banknote,
  Calculator,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  ReceiptText,
  Settings,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

const SECTION_META = {
  income: {
    title: "수입 관리",
    description: "후원금, 이용료, 보조금 등 입금 항목을 분류하고 관리합니다.",
    icon: Banknote,
    tone: "emerald",
    items: ["입금 내역 조회", "수입 항목 분류", "후원금 매칭", "미분류 수입 확인"],
  },
  expense: {
    title: "지출 관리",
    description: "운영비, 급여, 물품 구매 지출과 증빙을 함께 확인합니다.",
    icon: WalletCards,
    tone: "rose",
    items: ["지출 내역 조회", "증빙 첨부", "결재 문서 연결", "미승인 지출 확인"],
  },
  deposits: {
    title: "통장 입금",
    description: "계좌 거래 내역을 수입 관리 항목과 연결합니다.",
    icon: Landmark,
    tone: "blue",
    items: ["거래 내역 불러오기", "입금자 매칭", "미확인 입금 처리", "계좌별 현황"],
  },
  receipts: {
    title: "증빙 자료",
    description: "영수증, 세금계산서, 첨부 파일을 누락 없이 관리합니다.",
    icon: ReceiptText,
    tone: "amber",
    items: ["증빙함", "누락 증빙", "첨부 파일", "다운로드"],
  },
  reports: {
    title: "결산 리포트",
    description: "월별/연도별 수입과 지출을 정산 자료로 정리합니다.",
    icon: Calculator,
    tone: "violet",
    items: ["월별 결산", "연도별 결산", "수입·지출 리포트", "자료 출력"],
  },
  checklist: {
    title: "회계 점검",
    description: "마감 전 누락 증빙과 미분류 거래를 점검합니다.",
    icon: ClipboardCheck,
    tone: "slate",
    items: ["마감 체크리스트", "미분류 거래", "누락 증빙", "오류 확인"],
  },
  approval: {
    title: "결재 연동",
    description: "회계 처리와 연결된 결재 문서를 관리합니다.",
    icon: FileCheck2,
    tone: "blue",
    items: ["결재 대기", "결재 완료", "반려 문서", "회계 연결"],
  },
  settings: {
    title: "계정 설정",
    description: "회계 계정, 분류 기준, 결산 설정을 관리합니다.",
    icon: Settings,
    tone: "slate",
    items: ["계정 과목", "분류 규칙", "회계연도", "권한 설정"],
  },
} as const;

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function AccountingSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params?.section as keyof typeof SECTION_META;
  const meta = SECTION_META[section];

  if (!meta) {
    notFound();
  }

  const Icon = meta.icon;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-start gap-4">
            <span className={cn("grid h-12 w-12 place-items-center rounded-xl ring-1", toneClass[meta.tone])}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[12px] font-extrabold text-slate-400">회계포털</div>
              <h1 className="m-0 mt-1 text-2xl font-black tracking-tight text-slate-950">{meta.title}</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{meta.description}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {meta.items.map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-black text-slate-900">{item}</div>
              <p className="mt-2 text-[12px] font-medium leading-5 text-slate-500">세부 기능을 연결할 준비 영역입니다.</p>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
