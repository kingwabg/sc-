"use client";

import type { ApprovalRequest, ApprovalStep } from "@/lib/features/approval";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const STEP_ICON: Record<ApprovalStep["status"], React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  current: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

const STEP_TONE: Record<
  ApprovalStep["status"],
  { bg: string; text: string; ring: string; lineBg: string }
> = {
  pending: { bg: "bg-slate-100", text: "text-slate-500", ring: "ring-slate-200", lineBg: "bg-slate-200" },
  current: { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-300", lineBg: "bg-blue-200" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-300", lineBg: "bg-emerald-200" },
  rejected: { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-300", lineBg: "bg-red-200" },
};

const STEP_STATUS_LABEL: Record<ApprovalStep["status"], string> = {
  pending: "대기",
  current: "결재중",
  approved: "승인",
  rejected: "반려",
};

interface ApprovalLinePanelProps {
  req: ApprovalRequest;
}

export function ApprovalLinePanel({ req }: ApprovalLinePanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-6">
      <h2 className="text-[14px] font-bold text-slate-900 m-0 mb-5">결재선</h2>
      <ol className="space-y-0">
        {req.line.map((step, idx) => {
          const Icon = STEP_ICON[step.status];
          const tone = STEP_TONE[step.status];
          const isLast = idx === req.line.length - 1;

          return (
            <li key={step.step} className="flex gap-3">
              {/* 아이콘 + 라인 */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full grid place-items-center ring-2",
                    tone.bg,
                    tone.ring,
                  )}
                >
                  <Icon className={cn("w-4 h-4", tone.text)} />
                </div>
                {!isLast && (
                  <div
                    className={cn("w-0.5 flex-1 my-1", tone.lineBg)}
                    style={{ minHeight: "32px" }}
                  />
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 pt-1.5 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-slate-900">
                    {step.name}
                  </span>
                  <span className="text-[11px] text-slate-500">{step.position}</span>
                  <span
                    className={cn(
                      "inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold",
                      tone.bg,
                      tone.text,
                    )}
                  >
                    {STEP_STATUS_LABEL[step.status]}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {step.step}단계
                  </span>
                </div>
                {step.comment && (
                  <div className="mt-1.5 text-[12px] text-slate-600 bg-slate-50 rounded px-2.5 py-1.5 border-l-2 border-slate-300">
                    💬 {step.comment}
                  </div>
                )}
                {step.actedAt && (
                  <div className="text-[10px] text-slate-400 mt-1">
                    {formatDate(step.actedAt)}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
