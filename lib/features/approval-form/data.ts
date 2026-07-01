/**
 * Approval-Form Feature — Form Definitions
 */
import type { ApprovalFormKey } from "@/lib/types/approval";
import type { FormMeta } from "./types";
import { FORM_LABELS, FORM_EMOJIS, FORM_DESCRIPTIONS } from "./labels";

// ─── 9개 양식 정의 ────────────────────────────────────────

const EDUCATION_FIELDS = [
  { key: "education_type",   label: "교육구분",     type: "select" as const, required: true,  options: ["세미나", "연수", "워크숍", "연구회", "기타"] },
  { key: "education_name",   label: "교육명",        type: "text" as const,   required: true,  placeholder: "교육명을 입력하세요" },
  { key: "education_course", label: "교육과정명",    type: "text" as const,   required: true,  placeholder: "세부 과정을 입력하세요" },
  { key: "education_org",    label: "교육기관",      type: "text" as const,   required: true,  placeholder: "主办 기관명을 입력하세요" },
  { key: "education_cost",   label: "교육비용(원)",  type: "number" as const, required: false },
  { key: "participant_cost", label: "참가비용(원)",  type: "number" as const, required: false },
  { key: "half_day_count",   label: "반차신청인원",  type: "number" as const, required: false },
  { key: "sessions",         label: "차수",          type: "text" as const,   required: false },
  { key: "start_date",       label: "교육시작일",    type: "date" as const,   required: true,  half: true },
  { key: "end_date",         label: "교육종료일",    type: "date" as const,   required: true,  half: true },
];

const LEAVE_FIELDS = [
  { key: "leave_type",  label: "휴가종류",   type: "select" as const, required: true, options: ["연차", "반차", "병가", "경조", "공가", "기타"] },
  { key: "start_date",  label: "휴가시작일", type: "date" as const,   required: true,  half: true },
  { key: "end_date",    label: "휴가종료일", type: "date" as const,   required: true,  half: true },
  { key: "reason",      label: "사유",        type: "textarea" as const, required: true, placeholder: "휴가 사유를 입력하세요" },
];

const EXPENSE_FIELDS = [
  { key: "expense_item", label: "지출항목",    type: "select" as const, required: true,  options: ["사무용품", "교통비", "식비", "접대비", "소모품", "기타"] },
  { key: "amount",       label: "금액(원)",     type: "number" as const, required: true },
  { key: "payment_method", label: "결제방법", type: "select" as const, required: true, options: ["현금", "카드", "계좌이체", "기타"] },
  { key: "reason",       label: "사용내역",     type: "textarea" as const, required: true, placeholder: "사용 내역을 입력하세요" },
  { key: "receipt",      label: "영수증 첨부", type: "text" as const,   required: false },
];

const PURCHASE_FIELDS = [
  { key: "item_name",  label: "품명",       type: "text" as const,   required: true,  placeholder: "구매할 물품명을 입력하세요" },
  { key: "quantity",  label: "수량",        type: "number" as const, required: true,  half: true },
  { key: "unit_price", label: "단가(원)",   type: "number" as const, required: true,  half: true },
  { key: "total",     label: "합계(원)",    type: "number" as const, required: false },
  { key: "reason",    label: "구매사유",    type: "textarea" as const, required: true, placeholder: "구매 사유를 입력하세요" },
  { key: "vendor",    label: "거래처",      type: "text" as const,   required: false, placeholder: "구매처/거래처" },
];

const REPORT_FIELDS = [
  { key: "report_period", label: "보고기간",   type: "text" as const,    required: true,  placeholder: "예: 2026년 6월" },
  { key: "main_tasks",    label: "주요실적",   type: "textarea" as const, required: true,  placeholder: "주요 업무 실적을 입력하세요" },
  { key: "next_tasks",    label: "다음 계획",   type: "textarea" as const, required: false, placeholder: "다음 기간 계획을 입력하세요" },
];

const MEMO_FIELDS = [
  { key: "subject",    label: "품의제목",   type: "text" as const,    required: true,  placeholder: "품의 제목을 입력하세요" },
  { key: "reference",  label: "관련근거",    type: "text" as const,    required: false, placeholder: "관련 규정 atau 근거 문서" },
  { key: "content",    label: "품의 내용",   type: "textarea" as const, required: true,  placeholder: "품의 사유와 내용을 입력하세요" },
];

// ─── 업무 분장표 (지역아동센터 핵심) ────────────────────────
const DUTY_ASSIGNMENT_FIELDS = [
  { key: "staff_name",     label: "담당자 성명",  type: "text" as const,   required: true,  placeholder: "담당자 이름을 입력하세요" },
  { key: "position",        label: "직급",          type: "select" as const, required: true,  options: ["所长", "支援교사", "조리사", "행정", "기타"] },
  { key: "assigned_tasks", label: "담당 업무",     type: "textarea" as const, required: true,  placeholder: "담당할 업무를 입력하세요" },
  { key: "period_start",    label: "배분 시작일",   type: "date" as const,   required: true,  half: true },
  { key: "period_end",      label: "배분 종료일",   type: "date" as const,   required: false, half: true },
  { key: "notes",           label: "비고",          type: "textarea" as const, required: false },
];

// ─── 회의록 (P10 연동) ────────────────────────────────────
const MEETING_FIELDS = [
  { key: "meeting_type", label: "회의 종류",    type: "select" as const, required: true,  options: ["아동자치회의", "운영위원회", "종사자회의"] },
  { key: "meeting_date", label: "회의 일시",    type: "date" as const,   required: true,  half: true },
  { key: "location",     label: "장소",         type: "text" as const,   required: false, half: true, placeholder: "회의 장소를 입력하세요" },
  { key: "agenda",       label: "안건",         type: "textarea" as const, required: false, placeholder: "회의 안건을 입력하세요" },
  { key: "attendees",    label: "참석자",        type: "text" as const,   required: false, placeholder: "참석자名单 (쉼표 구분)" },
  { key: "decisions",    label: "결정 사항",     type: "textarea" as const, required: false, placeholder: "회의 결정 사항을 입력하세요" },
];

// ─── 후원금 영수증 (P8 연동) ───────────────────────────────
const DONATION_FIELDS = [
  { key: "donor_name",   label: "후원자명",     type: "text" as const,   required: true,  placeholder: "후원자 이름을 입력하세요" },
  { key: "donation_type", label: "후원 유형",   type: "select" as const, required: true,  options: ["현금", "물품"] },
  { key: "amount",        label: "금액(원)",     type: "number" as const, required: false },
  { key: "item_name",      label: "물품명",       type: "text" as const,   required: false, placeholder: "후원 물품명을 입력하세요" },
  { key: "item_qty",       label: "수량",         type: "number" as const, required: false },
  { key: "received_date",  label: "수령 일시",    type: "date" as const,   required: true,  half: true },
  { key: "receipt_needed", label: "영수증 발급", type: "select" as const, required: true,  options: ["발급 요청", "불필요"] },
];

// ─── 전체 양식 맵 ──────────────────────────────────────────
const ALL_FORMS: FormMeta[] = [
  {
    key: "education",
    label: FORM_LABELS.education,
    emoji: FORM_EMOJIS.education,
    description: FORM_DESCRIPTIONS.education,
    fields: EDUCATION_FIELDS,
    hasEditor: true,
    hasAttachment: true,
    titlePlaceholder: "교육수강신청 제목을 입력하세요",
  },
  {
    key: "leave",
    label: FORM_LABELS.leave,
    emoji: FORM_EMOJIS.leave,
    description: FORM_DESCRIPTIONS.leave,
    fields: LEAVE_FIELDS,
    hasEditor: false,
    hasAttachment: false,
    titlePlaceholder: "휴가신청서 제목을 입력하세요",
  },
  {
    key: "expense",
    label: FORM_LABELS.expense,
    emoji: FORM_EMOJIS.expense,
    description: FORM_DESCRIPTIONS.expense,
    fields: EXPENSE_FIELDS,
    hasEditor: false,
    hasAttachment: true,
    titlePlaceholder: "지출결의서 제목을 입력하세요",
  },
  {
    key: "purchase",
    label: FORM_LABELS.purchase,
    emoji: FORM_EMOJIS.purchase,
    description: FORM_DESCRIPTIONS.purchase,
    fields: PURCHASE_FIELDS,
    hasEditor: false,
    hasAttachment: true,
    titlePlaceholder: "구매품의서 제목을 입력하세요",
  },
  {
    key: "report",
    label: FORM_LABELS.report,
    emoji: FORM_EMOJIS.report,
    description: FORM_DESCRIPTIONS.report,
    fields: REPORT_FIELDS,
    hasEditor: true,
    hasAttachment: true,
    titlePlaceholder: "업무보고서 제목을 입력하세요",
  },
  {
    key: "memo",
    label: FORM_LABELS.memo,
    emoji: FORM_EMOJIS.memo,
    description: FORM_DESCRIPTIONS.memo,
    fields: MEMO_FIELDS,
    hasEditor: true,
    hasAttachment: false,
    titlePlaceholder: "품의서 제목을 입력하세요",
  },
  {
    key: "duty_assignment",
    label: FORM_LABELS.duty_assignment,
    emoji: FORM_EMOJIS.duty_assignment,
    description: FORM_DESCRIPTIONS.duty_assignment,
    fields: DUTY_ASSIGNMENT_FIELDS,
    hasEditor: false,
    hasAttachment: false,
    titlePlaceholder: "업무 분장표 제목을 입력하세요",
  },
  {
    key: "meeting",
    label: FORM_LABELS.meeting,
    emoji: FORM_EMOJIS.meeting,
    description: FORM_DESCRIPTIONS.meeting,
    fields: MEETING_FIELDS,
    hasEditor: true,
    hasAttachment: true,
    titlePlaceholder: "회의록 제목을 입력하세요",
  },
  {
    key: "donation",
    label: FORM_LABELS.donation,
    emoji: FORM_EMOJIS.donation,
    description: FORM_DESCRIPTIONS.donation,
    fields: DONATION_FIELDS,
    hasEditor: false,
    hasAttachment: true,
    titlePlaceholder: "후원금 영수증 신청 제목을 입력하세요",
  },
];

// ─── Helper Functions ───────────────────────────────────────
export function getFormsByKey(keys: ApprovalFormKey[]): FormMeta[] {
  return ALL_FORMS.filter((f) => keys.includes(f.key));
}

export function getFormByKey(key: ApprovalFormKey): FormMeta | undefined {
  return ALL_FORMS.find((f) => f.key === key);
}

/** 새 결재 작성에 노출할 5대 핵심 양식 (card那种) */
export const CORE_FORM_KEYS: ApprovalFormKey[] = [
  "duty_assignment",
  "expense",
  "leave",
  "purchase",
  "report",
];

export { ALL_FORMS };
