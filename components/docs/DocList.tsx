"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, Trash2, Search, Loader2, FileUp } from "lucide-react";
import { docStorage } from "@/lib/docs/storage";
import type { DocSummary } from "@/lib/docs/types";

export function DocList() {
  const router = useRouter();
  const [docs, setDocs] = useState<DocSummary[] | null>(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  async function refresh() {
    const list = await docStorage.list();
    setDocs(list);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate() {
    if (creating) return;
    setCreating(true);
    const doc = await docStorage.create();
    router.push(`/docs/${doc.id}`);
  }

  async function onDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("이 문서를 삭제할까요?")) return;
    await docStorage.remove(id);
    refresh();
  }

  if (docs === null) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        불러오는 중…
      </div>
    );
  }

  const filtered = query.trim()
    ? docs.filter(
        (d) =>
          d.title.toLowerCase().includes(query.toLowerCase()) ||
          d.snippet.toLowerCase().includes(query.toLowerCase())
      )
    : docs;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0 mb-1">내 문서</h1>
          <p className="text-sm text-slate-500 m-0">
            {docs.length}개의 문서 · 자동으로 저장됩니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/docs/hwp"
            className="inline-flex items-center gap-1.5 h-10 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-[10px] hover:bg-slate-50 transition shadow-sm"
          >
            <FileUp className="w-4 h-4" />
            HWP 파일 열기
          </Link>
          <button
            onClick={onCreate}
            disabled={creating}
            className="inline-flex items-center gap-1.5 h-10 px-4 bg-brand-600 text-white text-sm font-semibold rounded-[10px] hover:bg-brand-700 transition shadow-sm disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            새 문서
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center h-10 px-3 bg-white border border-slate-200 rounded-[10px] mb-4 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목 또는 내용 검색"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
        />
      </div>

      {/* Empty state */}
      {docs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-700 m-0 mb-1">
            아직 문서가 없어요
          </h2>
          <p className="text-sm text-slate-500 m-0 mb-5">
            새 문서를 만들어 시작해 보세요.
          </p>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 h-10 px-4 bg-brand-600 text-white text-sm font-semibold rounded-[10px] hover:bg-brand-700 transition"
          >
            <Plus className="w-4 h-4" />새 문서 만들기
          </button>
        </div>
      ) : (
        <>
          {/* List */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                검색 결과가 없습니다
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/docs/${d.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition group"
                    >
                      <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {d.title || "제목 없는 문서"}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                          {d.snippet || "본문이 비어 있습니다"}
                        </div>
                      </div>
                      <div className="text-right shrink-0 hidden sm:block">
                        <div className="text-[11px] text-slate-400">
                          {formatRelative(d.updatedAt)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {d.wordCount}자
                        </div>
                      </div>
                      <button
                        onClick={(e) => onDelete(d.id, e)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 grid place-items-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
