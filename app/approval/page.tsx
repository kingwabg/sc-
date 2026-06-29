"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalSidebar } from "./_components/ApprovalSidebar";
import {
  FileCheck2,
  X,
} from "lucide-react";
import type { ApprovalView } from "@/lib/types/approval";
import { MOCK_PENDING_DOCS, MOCK_COMPLETED_DOCS } from "@/lib/data/approvals";
import { cn } from "@/lib/utils";

export default function ApprovalHomePage() {
  const router = useRouter();

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
          <HomeContent />
        </main>
      </div>
    </AppShell>
  );
}

function HomeContent() {
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

      {/* 결재할 문서가 없습니다 */}
      <div className="px-6 py-12 border-b border-slate-100">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <FileCheck2 className="w-12 h-12 text-slate-200" />
          <p className="text-sm">결재할 문서가 없습니다.</p>
        </div>
      </div>

      {/* 기간 진행 문서 */}
      <div className="border-b border-slate-200">
        <div className="px-6 py-4 flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 m-0">기간 진행 문서</h2>
          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 text-[10px] grid place-items-center font-bold">
            ⓘ
          </span>
        </div>
        <ApprovalDocTable docs={MOCK_PENDING_DOCS} colSpan={6} />
      </div>

      {/* 완료 문서 */}
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