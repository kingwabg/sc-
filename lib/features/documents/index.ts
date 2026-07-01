/**
 * lib/features/documents/index.ts
 * re-export public API
 */
export type {
  DocCategory,
  ExpiryStatus,
  ExpiryWarning,
  ExpiringDocsResult,
  DocExpiryLight,
} from "./types";
export {
  todayKst,
  daysBetween,
  classifyExpiry,
  ddayLabel,
  statusLabel,
  buildWarning,
  sortWarnings,
  docExpiryLightByCount,
} from "./utils";
export {
  DOC_CATEGORY_LABEL,
  DOC_CATEGORY_TONE,
  EXPIRY_STATUS_TONE,
  DOC_EXPIRY_PAGE_TITLE,
  DOC_EXPIRY_PAGE_DESC,
  DOC_EXPIRY_SIGNAL_LABEL,
  DOC_EXPIRY_SIGNAL_DESC,
  DOC_EXPIRY_EMPTY_TITLE,
  DOC_EXPIRY_EMPTY_DESC,
} from "./labels";
export { getExpiringDocs, computeDocExpiryLight } from "./data";