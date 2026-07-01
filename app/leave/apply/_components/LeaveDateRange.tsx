/**
 * app/leave/apply/_components/LeaveDateRange.tsx — Step 2
 *
 * 날짜 선택 + 일수 자동 계산
 */

"use client";

import { Calendar } from "lucide-react";
import { useMemo } from "react";
import type { LeaveKind } from "@/lib/features/leave-mock";

interface Props {
  kind: LeaveKind;
  startDate: string;
  endDate: string;
  reason: string;
  onChange: (next: { startDate: string; endDate: string; reason: string }) => void;
}

function calcDays(start: string, end: string, kind: LeaveKind): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
  const diff = Math.floor((e.getTime() - s.getTime()) / 86_400_000) + 1;
  // 주말(토/일) 제외 — 간단 계산
  let workdays = 0;
  for (let d = 0; d < diff; d++) {
    const day = new Date(s);
    day.setDate(s.getDate() + d);
    const dow = day.getDay();
    if (dow !== 0 && dow !== 6) workdays++;
  }
  if (kind === "half") return 0.5;
  return workdays;
}

export function LeaveDateRange({ kind, startDate, endDate, reason, onChange }: Props) {
  const days = useMemo(() => calcDays(startDate, endDate, kind), [startDate, endDate, kind]);
  const isHalf = kind === "half";

  return (
    <div className="space-y-3">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">날짜 · 사유</h2>
        <p className="text-xs text-slate-500 mt-1">시작일 / 종료일 입력 (주말 자동 제외)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1">시작일</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange({ startDate: e.target.value, endDate, reason })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1">
            종료일 {isHalf && <span className="text-amber-600">(반차 — 종료일 무시)</span>}
          </span>
          <input
            type="date"
            value={endDate}
            disabled={isHalf}
            onChange={(e) => onChange({ startDate, endDate: e.target.value, reason })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none disabled:bg-slate-50 disabled:text-slate-400"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <Calendar className="w-4 h-4 text-emerald-700" />
        <span className="text-sm text-emerald-900">
          휴가 일수: <strong className="font-semibold">{days.toFixed(1)}일</strong>
        </span>
      </div>

      <label className="block">
        <span className="block text-xs font-medium text-slate-600 mb-1">사유 (선택)</span>
        <textarea
          value={reason}
          onChange={(e) => onChange({ startDate, endDate, reason: e.target.value })}
          rows={3}
          placeholder="예: 가족 행사, 병원 방문 등"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none resize-y"
        />
      </label>
    </div>
  );
}