import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalSidebar } from "../_components/ApprovalSidebar";
import { ApprovalListTable } from "./_components/ApprovalListTable";
import { StatsCards } from "../_components/StatsCards";
import { RecentApprovalList } from "../_components/RecentApprovalList";
import { APPROVAL_VIEW_TITLE } from "@/lib/features/approval";
import type { ApprovalView } from "@/lib/features/approval";
import { FOLDER_LABELS } from "@/lib/features/approval-folder";
import type { FolderKey } from "@/lib/features/approval-folder";
import { Clock, Info } from "lucide-react";

const VALID_FOLDERS: ApprovalView[] = [
  "standby",
  "inbox",
  "cc",
  "expected",
  "default",
  "draft",
  "temporary",
  "sign",
  "ccbox",
  "inboxbox",
  "sendbox",
  "appr",
  "dept-default",
  "dept-draft",
  "dept-cc",
  "dept-send",
  "config",
  "inquiry",
];

// P11-3 approval-folder module의 12개 folder key
const FOLDER_KEYS: FolderKey[] = [
  "standby", "inbox", "cc", "expected",
  "default", "draft", "temporary", "sign",
  "ccbox", "inboxbox", "sendbox", "appr",
];

// folder path → ApprovalView mapping
const FOLDER_TO_VIEW: Record<string, ApprovalView> = {
  standby: "standby",
  inbox: "inbox",
  cc: "cc",
  expected: "expected",
  default: "default",
  draft: "draft",
  temporary: "temporary",
  sign: "sign",
  ccbox: "ccbox",
  inboxbox: "inboxbox",
  sendbox: "sendbox",
  appr: "appr",
  "dept-default": "dept-default",
  "dept-draft": "dept-draft",
  "dept-cc": "dept-cc",
  "dept-send": "dept-send",
  config: "config",
  inquiry: "inquiry",
  dept: "dept",
};

interface PageProps {
  params: Promise<{ folder: string }>;
}

export default async function ApprovalFolderPage({ params }: PageProps) {
  const { folder } = await params;
  const view = FOLDER_TO_VIEW[folder];

  if (!view || !VALID_FOLDERS.includes(view)) {
    notFound();
  }

  const title = APPROVAL_VIEW_TITLE[view] ?? view;

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <ApprovalSidebar currentFolder={folder} />

        <main>
          {view === "default" ? (
            <DefaultDashboard title={title} />
          ) : (
            <FolderContent view={view} title={title} />
          )}
        </main>
      </div>
    </AppShell>
  );
}

// ─── 기본 문서함 대시보드 ───────────────────────────────
function DefaultDashboard({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      {/* 페이지 헤더 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 m-0">전자결재</h1>
            <p className="text-xs text-slate-500 mt-0.5">다우 전자결재에 오신 것을 환영합니다.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
            <Info className="w-3 h-3" />
            상반기의 끝자락, 새로운 행사는 작은 여유
          </div>
        </div>
      </div>

      {/* 통계 카드 4개 */}
      <StatsCards />

      {/* 최근 결재 목록 */}
      <RecentApprovalList />
    </div>
  );
}

// ─── 일반 폴더 콘텐츠 ───────────────────────────────────
function FolderContent({ view, title }: { view: ApprovalView; title: string }) {
  // 환경설정 / 문서관리는 안내 카드
  if (view === "config" || view === "inquiry") {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        </div>
        <div className="p-10 text-center text-slate-400">
          <div className="w-12 h-12 rounded-full bg-slate-100 grid place-items-center mx-auto mb-3">
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm">{title} 기능은 준비 중입니다.</p>
        </div>
      </div>
    );
  }

  // 12개 folder key → ApprovalListTable 사용
  if (FOLDER_KEYS.includes(view as FolderKey)) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
            <Clock className="w-3 h-3" />
            결재함 폴더별로 조회됩니다.
          </div>
        </div>
        <ApprovalListTable folder={view as FolderKey} />
      </div>
    );
  }

  // dept-* 폴더는 안내 카운
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>
      <div className="p-10 text-center text-slate-400">
        <div className="w-12 h-12 rounded-full bg-slate-100 grid place-items-center mx-auto mb-3">
          <Clock className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm">{title} 기능은 준비 중입니다.</p>
      </div>
    </div>
  );
}
