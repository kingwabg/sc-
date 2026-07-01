"use client";

/**
 * app/exec/audit-trail/page.tsx
 *
 * P13 — 감사 이력 페이지
 * - 회계 변경 이력 10건
 */

import { MOCK_AUDIT_TRAIL } from "@/lib/features/accounting/data";
import { FileSearch, Pencil, Plus, CheckCircle, Shield } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  budget: "예산",
  expense: "지출",
  donation: "후원금",
  settlement: "결산",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  "예산 항목 수정": <Pencil className="w-3.5 h-3.5 text-amber-500" />,
  "지출 등록": <Plus className="w-3.5 h-3.5 text-blue-500" />,
  "후원금 수입 등록": <Plus className="w-3.5 h-3.5 text-green-500" />,
  "지출 승인": <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />,
  "손익 결산 등록": <FileSearch className="w-3.5 h-3.5 text-violet-500" />,
  "회계 감사 실시": <Shield className="w-3.5 h-3.5 text-slate-500" />,
};

export default function AuditTrailPage() {
  const sorted = [...MOCK_AUDIT_TRAIL].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">감사 이력</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          회계 변경 이력 — {sorted.length}건
        </p>
      </div>

      {/* 타임라인 카드 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">변경 이력</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {sorted.map((entry, idx) => (
            <div key={entry.id} className="px-5 py-4 flex gap-4">
              {/* 타임라인纵线 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
                  {ACTION_ICONS[entry.action] ?? <FileSearch className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                {idx < sorted.length - 1 && (
                  <div className="w-0.5 flex-1 bg-slate-100 mt-2 min-h-[20px]" />
                )}
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{entry.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{entry.target}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${
                        entry.category === "donation"
                          ? "bg-green-100 text-green-700"
                          : entry.category === "expense"
                          ? "bg-blue-100 text-blue-700"
                          : entry.category === "budget"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-violet-100 text-violet-700"
                      }`}
                    >
                      {CATEGORY_LABELS[entry.category] ?? entry.category}
                    </span>
                  </div>
                </div>

                {/* 변경 내용 */}
                {(entry.before !== null || entry.after !== null) && (
                  <div className="mt-2 flex gap-2 text-xs">
                    {entry.before && (
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded">
                        Before: {entry.before}
                      </span>
                    )}
                    {entry.after && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                        After: {entry.after}
                      </span>
                    )}
                  </div>
                )}

                {/*メタ 정보 */}
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span>{entry.actor}</span>
                  <span>·</span>
                  <span>
                    {entry.timestamp.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
