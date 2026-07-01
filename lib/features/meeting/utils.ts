/**
 * lib/features/meeting/utils.ts
 *
 * - 입력 검증 (validateMeetingInput)
 * - 정렬 (최신 heldAt 우선)
 * - type 필터 (3종)
 * - 참석자/결석자/결정사항 join (목록 표시용)
 * - 통계 계산 (computeMeetingStats)
 * - 운영위원회 결재선 정의 (GOVERNANCE_APPROVAL_LINE)
 */

import type {
  Meeting,
  MeetingInput,
  MeetingType,
  MeetingStats,
  MeetingListResult,
} from "./types";

/** 운영위원회 결재선 — 시설장(1) → 센터장(2) 2-step */
export const GOVERNANCE_APPROVAL_LINE: Array<{
  step: number;
  name: string;
  position: string;
  status: string;
}> = [
  { step: 1, name: "박은수", position: "시설장", status: "current" },
  { step: 2, name: "왕준하", position: "센터장", status: "pending" },
];

/** 운영위원회 결재 양식 — ApprovalFormKey 'report' 재사용 */
export const GOVERNANCE_APPROVAL_FORM = "report" as const;

/** 한국 시간(KST) 자정 기준 오늘 — 회의 heldAt 기본값 */
export function todayKst(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** heldAt 정규화 — string | Date → Date */
export function normalizeHeldAt(input: Date | string): Date {
  return input instanceof Date ? input : new Date(input);
}

/** YYYY-MM-DD 형식 날짜 (한국 기준, KST 단순화 — UTC+9) */
export function formatDateKst(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  const kst = new Date(date.getTime() + 9 * 3600 * 1000);
  return kst.toISOString().slice(0, 10);
}

/** YYYY.MM.DD HH:mm 한국어 표기 */
export function formatDateTimeKo(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  const kst = new Date(date.getTime() + 9 * 3600 * 1000);
  const ymd = kst.toISOString().slice(0, 10).replaceAll("-", ".");
  const hh = kst.toISOString().slice(11, 16);
  return `${ymd} ${hh}`;
}

/** 이름 배열 → "김민준 외 4명" 압축 표시 */
export function compactNames(names: string[], max: number = 3): string {
  if (!names || names.length === 0) return "—";
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max).join(", ")} 외 ${names.length - max}명`;
}

/** 배열 항목 join (안전 — undefined/빈 배열 → "—") */
export function joinOrDash(items: string[] | undefined | null, sep: string = ", "): string {
  if (!items || items.length === 0) return "—";
  return items.join(sep);
}

/** 입력 검증 — create 직전 호출 */
export function validateMeetingInput(input: MeetingInput): string | null {
  if (!input.title?.trim()) return "회의 제목을 입력해 주세요";
  if (!input.heldAt) return "회의 일시를 입력해 주세요";
  const d = normalizeHeldAt(input.heldAt);
  if (isNaN(d.getTime())) return "회의 일시가 올바른 날짜 형식이 아닙니다";
  if (!input.type) return "회의 종류를 선택해 주세요";
  return null;
}

/** type별 필터 헬퍼 */
export function filterByType(meetings: Meeting[], type: MeetingType | "ALL"): Meeting[] {
  if (type === "ALL") return meetings;
  return meetings.filter((m) => m.type === type);
}

/** 최신 heldAt 순 정렬 */
export function sortByHeldDesc(a: Meeting, b: Meeting): number {
  return b.heldAt.getTime() - a.heldAt.getTime();
}

/** Meeting[] → MeetingStats 집계 (in-memory) */
export function computeMeetingStats(meetings: Meeting[]): MeetingStats {
  let childCouncilCount = 0;
  let governanceCount = 0;
  let staffCount = 0;
  let approvalSpawnedCount = 0;
  let approvalCompletedCount = 0;
  for (const m of meetings) {
    if (m.type === "CHILD_COUNCIL") childCouncilCount++;
    else if (m.type === "GOVERNANCE") {
      governanceCount++;
      if (m.approvalId) approvalSpawnedCount++;
    } else if (m.type === "STAFF") {
      staffCount++;
    }
  }
  return {
    totalCount: meetings.length,
    childCouncilCount,
    governanceCount,
    staffCount,
    approvalSpawnedCount,
    approvalCompletedCount,
  };
}

/** list 결과 묶음 — 페이지에서 한 번에 받기 */
export function buildListResult(meetings: Meeting[]): MeetingListResult {
  return { meetings, stats: computeMeetingStats(meetings) };
}

/** GOVERNANCE 결재 자동 spawn — DB row 또는 mock fallback 양쪽에서 호출 */
export function buildSpawnedApproval(approvalId: string): {
  approvalId: string;
  docNo: string;
  status: string;
  line: typeof GOVERNANCE_APPROVAL_LINE;
} {
  return {
    approvalId,
    docNo: `RPT-MTG-${new Date().getFullYear()}-${approvalId.slice(-4).toUpperCase()}`,
    status: "결재중",
    line: GOVERNANCE_APPROVAL_LINE,
  };
}