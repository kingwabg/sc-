/**
 * app/leave/apply/_components/LeavePreview.tsx — Step 3
 *
 * 미리보기 + 결재선 + 신청
 */

"use client";

import { useState } from "react";
import { Check, Loader2, UserCheck, Building2 } from "lucide-react";
import { LEAVE_KIND_LABELS, MY_LEAVE_BALANCES } from "@/lib/features/leave-mock";
import type { LeaveKind } from "@/lib/features/leave-mock";

interface Props {
  kind: LeaveKind;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  onSubmit: () => Promise<{ ok: boolean; id?: string; error?: string }>;
}

export function LeavePreview({ kind, startDate, endDate, days, reason, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; id?: string; error?: string } | null>(null);
  const balance = MY_LEAVE_BALANCES.find((b) => b.kind === kind);

  const handleSubmit = async () => {
    setSubmitting(true);
    const r = await onSubmit();
    setResult(r);
    setSubmitting(false);
  };

  if (result?.ok) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 grid place-items-center">
          <Check className="w-6 h-6 text-emerald-700" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">신청 완료</h2>
        <p className="text-sm text-slate-600">
          결재 상신됨. 결재 ID: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{result.id}</code>
        </p>
        <p className="text-xs text-slate-500">결재 진행 상황은 결재함에서 확인하세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">미리보기 · 신청</h2>
        <p className="text-xs text-slate-500 mt-1">아래 내용으로 결재 상신됩니다</p>
      </header>

      <dl className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 text-sm">
        <div className="flex justify-between px-3 py-2">
          <dt className="text-slate-500">휴가 종류</dt>
          <dd className="font-medium text-slate-900">{LEAVE_KIND_LABELS[kind]}</dd>
        </div>
        <div className="flex justify-between px-3 py-2">
          <dt className="text-slate-500">기간</dt>
          <dd className="font-medium text-slate-900">
            {startDate} ~ {endDate} ({days}일)
          </dd>
        </div>
        <div className="flex justify-between px-3 py-2">
          <dt className="text-slate-500">잔여</dt>
          <dd className="text-slate-700">
            {balance ? `${balance.remaining}일` : "-"}
          </dd>
        </div>
        {reason && (
          <div className="px-3 py-2">
            <dt className="text-slate-500 text-xs mb-1">사유</dt>
            <dd className="text-slate-900 whitespace-pre-wrap">{reason}</dd>
          </div>
        )}
      </dl>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="text-xs font-semibold text-slate-600 mb-2">결재선 (자동)</div>
        <ol className="space-y-1.5 text-sm">
          <li className="flex items-center gap-2 text-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            본인 (기안)
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            시설장 (검토)
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            센터장 (승인)
          </li>
        </ol>
      </div>

      {result && !result.ok && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
          신청 실패: {result.error ?? "unknown error"}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || days <= 0}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            신청 중...
          </>
        ) : (
          "결재 상신"
        )}
      </button>
    </div>
  );
}