"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DailyLogSidebar } from "../_components/DailyLogSidebar";
import {
  MOCK_DAILY_LOGS,
} from "@/lib/features/daily-log/data";
import type { DailyLogSummary } from "@/lib/features/daily-log/types";
import {
  MOCK_DAILY_STATS,
  buildStatsFromLogs,
  type DailyStatsRow,
  type StatsPeriod,
} from "./_lib/stats";
import { StatsToolbar } from "./_components/StatsToolbar";
import { StatsTable } from "./_components/StatsTable";

export default function DailyLogStatsPage() {
  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [selectedId, setSelectedId] = useState<string | null>(
    MOCK_DAILY_LOGS[0]?.id ?? null,
  );

  const summaries: DailyLogSummary[] = useMemo(
    () => MOCK_DAILY_LOGS.map((l) => ({
      id: l.id,
      date: l.date,
      title: l.title,
      authorName: l.authorName,
      authorRole: l.authorRole,
      status: l.status,
      updatedAt: l.updatedAt,
    })),
    [],
  );

  const rows: DailyStatsRow[] = useMemo(
    () => (MOCK_DAILY_STATS.length > 0 ? MOCK_DAILY_STATS : buildStatsFromLogs()),
    [],
  );

  const filtered = useMemo(() => {
    const today = new Date();
    const cutoff = new Date(today);
    if (period === "week") cutoff.setDate(today.getDate() - 6);
    else if (period === "month") cutoff.setDate(today.getDate() - 29);
    else cutoff.setFullYear(today.getFullYear() - 5);
    return rows.filter((r) => new Date(r.date) >= cutoff);
  }, [rows, period]);

  // 평균 / 합계 요약
  const totals = useMemo(() => {
    if (filtered.length === 0) return null;
    const sum = (k: keyof DailyStatsRow) =>
      filtered.reduce((acc, r) => acc + (Number(r[k]) || 0), 0);
    const avgRate = Math.round(
      filtered.reduce((a, r) => a + r.attendanceRate, 0) / filtered.length,
    );
    return {
      count: filtered.length,
      totalEnrolled: sum("enrolled"),
      totalPresent: sum("present"),
      totalAbsent: sum("absent"),
      totalExcused: sum("excused"),
      totalPrograms: sum("programs"),
      totalStaffEdu: sum("staffEdu"),
      avgRate,
    };
  }, [filtered]);

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 items-start">
          {/* Left sidebar — same as daily-log */}
          <div className="h-[calc(100vh-100px)] sticky top-[80px]">
            <DailyLogSidebar
              logs={summaries}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onNew={() => console.log("new log")}
            />
          </div>

          {/* Right main */}
          <div className="min-w-0 space-y-3">
            <StatsToolbar
              period={period}
              onPeriodChange={setPeriod}
              totalRows={filtered.length}
            />

            {totals && (
              <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                <Kpi label="일지 수" value={`${totals.count}일`} tone="slate" />
                <Kpi label="평균 출석률" value={`${totals.avgRate}%`} tone={totals.avgRate >= 90 ? "emerald" : totals.avgRate >= 75 ? "amber" : "red"} />
                <Kpi label="등록 인원" value={`${totals.totalEnrolled}명`} tone="slate" />
                <Kpi label="출석 합계" value={`${totals.totalPresent}명`} tone="emerald" />
                <Kpi label="결석 합계" value={`${totals.totalAbsent}명`} tone="red" />
                <Kpi label="공결 합계" value={`${totals.totalExcused}명`} tone="amber" />
                <Kpi label="프로그램/교육" value={`${totals.totalPrograms + totals.totalStaffEdu}`} tone="indigo" sub={`P ${totals.totalPrograms} / E ${totals.totalStaffEdu}`} />
              </div>
            )}

            <StatsTable rows={filtered} />

            <div className="text-[11px] text-slate-400 px-1">
              ※ 정부24 사회보장정보원 「지역아동센터 운영관리」 통계 양식 기반 · mock data
            </div>
          </div>
        </div>
    </AppShell>
  );
}

function Kpi({ label, value, tone, sub }: { label: string; value: string; tone: "slate" | "emerald" | "amber" | "red" | "indigo"; sub?: string }) {
  const toneMap = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  };
  return (
    <div className={`px-3 py-2.5 rounded-xl border ${toneMap[tone]}`}>
      <div className="text-[10px] font-semibold opacity-80">{label}</div>
      <div className="text-[18px] font-bold leading-tight">{value}</div>
      {sub && <div className="text-[10px] opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}