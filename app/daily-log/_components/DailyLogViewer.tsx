"use client";

import { useState } from "react";
import { CheckCircle2, Printer, Send, ChevronLeft, ChevronRight, Plus, FileText } from "lucide-react";
import type { DailyLog, DailyLogSummary } from "@/lib/features/daily-log/types";

type Props = {
  log: DailyLog | null;
  logs: DailyLogSummary[];
  onNavigate: (id: string) => void;
  onNew: () => void;
};

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${weekdays[d.getDay()]}`;
}

function StatusLabel({ status }: { status: DailyLog["status"] }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
        <CheckCircle2 className="w-4 h-4" />
        결재 완료
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        결재 진행중
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
      <span className="w-2 h-2 rounded-full bg-slate-400" />
      임시저장
    </span>
  );
}

export function DailyLogViewer({ log, logs, onNavigate, onNew }: Props) {
  const [zoom, setZoom] = useState(0.8);

  const currentIndex = log ? logs.findIndex((l) => l.id === log.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < logs.length - 1;
  const currentSummary = log ? logs[currentIndex] : null;

  if (!log) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card flex flex-col items-center justify-center flex-1 min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-slate-100 grid place-items-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
            <path d="M9 12h6M9 16h6M7 4H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3"/>
            <path d="M9 4h6"/>
          </svg>
        </div>
        <p className="text-[14px] font-semibold text-slate-700 mb-1">일지를 선택하세요</p>
        <p className="text-[12px] text-slate-400 mb-4">좌측 목록에서 운영일지를 클릭하면 내용이 표시됩니다</p>
        <button
          onClick={onNew}
          className="h-9 px-4 bg-brand-600 text-white text-[13px] font-semibold rounded-[10px] hover:bg-brand-700 transition inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          새 일지 작성
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden flex flex-col flex-1">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <StatusLabel status={log.status} />
          <span className="text-[13px] font-semibold text-slate-700 truncate">
            {formatFullDate(log.date)}
          </span>
          <span className="text-[12px] text-slate-400 shrink-0">
            {log.authorName} · {log.authorRole}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Prev / Next */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => hasPrev && onNavigate(logs[currentIndex - 1].id)}
              disabled={!hasPrev}
              className="h-8 px-2 text-slate-500 hover:bg-slate-50 transition disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="h-8 px-2 text-[11px] text-slate-500 flex items-center border-x border-slate-200">
              {currentIndex + 1} / {logs.length}
            </span>
            <button
              onClick={() => hasNext && onNavigate(logs[currentIndex + 1].id)}
              disabled={!hasNext}
              className="h-8 px-2 text-slate-500 hover:bg-slate-50 transition disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Print Preview */}
          <a
            href={`/preview/daily-log/${log.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-3 border border-slate-200 rounded-lg text-[12px] text-slate-600 hover:bg-slate-50 transition inline-flex items-center gap-1.5 no-underline"
          >
            <FileText className="w-3.5 h-3.5" />
            미리보기
          </a>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="h-8 px-3 border border-slate-200 rounded-lg text-[12px] text-slate-600 hover:bg-slate-50 transition inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            출력
          </button>

          {/* Submit for approval */}
          {log.status === "draft" && (
            <button className="h-8 px-3 bg-brand-600 text-white text-[12px] font-semibold rounded-lg hover:bg-brand-700 transition inline-flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              결재상신
            </button>
          )}
        </div>
      </div>

      {/* Zoom control */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
        <span className="text-[11px] text-slate-400">확대:</span>
        {[0.6, 0.8, 1.0, 1.2].map((z) => (
          <button
            key={z}
            onClick={() => setZoom(z)}
            className={`h-6 px-2 rounded text-[11px] font-medium transition ${
              zoom === z ? "bg-brand-100 text-brand-700" : "text-slate-500 hover:bg-slate-200"
            }`}
          >
            {Math.round(z * 100)}%
          </button>
        ))}
      </div>

      {/* HTML Content */}
      <div className="flex-1 overflow-auto bg-slate-100 p-4 flex justify-center">
        <div
          className="bg-white shadow-lg transition-all"
          style={{
            width: "794px",
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            minHeight: "1123px",
          }}
          dangerouslySetInnerHTML={{ __html: log.content }}
        />
      </div>
    </div>
  );
}
