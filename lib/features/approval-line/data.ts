/**
 * Approval-Line Feature — Data
 */
import type { ApprovalFormKey } from "@/lib/types/approval";
import type { ApprovalLineData, ApprovalLineStepData } from "./types";

// ─── Mock Staff (tenant 별 — 실운영 시 Supabase에서 조회) ──
const MOCK_LINE_STAFF = {
  director:  { name: "김영미", position: "所长" },
  manager:   { name: "박은수", position: "지원교사" },
  staff:     { name: "김선영", position: "지원교사" },
  admin:     { name: "최지연", position: "행정" },
  cook:      { name: "이정훈", position: "조리사" },
};

// ─── 양식별 기본 결재선 ────────────────────────────────────

function makeSteps(
  items: Array<{ name: string; position: string; type: ApprovalLineStepData["type"] }>
): ApprovalLineStepData[] {
  return items.map((item, i) => ({
    step: i + 1,
    name: item.name,
    position: item.position,
    type: item.type,
    status: "pending" as const,
  }));
}

// 업무 분장표 → 시설장 →所长 → 임원
const DUTY_ASSIGNMENT_LINE: ApprovalLineStepData[] = makeSteps([
  { name: MOCK_LINE_STAFF.manager.name,  position: MOCK_LINE_STAFF.manager.position,  type: "결재" },
  { name: MOCK_LINE_STAFF.director.name, position: MOCK_LINE_STAFF.director.position, type: "결재" },
]);

// 지출결의 → 담당 → 팀장 → 결재권자
const EXPENSE_LINE: ApprovalLineStepData[] = makeSteps([
  { name: MOCK_LINE_STAFF.staff.name,   position: MOCK_LINE_STAFF.staff.position,   type: "결재" },
  { name: MOCK_LINE_STAFF.manager.name,  position: MOCK_LINE_STAFF.manager.position,  type: "결재" },
  { name: MOCK_LINE_STAFF.director.name, position: MOCK_LINE_STAFF.director.position, type: "결재" },
]);

// 휴가신청서 → 팀장 →所长
const LEAVE_LINE: ApprovalLineStepData[] = makeSteps([
  { name: MOCK_LINE_STAFF.manager.name,  position: MOCK_LINE_STAFF.manager.position,  type: "결재" },
  { name: MOCK_LINE_STAFF.director.name, position: MOCK_LINE_STAFF.director.position, type: "결재" },
]);

// 구매품의서 → 담당 → 팀장 → 결재권자
const PURCHASE_LINE: ApprovalLineStepData[] = makeSteps([
  { name: MOCK_LINE_STAFF.staff.name,   position: MOCK_LINE_STAFF.staff.position,   type: "결재" },
  { name: MOCK_LINE_STAFF.manager.name,  position: MOCK_LINE_STAFF.manager.position,  type: "결재" },
  { name: MOCK_LINE_STAFF.director.name, position: MOCK_LINE_STAFF.director.position, type: "결재" },
]);

// 업무보고서 → 팀장 →所长
const REPORT_LINE: ApprovalLineStepData[] = makeSteps([
  { name: MOCK_LINE_STAFF.manager.name,  position: MOCK_LINE_STAFF.manager.position,  type: "결재" },
  { name: MOCK_LINE_STAFF.director.name, position: MOCK_LINE_STAFF.director.position, type: "결재" },
]);

// 품의서 → 팀장 →所长
const MEMO_LINE: ApprovalLineStepData[] = makeSteps([
  { name: MOCK_LINE_STAFF.manager.name,  position: MOCK_LINE_STAFF.manager.position,  type: "결재" },
  { name: MOCK_LINE_STAFF.director.name, position: MOCK_LINE_STAFF.director.position, type: "결재" },
]);

// 회의록 → 시설장 →所长 (참조 포함)
const MEETING_LINE: ApprovalLineStepData[] = makeSteps([
  { name: MOCK_LINE_STAFF.manager.name,  position: MOCK_LINE_STAFF.manager.position,  type: "결재" },
  { name: MOCK_LINE_STAFF.director.name, position: MOCK_LINE_STAFF.director.position, type: "결재" },
  { name: MOCK_LINE_STAFF.admin.name,     position: MOCK_LINE_STAFF.admin.position,     type: "참조" },
]);

// 후원금 → 행정 → 시설장 →所长
const DONATION_LINE: ApprovalLineStepData[] = makeSteps([
  { name: MOCK_LINE_STAFF.admin.name,     position: MOCK_LINE_STAFF.admin.position,     type: "시행" },
  { name: MOCK_LINE_STAFF.director.name, position: MOCK_LINE_STAFF.director.position, type: "결재" },
]);

// 교육수강 → 팀장 →所长
const EDUCATION_LINE: ApprovalLineStepData[] = makeSteps([
  { name: MOCK_LINE_STAFF.manager.name,  position: MOCK_LINE_STAFF.manager.position,  type: "결재" },
  { name: MOCK_LINE_STAFF.director.name, position: MOCK_LINE_STAFF.director.position, type: "결재" },
]);

const FORM_KEY_TO_STEPS: Record<ApprovalFormKey, ApprovalLineStepData[]> = {
  education:       EDUCATION_LINE,
  leave:           LEAVE_LINE,
  expense:         EXPENSE_LINE,
  purchase:         PURCHASE_LINE,
  report:          REPORT_LINE,
  memo:            MEMO_LINE,
  duty_assignment: DUTY_ASSIGNMENT_LINE,
  meeting:         MEETING_LINE,
  donation:        DONATION_LINE,
};

// ─── Public API ────────────────────────────────────────────

/**
 * tenant별 양식의 기본 결재선을 반환합니다.
 * 실운영: Supabase에서 tenantId별 커스텀 결재선을 조회.
 */
export function getDefaultApprovalLine(
  tenantId: string,
  formKey: ApprovalFormKey
): ApprovalLineData {
  const steps = FORM_KEY_TO_STEPS[formKey] ?? FORM_KEY_TO_STEPS.memo;
  return {
    id: `line-${tenantId}-${formKey}-default`,
    tenantId,
    name: "기본 결재선",
    form: formKey,
    steps,
  };
}

/** 결재선에 현재 단계를 표시 (첫 pending → current) */
export function activateFirstStep(line: ApprovalLineData): ApprovalLineData {
  const steps = line.steps.map((s, i) =>
    i === 0 ? { ...s, status: "current" as const } : s
  );
  return { ...line, steps };
}
