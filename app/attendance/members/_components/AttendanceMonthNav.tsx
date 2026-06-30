"use client";

/**
 * AttendanceMonthNav — 월 네비게이션 (이전/다음/현재 표시)
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
};

export function AttendanceMonthNav({ year, month, onPrev, onNext }: Props) {
  return (
    <div className="inline-flex items-center bg-white border border-slate-200 rounded-[10px] shadow-sm">
      <button
        onClick={onPrev}
        className="h-9 w-9 grid place-items-center text-slate-500 hover:text-slate-900 rounded-l-[10px]"
        aria-label="이전 달"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="px-4 h-9 grid place-items-center text-sm font-bold text-slate-900">
        {year}년 {month}월
      </span>
      <button
        onClick={onNext}
        className="h-9 w-9 grid place-items-center text-slate-500 hover:text-slate-900 rounded-r-[10px]"
        aria-label="다음 달"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}