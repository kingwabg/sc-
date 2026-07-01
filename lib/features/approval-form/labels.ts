/**
 * Approval-Form Feature — Korean Labels
 */
import type { ApprovalFormKey } from "@/lib/types/approval";

export const FORM_LABELS: Record<ApprovalFormKey, string> = {
  education:       "교육수강신청",
  leave:           "휴가신청서",
  expense:         "지출결의서",
  purchase:        "물품구매품의서",
  report:          "업무보고서",
  memo:            "품의서",
  duty_assignment: "업무 분장표",
  meeting:         "회의록",
  donation:        "후원금 영수증",
};

export const FORM_EMOJIS: Record<ApprovalFormKey, string> = {
  education:       "📚",
  leave:           "🏖️",
  expense:         "💰",
  purchase:        "📦",
  report:          "📊",
  memo:            "📋",
  duty_assignment: "📋",
  meeting:         "🗂️",
  donation:        "🎁",
};

export const FORM_DESCRIPTIONS: Record<ApprovalFormKey, string> = {
  education:       "외부 교육/세미나/연수 신청",
  leave:           "연차/반차/병가/경조 휴가 신청",
  expense:         "업무 관련 지출 내역 결의",
  purchase:        "비품/물품 구매 품의",
  report:          "주간/월간 업무 보고",
  memo:            "일반 사내 품의서",
  duty_assignment: "담당 업무 배분 및 분장표",
  meeting:         "회의록 작성 및 결재",
  donation:        "후원금 영수증 발급 요청",
};
