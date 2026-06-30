"use client";

/**
 * DocumentsPageHeader — 문서 페이지 상단 헤더
 */

import { Plus, Folder } from "lucide-react";

type Props = {
  onNew: () => void;
};

export function DocumentsPageHeader({ onNew }: Props) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Folder className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">문서관리</h1>
        </div>
        <p className="text-sm text-slate-500 m-0">내 문서 · 공유 문서를 한 곳에서 관리합니다</p>
      </div>
      <button
        onClick={onNew}
        className="h-10 px-4 bg-brand-600 text-white text-sm font-semibold rounded-[10px] hover:bg-brand-700 transition shadow-sm"
      >
        <Plus className="w-4 h-4 inline -mt-0.5 mr-1" />
        새 문서
      </button>
    </div>
  );
}