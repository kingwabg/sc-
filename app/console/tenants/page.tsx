"use client";

/**
 * app/console/tenants/page.tsx — 센터 목록
 */

import Link from "next/link";
import { useState, useMemo } from "react";
import { MOCK_TENANTS } from "@/lib/features/tenant";
import { formatStorage, daysUntilExpire, storagePercent } from "@/lib/features/tenant/utils";
import { Search, Plus, Building2 } from "lucide-react";

const PLAN_COLORS: Record<string, string> = {
  basic: "bg-slate-100 text-slate-700 border-slate-300",
  pro: "bg-indigo-50 text-indigo-700 border-indigo-300",
  enterprise: "bg-amber-50 text-amber-700 border-amber-300",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-300",
  suspended: "bg-yellow-50 text-yellow-700 border-yellow-300",
  deleted: "bg-slate-100 text-slate-500 border-slate-300",
};

export default function TenantsListPage() {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const data = useMemo(() => {
    return MOCK_TENANTS.filter((t) => {
      const q = query.toLowerCase();
      if (q && !t.siteName.toLowerCase().includes(q) && !t.tenantCode.includes(q) && !t.defaultDomain.includes(q)) return false;
      if (planFilter !== "all" && t.plan !== planFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });
  }, [query, planFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">센터 관리</h1>
          <p className="text-xs text-slate-500 mt-1">전체 {MOCK_TENANTS.length}개 센터 · SaaS 멀티테넌트</p>
        </div>
        <Link
          href="/console/tenants/new"
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          신규 센터 생성
        </Link>
      </header>

      {/* 필터 */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="사이트명 / 사이트 아이디 / 도메인"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5">
          <option value="all">전체 요금제</option>
          <option value="basic">basic</option>
          <option value="pro">pro</option>
          <option value="enterprise">enterprise</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5">
          <option value="all">전체 상태</option>
          <option value="active">활성</option>
          <option value="suspended">정지</option>
          <option value="deleted">삭제</option>
        </select>
      </div>

      {/* 목록 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">사이트</th>
              <th className="text-left px-4 py-2.5 font-medium">사이트 아이디</th>
              <th className="text-left px-4 py-2.5 font-medium">도메인</th>
              <th className="text-left px-4 py-2.5 font-medium">요금제</th>
              <th className="text-left px-4 py-2.5 font-medium">상태</th>
              <th className="text-left px-4 py-2.5 font-medium">만료</th>
              <th className="text-right px-4 py-2.5 font-medium">회원</th>
              <th className="text-right px-4 py-2.5 font-medium">용량</th>
              <th className="text-right px-4 py-2.5 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => {
              const days = daysUntilExpire(t.expireDate);
              const expired = days !== null && days < 0;
              const near = days !== null && days >= 0 && days <= 30;
              return (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/console/tenants/${t.id}`} className="flex items-center gap-1.5 font-medium text-slate-800 hover:text-emerald-600">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {t.siteName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">{t.tenantCode}</td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {t.defaultDomain}
                    {t.customDomain && <div className="text-[10px] text-amber-600 mt-0.5">+ {t.customDomain}</div>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${PLAN_COLORS[t.plan]}`}>
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${STATUS_COLORS[t.status]}`}>
                      {t.status === "active" ? "활성" : t.status === "suspended" ? "정지" : "삭제"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {t.expireDate ? (
                      <span className={`text-[11px] ${expired ? "text-rose-600 font-semibold" : near ? "text-amber-600 font-semibold" : "text-slate-600"}`}>
                        {t.expireDate}
                        {expired ? " (만료)" : near ? ` (D-${days})` : ""}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{t.memberLimit}명</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {formatStorage(t.usedStorage)}
                    <span className="text-slate-400 text-[10px] ml-1">({storagePercent(t.usedStorage, t.storageLimit).toFixed(0)}%)</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/console/tenants/${t.id}`} className="text-emerald-600 hover:underline text-[11px]">
                      상세 →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                  검색 결과가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}