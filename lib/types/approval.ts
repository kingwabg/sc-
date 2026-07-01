/**
 * 결재 도메인 타입
 */

// ─── 결재 양식 ────────────────────────────────────────────
export type ApprovalFormKey = "education" | "leave" | "expense" | "purchase" | "report" | "memo";

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
// folder key = URL path segment for /approval/[folder]
export type ApprovalView =
  | "home"
  | "new"
  | "standby"   // 결재 대기 문서
  | "inbox"      // 결재 수신 문서
  | "cc"         // 참조/열람 대기 문서
  | "expected"   // 결재 예정 문서
  | "default"    // 기본 문서함
  | "draft"      // 기안 문서함
  | "temporary"  // 임시 저장함
  | "sign"       // 결재 문서함
  | "ccbox"      // 참조/열람 문서함
  | "inboxbox"   // 수신 문서함
  | "sendbox"    // 발송 문서함
  | "appr"       // 공문 문서함
  | "dept-default"  // 부서 기본 문서함
  | "dept-draft"   // 부서 기안 완료함
  | "dept-cc"      // 부서 참조함
  | "dept-send"    // 부서 공문 발송함
  | "config"     // 환경설정
  | "inquiry"    // 양식별 문서 조회
  | "dept";      // 부서 문서함 (레거시)

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