/**
 * lib/features/accounting/types.ts
 *
 * P13 — 회계 포털 타입 정의
 */

import type { Donation } from "@/lib/features/donation/types";

/** 예산 단일 항목 */
export interface Budget {
  id: string;
  fiscalYear: number;
  month: number;
  category: BudgetCategory;
  limit: number;
  used: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 지출 단일 항목 */
export interface Expense {
  id: string;
  approvalId: string | null;
  fiscalYear: number;
  month: number;
  date: Date;
  category: BudgetCategory;
  amount: number;
  vendor: string | null;
  memo: string | null;
  status: ExpenseStatus;
  createdBy: string | null;
  createdAt: Date;
}

/** 예산 항목 분류 */
export type BudgetCategory =
  | "인건비"
  | "운영비"
  | "사업비"
  | "후원금"
  | "보조금";

/** 지출 상태 */
export type ExpenseStatus =
  | "확정"
  | "대기"
  | "반려";

/** 월별 예산 대 실제 지출 */
export interface BudgetVsActual {
  month: number;
  category: BudgetCategory;
  limit: number;
  actual: number;
  remaining: number;
  usagePct: number;
}

/** 월별 손익 계산 */
export interface MonthlyPnl {
  month: number;
  income: number;
  expense: number;
  net: number;
}

/** 대시보드 KPI 카드 데이터 */
export interface DashboardKpi {
  donationTotal: number;
  unpaidSubsidy: number;
  budgetUsagePct: number;
  pendingApprovalCount: number;
}

/** 감사 이력 항목 */
export interface AuditTrailEntry {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  target: string;
  before: string | null;
  after: string | null;
  category: "budget" | "expense" | "donation" | "settlement";
}


