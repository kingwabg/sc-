"use client";

import { useRouter, useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalSidebar } from "../_components/ApprovalSidebar";
import { ArrowLeft, FileCheck2, Inbox } from "lucide-react";
import type { ApprovalView } from "@/lib/types/approval";
import { APPROVAL_VIEW_TITLE } from "@/lib/data/approvals";

const VALID_FOLDERS: ApprovalView[] = [
  "pending",
  "received",
  "cc",
  "scheduled",
  "period",
  "draft",
  "search",
  "approved",
  "dept",
];

export default function ApprovalFolderPage() {
  const router = useRouter();
  const params = useParams<{ folder: string }>();
  const folder = params.folder as ApprovalView;
  const isValid = VALID_FOLDERS.includes(folder);
  const title = APPROVAL_VIEW_TITLE[folder] ?? "결재함";

  function handleSelect(view: ApprovalView) {
    if (view === "new") router.push("/approval/new");
    else if (view === "home") router.push("/approval");
    else router.push(`/approval/${view}`);
  }

  if (!isValid) {
    return (
      <AppShell>
        <div className="max-w-[600px] mx-auto text-center py-20">
          <div className="text-base font-bold text-slate-900 mb-2">존재하지 않는 결재함이에요</div>
          <button onClick={() => router.push("/approval")} className="text-sm text-brand-600 hover:underline">
            ← 전자결재 홈으로
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <ApprovalSidebar current={folder} onSelect={handleSelect} onWrite={() => router.push("/approval/new")} />

        <main>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <button onClick={() => router.push("/approval")} className="text-xs text-slate-500 hover:text-slate-900">
                <ArrowLeft className="w-3 h-3 inline mr-1" />
                전자결재 홈
              </button>
              <span className="text-slate-300">/</span>
              <h1 className="text-base font-bold text-slate-900 m-0">{title}</h1>
            </div>

            {/* 빈 상태 */}
            <div className="px-6 py-16 text-center">
              <Inbox className="w-12 h-12 mx-auto text-slate-200 mb-3" />
              <div className="text-sm text-slate-400 mb-1">{title}에 문서가 없습니다</div>
              <div className="text-xs text-slate-400">
                새 결재를 진행하려면 <button onClick={() => router.push("/approval/new")} className="text-brand-600 hover:underline">새 결재 작성</button>으로 이동하세요.
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}