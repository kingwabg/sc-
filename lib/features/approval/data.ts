/**
 * 결재 Feature Module — mock data
 */
import type {
  ApprovalForm,
  ApprovalDocument,
  ApprovalView,
  PortalApprovalItem,
} from "./types";

// ─── 결재 양식 ────────────────────────────────────────────
export const APPROVAL_FORMS: ApprovalForm[] = [
  { key: "education", label: "교육수강신청", emoji: "📚", description: "외부 교육/세미나/연수 신청" },
  { key: "leave", label: "휴가신청서", emoji: "🏖️", description: "연차/반차/병가/경조" },
  { key: "expense", label: "지출결의서", emoji: "💰", description: "업무 관련 지출 내역" },
  { key: "purchase", label: "물품구매품의서", emoji: "📦", description: "비품/물품 구매 신청" },
  { key: "report", label: "업무보고서", emoji: "📊", description: "주간/월간 업무 보고" },
  { key: "memo", label: "품의서", emoji: "📋", description: "일반 사내 품의" },
];

// ─── 결재선 (mock) ────────────────────────────────────────
export const APPROVAL_LINE: import("./types").ApprovalLineStep[] = [
  { step: 1, name: "박은수", position: "지원교사", status: "approved" },
  { step: 2, name: "김선영", position: "지원교사", status: "approved" },
  { step: 3, name: "김영미", position: "所长", status: "current" },
];

// ─── 결재 홈 mock 데이터 ──────────────────────────────────
export const MOCK_PENDING_DOCS: ApprovalDocument[] = [];

export const MOCK_COMPLETED_DOCS: ApprovalDocument[] = [
  {
    id: "doc-001",
    date: "2024-01-02",
    form: "업무분장표",
    urgent: false,
    title: "협업 변호료",
    hasFile: true,
    status: "완료",
    docNo: "서점제휴이벤트-2024-00001",
  },
];

// ─── 뷰별 제목 ────────────────────────────────────────────
export const APPROVAL_VIEW_TITLE: Record<ApprovalView, string> = {
  home: "전자결재 홈",
  new: "새 결재 작성",
  // 그룹 1: 결재하기
  standby: "결재 대기 문서",
  inbox: "결재 수신 문서",
  cc: "참조/열람 대기 문서",
  expected: "결재 예정 문서",
  // 그룹 2: 개인 문서함
  default: "기본 문서함",
  draft: "기안 문서함",
  temporary: "임시 저장함",
  sign: "결재 문서함",
  ccbox: "참조/열람 문서함",
  inboxbox: "수신 문서함",
  sendbox: "발송 문서함",
  appr: "공문 문서함",
  // 그룹 3: 부서 문서함
  "dept-default": "부서 기본 문서함",
  "dept-draft": "기안 완료함",
  "dept-cc": "부서 참조함",
  "dept-send": "공문 발송함",
  // 그룹 4: 환경설정
  config: "전자결재 환경설정",
  // 그룹 5: 전자결재 문서관리
  inquiry: "양식별 문서 조회",
  dept: "부서 문서함",
};

// ─── Portal용 결재 진행 현황 ──────────────────────────────
export const APPROVALS: PortalApprovalItem[] = [
  { id: "a1", status: "대기", title: "휴가신청서 (7월 1일~3일)", date: "07-01" },
  { id: "a2", status: "진행", title: "지출결의서 - 클라이언트 미팅", date: "06-28" },
  { id: "a3", status: "대기", title: "구매품의서 - 디자인 시안 검수", date: "06-28" },
  { id: "a4", status: "진행", title: "출장신청 - 부산 본사 방문", date: "06-27" },
  { id: "a5", status: "완료", title: "사내 동호회 지원금 신청", date: "06-25" },
];
