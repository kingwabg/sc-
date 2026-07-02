"use client";

/**
 * _components/AuditLogsTable.tsx — 감사 로그 표 + 페이지네이션
 */

import { ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import type { AuditAction, AuditLog, AuditResult } from "@/app/api/console/audit/route";

const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: "bg-emerald-50 text-emerald-700 border-emerald-300",
  UPDATE: "bg-indigo-50 text-indigo-700 border-indigo-300",
  DELETE: "bg-rose-50 text-rose-700 border-rose-300",
  VIEW: "bg-slate-100 text-slate-700 border-slate-300",
  LOGIN: "bg-amber-50 text-amber-700 border-amber-300",
};

const RESULT_COLORS: Record<AuditResult, string> = {
  success: "bg-green-50 text-green-700 border-green-300",
  failure: "bg-rose-50 text-rose-700 border-rose-300",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AuditLogsTable({
  logs,
  page,
  totalPages,
  onPageChange,
  emptyHint = "검색 결과가 없습니다",
  loadingHint = "데이터를 불러오는 중…",
  loading = false,
  hasData,
}: {
  logs: AuditLog[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  emptyHint?: string;
  loadingHint?: string;
  loading?: boolean;
  hasData: boolean;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-2.5 text-left font-semibold text-slate-700">일시</th>
            <th className="px-3 py-2.5 text-left font-semibold text-slate-700">사용자</th>
            <th className="px-3 py-2.5 text-left font-semibold text-slate-700">액션</th>
            <th className="px-3 py-2.5 text-left font-semibold text-slate-700">대상</th>
            <th className="px-3 py-2.5 text-left font-semibold text-slate-700">IP</th>
            <th className="px-3 py-2.5 text-left font-semibold text-slate-700">결과</th>
            <th className="px-3 py-2.5 text-left font-semibold text-slate-700">비고</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">
                {formatDateTime(log.timestamp)}
              </td>
              <td className="px-3 py-2 text-slate-700">{log.userName}</td>
              <td className="px-3 py-2">
                <span
                  className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${ACTION_COLORS[log.action]}`}
                >
                  {log.action}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-600">
                <div>{log.targetType}</div>
                {log.targetName && (
                  <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{log.targetName}</div>
                )}
              </td>
              <td className="px-3 py-2 font-mono text-slate-500">{log.ip}</td>
              <td className="px-3 py-2">
                <span
                  className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${RESULT_COLORS[log.result]}`}
                >
                  {log.result === "success" ? "성공" : "실패"}
                </span>
                {log.result === "failure" && (
                  <ShieldAlert className="w-3 h-3 text-rose-500 inline ml-1" />
                )}
              </td>
              <td className="px-3 py-2 text-slate-500 text-[11px]">{log.note ?? "-"}</td>
            </tr>
          ))}
          {hasData && logs.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                {emptyHint}
              </td>
            </tr>
          )}
          {!hasData && !loading && (
            <tr>
              <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                {loadingHint}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs">
          <span className="text-slate-500">
            페이지 {page} / {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 10)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`min-w-[28px] h-7 px-2 rounded text-[11px] font-medium ${
                    page === p
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-300 hover:bg-white text-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
