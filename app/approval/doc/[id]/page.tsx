"use client";

/**
 * 결재 상세 페이지 — 데이터 fetch + props 전달만 담당
 * 실제 UI는 _components/ 하위에서 렌더링
 */
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, RefreshCw, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { approvalService, APPROVAL_FORMS } from "@/lib/features/approval";
import type { ApprovalRequest } from "@/lib/features/approval";
import { ApprovalDocHeader } from "./_components/ApprovalDocHeader";
import { ApprovalLinePanel } from "./_components/ApprovalLinePanel";
import { ApprovalActions } from "./_components/ApprovalActions";
import { useToast } from "@/components/ui/Toast";

/** URL에서 approval id 추출 — useParams 응답 전 폴백 */
function readIdFromPath(): string | null {
  if (typeof window === "undefined") return null;
  const m = window.location.pathname.match(/^\/approval\/doc\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default function ApprovalDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [req, setReq] = useState<ApprovalRequest | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadApproval = useCallback(() => {
    const id = params?.id ?? readIdFromPath();
    if (!id) return;
    setReq(approvalService.get(id));
  }, [params?.id]);

  useEffect(() => {
    setMounted(true);
    loadApproval();
  }, [loadApproval]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") loadApproval();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadApproval]);

  if (!mounted) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          불러오는 중…
        </div>
      </AppShell>
    );
  }

  if (!req) {
    const triedId = params?.id ?? readIdFromPath();
    return (
      <AppShell>
        <div className="max-w-md mx-auto py-20 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 grid place-items-center mb-4">
            <X className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-slate-700 font-semibold">결재 문서를 찾을 수 없어요.</p>
          <p className="text-xs text-slate-400 mt-1 font-mono">id: {triedId ?? "(unknown)"}</p>
          <p className="text-xs text-slate-400 mt-3">
            다른 기기/탭에서 요청한 결재일 수 있어요. 다시 시도하거나 새로 결재를 올려보세요.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={loadApproval}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-[12px] text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              다시 불러오기
            </button>
            <Link
              href="/approval"
              className="inline-flex items-center h-9 px-4 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              결재함으로
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const formMeta = APPROVAL_FORMS.find((f) => f.key === req.form);
  const currentStep = req.line.find((s) => s.status === "current");

  function handleApprove(comment?: string) {
    if (!req || !currentStep) return;
    const updated = approvalService.approveStep(req.id, currentStep.step, comment);
    if (updated) {
      setReq(updated);
      toast.success(
        updated.status === "완료"
          ? "최종 결재 완료!"
          : `${currentStep.name} 결재 → 다음 단계로`,
      );
    }
  }

  function handleReject(comment: string) {
    if (!req || !currentStep) return;
    if (!comment.trim()) {
      toast.warning("반려 사유를 입력해주세요");
      return;
    }
    const updated = approvalService.rejectStep(req.id, currentStep.step, comment);
    if (updated) {
      setReq(updated);
      toast.warning("결재가 반려되었습니다");
    }
  }

  function handleCancel() {
    if (!req) return;
    if (!confirm("이 결재를 회수할까요? 결재선 진행이 중단됩니다.")) return;
    const updated = approvalService.cancelRequest(req.id);
    if (updated) {
      setReq(updated);
      toast.info("결재를 회수했습니다");
    } else {
      toast.error("회수할 수 없는 상태입니다");
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto pb-20">
        {/* 헤더 + 뒤로 */}
        <div className="flex items-center justify-between py-3">
          <Link
            href="/approval"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            결재함
          </Link>
          <span className="text-[11px] text-slate-400 font-mono">{req.docNo}</span>
        </div>

        <ApprovalDocHeader req={req} formMeta={formMeta} />

        <div className="mt-3">
          <ApprovalLinePanel req={req} />
        </div>

        <div className="mt-3">
          <ApprovalActions
            req={req}
            onApprove={handleApprove}
            onReject={handleReject}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </AppShell>
  );
}
