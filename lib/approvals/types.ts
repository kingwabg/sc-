/**
 * 결재 요청 도메인 타입
 *
 * "결재선에 올라간 문서" — HTML/HWP 등 어떤 문서든 결재 요청 가능.
 * 결재선 step별로 승인/반려 진행.
 */

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

/** 결재 양식 (기존 ApprovalFormKey 재사용) */
export type ApprovalFormKey = "education" | "leave" | "expense" | "purchase" | "report" | "memo";

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
  documentKind: "html-doc" | "hwp-doc" | "child-card" | "care-log" | "child-document" | "other";
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
