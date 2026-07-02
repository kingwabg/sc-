"use client";

import { useState } from "react";
import type { ApprovalRequest } from "@/lib/features/approval";
import { Check, X, RotateCcw } from "lucide-react";
import { useSession } from "@/lib/session";

interface ApprovalActionsProps {
  req: ApprovalRequest;
  onApprove: (comment?: string) => void;
  onReject: (comment: string) => void;
  onCancel: () => void;
}

export function ApprovalActions({ req, onApprove, onReject, onCancel }: ApprovalActionsProps) {
  const [comment, setComment] = useState("");
  const { user } = useSession();
  const currentUserName = user?.name ?? "왕준하";
  const currentStep = req.line.find((s) => s.status === "current");
  const isMyTurn = !!currentStep && currentStep.name === currentUserName;
  const isRequester = req.requesterName === currentUserName || req.requesterName === "나";
  const canCancel = isRequester && req.status === "결재중";

  return (
    <>
      {/* 내 차례: 승인/반려 액션 */}
      {req.status === "결재중" && isMyTurn && currentStep && (
        <div className="bg-blue-50/50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-[14px] font-bold text-blue-900 m-0">
              내 차례 — 결재 의견 작성
            </h2>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="결재 의견 (선택) — 반려 시 사유 필수"
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={() => {
                onReject(comment);
                setComment("");
              }}
              className="h-9 px-4 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition inline-flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              반려
            </button>
            <button
              onClick={() => {
                onApprove(comment || undefined);
                setComment("");
              }}
              className="h-9 px-5 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition inline-flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              승인
            </button>
          </div>
        </div>
      )}

      {/* 회수 버튼 (요청자만, 결재중일 때) */}
      {canCancel && (
        <div className="flex items-center justify-end mt-3">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-[12px] text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            결재 회수
          </button>
        </div>
      )}
    </>
  );
}
