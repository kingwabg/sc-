"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  FileText,
  Folder,
  Plus,
  ChevronRight,
  FileUp,
  Users,
} from "lucide-react";

export default function DocumentsPage() {
  return (
    <AppShell>
      <div className="max-w-6xl">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Folder className="w-6 h-6 text-brand-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">문서관리</h1>
            </div>
            <p className="text-sm text-slate-500 m-0">
              내 문서 · 공유 문서를 한 곳에서 관리합니다
            </p>
          </div>
          <button className="h-10 px-4 bg-brand-600 text-white text-sm font-semibold rounded-[10px] hover:bg-brand-700 transition shadow-sm">
            <Plus className="w-4 h-4 inline -mt-0.5 mr-1" />
            새 문서
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/docs" className="card-base card-hover p-5 group">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 grid place-items-center text-indigo-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">내 문서함</div>
                <div className="text-xs text-slate-500 mt-0.5">Naver SmartEditor 2 (HTML) · 자동저장</div>
                <div className="text-[11px] text-slate-400 mt-2">→ 새 문서 작성 · 목록</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 mt-1" />
            </div>
          </Link>

          <Link href="/docs/hwp" className="card-base card-hover p-5 group">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 grid place-items-center text-rose-600 shrink-0">
                <FileUp className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">HWP 문서함</div>
                <div className="text-xs text-slate-500 mt-0.5">rhwp (Rust + WASM) · 한글 호환</div>
                <div className="text-[11px] text-slate-400 mt-2">→ .hwp / .hwpx 파일 열기</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 mt-1" />
            </div>
          </Link>

          <div className="card-base p-5 md:col-span-2">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 grid place-items-center text-slate-400 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">공유 문서함</div>
                <div className="text-xs text-slate-500 mt-0.5">팀/시설 단위 공유 폴더 · 결재선 · 권한 관리</div>
                <div className="text-[11px] text-slate-400 mt-2">→ 다음 스프린트에서 공개</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}