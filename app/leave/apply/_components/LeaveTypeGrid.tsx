/**
 * app/leave/apply/_components/LeaveTypeGrid.tsx — Step 1
 *
 * 12종 휴가 종류 카드 그리드 (다우 wrap_list_group 형식)
 */

"use client";

import {
  Palmtree, Baby, Users, Heart, RefreshCw, Clock, Calendar,
  PartyPopper, Briefcase, Stethoscope, Timer, Cake,
} from "lucide-react";
import { LEAVE_KIND_LABELS, LEAVE_KIND_EMOJIS } from "@/lib/features/leave-mock";
import type { LeaveKind } from "@/lib/features/leave-mock";

const KIND_ICONS: Record<LeaveKind, typeof Palmtree> = {
  annual: Palmtree,
  half: Timer,
  sick: Stethoscope,
  condolence: Cake,
  public: Briefcase,
  menstrual: Heart,
  childcare: Baby,
  pregnancy: Baby,
  commuting: Baby,
  family: Users,
  reinstatement: RefreshCw,
  etc: Calendar,
};

interface Props {
  selected: LeaveKind | null;
  onSelect: (kind: LeaveKind) => void;
}

const KINDS = Object.keys(LEAVE_KIND_LABELS) as LeaveKind[];

export function LeaveTypeGrid({ selected, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">휴가 종류 선택</h2>
        <p className="text-xs text-slate-500 mt-1">12종류 중 신청할 휴가 종류를 선택하세요</p>
      </header>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {KINDS.map((kind) => {
          const Icon = KIND_ICONS[kind] ?? Palmtree;
          const isActive = selected === kind;
          return (
            <li key={kind}>
              <button
                type="button"
                onClick={() => onSelect(kind)}
                className={[
                  "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition",
                  isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700",
                ].join(" ")}
              >
                <span className="w-7 h-7 grid place-items-center rounded-md bg-slate-100 text-slate-600">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">{LEAVE_KIND_LABELS[kind]}</span>
                  <span className="block text-[11px] text-slate-500">{LEAVE_KIND_EMOJIS[kind]}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}