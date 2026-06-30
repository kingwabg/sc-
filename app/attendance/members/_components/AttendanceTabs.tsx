"use client";

/**
 * AttendanceTabs — 종사자/비종사자 탭 전환
 */

import { Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type AttendanceTab = "staff" | "volunteer";

type Props = {
  active: AttendanceTab;
  staffCount: number;
  volunteerCount: number;
  onChange: (tab: AttendanceTab) => void;
};

export function AttendanceTabs({ active, staffCount, volunteerCount, onChange }: Props) {
  const tabs: { id: AttendanceTab; icon: React.ReactNode; label: string; count: number }[] = [
    { id: "staff", icon: <Users className="w-4 h-4" />, label: "종사자", count: staffCount },
    { id: "volunteer", icon: <Clock className="w-4 h-4" />, label: "비종사자", count: volunteerCount },
  ];

  return (
    <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-1 shadow-sm text-sm mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-4 h-10 rounded-[8px] font-semibold transition",
            active === tab.id ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50",
          )}
        >
          {tab.icon}
          {tab.label}
          <span
            className={cn(
              "text-[11px] px-1.5 py-0.5 rounded-full font-bold",
              active === tab.id ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500",
            )}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}