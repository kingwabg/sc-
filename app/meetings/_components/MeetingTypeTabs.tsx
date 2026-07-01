/**
 * app/meetings/_components/MeetingTypeTabs.tsx
 *
 * 4-tab (전체 / 아동자치 / 운영위원회 / 종사자) — 회의 종류 필터
 * - 카운트 배지 + 활성 표시
 */

"use client";

import { Users, Building2, Briefcase, LayoutGrid } from "lucide-react";
import type { MeetingType } from "@/lib/features/meeting/types";
import {
  TAB_ALL,
  TAB_CHILD_COUNCIL,
  TAB_GOVERNANCE,
  TAB_STAFF,
} from "@/lib/features/meeting/labels";

export type MeetingTypeFilter = "ALL" | MeetingType;

interface TabDef {
  key: MeetingTypeFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: { active: string; idle: string };
}

const TABS: TabDef[] = [
  {
    key: "ALL",
    label: TAB_ALL,
    icon: LayoutGrid,
    tone: { active: "bg-slate-900 text-white", idle: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50" },
  },
  {
    key: "CHILD_COUNCIL",
    label: TAB_CHILD_COUNCIL,
    icon: Users,
    tone: { active: "bg-sky-600 text-white", idle: "bg-white text-sky-700 border-sky-200 hover:bg-sky-50" },
  },
  {
    key: "GOVERNANCE",
    label: TAB_GOVERNANCE,
    icon: Building2,
    tone: { active: "bg-indigo-600 text-white", idle: "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50" },
  },
  {
    key: "STAFF",
    label: TAB_STAFF,
    icon: Briefcase,
    tone: { active: "bg-emerald-600 text-white", idle: "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50" },
  },
];

interface Props {
  value: MeetingTypeFilter;
  counts: Record<MeetingTypeFilter, number>;
  onChange: (next: MeetingTypeFilter) => void;
}

export function MeetingTypeTabs({ value, counts, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist">
      {TABS.map((t) => {
        const active = t.key === value;
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[12.5px] font-medium transition ${
              active ? t.tone.active : t.tone.idle
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {t.label}
            <span
              className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] tabular-nums ${
                active
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts[t.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}