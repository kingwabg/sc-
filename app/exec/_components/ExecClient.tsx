"use client";

import { useSession } from "@/lib/session";
import { Crown, TrendingUp, Baby, Users, CalendarCheck, AlertCircle } from "lucide-react";

/* ─── 월별 KPI 데이터 (실제 DB 연동 전까지 seed 기반) ─── */
const MONTHLY_KPI = [
  { month: "1월", attendance: 95, satisfaction: 92, safety: 100, budget: 98 },
  { month: "2월", attendance: 88, satisfaction: 90, safety: 100, budget: 95 },
  { month: "3월", attendance: 97, satisfaction: 94, safety: 100, budget: 99 },
  { month: "4월", attendance: 93, satisfaction: 91, safety: 100, budget: 97 },
  { month: "5월", attendance: 96, satisfaction: 93, safety: 100, budget: 98 },
  { month: "6월", attendance: 91, satisfaction: 89, safety: 100, budget: 96 },
];

const OVERVIEW_STATS = [
  { label: "월 평균 등원율", value: "93.3%", icon: CalendarCheck, color: "text-blue-600",   bg: "bg-blue-50" },
  { label: "만족도 점수",     value: "91.6%", icon: TrendingUp,    color: "text-green-600",   bg: "bg-green-50" },
  { label: "안전점검 통과",   value: "100%",  icon: AlertCircle,   color: "text-violet-600", bg: "bg-violet-50" },
  { label: "예산執行률",      value: "97.2%", icon: TrendingUp,    color: "text-amber-600",   bg: "bg-amber-50" },
];

function TrafficLight({ value }: { value: number }) {
  const level =
    value >= 95 ? "green" :
    value >= 85 ? "yellow" :
    "red";
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${
        level === "green"  ? "bg-green-500" :
        level === "yellow" ? "bg-amber-400" :
        "bg-red-500"
      }`}
      title={`${value}%`}
    />
  );
}

function KpiBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 95 ? "bg-green-500" :
    value >= 85 ? "bg-amber-400" :
    "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs font-medium text-slate-600 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-10 text-xs font-semibold text-slate-700 text-right">{value}%</span>
      <TrafficLight value={value} />
    </div>
  );
}

export function ExecClient() {
  const { user } = useSession();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">임원 대시보드</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {user?.name}님 — 사업장 전체 핵심 지표 (월별 현황)
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-100">
          <Crown className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-semibold text-violet-700">소유자 전용</span>
        </div>
      </div>

      {/* 개요 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} grid place-items-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* 월별 신호등 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">월별 KPI 신호등</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            🟢 95% 이상 · 🟡 85% 이상 · 🔴 85% 미만
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">월</th>
                <th className="px-5 py-3">등원율</th>
                <th className="px-5 py-3">만족도</th>
                <th className="px-5 py-3">안전점검</th>
                <th className="px-5 py-3"> 예산執行</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MONTHLY_KPI.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-semibold text-slate-700">{row.month}</td>
                  <td className="px-5 py-3">
                    <KpiBar label="등원율" value={row.attendance} />
                  </td>
                  <td className="px-5 py-3">
                    <KpiBar label="만족도" value={row.satisfaction} />
                  </td>
                  <td className="px-5 py-3">
                    <KpiBar label="안전" value={row.safety} />
                  </td>
                  <td className="px-5 py-3">
                    <KpiBar label="예산" value={row.budget} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 하단 정보 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl border border-orange-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Baby className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-slate-800">아동 현황</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">3명</p>
          <p className="text-sm text-slate-500">현재 재원 아동 (활동 3명 / 퇴소 0명)</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-800">종사자 현황</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">5명</p>
          <p className="text-sm text-slate-500">활동 종사자 4명 / 휴가 1명</p>
        </div>
      </div>
    </div>
  );
}
