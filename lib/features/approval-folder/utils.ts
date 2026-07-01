// lib/features/approval-folder/utils.ts (P11-3)
import type { ApprovalListItem } from "./types";
import { STATUS_TONE } from "./labels";

export function statusClass(status: ApprovalListItem["status"]): string {
  const tone = STATUS_TONE[status] ?? "slate";
  return {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
  }[tone];
}

export function statusLabel(status: ApprovalListItem["status"]): string {
  return status;
}