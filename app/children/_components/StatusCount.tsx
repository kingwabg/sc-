"use client";

/**
 * StatusCount — 출석 상태 카운트 칩 (ChildrenPageHeader 내부에서 사용)
 */

import { cn } from "@/lib/utils";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "amber" | "blue" | "red";
  label: string;
  count: number;
};

const colorMap = {
  emerald: "text-emerald-600 bg-emerald-50",
  amber: "text-amber-600 bg-amber-50",
  blue: "text-blue-600 bg-blue-50",
  red: "text-red-600 bg-red-50",
} as const;

export function StatusCount({ icon: Icon, color, label, count }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("w-4 h-4 rounded grid place-items-center", colorMap[color])}>
        <Icon className="w-3 h-3" />
      </span>
      <span className="text-slate-600 text-[12px]">{label}</span>
      <span className="font-bold text-slate-900 text-[12px]">{count}</span>
    </div>
  );
}