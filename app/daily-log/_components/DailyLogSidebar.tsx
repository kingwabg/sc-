"use client";

import { Plus, Search, FileText, Clock, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DailyLogSummary } from "@/lib/features/daily-log/types";

type Props = {
  logs: DailyLogSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
};

function formatDate(dateStr: string): { weekday: string; short: string } {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return {
    weekday: weekdays[d.getDay()],
    short: `${d.getMonth() + 1}/${d.getDate()}`,
  };
}

function StatusBadge({ status }: { status: DailyLogSummary["status"] }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        완료
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
        <AlertCircle className="w-3 h-3" />
        결재중
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
      <Clock className="w-3 h-3" />
      임시저장
    </span>
  );
}

export function DailyLogSidebar({ logs, selectedId, onSelect, onNew }: Props) {
  const pathname = usePathname();
  const isStatsActive = pathname?.startsWith("/daily-log/stats");

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600" />
          <h2 className="text-[13px] font-bold text-slate-900 m-0">운영일지</h2>
          <span className="text-[11px] text-slate-400 font-medium">{logs.length}건</span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/daily-log/stats"
            className={cn(
              "h-7 px-2 rounded-lg grid place-items-center transition text-[11px] font-semibold gap-1 inline-flex items-center",
              isStatsActive
                ? "bg-brand-50 text-brand-700"
                : "text-slate-500 hover:bg-slate-50",
            )}
            title="일지별 집계"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            통계
          </Link>
          <button
            onClick={onNew}
            className="w-7 h-7 rounded-lg bg-brand-600 text-white grid place-items-center hover:bg-brand-700 transition shrink-0"
            title="새 일지 작성"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="flex items-center h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg gap-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            placeholder="날짜 · 작성자 검색"
            className="flex-1 bg-transparent outline-none text-[12px] text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-3 pt-2 pb-1 flex items-center gap-1 flex-wrap">
        {[
          { label: "전체", value: "all" },
          { label: "완료", value: "approved" },
          { label: "결재중", value: "pending" },
          { label: "임시저장", value: "draft" },
        ].map((tab) => (
          <button
            key={tab.value}
            className={cn(
              "px-2 py-1 rounded-md text-[11px] font-medium transition",
              tab.value === "all"
                ? "bg-brand-50 text-brand-700"
                : "text-slate-500 hover:bg-slate-50",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto">
        {logs.map((log) => {
          const { weekday, short } = formatDate(log.date);
          const isSelected = log.id === selectedId;
          return (
            <button
              key={log.id}
              onClick={() => onSelect(log.id)}
              className={cn(
                "w-full text-left px-3 py-3 border-b border-slate-100 transition",
                isSelected
                  ? "bg-brand-50 border-l-2 border-l-brand-600"
                  : "hover:bg-slate-50 border-l-2 border-l-transparent",
              )}
            >
              {/* Date + status row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-700">{short}</span>
                  <span
                    className={cn(
                      "text-[10px] font-bold w-5 h-5 rounded text-center leading-5",
                      weekday === "토" || weekday === "일"
                        ? "bg-red-100 text-red-600"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {weekday}
                  </span>
                </div>
                <StatusBadge status={log.status} />
              </div>

              {/* Title */}
              <div className="text-[12.5px] font-semibold text-slate-900 leading-snug mb-0.5 line-clamp-2">
                {log.title}
              </div>

              {/* Author */}
              <div className="text-[11px] text-slate-400">
                {log.authorName} · {log.authorRole}
              </div>
            </button>
          );
        })}

        {logs.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
            <FileText className="w-8 h-8 text-slate-200" />
            <span className="text-[12px]">일지가 없습니다</span>
          </div>
        )}
      </div>
    </aside>
  );
}
