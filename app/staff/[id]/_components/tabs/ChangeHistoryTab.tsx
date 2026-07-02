"use client";

/**
 * ChangeHistoryTab — 종사자 상세 > 변경이력 탭
 *
 * 컬럼: 변경일시 / 변경필드 / 변경전 / 변경후 / 변경자
 * 자동 diff 표시 (added/removed highlight)
 */

import { useState, useMemo } from "react";
import { History, ArrowRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type Change = {
  id: string;
  at: string;         // ISO datetime
  field: string;      // 변경필드
  before: string;
  after: string;
  author: string;
  category: "인사" | "연락처" | "자격" | "주소" | "계좌" | "기타";
};

const SEED: Change[] = [
  {
    id: "ch1",
    at: "2026-06-12T14:23:00",
    field: "전화번호",
    before: "010-1111-2222",
    after: "010-1111-3333",
    author: "센터장",
    category: "연락처",
  },
  {
    id: "ch2",
    at: "2026-05-30T10:05:00",
    field: "호봉",
    before: "5호봉",
    after: "6호봉",
    author: "시군구청장",
    category: "인사",
  },
  {
    id: "ch3",
    at: "2026-04-08T16:40:00",
    field: "주소",
    before: "경상남도 창원시 의창구 ...",
    after: "경상남도 창원시 성산구 ...",
    author: "본인",
    category: "주소",
  },
  {
    id: "ch4",
    at: "2026-02-15T09:00:00",
    field: "자격증",
    before: "(없음)",
    after: "보육교사 2급",
    author: "본인",
    category: "자격",
  },
  {
    id: "ch5",
    at: "2026-01-22T13:15:00",
    field: "계좌번호",
    before: "***-**-12345",
    after: "***-**-67890",
    author: "본인",
    category: "계좌",
  },
];

const CAT_TONE: Record<Change["category"], string> = {
  인사: "bg-brand-100 text-brand-700",
  연락처: "bg-sky-100 text-sky-700",
  자격: "bg-emerald-100 text-emerald-700",
  주소: "bg-amber-100 text-amber-700",
  계좌: "bg-violet-100 text-violet-700",
  기타: "bg-slate-100 text-slate-600",
};

export function ChangeHistoryTab() {
  const [filter, setFilter] = useState<Change["category"] | "all">("all");
  const filtered = useMemo(
    () => (filter === "all" ? SEED : SEED.filter((c) => c.category === filter)),
    [filter],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-slate-800">변경 이력</h3>
          <span className="text-xs text-slate-500">{filtered.length}건</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {(["all", "인사", "연락처", "자격", "주소", "계좌", "기타"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "h-7 px-2 rounded-md text-[11px] font-medium transition",
                filter === c
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
              )}
            >
              {c === "all" ? "전체" : c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["변경일시", "구분", "변경필드", "변경전", "변경후", "변경자"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                    {c.at.replace("T", " ").slice(0, 16)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded text-[11px] font-medium",
                        CAT_TONE[c.category],
                      )}
                    >
                      {c.category}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700 font-medium">{c.field}</td>
                  <td className="px-3 py-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs line-through">
                      {c.before}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs">
                        {c.after}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{c.author}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-400">
                    선택한 구분의 변경이력이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
