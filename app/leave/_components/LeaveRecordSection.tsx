"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MY_LEAVE_RECORDS } from "@/lib/features/leave-mock";
import { LEAVE_KIND_LABELS, LEAVE_KIND_EMOJIS } from "@/lib/features/leave-mock";
import type { LeaveRecord, LeaveStatus } from "@/lib/features/leave-mock";
import { CalendarDays, ArrowRight } from "lucide-react";

// ─── 상태 뱃지 ──────────────────────────────────────
function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, string> = {
    대기:  "bg-blue-50 text-blue-700 ring-blue-200",
    승인:  "bg-emerald-50 text-emerald-700 ring-emerald-200",
    반려:  "bg-red-50 text-red-700 ring-red-200",
    취소:  "bg-slate-100 text-slate-500 ring-slate-200",
  };
  return (
    <span className={cn("inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold ring-1", map[status])}>
      {status}
    </span>
  );
}

// ─── 단일 행 ────────────────────────────────────────
function LeaveRow({ record }: { record: LeaveRecord }) {
  const emoji = LEAVE_KIND_EMOJIS[record.kind] ?? "📋";
  const kind  = LEAVE_KIND_LABELS[record.kind] ?? record.kind;
  const days  = record.days < 1 ? `${record.days * 24}시간` : `${record.days}일`;

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition last:border-0">
      <td className="px-4 py-3">
        <StatusBadge status={record.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-medium text-slate-800">{kind}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 text-center">{days}</td>
      <td className="px-4 py-3 text-sm text-slate-600 text-center">
        <div className="flex items-center justify-center gap-1">
          <CalendarDays className="w-3 h-3 text-slate-400" />
          <span>{record.startDate === record.endDate ? record.startDate : `${record.startDate}~${record.endDate}`}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-400 text-right text-xs">{record.appliedAt}</td>
    </tr>
  );
}

// ─── 테이블 섹션 ────────────────────────────────────
interface RecordSectionProps {
  title: string;
  records: LeaveRecord[];
  emptyMsg: string;
  showArrow?: boolean;
}

function RecordSection({ title, records, emptyMsg }: RecordSectionProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <span className="text-[11px] text-slate-400">({records.length}건)</span>
      </div>
      {records.length === 0 ? (
        <div className="px-5 py-10 text-center text-slate-400 text-xs">{emptyMsg}</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-2 text-[11px] font-semibold text-slate-400 text-left">상태</th>
              <th className="px-4 py-2 text-[11px] font-semibold text-slate-400 text-left">종류</th>
              <th className="px-4 py-2 text-[11px] font-semibold text-slate-400 text-center">일수</th>
              <th className="px-4 py-2 text-[11px] font-semibold text-slate-400 text-center">기간</th>
              <th className="px-4 py-2 text-[11px] font-semibold text-slate-400 text-right">신청일</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <LeaveRow key={r.id} record={r} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── 예정휴가 + 지난휴가 섹션 ───────────────────────
export function LeaveRecordSection() {
  const today = new Date().toISOString().split("T")[0];

  const upcoming = MY_LEAVE_RECORDS.filter(
    (r) => r.startDate >= today && r.status !== "취소",
  );
  const past = MY_LEAVE_RECORDS.filter(
    (r) => r.startDate < today || r.status === "취소",
  );

  return (
    <section className="space-y-4">
      <RecordSection
        title="예정 휴가"
        records={upcoming}
        emptyMsg="예정된 휴가가 없습니다."
      />
      <RecordSection
        title="지난 휴가"
        records={past}
        emptyMsg="지난 휴가 기록이 없습니다."
      />
    </section>
  );
}
