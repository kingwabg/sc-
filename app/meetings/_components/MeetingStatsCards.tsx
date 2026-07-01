/**
 * app/meetings/_components/MeetingStatsCards.tsx
 *
 * 회의록 통계 카드 — 5종 (전체/아동자치/운영위원회/종사자/결재 진행)
 */

import {
  ClipboardList,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import {
  STATS_TOTAL_LABEL,
  STATS_CHILD_LABEL,
  STATS_GOVERNANCE_LABEL,
  STATS_STAFF_LABEL,
  STATS_APPROVAL_LABEL,
} from "@/lib/features/meeting/labels";
import type { MeetingStats } from "@/lib/features/meeting/types";

interface Props {
  stats: MeetingStats;
}

const CARD_TONE: Array<{
  key: keyof MeetingStats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}> = [
  { key: "totalCount", label: STATS_TOTAL_LABEL, icon: ClipboardList, tone: "bg-slate-100 text-slate-700" },
  { key: "childCouncilCount", label: STATS_CHILD_LABEL, icon: Users, tone: "bg-sky-100 text-sky-700" },
  { key: "governanceCount", label: STATS_GOVERNANCE_LABEL, icon: Building2, tone: "bg-indigo-100 text-indigo-700" },
  { key: "staffCount", label: STATS_STAFF_LABEL, icon: Briefcase, tone: "bg-emerald-100 text-emerald-700" },
  { key: "approvalSpawnedCount", label: STATS_APPROVAL_LABEL, icon: ShieldCheck, tone: "bg-amber-100 text-amber-700" },
];

export function MeetingStatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
      {CARD_TONE.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            className="bg-white border border-slate-200 rounded-2xl shadow-card px-4 py-3 flex items-center gap-3"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.tone}`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10.5px] text-slate-500 m-0">{c.label}</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums m-0">
                {stats[c.key]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}