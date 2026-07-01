/**
 * lib/features/accounting/utils.ts
 *
 * P13 — 회계 포털 유틸리티
 */

/**
 * 숫자 → 원화 문자열 (예: 1_234_567 → "1,234,567원")
 */
export function formatKRW(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/**
 * 사용률 계산 (%)
 * @param used 사용액
 * @param limit 한도
 * @returns 0~100 이상의 숫자
 */
export function calcBudgetUsagePct(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.round((used / limit) * 100);
}

/**
 * 사용률 기준 색상 클래스
 * - 녹색: < 70%
 * - 황색: 70%~90%
 * - 적색: > 90%
 */
export function usageColor(pct: number): "green" | "yellow" | "red" {
  if (pct < 70) return "green";
  if (pct < 90) return "yellow";
  return "red";
}

/**
 * 월별 손익 계산
 * @param donationsAmt 월별 후원금 수입 합계 배열 (인덱스 1~12)
 * @param expensesAmt 월별 지출 합계 배열 (인덱스 1~12)
 */
export function monthlyPnl(
  donationsAmt: number[],
  expensesAmt: number[],
): { month: number; income: number; expense: number; net: number }[] {
  const result = [];
  for (let m = 1; m <= 12; m++) {
    const income = donationsAmt[m] ?? 0;
    const expense = expensesAmt[m] ?? 0;
    result.push({ month: m, income, expense, net: income - expense });
  }
  return result;
}

/**
 * 배열을 key로 그룹화
 */
export function groupBy<T>(arr: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = typeof key === "function" ? key(item) : String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

/**
 * 월 이름 (1~12 → "1월" 등)
 */
export function monthLabel(m: number): string {
  return `${m}월`;
}

/**
 * 월별 막대 그래프 높이를 %로 변환 (max 기준)
 */
export function barHeight(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.round((value / max) * 100);
}
