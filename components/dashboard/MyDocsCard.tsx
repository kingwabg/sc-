"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { docStorage } from "@/lib/docs/storage";
import type { DocSummary } from "@/lib/docs/types";

export function MyDocsCard() {
  const [docs, setDocs] = useState<DocSummary[] | null>(null);

  useEffect(() => {
    docStorage.list().then(setDocs);
  }, []);

  const list = (docs ?? []).slice(0, 5);

  return (
    <article className="card-base p-[18px] pb-3.5 flex flex-col min-w-0">
      <header className="flex items-center justify-between mb-3.5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 tracking-tight m-0">
          <span className="text-brand-600 w-[18px] h-[18px] grid place-items-center">
            <FileText className="w-[18px] h-[18px]" />
          </span>
          내 문서
        </h2>
        <Link
          href="/docs"
          className="inline-flex items-center gap-0.5 text-xs text-slate-500 font-medium hover:text-brand-700 transition"
        >
          <Plus className="w-3 h-3" />새 문서
        </Link>
      </header>

      {docs === null ? (
        <div className="text-[12px] text-slate-400 py-6 text-center">불러오는 중…</div>
      ) : list.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[13px] text-slate-500 mb-3">아직 작성한 문서가 없어요</div>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 text-[12px] text-brand-600 font-semibold hover:text-brand-700"
          >
            <Plus className="w-3 h-3" />
            첫 문서 만들기
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col">
          {list.map((d) => (
            <li
              key={d.id}
              className="border-b border-dashed border-slate-200 last:border-b-0"
            >
              <Link
                href={`/docs/${d.id}`}
                className="block py-2.5 hover:bg-slate-50 -mx-2 px-2 rounded transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-slate-900 truncate">
                    {d.title || "제목 없는 문서"}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatRelative(d.updatedAt)}
                  </span>
                </div>
                <div className="text-[12px] text-slate-500 mt-0.5 truncate">
                  {d.snippet || "본문이 비어 있습니다"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
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
