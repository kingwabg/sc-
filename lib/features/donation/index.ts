/**
 * lib/features/donation/index.ts
 *
 * P8 — 후원금/물품 대장 모듈 public API
 *
 * 파일 구성:
 *  - types.ts  : Donation, DonationType, DonationInput, DonationStats
 *  - mock.ts   : MOCK_DONATIONS (DB 없을 때 fallback)
 *  - data.ts   : server-only queries (getDonation, listDonations, createDonation, issueReceipt)
 *    → 직접 import: `import { listDonations } from "@/lib/features/donation/data"`
 *  - utils.ts  : 포맷 · 채번 · 검증 · 통계
 *  - labels.ts : 한국어 라벨 · 색상 토큰
 *
 * NOTE: data.ts 는 `server-only` 이므로 barrel 을 통해 re-export 하지 않습니다.
 *  - server:  `@/lib/features/donation/data` 직접
 *  - client:  `@/lib/features/donation/labels`, `types`, `utils` 직접
 *  - 양쪽 모두: `@/lib/features/donation/types` (type-only) OK
 */

// ─── 타입 ─────────────────────────────────────────────
export type {
  Donation,
  DonationType,
  DonationInput,
  DonationStats,
  DonationListResult,
  IssuedReceipt,
} from "./types";

// ─── 라벨/색상 ─────────────────────────────────────────
export {
  DONATION_TYPE_LABEL,
  DONATION_TYPE_LABEL_LONG,
  DONATION_TYPE_TONE,
  RECEIPT_LABEL,
  DONATION_PAGE_TITLE,
  DONATION_PAGE_DESC,
  STATS_TOTAL_LABEL,
  STATS_CASH_LABEL,
  STATS_GOODS_LABEL,
  STATS_RECEIPT_LABEL,
  STATS_RECEIPT_PENDING,
  RECEIPT_TITLE,
  RECEIPT_INSTITUTION,
  RECEIPT_FOOTER,
  DONATION_EMPTY_TITLE,
  DONATION_EMPTY_DESC,
  NEW_DONATION_TITLE,
  NEW_DONATION_DESC,
  DETAIL_TITLE,
  RECEIPT_PRINT_LABEL,
  RECEIPT_ISSUE_LABEL,
  RECEIPT_VIEW_LABEL,
  RECEIPT_ALREADY_ISSUED,
  FIELD_DONOR_NAME,
  FIELD_DONOR_CONTACT,
  FIELD_TYPE,
  FIELD_AMOUNT,
  FIELD_ITEM_NAME,
  FIELD_ITEM_QTY,
  FIELD_RECEIVED_AT,
  FIELD_NOTES,
  SUBMIT_LABEL,
  CANCEL_LABEL,
  TYPE_CASH_LABEL,
  TYPE_GOODS_LABEL,
} from "./labels";

// ─── 유틸 (포맷·채번·검증) ──────────────────────────────
export {
  formatKRW,
  formatKRWPlain,
  formatDateKst,
  formatDateKo,
  generateReceiptNumber,
  previewReceiptNumber,
  validateDonationInput,
  computeStats,
  buildListResult,
  sortByReceivedDesc,
  currentYear,
  filterCash,
  filterGoods,
} from "./utils";

// ─── Mock (테스트용 — server-side only import OK, client는 사용 안 함) ──
export { MOCK_DONATIONS } from "./mock";
