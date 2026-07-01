"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  CheckCircle2,
} from "lucide-react";

const YEARS = [2026, 2025, 2024];

export type AttendanceStats = {
  present: number;
  absent: number;
  leave: number;
  sick: number;
  rate: number;
};

export type AttendanceLedgerToolbarProps = {
  year: number;
  month: number;
  bizDays: number;
  facilityCapacity: 30 | 40 | 50;
  filteredChildrenCount: number;
  stats: AttendanceStats;
  onYearChange: (y: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export function AttendanceLedgerToolbar({
  year,
  month,
  bizDays,
  facilityCapacity,
  filteredChildrenCount,
  stats,
  onYearChange,
  onPrevMonth,
  onNextMonth,
}: AttendanceLedgerToolbarProps) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3 flex-wrap">
        <Link
          href="/children"
          className="hover:text-slate-900 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          아동 목록
        </Link>
        <span className="text-slate-300">·</span>
        <span className="text-slate-900 font-semibold">출결대장</span>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">출결대장</h1>
          </div>
          <p className="text-sm text-slate-500 m-0">
            {year}년 {month}월 · 영업일 <b className="text-slate-900">{bizDays}일</b> ·
            정원 <b className="text-brand-600">{facilityCapacity}명</b> ·
            현재 <b className="text-slate-900">{filteredChildrenCount}명</b> 재원
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 px-3 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-[10px] hover:bg-slate-50 transition shadow-sm inline-flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            내보내기
          </button>
          <button
            onClick={() => window.print()}
            className="h-10 px-3 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-[10px] hover:bg-slate-50 transition shadow-sm inline-flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            인쇄
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card-base p-3 mb-4 flex items-center gap-2 flex-wrap">
        {/* Year */}
        <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-1 shadow-sm text-xs">
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => onYearChange(y)}
              className={cn(
                "px-3 h-8 rounded-md font-medium transition",
                year === y
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              {y}년
            </button>
          ))}
        </div>

        {/* Month nav */}
        <div className="inline-flex items-center bg-white border border-slate-200 rounded-[10px] shadow-sm">
          <button
            onClick={onPrevMonth}
            className="h-9 w-9 grid place-items-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-l-[10px]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 h-9 grid place-items-center text-sm font-semibold text-slate-900 min-w-[80px]">
            {month}월
          </span>
          <button
            onClick={onNextMonth}
            className="h-9 w-9 grid place-items-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-r-[10px]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-3 text-[12px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            등원 {stats.present}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            조퇴 {stats.leave}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
            보건 {stats.sick}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
            결석 {stats.absent}
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            출석률 {stats.rate}%
          </span>
        </div>
      </div>
    </>
  );
}
