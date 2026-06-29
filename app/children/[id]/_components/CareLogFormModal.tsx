"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CareLog, CareLogCategory } from "@/lib/features/children/types";
import { careLogCategoryTone } from "@/lib/features/children/utils";

const MOODS = [
  { v: "좋음" as const, Icon: () => <span>😊</span>, tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { v: "보통" as const, Icon: () => <span>😐</span>, tone: "bg-amber-100 text-amber-700 border-amber-200" },
  { v: "나쁨" as const, Icon: () => <span>😟</span>, tone: "bg-red-100 text-red-700 border-red-200" },
];

const CATEGORIES: CareLogCategory[] = ["식사", "학습", "놀이", "투약", "관찰", "특별활동", "기타"];

const inputCls =
  "w-full h-9 px-3 bg-white border border-slate-200 rounded-[10px] text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

type Props = {
  childId: string;
  onClose: () => void;
  onSubmit: (log: Omit<CareLog, "id" | "createdAt">) => void;
};

export function CareLogFormModal({ childId, onClose, onSubmit }: Props) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<CareLogCategory>("관찰");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<"좋음" | "보통" | "나쁨" | undefined>("보통");

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      childId,
      date,
      category,
      title: title.trim(),
      content: content.trim(),
      mood,
      authorName: "박은수 선생님",
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 m-0">관찰일지 작성</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="날짜">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="기분">
              <div className="flex gap-1.5">
                {MOODS.map((m) => {
                  const active = mood === m.v;
                  return (
                    <button
                      key={m.v}
                      onClick={() => setMood(active ? undefined : m.v)}
                      className={cn(
                        "flex-1 h-9 rounded-[10px] text-[12px] font-semibold border transition flex items-center justify-center gap-1",
                        active ? m.tone : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
                      )}
                    >
                      <m.Icon />
                      {m.v}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <Field label="카테고리">
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map((c) => {
                const tone = careLogCategoryTone(c);
                const active = category === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "h-9 rounded-[10px] text-[12px] font-semibold border transition",
                      active
                        ? cn(tone.bg, tone.text, "border-transparent ring-2 ring-brand-300")
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="제목" required>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 국어 독해 연습"
              className={inputCls}
            />
          </Field>

          <Field label="내용" required>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 있었던 일, 행동 특성, 보호자 연락 사항 등"
              className={cn(inputCls, "h-32 resize-none")}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 bg-white border border-slate-200 text-slate-700 text-[13px] font-medium rounded-[10px] hover:bg-slate-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={cn(
              "h-9 px-4 text-white text-[13px] font-semibold rounded-[10px] transition",
              isValid ? "bg-brand-600 hover:bg-brand-700" : "bg-slate-300 cursor-not-allowed",
            )}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-slate-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
