/**
 * 결재 Feature Module — types
 *
 * From lib/types/approval.ts (sidebar views) + lib/approvals/types.ts (request domain)
 */

// ─── 결재 양식 ────────────────────────────────────────────
export type ApprovalFormKey =
  | "education"
  | "leave"
  | "expense"
  | "purchase"
  | "report"
  | "memo";

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
  | "standby" // 결재 대기 문서
  | "inbox" // 결재 수신 문서
  | "cc" // 참조/열람 대기 문서
  | "expected" // 결재 예정 문서
  | "default" // 기본 문서함
  | "draft" // 기안 문서함
  | "temporary" // 임시 저장함
  | "sign" // 결재 문서함
  | "ccbox" // 참조/열람 문서함
  | "inboxbox" // 수신 문서함
  | "sendbox" // 발송 문서함
  | "appr" // 공문 문서함
  | "dept-default" // 부서 기본 문서함
  | "dept-draft" // 부서 기안 완료함
  | "dept-cc" // 부서 참조함
  | "dept-send" // 부서 공문 발송함
  | "config" // 환경설정
  | "inquiry" // 양식별 문서 조회
  | "dept"; // 부서 문서함 (레거시)

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

// ─── 결재 요청 도메인 타입 ────────────────────────────────
export type ApprovalRequestStatus = "결재중" | "완료" | "반려" | "회수";

export type ApprovalStepStatus = "pending" | "current" | "approved" | "rejected";

export type ApprovalStep = {
  /** 1부터 시작하는 결재 순서 */
  step: number;
  /** 결재자 이름 (mock) */
  name: string;
  /** 결재자 직위 */
  position: string;
  /** 현재 결재 상태 */
  status: ApprovalStepStatus;
  /** 결재 일시 (epoch ms) — approved/rejected 시에만 */
  actedAt?: number;
  /** 결재 코멘트 (선택) */
  comment?: string;
};

/**
 * 결재 요청 — 원본 문서를 가리키는 참조.
 * 결재선 통과/반려 시 status가 변경됨.
 */
export type ApprovalRequest = {
  id: string;
  /** 원본 문서 ID (예: docStorage id) */
  documentId: string;
  /** 원본 문서 URL (예: "/docs/abc123") */
  documentUrl: string;
  /** 원본 문서 종류 (kind) */
  documentKind:
    | "html-doc"
    | "hwp-doc"
    | "child-card"
    | "care-log"
    | "child-document"
    | "other";
  /** 결재 제목 (보통 문서 제목) */
  title: string;
  /** 결재 양식 (education/leave/expense/purchase/report/memo) */
  form: ApprovalFormKey;
  /** 요청자 */
  requesterId: string;
  requesterName: string;
  /** 결재선 (1단계부터 순서대로) */
  line: ApprovalStep[];
  /** 전체 상태 */
  status: ApprovalRequestStatus;
  /** 긴급 여부 */
  urgent: boolean;
  /** 첨부 파일 여부 (mock) */
  hasFile: boolean;
  /** 문서번호 (mock, 결재 등록 시 자동 생성) */
  docNo?: string;
  /** 본문 미리보기 (선택) */
  snippet?: string;
  /** 요청 일시 */
  createdAt: number;
  /** 완료/반려/회수 일시 */
  completedAt?: number;
};

/** 결재선 입력용 (status 없는 raw form) */
export type ApprovalLineInput = {
  name: string;
  position: string;
};

// ─── Portal용 결재 진행 현황 ─────────────────────────────
export type PortalApprovalItem = {
  id: string;
  status: "대기" | "진행" | "완료" | "반려";
  title: string;
  date: string;
};

export const STATUS_TONE: Record<PortalApprovalItem["status"], string> = {
  대기: "bg-amber-100 text-amber-700",
  진행: "bg-blue-100 text-blue-700",
  완료: "bg-emerald-100 text-emerald-700",
  반려: "bg-red-100 text-red-700",
};
