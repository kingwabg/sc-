"use client";

/**
 * DocumentsPage — 문서 허브
 *
 * 모든 "문서성" 데이터를 단일 인덱스로 보여주는 허브:
 *  - HTML 문서 (/docs)
 *  - HWP (/docs/hwp)
 *  - 아동카드 observations
 *  - 돌봄일지
 *  - 아동 첨부 문서
 *
 * 각 항목 클릭 시 원본 위치로 이동.
 */

import { useEffect, useMemo, useState } from "react";
import { FileText, FileUp, Users, Filter } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { documentService } from "@/lib/documents/service";
import type {
  DocumentIndexEntry,
  DocumentKind,
} from "@/lib/documents/types";
import { MOCK_CHILDREN } from "@/lib/features/children/data";
import { DocumentsPageHeader } from "./_components/DocumentsPageHeader";
import { DocumentCard } from "./_components/DocumentCard";
import { DocumentIndexTable, KIND_META } from "./_components/DocumentIndexTable";
import { cn } from "@/lib/utils";

type KindFilter = DocumentKind | "all";

const KIND_FILTERS: { value: KindFilter; label: string }[] = [
  { value: "all",            label: "전체" },
  { value: "html-doc",       label: KIND_META["html-doc"].label },
  { value: "approval-doc",   label: KIND_META["approval-doc"].label },
  { value: "child-card",     label: KIND_META["child-card"].label },
  { value: "care-log",       label: KIND_META["care-log"].label },
  { value: "child-document", label: KIND_META["child-document"].label },
  { value: "hwp-doc",        label: KIND_META["hwp-doc"].label },
];

export default function DocumentsPage() {
  const [entries, setEntries] = useState<DocumentIndexEntry[]>([]);
  const [kind, setKind] = useState<KindFilter>("all");
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEntries(documentService.list());
  }, []);

  // childId → 이름 매핑 (mock + extra)
  const childNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of MOCK_CHILDREN) m[c.id] = c.name;
    return m;
  }, []);

  // 필터링
  const filtered = useMemo(() => {
    let list = entries;
    if (kind !== "all") list = list.filter((e) => e.kind === kind);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.snippet?.toLowerCase().includes(q) ?? false),
      );
    }
    return list;
  }, [entries, kind, query]);

  // 종류별 카운트
  const kindCounts = useMemo(() => {
    const counts: Record<string, number> = { all: entries.length };
    for (const e of entries) counts[e.kind] = (counts[e.kind] ?? 0) + 1;
    return counts;
  }, [entries]);

  return (
    <AppShell>
      <div className="max-w-6xl">
        <DocumentsPageHeader
          onNew={() => alert("새 문서 기능은 다음 스프린트에서 공개됩니다.")}
        />

        {/* ── 기존 카드 그리드 (엔트리 포인트) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <DocumentCard
            href="/docs"
            icon={<FileText className="w-6 h-6" />}
            iconBg="bg-indigo-100 text-indigo-600"
            title="내 문서함"
            subtitle="Naver SmartEditor 2 (HTML) · 자동저장"
            hint="→ 새 문서 작성 · 목록"
          />
          <DocumentCard
            href="/docs/hwp"
            icon={<FileUp className="w-6 h-6" />}
            iconBg="bg-rose-100 text-rose-600"
            title="HWP 문서함"
            subtitle="rhwp (Rust + WASM) · 한글 호환"
            hint="→ .hwp / .hwpx 파일 열기"
          />
          <DocumentCard
            icon={<Users className="w-6 h-6" />}
            iconBg="bg-slate-100 text-slate-400"
            title="공유 문서함"
            subtitle="팀/시설 단위 공유 폴더 · 결재선 · 권한 관리"
            hint="→ 다음 스프린트에서 공개"
            disabled
            className="md:col-span-2"
          />
        </div>

        {/* ── 🆕 통합 문서 인덱스 ── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
          <header className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 m-0 flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-500" />
                모든 문서 활동
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                HTML/HWP/아동카드/돌봄일지/아동문서 — 어디서 만들었든 한 곳에서.
              </p>
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목/내용 검색…"
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-brand-500 focus:bg-white w-64"
            />
          </header>

          {/* 종류 필터 칩 */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-1.5 flex-wrap">
            {KIND_FILTERS.map((f) => {
              const count = kindCounts[f.value] ?? 0;
              const active = kind === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setKind(f.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium transition",
                    active
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 테이블 */}
          <div className="p-3">
            {mounted ? (
              <DocumentIndexTable
                entries={filtered}
                childNameById={childNameById}
              />
            ) : (
              <div className="h-32 grid place-items-center text-slate-400 text-sm">
                불러오는 중…
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
