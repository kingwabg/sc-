"use client";

/**
 * ApprovalActions — 결재 진행 action 버튼
 *
 * /api/approval/[id]/act API 호출 (mock in-memory store)
 * approve / reject / cc_confirm / withdraw
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, RotateCcw } from "lucide-react";
import type { ApprovalRequest } from "@/lib/features/approval/types";
import { useToast } from "@/components/ui/Toast";

interface Props {
  req: ApprovalRequest;
}

export function ApprovalActions({ req }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const currentStep = req.line.find((s) => s.status === "current");
  const isMyTurn = !!currentStep;
  const isRequester = req.requesterId === "u1"; // mock current user
  const canWithdraw = isRequester && req.status === "결재중";

  async function callAction(action: string, commentVal?: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/approval/${req.id}/act`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment: commentVal }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "오류가 발생했습니다.");
        return;
      }
      toast.success(
        action === "approve"
          ? json.data.status === "완료"
            ? "최종 결재 완료!"
            : "승인 처리되었습니다."
          : action === "reject"
          ? "결재가 반려되었습니다."
          : action === "withdraw"
          ? "결재를 회수했습니다."
          : "확인 처리되었습니다.",
      );
      setComment("");
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* 승인/반려 액션 (현재 결재자) */}
      {req.status === "결재중" && isMyTurn && (
        <div className="bg-blue-50/50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-[14px] font-bold text-blue-900 m-0">내 차례 — 결재 의견 작성</h2>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="결재 의견 (선택) — 반려 시 사유 입력 권장"
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={() => callAction("reject", comment)}
              disabled={loading}
              className="h-9 px-4 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition inline-flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              반려
            </button>
            <button
              onClick={() => callAction("approve", comment || undefined)}
              disabled={loading}
              className="h-9 px-5 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition inline-flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              승인
            </button>
          </div>
        </div>
      )}

      {/* 회수 버튼 */}
      {canWithdraw && (
        <div className="flex items-center justify-end mt-3">
          <button
            onClick={() => {
              if (!confirm("이 결재를 회수할까요? 결재선 진행이 중단됩니다.")) return;
              callAction("withdraw");
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-[12px] text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            결재 회수
          </button>
        </div>
      )}
    </>
  );
}
