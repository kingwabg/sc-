/**
 * lib/features/meeting/index.ts
 *
 * P10 — 회의록 모듈 public API
 *
 * 파일 구성:
 *  - types.ts   : Meeting, MeetingType, MeetingInput, MeetingUpdateInput, CreateMeetingResult, MeetingStats
 *  - mock.ts    : MOCK_MEETINGS (DB 없을 때 fallback)
 *  - data.ts    : server-only queries (getMeeting, listMeetings, createMeeting, updateMeeting, deleteMeeting)
 *                 → 직접 import: `import { listMeetings } from "@/lib/features/meeting/data"`
 *                 - createMeeting은 GOVERNANCE 타입 시 ApprovalRequest 자동 spawn
 *  - utils.ts   : 검증 · 정렬 · 필터 · 통계 · 결재선 정의
 *  - labels.ts  : 한국어 라벨 · 색상 토큰
 *
 * NOTE: data.ts 는 `server-only` 이므로 barrel 을 통해 re-export 하지 않습니다.
 *  - server:  `@/lib/features/meeting/data` 직접
 *  - client:  `@/lib/features/meeting/labels`, `types`, `utils` 직접
 *  - 양쪽 모두: `@/lib/features/meeting/types` (type-only) OK
 */

// ─── 타입 ─────────────────────────────────────────────
export type {
  Meeting,
  MeetingType,
  MeetingInput,
  MeetingUpdateInput,
  SpawnedApproval,
  CreateMeetingResult,
  MeetingStats,
  MeetingListResult,
} from "./types";

// ─── 라벨/색상 ─────────────────────────────────────────
export {
  MEETING_TYPE_LABEL,
  MEETING_TYPE_LABEL_LONG,
  MEETING_TYPE_TONE,
  APPROVAL_STATUS_LABEL,
  MEETING_PAGE_TITLE,
  MEETING_PAGE_DESC,
  MEETING_PAGE_DESC_GOVERNANCE,
  TAB_ALL,
  TAB_CHILD_COUNCIL,
  TAB_GOVERNANCE,
  TAB_STAFF,
  STATS_TOTAL_LABEL,
  STATS_CHILD_LABEL,
  STATS_GOVERNANCE_LABEL,
  STATS_STAFF_LABEL,
  STATS_APPROVAL_LABEL,
  STATS_APPROVAL_DONE,
  MEETING_EMPTY_TITLE,
  MEETING_EMPTY_DESC,
  MEETING_EMPTY_BY_TYPE,
  NEW_MEETING_TITLE,
  NEW_MEETING_DESC,
  DETAIL_TITLE,
  DETAIL_EDIT_LABEL,
  FIELD_TYPE,
  FIELD_TITLE,
  FIELD_HELD_AT,
  FIELD_LOCATION,
  FIELD_AGENDA,
  FIELD_CONTENT,
  FIELD_ATTENDEES,
  FIELD_ABSENT,
  FIELD_DECISIONS,
  SUBMIT_LABEL,
  SUBMITTING_LABEL,
  CANCEL_LABEL,
  NEW_BUTTON_LABEL,
  APPROVAL_TRIGGER_TITLE,
  APPROVAL_TRIGGER_DESC_GOVERNANCE,
  APPROVAL_TRIGGER_DESC_OTHER,
  LABEL_AGENDA,
  LABEL_ATTENDEES,
  LABEL_ABSENT,
  LABEL_DECISIONS,
  LABEL_CONTENT,
  LABEL_APPROVAL,
  LABEL_NO_APPROVAL,
  APPROVAL_LINE_TITLE,
  APPROVAL_LINE_STEP,
} from "./labels";

// ─── 유틸 (검증·정렬·필터·통계·결재선) ──────────────────────
export {
  GOVERNANCE_APPROVAL_LINE,
  GOVERNANCE_APPROVAL_FORM,
  todayKst,
  normalizeHeldAt,
  formatDateKst,
  formatDateTimeKo,
  compactNames,
  joinOrDash,
  validateMeetingInput,
  filterByType,
  sortByHeldDesc,
  computeMeetingStats,
  buildListResult,
  buildSpawnedApproval,
} from "./utils";

// ─── Mock (server-side only import OK, client는 사용 안 함) ──
export { MOCK_MEETINGS } from "./mock";