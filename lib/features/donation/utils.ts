/**
 * lib/features/donation/utils.ts
 *
 * - 금액 포맷 (₩1,000,000)
 * - 영수증 번호 채번 (RC-YYYY-NNNN, 연도별 일련번호)
 * - 통계 계산
 * - 표시용 라벨 (날짜·D-day)
 */

import type {
  Donation,
  DonationInput,
  DonationStats,
  DonationListResult,
} from "./types";

const DEFAULT_CURRENCY_FORMAT = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

/** 금전 금액 한국어 포맷 — `₩1,000,000` */
export function formatKRW(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return DEFAULT_CURRENCY_FORMAT.format(amount);
}

/** 금액 + '원' 표기 — 메인 표시 (`1,000,000원`) */
export function formatKRWPlain(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** YYYY-MM-DD 형식 날짜 (한국 기준, KST 단순화 — UTC+9) */
export function formatDateKst(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  // KST = UTC+9
  const kst = new Date(date.getTime() + 9 * 3600 * 1000);
  return kst.toISOString().slice(0, 10);
}

/** YYYY.MM.DD 한국어 표기 — 영수증 등 인쇄용 */
export function formatDateKo(d: Date | string | null | undefined): string {
  const s = formatDateKst(d);
  if (s === "—") return "—";
  return s.replaceAll("-", ".");
}

/**
 * 영수증 번호 채번 — `RC-{year}-{4자리 일련}`
 * - 같은 연도 내 일련번호는 1부터 증가
 * - 결정적(같은 입력 → 같은 출력) — 단, 기존 발급된 번호는 변경 불가
 *
 * @param existingReceipts - 해당 연도에 발급된 영수증 번호 목록
 */
export function generateReceiptNumber(
  year: number,
  existingReceipts: string[],
): string {
  const prefix = `RC-${year}-`;
  const sameYear = existingReceipts.filter((n) => n.startsWith(prefix));
  const maxSeq = sameYear.reduce((max, n) => {
    const tail = parseInt(n.slice(prefix.length), 10);
    return isNaN(tail) ? max : Math.max(max, tail);
  }, 0);
  const next = (maxSeq + 1).toString().padStart(4, "0");
  return `${prefix}${next}`;
}

/** 향후 영수증 번호 미리보기 (issue 전 표시) */
export function previewReceiptNumber(
  year: number,
  existingReceipts: string[],
): string {
  return generateReceiptNumber(year, existingReceipts);
}

/** DonationInput 유효성 검증 — 페이지 폼에서 submit 직전 호출 */
export function validateDonationInput(input: DonationInput): string | null {
  if (!input.donorName?.trim()) return "후원자 이름을 입력해 주세요";
  if (input.type === "CASH") {
    if (input.amount == null || isNaN(input.amount) || input.amount <= 0) {
      return "금액을 0보다 큰 숫자로 입력해 주세요";
    }
  } else if (input.type === "GOODS") {
    if (!input.itemName?.trim()) return "물품명을 입력해 주세요";
    if (input.itemQty == null || input.itemQty <= 0) {
      return "수량을 0보다 큰 숫자로 입력해 주세요";
    }
  } else {
    return "후원 종류를 선택해 주세요";
  }
  return null;
}

/** Donation[] → DonationStats 집계 (in-memory) */
export function computeStats(donations: Donation[]): DonationStats {
  let cashCount = 0;
  let goodsCount = 0;
  let cashTotal = 0;
  let receiptIssuedCount = 0;
  for (const d of donations) {
    if (d.type === "CASH") {
      cashCount++;
      cashTotal += d.amount ?? 0;
    } else {
      goodsCount++;
    }
    if (d.receiptIssued) receiptIssuedCount++;
  }
  return {
    totalCount: donations.length,
    cashCount,
    goodsCount,
    cashTotal,
    receiptIssuedCount,
    receiptPendingCount: donations.length - receiptIssuedCount,
  };
}

/** list 결과 묶음 — 페이지에서 한 번에 받기 */
export function buildListResult(donations: Donation[]): DonationListResult {
  return { donations, stats: computeStats(donations) };
}

/** 정렬 — 최신 receivedAt 순 */
export function sortByReceivedDesc(a: Donation, b: Donation): number {
  return b.receivedAt.getTime() - a.receivedAt.getTime();
}

/** 현재 연도 가져오기 (영수증 번호에 사용) */
export function currentYear(): number {
  return new Date().getFullYear();
}

/** 금전만 필터 */
export function filterCash(donations: Donation[]): Donation[] {
  return donations.filter((d) => d.type === "CASH");
}

/** 물품만 필터 */
export function filterGoods(donations: Donation[]): Donation[] {
  return donations.filter((d) => d.type === "GOODS");
}
