"use client";

/**
 * StatusFilter — 출석 상태 필터 칩 그룹
 */

import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/features/children/types";

type Props = {
  value: AttendanceStatus | "all";
  onChange: (v: AttendanceStatus | "all") => void;
};

const STATUSES: AttendanceStatus[] = ["등원", "결석", "조퇴", "보건휴식", "미등원"];

export function StatusFilter({ value, onChange }: Props) {
  const options: { v: AttendanceStatus | "all"; l: string }[] = [
    { v: "all", l: "전체" },
    ...STATUSES.map((s) => ({ v: s as AttendanceStatus, l: s === "보건휴식" ? "보건" : s })),
  ];

  return (
    <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-0.5 shadow-sm text-xs">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "px-2.5 h-8 rounded-md font-medium transition",
            value === o.v
              ? "bg-brand-50 text-brand-700"
              : "text-slate-600 hover:bg-slate-50",
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}