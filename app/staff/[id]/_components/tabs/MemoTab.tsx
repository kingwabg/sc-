"use client";

/**
 * MemoTab — 종사자 상세 > 메모현황 탭
 *
 * 컬럼: 일자 / 작성자 / 내용 / 중요도
 * 추가/삭제/중요(별표) 토글
 */

import { useState } from "react";
import { Plus, Trash2, Star, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

type Importance = "low" | "normal" | "high";

type Memo = {
  id: string;
  date: string;
  author: string;
  content: string;
  importance: Importance;
};

const SEED: Memo[] = [
  {
    id: "m1",
    date: "2025-06-12",
    author: "센터장",
    content: "학부모 민원 응대 시 친절하게 잘 대응함. 근속 연장 의사가 있음.",
    importance: "high",
  },
  {
    id: "m2",
    date: "2025-04-20",
    author: "복지사",
    content: "다음 진료 예약 5/15 — 정신건강 상담 연계",
    importance: "normal",
  },
  {
    id: "m3",
    date: "2025-03-08",
    author: "센터장",
    content: "신규 입사자 교육 보조 — OJT 역할 수행",
    importance: "low",
  },
];

const IMP_LABEL: Record<Importance, string> = {
  low: "참고",
  normal: "보통",
  high: "중요",
};
const IMP_TONE: Record<Importance, string> = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-sky-100 text-sky-700",
  high: "bg-rose-100 text-rose-700",
};

export function MemoTab() {
  const [rows, setRows] = useState<Memo[]>(SEED);

  function add() {
    const today = new Date().toISOString().slice(0, 10);
    setRows([
      {
        id: `m-${Date.now()}`,
        date: today,
        author: "센터장",
        content: "",
        importance: "normal",
      },
      ...rows,
    ]);
  }
  function update(id: string, patch: Partial<Memo>) {
    setRows(rows.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function remove(id: string) {
    setRows(rows.filter((m) => m.id !== id));
  }
  function togglePin(id: string) {
    setRows(
      rows.map((m) =>
        m.id === id
          ? { ...m, importance: m.importance === "high" ? "normal" : "high" }
          : m,
      ),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-slate-800">메모</h3>
          <span className="text-xs text-slate-500">총 {rows.length}건</span>
        </div>
        <button
          onClick={add}
          className="h-8 px-3 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> 추가
        </button>
      </div>

      <div className="space-y-2">
        {rows.map((m) => (
          <div
            key={m.id}
            className={cn(
              "bg-white border rounded-2xl shadow-card p-3 group",
              m.importance === "high"
                ? "border-rose-200 bg-rose-50/40"
                : "border-slate-200",
            )}
          >
            <div className="flex items-start gap-3">
              <input
                type="date"
                value={m.date}
                onChange={(e) => update(m.id, { date: e.target.value })}
                className="w-36 px-2 h-8 border border-slate-200 rounded-md text-xs shrink-0"
              />
              <input
                value={m.author}
                onChange={(e) => update(m.id, { author: e.target.value })}
                placeholder="작성자"
                className="w-28 px-2 h-8 border border-slate-200 rounded-md text-xs shrink-0"
              />
              <select
                value={m.importance}
                onChange={(e) =>
                  update(m.id, { importance: e.target.value as Importance })
                }
                className={cn(
                  "h-8 px-2 rounded-md border text-[11px] font-medium shrink-0",
                  IMP_TONE[m.importance],
                )}
              >
                <option value="low">참고</option>
                <option value="normal">보통</option>
                <option value="high">중요</option>
              </select>
              <textarea
                value={m.content}
                onChange={(e) => update(m.id, { content: e.target.value })}
                rows={2}
                className="flex-1 px-2 py-1.5 border border-slate-200 rounded-md text-sm resize-none"
              />
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => togglePin(m.id)}
                  className={cn(
                    "p-1.5 rounded transition",
                    m.importance === "high"
                      ? "text-amber-500"
                      : "text-slate-400 hover:text-amber-500",
                  )}
                  aria-label="중요 표시"
                  title="중요 표시 토글"
                >
                  <Star
                    className={cn(
                      "w-4 h-4",
                      m.importance === "high" && "fill-amber-400",
                    )}
                  />
                </button>
                <button
                  onClick={() => remove(m.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                  aria-label="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-sm text-slate-400">
            등록된 메모가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
