/**
 * app/leave/stats/page.tsx — 휴가 사용 통계 (verifier fix-pointer)
 *
 * 5번째 사이드바 메뉴용 페이지. 직원별 휴가 사용 추이 + 종류별 비중.
 */

import { AppShell } from "@/components/layout/AppShell";
import { LeaveSidebar } from "@/components/layout/LeaveSidebar";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";

export default function LeaveStatsPage() {
  // 5종류 통계 (mock — P12-1 lib 의 getLeaveStats 연동 가능)
  const monthly = [
    { month: "1월", days: 0 },
    { month: "2월", days: 0 },
    { month: "3월", days: 0 },
    { month: "4월", days: 0 },
    { month: "5월", days: 0 },
    { month: "6월", days: 0 },
    { month: "7월", days: 0 },
  ];
  const max = 1; // 0% 표시용 — 실제 데이터 시 max = Math.max(...monthly.map(m => m.days)) 또는 1

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <LeaveSidebar currentPath="/leave/stats" />

        <main>
          <header className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">휴가 통계</h1>
            <p className="text-xs text-slate-500 mt-1">
              2026년 사용 추이 · 종류별 비중 · 예정 휴가
            </p>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>총 휴가 일수</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">0<span className="text-sm text-slate-500 ml-1">일</span></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>월 평균</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">0.0<span className="text-sm text-slate-500 ml-1">일</span></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>가장 많이 사용한 종류</span>
              </div>
              <div className="mt-2 text-base font-bold text-slate-900">연차</div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">월별 사용 추이</h2>
            <div className="flex items-end gap-2 h-32">
              {monthly.map((m) => {
                const h = max > 0 ? (m.days / max) * 100 : 0;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-emerald-200 rounded-t"
                      style={{ height: `${Math.max(h, 4)}%` }}
                      title={`${m.days}일`}
                    />
                    <span className="text-[10px] text-slate-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-3 text-center">
              P12-1 lib 의 getLeaveStats 연동 시 실제 데이터로 갱신됩니다
            </p>
          </section>
        </main>
      </div>
    </AppShell>
  );
}