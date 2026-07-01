import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LeaveSidebar } from "@/components/layout/LeaveSidebar";
import { COMPANY_LEAVE_ENTRIES } from "@/lib/features/leave-mock";
import { LEAVE_KIND_LABELS, LEAVE_KIND_EMOJIS } from "@/lib/features/leave-mock";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

export default function LeaveCompanyPage() {
  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">
        <Suspense fallback={null}>
          <LeaveSidebar />
        </Suspense>
        <div className="min-w-0 space-y-5">
          <div>
            <h1 className="text-lg font-bold text-slate-900 mb-1">전사 휴가 현황</h1>
            <p className="text-sm text-slate-500">전체 직원의 휴가 잔여 및 사용 현황입니다.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 text-left">이름</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 text-left">직위</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 text-left">부서</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 text-center">잔여</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 text-center">사용</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 text-center">총</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 text-center">소진율</th>
                </tr>
              </thead>
              <tbody>
                {COMPANY_LEAVE_ENTRIES.map((entry) => {
                  const b = entry.balances[0];
                  const rate = b.total > 0 ? Math.round((b.used / b.total) * 100) : 0;
                  return (
                    <tr key={entry.staffId} className="border-b border-slate-50 hover:bg-slate-50/50 transition last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 text-xs font-bold grid place-items-center shrink-0">
                            {entry.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{entry.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{entry.position}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{entry.department}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-600 text-center">{b.remaining}일</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">{b.used}일</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">{b.total}일</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                rate > 80 ? "bg-red-400" : rate > 50 ? "bg-amber-400" : "bg-brand-400",
                              )}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-8 text-right">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
