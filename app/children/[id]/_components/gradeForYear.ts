/**
 * 아동 카드에서 사용하는 연도 기반 학년/나이 계산 헬퍼.
 * page.tsx와 ChildCardTab.tsx 양쪽에서 쓰기 위해 분리.
 */
import type { Child } from "@/lib/features/children/types";

// 한국 학제 — 1년에 1학년씩
export const GRADE_ORDER = [
  "미취학", "초1", "초2", "초3", "초4", "초5", "초6",
  "중1", "중2", "중3", "고1", "고2", "고3",
];

export function gradeForYear(child: Child, year: number): string {
  const enrolledYear = parseInt((child.enrolledAt || "").slice(0, 4));
  if (!enrolledYear) return child.grade ?? "-";
  const diff = year - enrolledYear;
  const idx = GRADE_ORDER.indexOf(child.grade ?? "");
  if (idx === -1) return child.grade ?? "-";
  return GRADE_ORDER[Math.min(GRADE_ORDER.length - 1, Math.max(0, idx + diff))];
}

export function ageForYear(birthDate: string, year: number): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  return year - birth.getFullYear();
}