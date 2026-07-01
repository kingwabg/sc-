import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LeaveSidebar } from "@/components/layout/LeaveSidebar";
import { MONTHLY_LEAVE_HISTORY, LEAVE_KIND_LABELS, LEAVE_KIND_EMOJIS } from "@/lib/features/leave";
import type { LeaveRecord } from "@/lib/features/leave";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

function StatusBadge({ status }: { status: LeaveRecord["status"] }) {
  const map: Record<LeaveRecord["status"], string> = {
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

function LeaveRow({ record }: { record: LeaveRecord }) {
  const emoji = LEAVE_KIND_EMOJIS[record.kind] ?? "📋";
  const kind  = LEAVE_KIND_LABELS[record.kind] ?? record.kind;
  const days  = record.days < 1 ? `${record.days * 24}시간` : `${record.days}일`;

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition last:border-0">
      <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
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

export default function LeaveAnnualPage() {
  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">
        <Suspense fallback={null}>
          <LeaveSidebar />
        </Suspense>
        <div className="min-w-0 space-y-5">
          <div>
            <h1 className="text-lg font-bold text-slate-900 mb-1">연차 내역</h1>
            <p className="text-sm text-slate-500">월별 휴가 사용 내역을 확인할 수 있습니다.</p>
          </div>
          {MONTHLY_LEAVE_HISTORY.map((group) => (
            <div key={group.month} className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">{group.month}</h2>
              </div>
              {group.records.length === 0 ? (
                <div className="px-5 py-8 text-center text-slate-400 text-xs">해당 월에 사용한 휴가가 없습니다.</div>
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
                    {group.records.map((r) => <LeaveRow key={r.id} record={r} />)}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
