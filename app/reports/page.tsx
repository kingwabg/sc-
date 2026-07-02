import Link from "next/link";
import {
  BookOpen,
  CalendarRange,
  ChevronRight,
  FileText,
  MessagesSquare,
  NotebookPen,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const reportModules = [
  {
    title: "회의록",
    description: "아동자치, 운영위원회, 종사자 회의 기록과 결재 상태를 관리합니다.",
    href: "/meetings",
    actionHref: "/meetings/new",
    actionLabel: "신규 회의록 작성",
    icon: MessagesSquare,
    count: "3건",
    tone: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    title: "연간계획",
    description: "연 단위 목표, 프로그램, 월간 슬롯의 기준 계획을 작성합니다.",
    href: "/annual-plan",
    actionHref: "/annual-plan",
    actionLabel: "연간계획 보기",
    icon: BookOpen,
    count: "2건",
    tone: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    title: "월간계획",
    description: "연간계획에서 내려온 월별 목표와 실행 계획을 확인합니다.",
    href: "/monthly-plan",
    actionHref: "/monthly-plan",
    actionLabel: "월간계획 보기",
    icon: CalendarRange,
    count: "12개월",
    tone: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    title: "운영일지",
    description: "일별 운영 기록, 프로그램 실행 내용, 특이사항을 작성합니다.",
    href: "/daily-log",
    actionHref: "/daily-log",
    actionLabel: "운영일지 보기",
    icon: NotebookPen,
    count: "3건",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="m-0 text-xl font-bold tracking-tight text-slate-900">
                  보고
                </h1>
                <span className="text-[12px] tabular-nums text-slate-400">
                  {reportModules.length}개 영역
                </span>
              </div>
              <p className="m-0 mt-1 text-[12px] text-slate-500">
                회의록, 연간계획, 월간계획, 운영일지를 한 곳에서 확인합니다.
              </p>
              <p className="m-0 mt-0.5 text-[11px] text-indigo-600">
                계획에서 일지까지 이어지는 보고 흐름을 기준으로 정리됩니다.
              </p>
            </div>
            <Link
              href="/meetings/new"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-[13px] font-medium text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              신규 회의록 작성
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {reportModules.map((module) => (
            <ReportSummaryCard key={module.href} module={module} />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <h2 className="m-0 text-[15px] font-bold text-slate-900">보고 영역</h2>
            </div>
            <span className="text-[12px] text-slate-400">전체 {reportModules.length}개</span>
          </div>

          <div className="divide-y divide-slate-100">
            {reportModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${module.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{module.title}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                          {module.count}
                        </span>
                      </div>
                      <p className="m-0 mt-1 truncate text-[12px] text-slate-500">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ReportSummaryCard({
  module,
}: {
  module: (typeof reportModules)[number];
}) {
  const Icon = module.icon;

  return (
    <Link
      href={module.href}
      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-brand-300 hover:shadow-lg hover:shadow-brand-600/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl border ${module.tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
          {module.count}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="m-0 text-[15px] font-bold text-slate-900">{module.title}</h3>
        <p className="m-0 mt-1 line-clamp-2 min-h-[34px] text-[12px] leading-5 text-slate-500">
          {module.description}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[12px] font-semibold text-brand-600">
        <span>{module.actionLabel}</span>
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
