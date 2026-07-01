"use client";

import { useRouter } from "next/navigation";
import { FileCheck2, ArrowLeft } from "lucide-react";
import { CORE_FORM_KEYS, getFormByKey } from "@/lib/features/approval-form";
import type { ApprovalFormKey } from "@/lib/types/approval";

const CARD_META: Record<ApprovalFormKey, { accent: string; icon: string }> = {
  duty_assignment: { accent: "from-violet-500 to-purple-600", icon: "📋" },
  expense:         { accent: "from-emerald-500 to-teal-600",    icon: "💰" },
  leave:           { accent: "from-sky-500 to-blue-600",        icon: "🏖️" },
  purchase:        { accent: "from-orange-500 to-red-500",      icon: "📦" },
  report:          { accent: "from-indigo-500 to-blue-600",      icon: "📊" },
  education:       { accent: "from-amber-500 to-orange-600",     icon: "📚" },
  memo:            { accent: "from-slate-500 to-slate-600",      icon: "📋" },
  meeting:         { accent: "from-rose-500 to-pink-600",        icon: "🗂️" },
  donation:        { accent: "from-pink-500 to-rose-600",        icon: "🎁" },
};

export function FormCardSelector() {
  const router = useRouter();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
        <FileCheck2 className="w-5 h-5 text-brand-600" />
        <h1 className="text-lg font-bold text-slate-900 m-0">새 결재 작성</h1>
        <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          양식 선택
        </span>
      </div>

      {/* 안내 */}
      <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100">
        <p className="text-xs text-slate-500 m-0">
          사용할 결재 양식을 선택하세요. 양식에 맞는 결재선이 자동 제안됩니다.
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {CORE_FORM_KEYS.map((key) => {
            const form = getFormByKey(key);
            if (!form) return null;
            const meta = CARD_META[key];
            return (
              <button
                key={key}
                onClick={() => router.push(`/approval/new/${key}`)}
                className="group relative flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
              >
                {/* 그라데이션 배지 */}
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent} shadow-sm text-white text-lg`}
                >
                  {meta.icon}
                </div>

                {/* 양식명 */}
                <h3 className="font-bold text-slate-900 text-sm mb-1 leading-tight group-hover:text-brand-700 transition-colors">
                  {form.label}
                </h3>

                {/* 설명 */}
                <p className="text-[11px] text-slate-500 leading-relaxed flex-1">
                  {form.description}
                </p>

                {/* 필드 수 표시 */}
                <div className="mt-3 text-[10px] text-slate-400 font-medium">
                  {form.fields.length}개 입력항목
                </div>

                {/* 화살표 */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-brand-500 text-sm">→</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 하단: 모든 양식 보기 */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            더 많은 양식:{" "}
            <span className="font-medium">교육수강, 품의서, 회의록, 후원금</span>
          </p>
          <button
            onClick={() => router.push("/approval")}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 transition"
          >
            <ArrowLeft className="w-3 h-3" />
            결재 홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
