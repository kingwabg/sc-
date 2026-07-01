/**
 * 결재-folder Feature Module — utils
 *
 * 결재선 렌더링 helper
 */
import type { ApprovalListItem } from "./types";

/** 결재선 프로필 이니셜 */
export function getInitial(name: string): string {
  return name.charAt(0);
}

/** 결재선 단계 상태 → 색상 클래스 */
export const STEP_COLOR: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  current:  "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  pending:  "bg-slate-100 text-slate-500",
};

/** 결재선 최대 3단계 미리보기 */
export function getLinePreview(item: ApprovalListItem) {
  return item.line.slice(0, 3);
}

/** 진행률: approved 수 / 전체 */
export function getProgress(item: ApprovalListItem): string {
  const total = item.line.length;
  if (total === 0) return "0/0";
  const done = item.line.filter((s) => s.status === "approved").length;
  return `${done}/${total}`;
}
