"use client";

import { useState } from "react";
import { X, Paperclip, Send, AlertCircle } from "lucide-react";
import { submitAbsenceReason } from "../actions";
import { ABSENCE_REASON_LABEL } from "@/lib/features/attendance";
import type { AbsenceReason } from "@/lib/features/attendance";
import { cn } from "@/lib/utils";

const ABSENCE_REASONS: AbsenceReason[] = ["DISEASE", "FAMILY", "SCHOOL", "OTHER"];

type Props = {
  childId: string;
  childName: string;
  date: string; // YYYY-MM-DD
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AbsenceReasonModal({
  childId,
  childName,
  date,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [reason, setReason] = useState<AbsenceReason | "">("");
  const [note, setNote] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const dateLabel = (() => {
    const [y, m, d] = date.split("-").map(Number);
    const labels = ["일", "월", "화", "수", "목", "금", "토"];
    return `${y}년 ${m}월 ${d}일 ${labels[new Date(y, m - 1, d).getDay()]}요일`;
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      setError("사유를 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("childId", childId);
      formData.set("date", date);
      formData.set("reason", reason);
      formData.set("note", note);
      formData.set("fileUrl", fileUrl);
      await submitAbsenceReason(formData);
      setReason("");
      setNote("");
      setFileUrl("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출 중 오류가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    setReason("");
    setNote("");
    setFileUrl("");
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="absence-modal-title"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 id="absence-modal-title" className="text-base font-bold text-slate-900">
              결석 사유서
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {childName} · {dateLabel}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="w-8 h-8 rounded-lg grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
          {/* Reason selector */}
          <fieldset>
            <legend className="text-sm font-semibold text-slate-800 mb-2.5 block">
              사유 선택 <span className="text-red-500 ml-0.5">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {ABSENCE_REASONS.map((r) => (
                <label
                  key={r}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition text-sm font-medium",
                    reason === r
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name="absence-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition",
                      reason === r
                        ? "border-brand-500 bg-brand-500"
                        : "border-slate-300",
                    )}
                  >
                    {reason === r && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  {ABSENCE_REASON_LABEL[r]}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Note */}
          <div>
            <label
              htmlFor="absence-note"
              className="text-sm font-semibold text-slate-800 mb-1.5 block"
            >
              메모 <span className="text-slate-400 font-normal">(선택)</span>
            </label>
            <textarea
              id="absence-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="상세 사유를 입력해 주세요. 예) 발열로 인한 병원 방문"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          {/* File attachment */}
          <div>
            <label
              htmlFor="absence-file"
              className="text-sm font-semibold text-slate-800 mb-1.5 block"
            >
              첨부파일 <span className="text-slate-400 font-normal">(선택)</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="absence-file"
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="의료확인서 URL (예: https://...)"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              의료확인서, 확정일정서 등 관련 문서 링크를 입력해 주세요.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="h-10 px-4 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || !reason}
              className="h-10 px-4 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  저장 중…
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  제출하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
