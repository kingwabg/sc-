"use client";

/**
 * ApprovalDocHeader — 결재 상세 헤더
 *
 * P11-1의 app/approval/doc/[id]/_components/ApprovalDocHeader.tsx와 별도 namespace
 */
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { ApprovalRequest, ApprovalForm } from "@/lib/features/approval/types";
import { cn } from "@/lib/utils";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const STATUS_TONE: Record<
  ApprovalRequest["status"],
  { label: string; bg: string; text: string; ring: string }
> = {
  결재중: { label: "결재중",  bg: "bg-blue-50",    text: "text-blue-700",    ring: "ring-blue-200" },
  완료:   { label: "완료",    bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  반려:   { label: "반려",    bg: "bg-red-50",     text: "text-red-700",     ring: "ring-red-200" },
  회수:   { label: "회수",    bg: "bg-slate-100",  text: "text-slate-600",   ring: "ring-slate-200" },
};

interface Props {
  req: ApprovalRequest;
  formMeta?: ApprovalForm;
}

export function ApprovalDocHeader({ req, formMeta }: Props) {
  const tone = STATUS_TONE[req.status];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-6">
      {/* 상태 + 긴급 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={cn("inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-semibold ring-1", tone.bg, tone.text, tone.ring)}>
          {tone.label}
        </span>
        {req.urgent && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold ring-1 ring-red-200">
            🔥 긴급
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold text-slate-900 m-0">{req.title}</h1>

      {/* 메타 */}
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

      {/* 미리보기 */}
      {req.snippet && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg text-[12px] text-slate-600 border-l-2 border-brand-300">
          {req.snippet}
        </div>
      )}

      {/* 원본 문서 링크 */}
      <Link
        href={req.documentUrl}
        className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-brand-600 hover:text-brand-700 font-semibold"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        원본 문서 열기 →
      </Link>
    </div>
  );
}
