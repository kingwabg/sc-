/**
 * app/facility/inspection/_components/InspectionListClient.tsx
 *
 * Client Component — 점검 목록 렌더링
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ClipboardCheck,
  Plus,
  Search,
} from "lucide-react";
import { Button, Input, InputGroup } from "rsuite";
import type { InspectionVM } from "@/lib/features/inspection";
import type { InspectionCategory } from "@prisma/client";
import {
  INSPECTION_CATEGORY_LABELS,
  INSPECTION_CATEGORY_TONE,
  INSPECTION_CATEGORY_EMOJI,
  INSPECTION_STATUS_LABELS,
  INSPECTION_STATUS_TONE,
  INSPECTION_EMPTY_TITLE,
  INSPECTION_EMPTY_DESC,
} from "@/lib/features/inspection/labels";
import { useState, useMemo } from "react";

// ─── Props ─────────────────────────────────────────────

interface Props {
  inspections: InspectionVM[];
}

// ─── Helpers ───────────────────────────────────────────

function StatusBadge({ status }: { status: InspectionVM["status"] }) {
  const toneMap: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const tone = INSPECTION_STATUS_TONE[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${toneMap[tone] ?? ""}`}
    >
      {INSPECTION_STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Component ─────────────────────────────────────────

export function InspectionListClient({ inspections }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return inspections;
    const q = query.toLowerCase();
    return inspections.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        INSPECTION_CATEGORY_LABELS[i.category].includes(q) ||
        (i.checkedBy ?? "").toLowerCase().includes(q),
    );
  }, [inspections, query]);

  const byCategory = useMemo(() => {
    const map = new Map<InspectionCategory, InspectionVM[]>();
    for (const ins of filtered) {
      const list = map.get(ins.category) ?? [];
      list.push(ins);
      map.set(ins.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* 검색 + 신규버튼 */}
      <div className="flex items-center gap-2">
        <InputGroup style={{ flex: 1 }}>
          <InputGroup.Addon>
            <Search className="w-3.5 h-3.5 text-slate-400" />
          </InputGroup.Addon>
          <Input
            value={query}
            onChange={setQuery}
            placeholder="점검명, 카테고리 검색"
          />
        </InputGroup>
        <Button
          appearance="primary"
          startIcon={<Plus className="w-4 h-4" />}
          onClick={() => router.push("/facility/inspection/new")}
          style={{ backgroundColor: "#4F46E5", borderColor: "#4F46E5" }}
        >
          신규 점검
        </Button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">{INSPECTION_EMPTY_TITLE}</p>
          <p className="text-slate-400 text-sm mt-1">{INSPECTION_EMPTY_DESC}</p>
          <Button
            className="mt-4"
            appearance="primary"
            startIcon={<Plus className="w-4 h-4" />}
            onClick={() => router.push("/facility/inspection/new")}
            style={{ backgroundColor: "#4F46E5", borderColor: "#4F46E5" }}
          >
            신규 점검 시작
          </Button>
        </div>
      )}

      {/* 카테고리별分组列表 */}
      {Array.from(byCategory.entries()).map(([category, items]) => (
        <div key={category} className="space-y-2">
          {/* 카테고리 헤더 */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-sm font-semibold text-slate-700">
              {INSPECTION_CATEGORY_EMOJI[category]} {INSPECTION_CATEGORY_LABELS[category]}
            </span>
            <span className="text-xs text-slate-400">{items.length}건</span>
          </div>

          {/* 점검 카드 */}
          <div className="space-y-2">
            {items.map((ins) => (
              <Link
                key={ins.id}
                href={`/facility/inspection/${ins.id}`}
                className="block bg-white border border-slate-200 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {ins.title}
                      </p>
                      <StatusBadge status={ins.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{formatDate(ins.checkedAt)}</span>
                      {ins.checkedBy && <span>점검자: {ins.checkedBy}</span>}
                      <span>항목 {ins.items.length}개</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
