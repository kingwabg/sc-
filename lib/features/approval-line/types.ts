/**
 * Approval-Line Feature — Domain Types
 */
import type { ApprovalFormKey } from "@/lib/types/approval";

// ─── 결재선 단계 유형 ──────────────────────────────────────
export type ApprovalStepType = "결재" | "협조" | "참조" | "시행";

// ─── 결재선 단계 ────────────────────────────────────────────
export type ApprovalLineStepData = {
  step: number;
  name: string;
  position: string;
  /** 결재/협조/참조/시행 */
  type: ApprovalStepType;
  status: "pending" | "current" | "approved" | "rejected";
};

// ─── 결재선 ────────────────────────────────────────────────
export type ApprovalLineData = {
  id: string;
  tenantId: string;
  name: string;
  form: ApprovalFormKey;
  steps: ApprovalLineStepData[];
};
