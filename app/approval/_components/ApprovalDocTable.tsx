"use client";

import Link from "next/link";
import { Paperclip, Flame, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApprovalView } from "@/lib/types/approval";
import type { ApprovalDocument } from "@/lib/types/approval";
import { MOCK_PENDING_DOCS, MOCK_COMPLETED_DOCS } from "@/lib/data/approvals";

interface ApprovalDocTableProps {
  view: ApprovalView;
}

// folder별 문서 조회 (mock – 실제 구현 시 API 호출)
function getDocsForView(view: ApprovalView): ApprovalDocument[] {
  switch (view) {
    case "standby":
    case "inbox":
    case "cc":
    case "expected":
      return MOCK_PENDING_DOCS;
    case "sign":
    case "inboxbox":
    case "sendbox":
    case "appr":
      return MOCK_COMPLETED_DOCS;
    case "default":
    case "draft":
    case "temporary":
    case "ccbox":
      return [];
    case "dept-default":
    case "dept-draft":
    case "dept-cc":
    case "dept-send":
      return MOCK_COMPLETED_DOCS;
    default:
      return [];
  }
}

// 결재상태 Badge
function StatusBadge({ status }: { status: ApprovalDocument["status"] }) {
  const tone: Record<ApprovalDocument["status"], string> = {
    결재중: "bg-blue-50 text-blue-700 ring-blue-200",
    완료: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    반려: "bg-red-50 text-red-700 ring-red-200",
    회수: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span
      className={cn(
        "inline-block text-[11px] px-2 py-0.5 rounded font-semibold ring-1",
        tone[status] ?? "bg-slate-100 text-slate-600",
      )}
    >
      {status}
    </span>
  );
}

export function ApprovalDocTable({ view }: ApprovalDocTableProps) {
  const docs = getDocsForView(view);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-t border-b border-slate-200 bg-slate-50/40">
          <tr className="text-[11px] font-semibold text-slate-500">
            <th className="text-left px-4 py-2.5 w-[110px]">기안일</th>
            <th className="text-left px-3 py-2.5 w-[130px]">결재양식</th>
            <th className="text-center px-3 py-2.5 w-[60px]">긴급</th>
            <th className="text-left px-3 py-2.5 min-w-[200px]">제목</th>
            <th className="text-center px-3 py-2.5 w-[60px]">첨부</th>
            <th className="text-left px-3 py-2.5 w-[160px]">문서번호</th>
            <th className="text-left px-3 py-2.5 w-[100px]">결재상태</th>
            <th className="text-left px-3 py-2.5 w-[160px]">결재선</th>
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-16 text-slate-400 text-xs">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 grid place-items-center">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-600 mb-0.5">문서가 없습니다</p>
                    <p className="text-slate-400">선택한 결재함에 문서가 없습니다.</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            docs.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-slate-50/60 transition border-b border-slate-100 cursor-pointer"
              >
                <td className="px-4 py-2.5 text-slate-600 text-[12px]">{doc.date}</td>
                <td className="px-3 py-2.5 text-slate-800 text-[12.5px]">{doc.form}</td>
                <td className="px-3 py-2.5 text-center">
                  {doc.urgent ? (
                    <Flame className="w-4 h-4 text-red-500 inline-block" />
                  ) : (
                    <span className="text-slate-300 text-[12px]">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/approval/doc/${doc.id}`}
                    className="text-slate-900 font-medium text-[13px] hover:text-brand-600 hover:underline"
                  >
                    {doc.title}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {doc.hasFile ? (
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 inline-block" />
                  ) : (
                    <span className="text-slate-300 text-[12px]">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-slate-600 font-mono text-[12px]">
                  {doc.docNo ?? "—"}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-3 py-2.5 text-slate-500 text-[12px]">
                  {/* mock 결재선 미리보기 */}
                  <div className="flex items-center gap-1">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold grid place-items-center">
                      박
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold grid place-items-center">
                      김
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold grid place-items-center">
                      정
                    </span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
