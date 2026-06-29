"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  getAllDocumentsForChild,
  CHILD_DOCUMENT_CATEGORIES,
  categoryTone,
  categoryEmoji,
  fileSizeLabel,
  isExpiringSoon,
  isTextCategory,
} from "@/lib/child-documents";
import type { ChildDocument, ChildDocumentCategory } from "@/lib/child-documents";
import { getChildById, ageFromBirthDate } from "@/lib/children";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Plus,
  FileText,
  Upload,
  Download,
  Filter,
  AlertTriangle,
  Clock,
  Tag,
  FileUp,
  PencilLine,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterCat = ChildDocumentCategory | "all" | "expiring";

export default function ChildDocumentsPage() {
  const params = useParams<{ id: string }>();
  const childId = params?.id ?? "";
  const child = getChildById(childId);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterCat>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stored, setStored] = useState<ChildDocument[]>([]);

  // Hydrate stored text docs from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const list: ChildDocument[] = JSON.parse(
          localStorage.getItem("office-portal:child-text-docs:v1") ?? "[]",
        );
        setStored(list.filter((d) => d.childId === childId));
      } catch {
        /* noop */
      }
    }
  }, [childId]);

  const allDocs = useMemo(() => {
    return [...getAllDocumentsForChild(childId), ...stored];
  }, [childId, stored]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allDocs.length };
    for (const cat of CHILD_DOCUMENT_CATEGORIES) c[cat.value] = 0;
    let expiring = 0;
    for (const d of allDocs) {
      c[d.category] = (c[d.category] ?? 0) + 1;
      if (isExpiringSoon(d).expiring || isExpiringSoon(d).expired) expiring++;
    }
    c.expiring = expiring;
    return c;
  }, [allDocs]);

  const filtered = useMemo(() => {
    return allDocs
      .filter((d) => {
        if (filter === "all") return true;
        if (filter === "expiring") return isExpiringSoon(d).expiring || isExpiringSoon(d).expired;
        return d.category === filter;
      })
      .filter((d) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          (d.tags ?? []).some((t) => t.toLowerCase().includes(q))
        );
      });
  }, [allDocs, filter, query]);

  if (!child) {
    return (
      <AppShell>
        <div className="text-center py-20 text-slate-500">
          아동을 찾을 수 없습니다.{" "}
          <Link href="/children" className="text-brand-600 underline">
            목록
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3 flex-wrap">
          <Link href="/children" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            아동 목록
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/children/${child.id}`} className="hover:text-slate-900">
            {child.name}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 font-semibold">문서관리</span>
        </div>

        {/* Hero */}
        <div className="card-base p-5 mb-5">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-xl grid place-items-center text-xl font-bold shrink-0",
                child.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700",
              )}
            >
              {child.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 m-0">{child.name} 문서함</h1>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                  {child.grade}
                </span>
                <span className="text-[11px] text-slate-500">
                  만 {ageFromBirthDate(child.birthDate)}세
                </span>
              </div>
              <p className="text-sm text-slate-500 m-0">
                총 <b className="text-slate-900 font-bold">{allDocs.length}건</b>
                {counts.expiring ? (
                  <>
                    {" "}· <span className="text-amber-600 font-semibold">만료 임박 {counts.expiring}건</span>
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/children/${child.id}/card`}
                className="h-9 px-3 bg-white border border-slate-200 rounded-[10px] text-[13px] font-medium text-slate-700 hover:border-brand-600 hover:text-brand-700 transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                카드
              </Link>
              <button className="h-9 px-3 bg-brand-600 text-white rounded-[10px] text-[13px] font-semibold hover:bg-brand-700 transition flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                업로드
              </button>
              <Link
                href={`/children/${child.id}/documents/new`}
                className="h-9 px-3 bg-white border border-slate-200 rounded-[10px] text-[13px] font-medium text-slate-700 hover:border-brand-600 hover:text-brand-700 transition flex items-center gap-1.5"
              >
                <PencilLine className="w-3.5 h-3.5" />
                새 상담 작성
              </Link>
            </div>
          </div>
        </div>

        {/* Category filter bar */}
        <div className="card-base p-3 mb-4 overflow-x-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label="전체"
              count={counts.all}
              tone="default"
            />
            <FilterChip
              active={filter === "expiring"}
              onClick={() => setFilter("expiring")}
              label="⚠️ 만료 임박"
              count={counts.expiring}
              tone="amber"
            />
            <span className="mx-1 h-5 w-px bg-slate-200" />
            {CHILD_DOCUMENT_CATEGORIES.map((c) => (
              <FilterChip
                key={c.value}
                active={filter === c.value}
                onClick={() => setFilter(c.value)}
                label={`${c.emoji} ${c.value}`}
                count={counts[c.value] ?? 0}
                tone="ghost"
              />
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center h-10 px-3 bg-white border border-slate-200 rounded-[10px] shadow-sm mb-4">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목 / 카테고리 / 태그 검색"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
          />
        </div>

        {/* Document list */}
        <div className="space-y-2">
          {filtered.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              expanded={expandedId === doc.id}
              onToggle={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm bg-white border border-dashed border-slate-200 rounded-2xl">
              조건에 맞는 문서가 없습니다
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="mt-6 text-center text-[11px] text-slate-400">
          모든 문서는 암호화되어 저장되며, {child.guardian.name} ({child.guardian.relation})님만 열람 가능합니다
        </div>
      </div>
    </AppShell>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone: "default" | "amber" | "ghost";
}) {
  const base =
    "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition shrink-0";
  const cls = active
    ? "bg-brand-600 text-white"
    : tone === "amber"
    ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
    : tone === "default"
    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
    : "bg-white border border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-700";
  return (
    <button onClick={onClick} className={cn(base, cls)}>
      {label}
      <span
        className={cn(
          "min-w-5 h-5 px-1 rounded-full text-[10px] font-bold grid place-items-center",
          active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function DocumentRow({
  doc,
  expanded,
  onToggle,
}: {
  doc: ChildDocument;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tone = categoryTone(doc.category);
  const emoji = categoryEmoji(doc.category);
  const exp = isExpiringSoon(doc);
  const isText = isTextCategory(doc.category) || doc.kind === "text";

  return (
    <div className="card-base overflow-hidden hover:shadow-card-hover transition-shadow">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-4 text-left"
      >
        {/* File icon */}
        <div className={cn("w-12 h-12 rounded-xl grid place-items-center text-2xl shrink-0", tone)}>
          {emoji}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn("text-[11px] px-1.5 py-0.5 rounded font-semibold", tone)}>
              {doc.category}
            </span>
            <span className="text-[11px] text-slate-500">{isText ? "작성" : "발급"} {doc.issuedAt}</span>
            {!isText && doc.expiresAt && (
              <span className={cn(
                "text-[11px] px-1.5 py-0.5 rounded font-semibold",
                exp.expired ? "bg-red-100 text-red-700" : exp.expiring ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600",
              )}>
                {exp.expired ? "만료됨" : `만료 ${doc.expiresAt}${exp.daysLeft !== undefined && exp.daysLeft > 0 ? ` (D-${exp.daysLeft})` : ""}`}
              </span>
            )}
            {isText && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-semibold">
                ✍️ 에디터 작성
              </span>
            )}
          </div>
          <div className="font-semibold text-slate-900">{doc.title}</div>
          {isText && doc.excerpt && (
            <div className="text-[12px] text-slate-500 mt-1 line-clamp-2">{doc.excerpt}</div>
          )}
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
            {isText ? (
              <>
                <span>작성자: {doc.uploadedBy}</span>
                {doc.tags && doc.tags.length > 0 && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {doc.tags.join(", ")}
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <span>{fileSizeLabel(doc.fileSize ?? 0)}</span>
                <span>·</span>
                <span className="uppercase">{doc.fileType}</span>
                <span>·</span>
                <span>업로드: {doc.uploadedBy}</span>
                {doc.tags && doc.tags.length > 0 && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {doc.tags.join(", ")}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {isText ? (
            <Link
              href={`/children/${doc.childId}/documents/new`}
              className="w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              title="수정"
            >
              <PencilLine className="w-4 h-4" />
            </Link>
          ) : (
            <button className="w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition" title="다운로드">
              <Download className="w-4 h-4" />
            </button>
          )}
          <ChevronRight
            className={cn("w-4 h-4 text-slate-400 transition shrink-0", expanded && "rotate-90")}
          />
        </div>
      </button>

      {expanded && isText && (
        <div className="px-5 pb-5 pt-1 bg-slate-50/50 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2 mt-3 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            본문 미리보기
          </div>
          <div
            className="prose prose-sm max-w-none bg-white border border-slate-200 rounded-lg p-4 prose-headings:text-base prose-headings:font-semibold prose-h2:mt-3 prose-h2:mb-1.5 prose-h3:mt-2 prose-h3:mb-1 prose-p:my-1.5 prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5"
            dangerouslySetInnerHTML={{ __html: doc.content || "(비어 있음)" }}
          />
        </div>
      )}
    </div>
  );
}