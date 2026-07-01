"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { approvalService } from "@/lib/approvals/service";
import { APPROVAL_FORMS } from "@/lib/data/approvals";
import type { ApprovalRequest } from "@/lib/approvals/types";
import { cn } from "@/lib/utils";
import { Flame, Loader2, ArrowRight } from "lucide-react";

export function RecentApprovalList() {
  const [reqs, setReqs] = useState<ApprovalRequest[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReqs(approvalService.list());
  }, []);

  const inProgress = reqs.filter((r) => r.status === "결재중");
  const done = reqs.filter((r) => r.status === "완료");

  return (
    <div className="space-y-4">
      {/* 진행 중인 결재 */}
      <Section title="진행 중인 결재" count={inProgress.length} items={inProgress} emptyMsg="결재 진행 중인 문서가 없습니다." mounted={mounted} />
      {/* 완료된 결재 */}
      <Section title="완료된 결재" count={done.length} items={done} emptyMsg="완료된 문서가 없습니다." mounted={mounted} />
    </div>
  );
}

function Section({
  title,
  count,
  items,
  emptyMsg,
  mounted,
}: {
  title: string;
  count: number;
  items: ApprovalRequest[];
  emptyMsg: string;
  mounted: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <span className="text-[11px] text-slate-400">({count}건)</span>
      </div>
      {!mounted ? (
        <div className="px-5 py-10 text-center text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
          불러오는 중…
        </div>
      ) : items.length === 0 ? (
        <div className="px-5 py-10 text-center text-slate-400 text-xs">{emptyMsg}</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.slice(0, 5).map((req) => {
            const formMeta = APPROVAL_FORMS.find((f) => f.key === req.form);
            const approvedCount = req.line.filter((s) => s.status === "approved").length;
            const totalSteps = req.line.length;
            const currentStep = req.line.find((s) => s.status === "current");

            return (
              <li key={req.id}>
                <Link
                  href={`/approval/doc/${req.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition"
                >
                  <span className="text-xl shrink-0">{formMeta?.emoji ?? "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold text-slate-900 truncate">
                        {req.title}
                      </span>
                      {req.urgent && (
                        <span className="flex items-center gap-0.5 text-[10px] text-red-600 font-bold shrink-0">
                          <Flame className="w-3 h-3" />
                          긴급
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>{formMeta?.label ?? req.form}</span>
                      <span>·</span>
                      <span>{req.requesterName}</span>
                      {req.docNo && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{req.docNo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={req.status} />
                    {req.status === "결재중" && currentStep && (
                      <div className="text-[10px] text-slate-500 mt-1">
                        {approvedCount}/{totalSteps}단계 · {currentStep.name}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ApprovalRequest["status"] }) {
  const tone: Record<ApprovalRequest["status"], string> = {
    결재중: "bg-blue-50 text-blue-700 ring-blue-200",
    완료: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    반려: "bg-red-50 text-red-700 ring-red-200",
    회수: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span
      className={cn(
        "inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold ring-1",
        tone[status],
      )}
    >
      {status}
    </span>
  );
}
