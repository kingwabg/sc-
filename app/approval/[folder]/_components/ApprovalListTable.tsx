"use client";

/**
 * ApprovalListTable — 결재함 folder별 목록 테이블
 *
 * P11-1의 app/approval/_components/ApprovalDocTable.tsx와 별도 namespace
 * 12개 folder별 2~3건 mock 데이터 표시
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Paperclip, Flame, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { approvalService, APPROVAL_FORMS, type ApprovalRequest } from "@/lib/features/approval";
import { getListByFolder, FOLDER_LABELS } from "@/lib/features/approval-folder";
import type { ApprovalListItem, FolderKey } from "@/lib/features/approval-folder";
import { COL_LABELS } from "@/lib/features/approval-folder/labels";
import { STEP_COLOR, getInitial } from "@/lib/features/approval-folder/utils";

interface Props {
  folder: FolderKey;
}

// ─── Status Badge ─────────────────────────────────────────
function StatusBadge({ status }: { status: ApprovalListItem["status"] }) {
  const tone: Record<ApprovalListItem["status"], string> = {
    결재중: "bg-blue-50 text-blue-700 ring-blue-200",
    완료:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
    반려:   "bg-red-50 text-red-700 ring-red-200",
    회수:   "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span className={cn("inline-block text-[11px] px-2 py-0.5 rounded font-semibold ring-1",
      tone[status] ?? "bg-slate-100 text-slate-600")}>
      {status}
    </span>
  );
}

// ─── Line Preview ─────────────────────────────────────────
function LinePreview({ line }: { line: ApprovalListItem["line"] }) {
  if (line.length === 0) {
    return <span className="text-slate-300 text-[12px]">—</span>;
  }
  return (
    <div className="flex items-center gap-1">
      {line.slice(0, 3).map((s, i) => (
        <span key={i} className={cn(
          "w-5 h-5 rounded-full text-[10px] font-bold grid place-items-center",
          STEP_COLOR[s.status] ?? "bg-slate-100 text-slate-500"
        )}>
          {getInitial(s.name)}
        </span>
      ))}
      {line.length > 3 && (
        <span className="text-slate-400 text-[10px]">+{line.length - 3}</span>
      )}
    </div>
  );
}

// ─── Table ───────────────────────────────────────────────
export function ApprovalListTable({ folder }: Props) {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const mockItems = useMemo(() => getListByFolder(folder), [folder]);
  const items = useMemo(
    () => [...getLocalItemsByFolder(folder, requests), ...mockItems],
    [folder, mockItems, requests],
  );

  useEffect(() => {
    setRequests(approvalService.list());
    function onVisible() {
      if (document.visibilityState === "visible") setRequests(approvalService.list());
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-t border-b border-slate-200 bg-slate-50/40">
          <tr className="text-[11px] font-semibold text-slate-500">
            <th className="text-left px-4 py-2.5 w-[110px]">{COL_LABELS.date}</th>
            <th className="text-left px-3 py-2.5 w-[130px]">{COL_LABELS.form}</th>
            <th className="text-center px-3 py-2.5 w-[60px]">{COL_LABELS.urgent}</th>
            <th className="text-left px-3 py-2.5 min-w-[200px]">{COL_LABELS.title}</th>
            <th className="text-center px-3 py-2.5 w-[60px]">{COL_LABELS.hasFile}</th>
            <th className="text-left px-3 py-2.5 w-[160px]">{COL_LABELS.docNo}</th>
            <th className="text-left px-3 py-2.5 w-[100px]">{COL_LABELS.status}</th>
            <th className="text-left px-3 py-2.5 w-[160px]">{COL_LABELS.line}</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-16 text-slate-400 text-xs">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 grid place-items-center">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-600 mb-0.5">문서가 없습니다</p>
                    <p className="text-slate-400">
                      {FOLDER_LABELS[folder]}에 문서가 없습니다.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/60 transition border-b border-slate-100 cursor-pointer"
              >
                <td className="px-4 py-2.5 text-slate-600 text-[12px]">{item.date}</td>
                <td className="px-3 py-2.5 text-slate-800 text-[12.5px]">{item.form}</td>
                <td className="px-3 py-2.5 text-center">
                  {item.urgent
                    ? <Flame className="w-4 h-4 text-red-500 inline-block" />
                    : <span className="text-slate-300 text-[12px]">—</span>}
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={item.id.startsWith("local:") ? `/approval/doc/${item.id.slice(6)}` : `/approval/doc/${item.id}`}
                    className="text-slate-900 font-medium text-[13px] hover:text-brand-600 hover:underline"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {item.hasFile
                    ? <Paperclip className="w-3.5 h-3.5 text-slate-400 inline-block" />
                    : <span className="text-slate-300 text-[12px]">—</span>}
                </td>
                <td className="px-3 py-2.5 text-slate-600 font-mono text-[12px]">
                  {item.docNo ?? "—"}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-3 py-2.5">
                  <LinePreview line={item.line} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function getLocalItemsByFolder(folder: FolderKey, requests: ApprovalRequest[]): ApprovalListItem[] {
  if (folder !== "standby" && folder !== "inbox" && folder !== "sign" && folder !== "default") {
    return [];
  }

  return requests
    .filter((request) => {
      if (folder === "standby" || folder === "inbox") return request.status === "결재중";
      return request.status === "완료" || request.status === "반려" || request.status === "회수";
    })
    .map((request) => {
      const formLabel = APPROVAL_FORMS.find((form) => form.key === request.form)?.label ?? request.form;
      return {
        id: `local:${request.id}`,
        date: new Date(request.createdAt).toISOString().slice(0, 10),
        form: formLabel,
        formKey: request.form,
        urgent: request.urgent,
        title: request.title,
        hasFile: request.hasFile,
        docNo: request.docNo,
        status: request.status,
        line: request.line.map((step) => ({
          step: step.step,
          name: step.name,
          status: step.status,
        })),
      };
    });
}
