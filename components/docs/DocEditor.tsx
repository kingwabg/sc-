"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Check, Loader2, FileCheck2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { NaverEditor, type NaverEditorHandle } from "./NaverEditor";
import { ApprovalRequestDialog } from "./ApprovalRequestDialog";
import { docStorage } from "@/lib/docs/storage";
import { approvalService } from "@/lib/features/approval";
import type { Doc } from "@/lib/docs/types";
import type { ApprovalFormKey, ApprovalLineInput } from "@/lib/features/approval";
import { useToast } from "@/components/ui/Toast";

type SaveState = "idle" | "saving" | "saved";

export function DocEditor({ docId }: { docId: string }) {
  const router = useRouter();
  const toast = useToast();
  const editorRef = useRef<NaverEditorHandle | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [title, setTitle] = useState("");
  const titleRef = useRef(title);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editorReady, setEditorReady] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialPushDone = useRef(false);

  // Load doc
  useEffect(() => {
    let cancelled = false;
    docStorage.get(docId).then((d) => {
      if (cancelled) return;
      if (!d) {
        router.replace("/docs");
        return;
      }
      setDoc(d);
      setTitle(d.title);
      titleRef.current = d.title;
    });
    return () => {
      cancelled = true;
    };
  }, [docId, router]);

  function scheduleSave(content: string, nextTitle?: string) {
    if (!doc) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const finalTitle = titleRef.current;
      await docStorage.save({ id: doc.id, title: finalTitle, content });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    }, 600);
  }

  function onEditorChange(html: string) {
    if (!doc) return;
    if (!initialPushDone.current) return;
    scheduleSave(html);
  }

  function onEditorReady() {
    setEditorReady(true);
    if (doc && !initialPushDone.current) {
      editorRef.current?.setHTML(doc.content);
      initialPushDone.current = true;
    }
  }

  function onTitleChange(next: string) {
    setTitle(next);
    titleRef.current = next;
    if (!doc) return;
    const content = editorRef.current?.getHTML() ?? doc.content;
    scheduleSave(content, next);
  }

  // Manual save (Ctrl/Cmd+S)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        flushSave();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, title]);

  async function flushSave() {
    if (!doc) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const content = editorRef.current?.getHTML() ?? doc.content;
    setSaveState("saving");
    await docStorage.save({ id: doc.id, title, content });
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 1500);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function onDelete() {
    if (!doc) return;
    if (!confirm("이 문서를 삭제할까요? 되돌릴 수 없습니다.")) return;
    await docStorage.remove(doc.id);
    router.push("/docs");
  }

  async function handleApprovalSubmit(input: {
    form: ApprovalFormKey;
    line: ApprovalLineInput[];
    urgent: boolean;
  }) {
    if (!doc) return;
    // 먼저 현재 내용 저장
    await flushSave();
    // 그 다음 결재 요청 생성
    const content = editorRef.current?.getHTML() ?? doc.content;
    const snippet = content
      .replace(/<style[\s\S]*?<\/style>/g, "")
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 140);
    const req = approvalService.createRequest({
      documentId: doc.id,
      documentUrl: `/docs/${doc.id}`,
      documentKind: "html-doc",
      title: titleRef.current || doc.title,
      form: input.form,
      line: input.line,
      urgent: input.urgent,
      snippet: snippet || undefined,
    });
    setShowApprovalDialog(false);
    toast.success(`결재 요청 완료 (${req.docNo})`);
    // 결재함 상세로 이동
    router.push(`/approval/doc/${req.id}`);
  }

  if (!doc) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          불러오는 중…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto pb-32">
        <div className="flex items-center justify-between py-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={flushSave}
              className="text-xs text-slate-500 hover:text-brand-700 transition"
              title="지금 저장 (⌘S)"
            >
              저장
            </button>
            <SaveIndicator state={saveState} />
            <button
              onClick={() => setShowApprovalDialog(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              결재 올리기
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="제목 없는 문서"
          className="w-full mt-3 mb-4 text-4xl font-bold tracking-tight text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
        />

        <NaverEditor
          ref={editorRef}
          initialHTML=""
          onChange={onEditorChange}
          onReady={onEditorReady}
        />

        {!editorReady && (
          <p className="mt-2 text-xs text-slate-400 text-center">
            에디터 로딩 중…
          </p>
        )}
      </div>

      {showApprovalDialog && doc && (
        <ApprovalRequestDialog
          documentTitle={titleRef.current || doc.title}
          onClose={() => setShowApprovalDialog(false)}
          onSubmit={handleApprovalSubmit}
        />
      )}
    </AppShell>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle")
    return <span className="text-xs text-slate-300">자동 저장 · ⌘S</span>;
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