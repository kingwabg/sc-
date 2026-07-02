"use client";

/**
 * ReportHistoryTab — 종사자 상세 > 보고이력 탭
 *
 * 시군구 보고 내역 (입사보고 / 호봉승급보고 / 퇴사보고)
 * 컬럼: 보고일 / 보고유형 / 공문번호 / 처리상태
 */

import { useState, useMemo } from "react";
import { Plus, Trash2, FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ReportKind = "입사보고" | "호봉승급보고" | "퇴사보고" | "휴직보고" | "복직보고";
type ReportStatus = "제출" | "접수" | "처리중" | "완료" | "반려";

type Report = {
  id: string;
  date: string;           // YYYY-MM-DD (보고일)
  kind: ReportKind;
  documentNumber: string; // 공문번호
  status: ReportStatus;
  notes?: string;
};

const SEED: Report[] = [
  { id: "rep1", date: "2025-06-15", kind: "호봉승급보고", documentNumber: "아동-2025-0128", status: "완료", notes: "1년차 정기 승급" },
  { id: "rep2", date: "2024-09-05", kind: "호봉승급보고", documentNumber: "아동-2024-0089", status: "완료", notes: "정기 승급" },
  { id: "rep3", date: "2024-01-15", kind: "입사보고", documentNumber: "아동-2024-0011", status: "완료", notes: "신규 채용 입사" },
];

const KIND_TONE: Record<ReportKind, string> = {
  입사보고: "bg-emerald-100 text-emerald-700",
  호봉승급보고: "bg-violet-100 text-violet-700",
  퇴사보고: "bg-slate-100 text-slate-700",
  휴직보고: "bg-amber-100 text-amber-700",
  복직보고: "bg-cyan-100 text-cyan-700",
};

const STATUS_TONE: Record<ReportStatus, string> = {
  제출: "bg-slate-100 text-slate-600",
  접수: "bg-sky-100 text-sky-700",
  처리중: "bg-amber-100 text-amber-700",
  완료: "bg-emerald-100 text-emerald-700",
  반려: "bg-rose-100 text-rose-700",
};

const KIND_OPTIONS = Object.keys(KIND_TONE) as ReportKind[];
const STATUS_OPTIONS = Object.keys(STATUS_TONE) as ReportStatus[];

export function ReportHistoryTab() {
  const [rows, setRows] = useState<Report[]>(SEED);

  function add() {
    const d = new Date().toISOString().slice(0, 10);
    setRows([{ id: `rep-${Date.now()}`, date: d, kind: "호봉승급보고", documentNumber: "", status: "제출", notes: "" }, ...rows]);
  }
  function update(id: string, patch: Partial<Report>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function remove(id: string) {
    setRows(rows.filter((r) => r.id !== id));
  }

  const stats = useMemo(() => {
    const map: Record<ReportStatus, number> = {
      제출: 0, 접수: 0, 처리중: 0, 완료: 0, 반려: 0,
    };
    for (const r of rows) map[r.status]++;
    return map;
  }, [rows]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-brand-600" />
            <span className="font-semibold text-slate-800">시군구 보고 이력</span>
          </span>
          <span className="text-xs text-slate-500">총 {rows.length}건</span>
        </div>
        <button
          onClick={add}
          className="h-8 px-3 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> 보고 추가
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["제출", "접수", "처리중", "완료", "반려"] as ReportStatus[]).map((s) => (
          <span key={s} className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium", STATUS_TONE[s])}>
            {s} <span className="opacity-70">{stats[s]}</span>
          </span>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["보고일", "보고유형", "공문번호", "처리상태", "비고", ""].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-xs text-slate-700">{r.date}</td>
                  <td className="px-3 py-2">
                    <select
                      value={r.kind}
                      onChange={(e) =>
                        update(r.id, { kind: e.target.value as ReportKind })
                      }
                      className={cn(
                        "h-7 px-2 rounded-md border text-[11px] font-medium",
                        KIND_TONE[r.kind],
                      )}
                    >
                      {KIND_OPTIONS.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.documentNumber}
                      onChange={(e) =>
                        update(r.id, { documentNumber: e.target.value })
                      }
                      placeholder="예: 아동-2025-0128"
                      className="w-44 px-2 h-8 border border-slate-200 rounded-md text-sm font-mono text-[12px]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        update(r.id, { status: e.target.value as ReportStatus })
                      }
                      className={cn(
                        "h-7 px-2 rounded-md border text-[11px] font-medium",
                        STATUS_TONE[r.status],
                      )}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={r.notes ?? ""}
                      onChange={(e) => update(r.id, { notes: e.target.value })}
                      className="w-40 px-2 h-8 border border-slate-200 rounded-md text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      aria-label="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-400">
                    보고 이력이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
