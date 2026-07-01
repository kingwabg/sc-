/**
 * lib/features/meeting/labels.ts
 *
 * 한국어 라벨 — MeetingType, 페이지/카드/액션 라벨
 */

import type { MeetingType } from "./types";

// ─── MeetingType 한국어 라벨 ───────────────────────────────
export const MEETING_TYPE_LABEL: Record<MeetingType, string> = {
  CHILD_COUNCIL: "아동자치회의",
  GOVERNANCE: "운영위원회",
  STAFF: "종사자회의",
};

export const MEETING_TYPE_LABEL_LONG: Record<MeetingType, string> = {
  CHILD_COUNCIL: "아동자치 회의록",
  GOVERNANCE: "운영위원회 회의록",
  STAFF: "종사자 회의록",
};

// ─── MeetingType 색상 (tailwind) ──────────────────────────
export const MEETING_TYPE_TONE: Record<
  MeetingType,
  { bg: string; text: string; border: string; accent: string }
> = {
  CHILD_COUNCIL: {
    bg: "bg-sky-100",
    text: "text-sky-700",
    border: "border-sky-200",
    accent: "bg-sky-500",
  },
  GOVERNANCE: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-200",
    accent: "bg-indigo-500",
  },
  STAFF: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    accent: "bg-emerald-500",
  },
};

// ─── 운영위원회 결재 상태 ──────────────────────────────────
export const APPROVAL_STATUS_LABEL = {
  PENDING: "결재 대기",
  PENDING_TONE: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  SPAWNED: "결재 자동 생성됨",
  SPAWNED_TONE: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  NONE: "결재 불필요",
  NONE_TONE: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
  },
};

// ─── 페이지 헤더 ──────────────────────────────────────────
export const MEETING_PAGE_TITLE = "회의록";
export const MEETING_PAGE_DESC = "아동자치 · 운영위원회 · 종사자 회의 관리";
export const MEETING_PAGE_DESC_GOVERNANCE =
  "운영위원회 회의록은 저장 시 시설장 → 센터장 결재가 자동 생성됩니다.";

// ─── 탭 라벨 ──────────────────────────────────────────────
export const TAB_ALL = "전체";
export const TAB_CHILD_COUNCIL = MEETING_TYPE_LABEL.CHILD_COUNCIL;
export const TAB_GOVERNANCE = MEETING_TYPE_LABEL.GOVERNANCE;
export const TAB_STAFF = MEETING_TYPE_LABEL.STAFF;

// ─── 통계 카드 ─────────────────────────────────────────────
export const STATS_TOTAL_LABEL = "전체 회의";
export const STATS_CHILD_LABEL = "아동자치";
export const STATS_GOVERNANCE_LABEL = "운영위원회";
export const STATS_STAFF_LABEL = "종사자";
export const STATS_APPROVAL_LABEL = "결재 진행";
export const STATS_APPROVAL_DONE = "결재 완료";

// ─── 빈 상태 ──────────────────────────────────────────────
export const MEETING_EMPTY_TITLE = "등록된 회의록이 없습니다";
export const MEETING_EMPTY_DESC =
  "신규 회의록을 작성하면 회의 종류별로 표시됩니다.";
export const MEETING_EMPTY_BY_TYPE = (typeLabel: string): string =>
  `아직 ${typeLabel} 회의록이 없습니다.`;

// ─── 신규 작성 ────────────────────────────────────────────
export const NEW_MEETING_TITLE = "신규 회의록 작성";
export const NEW_MEETING_DESC = "회의 종류 · 일시 · 안건 · 참석자 · 결정사항 입력";

// ─── 상세 ────────────────────────────────────────────────
export const DETAIL_TITLE = "회의록 상세";
export const DETAIL_EDIT_LABEL = "수정";

// ─── 폼 필드 ──────────────────────────────────────────────
export const FIELD_TYPE = "회의 종류";
export const FIELD_TITLE = "회의 제목";
export const FIELD_HELD_AT = "회의 일시";
export const FIELD_LOCATION = "장소";
export const FIELD_AGENDA = "안건 (줄바꿈으로 구분)";
export const FIELD_CONTENT = "회의 내용 (마크다운/HTML)";
export const FIELD_ATTENDEES = "참석자 (줄바꿈으로 구분)";
export const FIELD_ABSENT = "결석자 (줄바꿈으로 구분)";
export const FIELD_DECISIONS = "결정 사항 (줄바꿈으로 구분)";

// ─── 액션 ────────────────────────────────────────────────
export const SUBMIT_LABEL = "저장";
export const SUBMITTING_LABEL = "저장 중...";
export const CANCEL_LABEL = "취소";
export const NEW_BUTTON_LABEL = "신규 회의록 작성";

// ─── 결재 자동 트리거 안내 ─────────────────────────────────
export const APPROVAL_TRIGGER_TITLE = "결재 자동 트리거";
export const APPROVAL_TRIGGER_DESC_GOVERNANCE =
  "운영위원회 회의록은 저장 시 결재가 자동 생성됩니다 (시설장 → 센터장 2단계).";
export const APPROVAL_TRIGGER_DESC_OTHER =
  "이 회의 종류는 결재가 자동 생성되지 않습니다.";

// ─── 표시 라벨 ─────────────────────────────────────────────
export const LABEL_AGENDA = "안건";
export const LABEL_ATTENDEES = "참석자";
export const LABEL_ABSENT = "결석자";
export const LABEL_DECISIONS = "결정 사항";
export const LABEL_CONTENT = "회의 내용";
export const LABEL_APPROVAL = "연결된 결재";
export const LABEL_NO_APPROVAL = "결재 없음";

// ─── 결재선 표시 ───────────────────────────────────────────
export const APPROVAL_LINE_TITLE = "결재선";
export const APPROVAL_LINE_STEP = (step: number, name: string, position: string): string =>
  `${step}. ${position} ${name}`;