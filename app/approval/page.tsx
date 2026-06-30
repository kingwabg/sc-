"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalSidebar } from "./_components/ApprovalSidebar";
import {
  FileCheck2,
  X,
  Loader2,
} from "lucide-react";
import type { ApprovalView } from "@/lib/types/approval";
import { MOCK_PENDING_DOCS, MOCK_COMPLETED_DOCS, APPROVAL_FORMS } from "@/lib/data/approvals";
import { approvalService } from "@/lib/approvals/service";
import type { ApprovalRequest } from "@/lib/approvals/types";
import { cn } from "@/lib/utils";

export default function ApprovalHomePage() {
  const router = useRouter();
  const [liveReqs, setLiveReqs] = useState<ApprovalRequest[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLiveReqs(approvalService.list());
  }, []);

  function handleSelect(view: ApprovalView) {
    if (view === "new") {
      router.push("/approval/new");
    } else if (view !== "home") {
      router.push(`/approval/${view}`);
    }
  }

  function handleWrite() {
    router.push("/approval/new");
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <ApprovalSidebar current="home" onSelect={handleSelect} onWrite={handleWrite} />

        <main>
          <HomeContent liveReqs={liveReqs} mounted={mounted} />
        </main>
      </div>
    </AppShell>
  );
}

function HomeContent({ liveReqs, mounted }: { liveReqs: ApprovalRequest[]; mounted: boolean }) {
  const pending = liveReqs.filter((r) => r.status === "결재중");
  const completed = liveReqs.filter((r) => r.status === "완료");
  const rejected = liveReqs.filter((r) => r.status === "반려");
  const cancelled = liveReqs.filter((r) => r.status === "회수");

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      {/* 헤더 + 알림 */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-900 m-0">전자결재 홈</h1>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
          <span>상반기의 끝자락, 새로운 행사는 작은 여유</span>
          <button className="text-slate-400 hover:text-slate-900">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 🆕 진행 중인 결재 (실데이터) */}
      <div className="border-b border-slate-200">
        <div className="px-6 py-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-900 m-0">진행 중인 결재</h2>
          <span className="text-[11px] text-slate-400">({pending.length}건)</span>
        </div>
        {mounted ? (
          <LiveApprovalList reqs={pending} emptyMsg="결재 진행 중인 문서가 없어요." />
        ) : (
          <div className="px-6 py-10 text-center text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
            불러오는 중…
          </div>
        )}
      </div>

      {/* 완료된 결재 */}
      {completed.length > 0 && (
        <div className="border-b border-slate-200">
          <div className="px-6 py-4 flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 m-0">완료된 결재</h2>
            <span className="text-[11px] text-slate-400">({completed.length}건)</span>
          </div>
          <LiveApprovalList reqs={completed} emptyMsg="" />
        </div>
      )}

      {/* 반려/회수 */}
      {(rejected.length > 0 || cancelled.length > 0) && (
        <div className="border-b border-slate-200">
          <div className="px-6 py-4 flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-700 m-0">반려 / 회수</h2>
            <span className="text-[11px] text-slate-400">
              ({rejected.length + cancelled.length}건)
            </span>
          </div>
          <LiveApprovalList
            reqs={[...rejected, ...cancelled]}
            emptyMsg=""
          />
        </div>
      )}

      {/* 기간 진행 문서 (mock) */}
      <div className="border-b border-slate-200">
        <div className="px-6 py-4 flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 m-0">기간 진행 문서</h2>
          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 text-[10px] grid place-items-center font-bold">
            ⓘ
          </span>
        </div>
        <ApprovalDocTable docs={MOCK_PENDING_DOCS} colSpan={6} />
      </div>

      {/* 완료 문서 (mock) */}
      <div>
        <div className="px-6 py-4 flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 m-0">완료 문서</h2>
          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 text-[10px] grid place-items-center font-bold">
            ⓘ
          </span>
        </div>
        <ApprovalDocTable docs={MOCK_COMPLETED_DOCS} colSpan={7} showDocNo />
      </div>
    </div>
  );
}

function LiveApprovalList({ reqs, emptyMsg }: { reqs: ApprovalRequest[]; emptyMsg: string }) {
  if (reqs.length === 0 && emptyMsg) {
    return (
      <div className="px-6 py-10 text-center text-slate-400 text-xs">
        {emptyMsg}
      </div>
    );
  }
  if (reqs.length === 0) return null;
  return (
    <ul className="divide-y divide-slate-100">
      {reqs.map((req) => {
        const formMeta = APPROVAL_FORMS.find((f) => f.key === req.form);
        const currentStep = req.line.find((s) => s.status === "current");
        const totalSteps = req.line.length;
        const approvedCount = req.line.filter((s) => s.status === "approved").length;
        return (
          <li key={req.id}>
            <Link
              href={`/approval/doc/${req.id}`}
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition"
            >
              <span className="text-xl shrink-0">{formMeta?.emoji ?? "📋"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold text-slate-900 truncate">
                    {req.title}
                  </span>
                  {req.urgent && <span className="text-[10px] text-red-600 font-bold">🔥긴급</span>}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                  <span>{formMeta?.label ?? req.form}</span>
                  <span>·</span>
                  <span>{req.requesterName}</span>
                  <span>·</span>
                  <span className="font-mono">{req.docNo}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <StatusBadge status={req.status} />
                {req.status === "결재중" && (
                  <div className="text-[10px] text-slate-500 mt-1 tabular-nums">
                    {approvedCount}/{totalSteps} 단계
                    {currentStep && ` · ${currentStep.name}`}
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function StatusBadge({ status }: { status: ApprovalRequest["status"] }) {
  const tone: Record<ApprovalRequest["status"], string> = {
    결재중: "bg-blue-50 text-blue-700 ring-blue-200",
    완료: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    반려: "bg-red-50 text-red-700 ring-red-200",
    회수: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span
      className={cn(
        "inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold ring-1",
        tone[status],
      )}
    >
      {status}
    </span>
  );
}

function ApprovalDocTable({
  docs,
  colSpan,
  showDocNo,
}: {
  docs: typeof MOCK_PENDING_DOCS;
  colSpan: number;
  showDocNo?: boolean;
}) {
  return (
    <table className="w-full text-sm">
      <thead className="border-t border-b border-slate-200 bg-slate-50/40">
        <tr className="text-[11px] font-semibold text-slate-500">
          <th className="text-left px-3 py-2 w-[100px]">기안일</th>
          <th className="text-left px-3 py-2">결재양식</th>
          <th className="text-center px-3 py-2 w-[60px]">긴급</th>
          <th className="text-left px-3 py-2">제목</th>
          <th className="text-center px-3 py-2 w-[60px]">첨부</th>
          {showDocNo && <th className="text-left px-3 py-2 w-[140px]">문서번호</th>}
          <th className="text-left px-3 py-2 w-[100px]">결재상태</th>
        </tr>
      </thead>
      <tbody>
        {docs.length === 0 ? (
          <tr>
            <td colSpan={colSpan} className="text-center py-10 text-slate-400 text-xs">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 grid place-items-center">
                  🐹
                </div>
                문서가 없습니다.
              </div>
            </td>
          </tr>
        ) : (
          docs.map((doc) => (
            <tr key={doc.id} className="hover:bg-slate-50 transition border-b border-slate-100">
              <td className="px-3 py-2 text-slate-600">{doc.date}</td>
              <td className="px-3 py-2 text-slate-900">{doc.form}</td>
              <td className="px-3 py-2 text-center text-slate-400">{doc.urgent ? "🔥" : "—"}</td>
              <td className="px-3 py-2 text-slate-900">{doc.title}</td>
              <td className="px-3 py-2 text-center">
                {doc.hasFile && <span className="inline-block w-3 h-3 bg-slate-300 rounded-sm" title="첨부파일" />}
              </td>
              {showDocNo && (
                <td className="px-3 py-2 text-slate-600 font-mono text-[12px]">{doc.docNo}</td>
              )}
              <td className="px-3 py-2">
                <span className="inline-block text-[11px] px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-700 bg-emerald-50 font-semibold">
                  {doc.status}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
