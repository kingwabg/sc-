/**
 * app/facility/inspection/_components/NewInspectionClient.tsx
 *
 * Client Component — 신규 점검: 카테고리 선택 → 템플릿 자동 생성
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardCheck, ShieldCheck, Thermometer, BookOpen, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Button } from "rsuite";
import type { InspectionCategory } from "@prisma/client";
import {
  INSPECTION_CATEGORY_LABELS,
  INSPECTION_CATEGORY_TONE,
  INSPECTION_CATEGORY_EMOJI,
  ALL_INSPECTION_TEMPLATES,
  type InspectionTemplate,
} from "@/lib/features/inspection/labels";

// ─── Category Card ────────────────────────────────────────

const CATEGORY_ICONS: Record<InspectionCategory, React.ReactNode> = {
  FIRE_SAFETY: <ShieldCheck className="w-7 h-7" />,
  HYGIENE: <Thermometer className="w-7 h-7" />,
  EDUCATION: <BookOpen className="w-7 h-7" />,
  EMERGENCY: <AlertTriangle className="w-7 h-7" />,
  ETC: <FileText className="w-7 h-7" />,
};

const CATEGORY_BG: Record<string, string> = {
  red: "bg-red-50 border-red-200 hover:bg-red-100",
  blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  green: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  orange: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  slate: "bg-slate-50 border-slate-200 hover:bg-slate-100",
};

function CategoryCard({
  template,
  selected,
  onSelect,
}: {
  template: InspectionTemplate;
  selected: boolean;
  onSelect: (t: InspectionTemplate) => void;
}) {
  const tone = INSPECTION_CATEGORY_TONE[template.category];
  const bg = CATEGORY_BG[tone] ?? CATEGORY_BG.slate;
  const icon = CATEGORY_ICONS[template.category];

  return (
    <button
      onClick={() => onSelect(template)}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${bg} ${
        selected ? "border-indigo-400 ring-2 ring-indigo-200" : "border-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          tone === "red" ? "text-red-500 bg-red-100"
          : tone === "blue" ? "text-blue-500 bg-blue-100"
          : tone === "green" ? "text-emerald-500 bg-emerald-100"
          : tone === "orange" ? "text-orange-500 bg-orange-100"
          : "text-slate-500 bg-slate-100"
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            {INSPECTION_CATEGORY_EMOJI[template.category]}{" "}
            {template.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            점검 항목 {template.items.length}개
          </p>
          {/* 미리보기 첫 2개 */}
          <ul className="mt-2 space-y-0.5">
            {template.items.slice(0, 2).map((item, i) => (
              <li key={i} className="text-xs text-slate-400 truncate">
                • {item}
              </li>
            ))}
            {template.items.length > 2 && (
              <li className="text-xs text-slate-400">
                … 외 {template.items.length - 2}개
              </li>
            )}
          </ul>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

// ─── Component ─────────────────────────────────────────

export function NewInspectionClient() {
  const router = useRouter();
  const [selected, setSelected] = useState<InspectionTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/inspection/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selected.category,
          title: selected.title,
          items: selected.items.map((label, idx) => ({ label, position: idx + 1 })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/facility/inspection/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* 설명 */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3">
        <p className="text-sm text-indigo-700">
          <ClipboardCheck className="w-4 h-4 inline-block mr-1 mb-0.5" />
          점검 항목을 선택하면 해당 템플릿 기반으로 점검표가 자동 생성됩니다.
          항목별로 적합/부적합 여부를 체크리스트로 기록하세요.
        </p>
      </div>

      {/* 카테고리 선택 */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">점검 카테고리 선택</p>
        {ALL_INSPECTION_TEMPLATES.map((t) => (
          <CategoryCard
            key={t.category}
            template={t}
            selected={selected?.category === t.category}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* 시작 버튼 */}
      <Button
        block
        size="lg"
        appearance="primary"
        disabled={!selected}
        loading={loading}
        onClick={handleStart}
        style={{ backgroundColor: "#4F46E5", borderColor: "#4F46E5" }}
      >
        {selected ? `"${selected.title}" 점검 시작` : "점검 카테고리를 선택하세요"}
      </Button>
    </div>
  );
}
