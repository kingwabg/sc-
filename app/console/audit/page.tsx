"use client";

/**
 * app/console/audit/page.tsx — 운영자 콘솔: 전체 운영자 활동 감사 로그
 *
 * - mock 30건 (API: /api/console/audit)
 * - 필터: 액션 타입 / 사용자 / 기간
 * - 페이지네이션 (10건/페이지)
 * - 표: 일시 / 사용자 / 액션 / 대상 / IP / 결과 / 비고
 */

import { useEffect, useMemo, useState } from "react";
import { Filter, RefreshCw, ShieldCheck } from "lucide-react";
import AuditLogsTable from "./_components/AuditLogsTable";
import type { AuditAction, AuditLog } from "@/app/api/console/audit/route";

type AuditApiResponse = {
  ok: boolean;
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
};

const ACTIONS: (AuditAction | "all")[] = ["all", "CREATE", "UPDATE", "DELETE", "VIEW", "LOGIN"];

const INPUT =
  "w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition";

const SELECT = `${INPUT} appearance-none`;

export default function AuditPage() {
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [userFilter, setUserFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<AuditApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (actionFilter !== "all") params.set("action", actionFilter);
    if (userFilter.trim()) params.set("user", userFilter.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(page));
    params.set("pageSize", "10");
    return params.toString();
  }, [actionFilter, userFilter, from, to, page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/console/audit?${queryString}`);
      const json: AuditApiResponse = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "조회에 실패했습니다");
        setData(null);
      } else {
        setData(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const resetFilters = () => {
    setActionFilter("all");
    setUserFilter("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            감사 이력
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            전체 운영자 활동 로그 (super-admin 영역 — 모든 테넌트 cross-access)
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs border border-slate-300 hover:bg-slate-50 rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </header>

      {/* 필터 */}
      <section className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-3">
          <Filter className="w-3.5 h-3.5" />
          필터
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">액션 타입</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value as AuditAction | "all");
                setPage(1);
              }}
              className={SELECT}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a === "all" ? "전체" : a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">사용자</label>
            <input
              type="text"
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
                setPage(1);
              }}
              placeholder="이름 검색"
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">시작일</label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">종료일</label>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              className={INPUT}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500">{data ? `총 ${data.total}건` : "-"}</div>
          <button
            onClick={resetFilters}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline"
          >
            필터 초기화
          </button>
        </div>
      </section>

      <AuditLogsTable
        logs={data?.logs ?? []}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        loading={loading}
        hasData={!!data}
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
