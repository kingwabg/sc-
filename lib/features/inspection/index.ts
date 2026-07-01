/**
 * lib/features/inspection/index.ts
 *
 * P7 — 디지털 안전점검 public API re-export
 */
export type {
  InspectionCategory,
  InspectionStatus,
  InspectionResult,
  InspectionItemVM,
  InspectionVM,
  CreateInspectionInput,
  UpdateItemResultInput,
} from "./types";

export {
  INSPECTION_CATEGORY_LABELS,
  INSPECTION_CATEGORY_TONE,
  INSPECTION_CATEGORY_EMOJI,
  INSPECTION_STATUS_LABELS,
  INSPECTION_STATUS_TONE,
  INSPECTION_RESULT_LABELS,
  INSPECTION_RESULT_TONE,
  INSPECTION_PAGE_TITLE,
  INSPECTION_PAGE_DESC,
  INSPECTION_EMPTY_TITLE,
  INSPECTION_EMPTY_DESC,
  ALL_INSPECTION_TEMPLATES,
  type InspectionTemplate,
} from "./labels";

export {
  getInspectionsByTenant,
  getInspectionById,
  createInspection,
  updateItemResult,
  updateInspectionNotes,
} from "./data";
