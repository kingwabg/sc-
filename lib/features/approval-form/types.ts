/**
 * Approval-Form Feature — Domain Types
 */
import type { ApprovalFormKey } from "@/lib/types/approval";

// ─── 필드 타입 ────────────────────────────────────────────
export type FormFieldType = "text" | "number" | "date" | "select" | "textarea";

export type FormField = {
  /** 양식 내 고유 key (snake_case) */
  key: string;
  /** 표시 라벨 */
  label: string;
  /** 필드 종류 */
  type: FormFieldType;
  /** 필수 여부 */
  required?: boolean;
  /** select 类型일 때 옵션 목록 */
  options?: string[];
  /** placeholder 힌트 */
  placeholder?: string;
  /** 2컬럼 레이아웃 사용 */
  half?: boolean;
};

// ─── 양식 메타 ────────────────────────────────────────────
export type FormMeta = {
  key: ApprovalFormKey;
  label: string;
  emoji: string;
  description: string;
  /** 이 양식의 필드 정의 */
  fields: FormField[];
  /** 본문 에디터 사용 여부 */
  hasEditor?: boolean;
  /** 파일첨부 사용 여부 */
  hasAttachment?: boolean;
  /** 제목 placeholder */
  titlePlaceholder?: string;
};
