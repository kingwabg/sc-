/**
 * lib/features/inspection/types.ts
 *
 * P7 — 디지털 안전점검 도메인 타입
 * - Prisma enums 재노출 (의존성 격리)
 * - UI 전달용 view-model 타입
 */

import type {
  InspectionCategory,
  InspectionStatus,
  InspectionResult,
} from "@prisma/client";

export type { InspectionCategory, InspectionStatus, InspectionResult };

/** 점검 항목 view-model */
export interface InspectionItemVM {
  id: string;
  label: string;
  result: InspectionResult;
  note: string | null;
  position: number;
}

/** 점검 view-model — items 정렬 포함 */
export interface InspectionVM {
  id: string;
  tenantId: string;
  category: InspectionCategory;
  /** 한국어 카테고리 라벨 */
  categoryLabel: string;
  title: string;
  checkedAt: Date;
  checkedBy: string | null;
  status: InspectionStatus;
  /** 한국어 상태 라벨 */
  statusLabel: string;
  /** 한국어 상태 배지 tone */
  statusTone: "green" | "red" | "yellow";
  notes: string | null;
  items: InspectionItemVM[];
}

/** 신규 점검 생성 입력 */
export interface CreateInspectionInput {
  tenantId: string;
  category: InspectionCategory;
  title: string;
  checkedBy?: string;
  items: { label: string; position: number }[];
}

/** 항목 결과 업데이트 입력 */
export interface UpdateItemResultInput {
  itemId: string;
  result: InspectionResult;
  note?: string;
}
