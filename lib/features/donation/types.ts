/**
 * lib/features/donation/types.ts
 *
 * P8 — 후원금/물품 대장 도메인 타입
 * - Prisma DonationType enum 재노출 (의존성 격리)
 * - Donation: DB row view-model (amount는 string으로 정규화, UI 표시는 utils에서)
 * - DonationStats: 목록 페이지 통계 카드용
 */

import type { DonationType } from "@prisma/client";

export type { DonationType };

/** 후원 단일 항목 (DB row → UI view-model) */
export interface Donation {
  id: string;
  tenantId: string;
  donorName: string;
  donorContact: string | null;
  type: DonationType;
  /** CASH일 때 금액 (원, 정수). null이면 GOODS 또는 미기재 */
  amount: number | null;
  itemName: string | null;
  itemQty: number | null;
  receivedAt: Date;
  receiptIssued: boolean;
  receiptNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 입력 폼에서 쓰는 입력 DTO (create용) */
export interface DonationInput {
  donorName: string;
  donorContact?: string | null;
  type: DonationType;
  amount?: number | null;
  itemName?: string | null;
  itemQty?: number | null;
  receivedAt?: Date;
  notes?: string | null;
}

/** 목록 페이지 통계 — 총 건수 + 금전 합계 + 물품 건수 */
export interface DonationStats {
  totalCount: number;
  cashCount: number;
  goodsCount: number;
  cashTotal: number;
  /** 영수증 발급 완료 건수 */
  receiptIssuedCount: number;
  /** 영수증 미발급 건수 */
  receiptPendingCount: number;
}

/** 목록 + 통계를 한 번에 반환 */
export interface DonationListResult {
  donations: Donation[];
  stats: DonationStats;
}

/** 영수증 발급 결과 (issueReceipt 반환 타입) */
export interface IssuedReceipt {
  id: string;
  receiptNumber: string;
  issuedAt: Date;
}
