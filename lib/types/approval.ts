/**
 * 결재 도메인 타입
 */

// ─── 결재 양식 ────────────────────────────────────────────
export type ApprovalFormKey =
  | "education"
  | "leave"
  | "expense"
  | "purchase"
  | "report"
  | "memo"
  | "duty_assignment"   // 업무 분장표 (지역아동센터 핵심)
  | "meeting"            // 회의록 (P10 연동)
  | "donation";          // 후원금 영수증 (P8 연동)

export type ApprovalForm = {
  key: ApprovalFormKey;
  label: string;
  emoji: string;
  description: string;
};

// ─── 결재선 ────────────────────────────────────────────────
export type ApprovalStatus = "pending" | "approved" | "current" | "rejected";

export type ApprovalLineStep = {
  step: number;
  name: string;
  position: string;
  status: ApprovalStatus;
};

// ─── 결재 사이드바 뷰 ─────────────────────────────────────
export type ApprovalView =
  | "home"
  | "new"
  | "pending"
  | "received"
  | "cc"
  | "scheduled"
  | "period"
  | "draft"
  | "search"
  | "approved"
  | "dept";

export type ApprovalMailboxTitle = Record<ApprovalView, string>;

// ─── 결재 진행 문서 ───────────────────────────────────────
export type ApprovalDocumentStatus = "결재중" | "완료" | "반려" | "회수";

export type ApprovalDocument = {
  id: string;
  date: string;
  form: string;
  urgent: boolean;
  title: string;
  hasFile: boolean;
  status: ApprovalDocumentStatus;
  docNo?: string;
};