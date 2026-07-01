/**
 * 결재-folder Feature Module — types
 *
 * 12개 결재함 folder별 리스트 타입 (P11-1 approval module과 별도 namespace)
 */

// ─── Folder Key ───────────────────────────────────────────
export type FolderKey =
  | "standby"
  | "inbox"
  | "cc"
  | "expected"
  | "default"
  | "draft"
  | "temporary"
  | "sign"
  | "ccbox"
  | "inboxbox"
  | "sendbox"
  | "appr";

// ─── 결재 문서 상태 ───────────────────────────────────────
export type DocStatus = "결재중" | "완료" | "반려" | "회수";

// ─── 결재선 단계 ─────────────────────────────────────────
export type StepStatus = "pending" | "current" | "approved" | "rejected";

export type ApprovalStep = {
  step: number;
  name: string;
  position: string;
  status: StepStatus;
  actedAt?: number;
  comment?: string;
};

// ─── 결재 목록 아이템 ─────────────────────────────────────
export type ApprovalListItem = {
  id: string;
  date: string;           // 기안일 (YYYY-MM-DD)
  form: string;            // 결재양식 라벨
  formKey: string;         // education / leave / expense / purchase / report / memo
  urgent: boolean;
  title: string;
  hasFile: boolean;
  docNo?: string;          // 문서번호
  status: DocStatus;
  // 결재선 미리보기 (최대 3단계)
  line: Pick<ApprovalStep, "step" | "name" | "status">[];
};
