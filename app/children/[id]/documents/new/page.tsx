"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  TEXT_CATEGORIES,
  CHILD_DOCUMENT_CATEGORIES,
  categoryTone,
  categoryEmoji,
  saveTextDoc,
  htmlToExcerpt,
} from "@/lib/child-documents";
import type { ChildDocument, ChildDocumentCategory } from "@/lib/child-documents";
import { getChildById } from "@/lib/children";
import { NaverEditor, type NaverEditorHandle } from "@/components/docs/NaverEditor";
import {
  ArrowLeft,
  ChevronRight,
  Save,
  Check,
  Loader2,
  Trash2,
  Baby,
  Calendar,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewTextDocumentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const childId = params?.id ?? "";
  const child = getChildById(childId);

  const [category, setCategory] = useState<ChildDocumentCategory>("아동상담");
  const [title, setTitle] = useState("");
  const [issuedAt, setIssuedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<NaverEditorHandle | null>(null);

  useEffect(() => {
    // Auto-suggest title from category + date
    if (!title && child) {
      setTitle(`${category} (${issuedAt})`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

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

  function onSave() {
    if (!editorRef.current || !editorReady) return;
    setSaveState("saving");
    const html = editorRef.current.getHTML() || "";
    const doc: ChildDocument = {
      id: `txt-${Date.now()}`,
      childId: child!.id,
      title: title.trim() || `${category} (${issuedAt})`,
      category,
      kind: "text",
      issuedAt,
      content: html,
      excerpt: htmlToExcerpt(html),
      uploadedBy: "박은수 선생님",
      createdAt: Date.now(),
      tags: tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    saveTextDoc(doc);
    setSaveState("saved");
    setTimeout(() => router.push(`/children/${child!.id}/documents`), 700);
  }

  function onCancel() {
    if (!confirm("작성 중인 내용이 사라집니다. 취소할까요?")) return;
    router.push(`/children/${child!.id}/documents`);
  }

  function onClear() {
    if (!editorRef.current) return;
    if (!confirm("본문을 모두 지울까요?")) return;
    editorRef.current.setHTML("");
  }

  const tone = categoryTone(category);
  const emoji = categoryEmoji(category);

  return (
    <AppShell>
      <div className="max-w-4xl">
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
          <Link href={`/children/${child.id}/documents`} className="hover:text-slate-900">
            문서관리
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 font-semibold">새 문서 작성</span>
        </div>

        {/* Header */}
        <div className="card-base p-5 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl grid place-items-center text-xl font-bold shrink-0",
                child.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700",
              )}
            >
              {child.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Baby className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-500">{child.name} ({child.grade})</span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-500">문서 작성 중</span>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="문서 제목 (예: 분노 조절 상담 6/15)"
                className="w-full text-xl font-bold text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
            {/* Category */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                카테고리
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ChildDocumentCategory)}
                  className={cn(
                    "appearance-none w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-[10px] text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200",
                  )}
                >
                  {TEXT_CATEGORIES.map((c) => {
                    const meta = CHILD_DOCUMENT_CATEGORIES.find((x) => x.value === c);
                    return (
                      <option key={c} value={c}>
                        {meta?.emoji} {c}
                      </option>
                    );
                  })}
                </select>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                  {emoji}
                </span>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                작성일
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={issuedAt}
                  onChange={(e) => setIssuedAt(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-[10px] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                태그 (쉼표 구분)
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="예: 1:1 상담, 감정코칭"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-[10px] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>

          {/* Category description */}
          <div className={cn("mt-3 px-3 py-2 rounded-lg text-[12px]", tone)}>
            <Sparkles className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
            {category === "아동상담" && "1:1 또는 소그룹 상담 기록. 관찰 배경, 상담 내용, 후속 조치 등을 자유 형식으로 작성하세요."}
            {category === "보호자 상담" && "학부모/보호자와의 면담 기록. 참석자, 안건, 합의 사항을 정리하면 다음 상담에 도움됩니다."}
            {category === "관찰일지" && "특정 시점의 관찰 내용. 장소, 관찰 사항, 종합 평가를 작성해 발달 추이를 추적하세요."}
          </div>
        </div>

        {/* Editor */}
        <div className="mb-4">
          <NaverEditor
            ref={editorRef}
            initialHTML=""
            onChange={() => {}}
            onReady={() => setEditorReady(true)}
          />
        </div>

        {/* Footer actions */}
        <div className="card-base p-3 flex items-center justify-between gap-2 flex-wrap sticky bottom-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="h-9 px-3 text-[13px] font-medium text-slate-600 hover:text-red-600 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              본문 비우기
            </button>
            <SaveIndicator state={saveState} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="h-9 px-4 bg-white border border-slate-200 rounded-[10px] text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              취소
            </button>
            <button
              onClick={onSave}
              disabled={!editorReady || saveState === "saving"}
              className="h-9 px-4 bg-brand-600 text-white rounded-[10px] text-[13px] font-semibold hover:bg-brand-700 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              저장
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" }) {
  if (state === "idle")
    return <span className="text-xs text-slate-300 inline-flex items-center gap-1">⌘S 저장</span>;
  if (state === "saving")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        저장 중…
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
      <Check className="w-3 h-3" />
      저장됨
    </span>
  );
}