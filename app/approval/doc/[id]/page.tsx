"use client";

/**
 * 결재 상세 — 결재선 단계별 진행 상황 + 승인/반려
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  X,
  RotateCcw,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { approvalService } from "@/lib/approvals/service";
import { APPROVAL_FORMS } from "@/lib/data/approvals";
import type { ApprovalRequest, ApprovalStep } from "@/lib/approvals/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const CURRENT_USER = "왕준하"; // mock: 현재 결재자 (mock 환경)

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** URL 경로에서 마지막 segment(=approval id) 추출 — useParams 응답 전에도 안전 */
function readIdFromPath(): string | null {
  if (typeof window === "undefined") return null;
  const m = window.location.pathname.match(/^\/approval\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

const STATUS_TONE: Record<ApprovalRequest["status"], { label: string; bg: string; text: string; ring: string }> = {
  결재중: { label: "결재중", bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200" },
  완료:   { label: "완료",   bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  반려:   { label: "반려",   bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
  회수:   { label: "회수",   bg: "bg-slate-100", text: "text-slate-600", ring: "ring-slate-200" },
};

const STEP_ICON: Record<ApprovalStep["status"], React.ComponentType<{ className?: string }>> = {
  pending:  Clock,
  current:  Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

const STEP_TONE: Record<ApprovalStep["status"], { bg: string; text: string; ring: string; lineBg: string }> = {
  pending:  { bg: "bg-slate-100", text: "text-slate-500", ring: "ring-slate-200", lineBg: "bg-slate-200" },
  current:  { bg: "bg-blue-100",  text: "text-blue-700",  ring: "ring-blue-300",  lineBg: "bg-blue-200" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-300", lineBg: "bg-emerald-200" },
  rejected: { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-300", lineBg: "bg-red-200" },
};

export default function ApprovalDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [req, setReq] = useState<ApprovalRequest | null>(null);
  const [mounted, setMounted] = useState(false);
  const [comment, setComment] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  const loadApproval = useCallback(() => {
    // params.id 신뢰하되 fallback으로 path도 시도
    const id = params?.id ?? readIdFromPath();
    if (!id) return;
    const found = approvalService.get(id);
    setReq(found);
    setLoadAttempt((n) => n + 1);
  }, [params?.id]);

  useEffect(() => {
    setMounted(true);
    loadApproval();
  }, [loadApproval]);

  // [결재 승인/반려/회수] 직후 다른 탭이 변경한 게 있을 수 있으므로 재로드 대비
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
  const statusTone = STATUS_TONE[req.status];
  const currentStep = req.line.find((s) => s.status === "current");
  const isMyTurn = !!currentStep && currentStep.name === CURRENT_USER;
  const isRequester = req.requesterName === "나";
  const canCancel = isRequester && req.status === "결재중";

  function handleApprove() {
    if (!req || !currentStep) return;
    const updated = approvalService.approveStep(req.id, currentStep.step, comment || undefined);
    if (updated) {
      setReq(updated);
      setComment("");
      toast.success(
        updated.status === "완료"
          ? "최종 결재 완료!"
          : `${currentStep.name} 결재 → 다음 단계로`,
      );
    }
  }

  function handleReject() {
    if (!req || !currentStep) return;
    if (!comment.trim()) {
      toast.warning("반려 사유를 입력해주세요");
      return;
    }
    const updated = approvalService.rejectStep(req.id, currentStep.step, comment);
    if (updated) {
      setReq(updated);
      setComment("");
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
        {/* 헤더 */}
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

        {/* 상태 + 제목 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-6 mt-3">
          <div className="flex items-start justify-between gap-3 mb-3">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-semibold ring-1",
                statusTone.bg,
                statusTone.text,
                statusTone.ring,
              )}
            >
              {statusTone.label}
            </span>
            {req.urgent && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold ring-1 ring-red-200">
                🔥 긴급
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 m-0">{req.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-slate-500">
            <span>
              <span className="text-slate-400">양식:</span>{" "}
              {formMeta ? `${formMeta.emoji} ${formMeta.label}` : req.form}
            </span>
            <span>
              <span className="text-slate-400">요청자:</span> {req.requesterName}
            </span>
            <span>
              <span className="text-slate-400">요청일:</span> {formatDate(req.createdAt)}
            </span>
            {req.completedAt && (
              <span>
                <span className="text-slate-400">완료:</span> {formatDate(req.completedAt)}
              </span>
            )}
          </div>

          {req.snippet && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-[12px] text-slate-600 border-l-2 border-brand-300">
              {req.snippet}
            </div>
          )}

          <Link
            href={req.documentUrl}
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-brand-600 hover:text-brand-700 font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            원본 문서 열기 →
          </Link>
        </div>

        {/* 결재선 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-6 mt-3">
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
                      <div className={cn("w-0.5 flex-1 my-1", tone.lineBg)} style={{ minHeight: "32px" }} />
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
                        {step.status === "pending" && "대기"}
                        {step.status === "current" && "결재중"}
                        {step.status === "approved" && "승인"}
                        {step.status === "rejected" && "반려"}
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

        {/* 내 차례: 승인/반려 액션 */}
        {req.status === "결재중" && isMyTurn && currentStep && (
          <div className="bg-blue-50/50 border-2 border-blue-200 rounded-2xl p-5 mt-3">
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
                onClick={handleReject}
                className="h-9 px-4 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition inline-flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                반려
              </button>
              <button
                onClick={handleApprove}
                className="h-9 px-5 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                승인
              </button>
            </div>
          </div>
        )}

        {/* 회수 버튼 (요청자만, 결재중일 때만) */}
        {canCancel && (
          <div className="flex items-center justify-end mt-3">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 h-9 px-4 text-[12px] text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              결재 회수
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
