"use client";

/**
 * 결재선 선택 다이얼로그
 *
 * - 결재 양식 선택 (education/leave/expense/purchase/report/memo)
 * - 결재선 단계 추가/삭제 (이름 + 직위)
 * - 미리보기
 */
import { useState } from "react";
import { Plus, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPROVAL_FORMS } from "@/lib/features/approval";
import type { ApprovalFormKey, ApprovalLineInput } from "@/lib/features/approval";

const SUGGESTED_LINE: ApprovalLineInput[] = [
  { name: "박은수", position: "지원교사" },
  { name: "왕준하", position: "센터장" },
];

type Props = {
  documentTitle: string;
  snippet?: string;
  onClose: () => void;
  onSubmit: (input: { form: ApprovalFormKey; line: ApprovalLineInput[]; urgent: boolean }) => void;
};

export function ApprovalRequestDialog({ documentTitle, snippet, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ApprovalFormKey>("report");
  const [line, setLine] = useState<ApprovalLineInput[]>(SUGGESTED_LINE);
  const [urgent, setUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function addStep() {
    setLine((prev) => [...prev, { name: "", position: "" }]);
  }

  function removeStep(idx: number) {
    setLine((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateStep(idx: number, key: "name" | "position", value: string) {
    setLine((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setLine((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveDown(idx: number) {
    if (idx === line.length - 1) return;
    setLine((prev) => {
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  function handleSubmit() {
    // validate
    if (line.length === 0) {
      alert("결재선을 1단계 이상 추가해주세요.");
      return;
    }
    if (line.some((s) => !s.name.trim() || !s.position.trim())) {
      alert("결재자 이름과 직위를 모두 입력해주세요.");
      return;
    }
    setSubmitting(true);
    onSubmit({ form, line, urgent });
    // close는 부모에서 처리
  }

  const formMeta = APPROVAL_FORMS.find((f) => f.key === form);

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-slate-900 m-0">결재 올리기</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              결재선이 모두 승인하면 완료 처리됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* 문서 정보 (read-only) */}
          <section>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              문서
            </h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
              <div className="text-[13px] font-semibold text-slate-900 truncate">
                {documentTitle}
              </div>
              {snippet && (
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {snippet}
                </div>
              )}
            </div>
          </section>

          {/* 결재 양식 */}
          <section>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              결재 양식
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {APPROVAL_FORMS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setForm(f.key)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-left border transition text-[12px]",
                    form === f.key
                      ? "bg-brand-50 border-brand-300 text-brand-700 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span className="text-lg leading-none">{f.emoji}</span>
                  <span className="truncate">{f.label}</span>
                </button>
              ))}
            </div>
            {formMeta && (
              <p className="text-[11px] text-slate-400 mt-1.5">💡 {formMeta.description}</p>
            )}
          </section>

          {/* 결재선 */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                결재선 ({line.length}단계)
              </h3>
              <button
                onClick={addStep}
                className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-700 font-semibold"
              >
                <Plus className="w-3 h-3" />
                단계 추가
              </button>
            </div>
            <div className="space-y-1.5">
              {line.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="w-4 h-4 grid place-items-center text-slate-400 hover:text-slate-700 disabled:opacity-30 text-[10px]"
                      aria-label="위로"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === line.length - 1}
                      className="w-4 h-4 grid place-items-center text-slate-400 hover:text-slate-700 disabled:opacity-30 text-[10px]"
                      aria-label="아래로"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold grid place-items-center shrink-0">
                    {idx + 1}
                  </div>
                  <input
                    value={step.name}
                    onChange={(e) => updateStep(idx, "name", e.target.value)}
                    placeholder="이름"
                    className="flex-1 min-w-0 h-7 px-2 bg-slate-50 border border-slate-200 rounded text-[12px] focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                  <input
                    value={step.position}
                    onChange={(e) => updateStep(idx, "position", e.target.value)}
                    placeholder="직위"
                    className="w-28 h-7 px-2 bg-slate-50 border border-slate-200 rounded text-[12px] focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                  <button
                    onClick={() => removeStep(idx)}
                    disabled={line.length === 1}
                    className="w-6 h-6 grid place-items-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30"
                    aria-label="삭제"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 긴급 */}
          <section>
            <label className="flex items-center gap-2 text-[13px] text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="w-4 h-4 accent-red-500"
              />
              <span>긴급 결재로 표시 (결재자에게 알림 강조)</span>
            </label>
          </section>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            onClick={onClose}
            className="h-9 px-4 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-9 px-5 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg transition inline-flex items-center gap-1.5"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            결재 요청
          </button>
        </div>
      </div>
    </div>
  );
}
