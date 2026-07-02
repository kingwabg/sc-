"use client";

/**
 * app/console/page.tsx — 운영자 대시보드
 *
 * 전체 센터 KPI + 활성/정지 현황 + 최근 활동
 */

import Link from "next/link";
import { Building2, Users, HardDrive, TrendingUp, ChevronRight } from "lucide-react";
import { getTenantKpi, MOCK_TENANTS } from "@/lib/features/tenant";
import { formatStorage } from "@/lib/features/tenant/utils";

const PLAN_COLORS: Record<string, string> = {
  basic: "bg-slate-100 text-slate-700 border-slate-200",
  pro: "bg-indigo-50 text-indigo-700 border-indigo-200",
  enterprise: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  suspended: "bg-yellow-50 text-yellow-700",
  deleted: "bg-slate-100 text-slate-500",
};

export default function ConsoleDashboard() {
  const kpi = getTenantKpi();
  const recent = MOCK_TENANTS.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <header>
        <h1 className="text-xl font-bold text-slate-900">운영자 대시보드</h1>
        <p className="text-xs text-slate-500 mt-1">서비스 운영 현황 — 전체 센터 / 회원 / 용량</p>
      </header>

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiCard icon={Building2} label="전체 센터" value={kpi.totalTenants} sub={`활성 ${kpi.activeTenants}`} color="emerald" />
        <KpiCard icon={Users} label="총 회원 (한도)" value={kpi.totalMembers.toLocaleString()} sub="명" color="indigo" />
        <KpiCard icon={HardDrive} label="총 사용 용량" value={formatStorage(kpi.totalStorageUsed)} sub={`/ ${formatStorage(kpi.totalTenants * 5_368_709_120)} 한도`} color="amber" />
        <KpiCard icon={TrendingUp} label="요금제 분포" value={`B ${kpi.planDistribution.basic} / P ${kpi.planDistribution.pro} / E ${kpi.planDistribution.enterprise}`} sub="basic / pro / enterprise" color="purple" />
      </div>

      {/* 요금제 분포 막대 차트 */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">요금제 분포</h2>
        <div className="space-y-2">
          {(["basic", "pro", "enterprise"] as const).map((plan) => {
            const count = kpi.planDistribution[plan];
            const pct = kpi.totalTenants > 0 ? (count / kpi.totalTenants) * 100 : 0;
            return (
              <div key={plan}>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="font-medium uppercase">{plan}</span>
                  <span>{count}개 ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(plan === "basic" ? "bg-slate-400" : plan === "pro" ? "bg-indigo-500" : "bg-amber-500")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 최근 센터 */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">최근 센터</h2>
          <Link href="/console/tenants" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
            전체 보기 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2 font-medium">사이트명</th>
              <th className="text-left px-4 py-2 font-medium">사이트 아이디</th>
              <th className="text-left px-4 py-2 font-medium">도메인</th>
              <th className="text-left px-4 py-2 font-medium">요금제</th>
              <th className="text-left px-4 py-2 font-medium">상태</th>
              <th className="text-right px-4 py-2 font-medium">회원 / 용량</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link href={`/console/tenants/${t.id}`} className="font-medium text-slate-800 hover:text-emerald-600">
                    {t.siteName}
                  </Link>
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-500">{t.tenantCode}</td>
                <td className="px-4 py-2.5 text-slate-600">
                  {t.defaultDomain}
                  {t.customDomain && <span className="ml-1 text-[10px] text-amber-600">(커스텀: {t.customDomain})</span>}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${PLAN_COLORS[t.plan]}`}>
                    {t.plan}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[t.status]}`}>
                    {t.status === "active" ? "활성" : t.status === "suspended" ? "정지" : "삭제"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-slate-600">
                  {t.memberLimit}명 · {formatStorage(t.usedStorage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color }: any) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-semibold ${colorMap[color]}`}>
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}