// Multi-tenant type definitions
// 4 verticals: child-center, nursing-home, care-academy, nursing-academy

export type TenantId =
  | "child-center"
  | "nursing-home"
  | "care-academy"
  | "nursing-academy";

export type TenantType = "facility" | "academy";

export type Tenant = {
  id: TenantId;
  /** 메인 표시명 */
  label: string;
  /** 짧은 라벨 (사이드바 등 좁은 곳) */
  shortLabel: string;
  /** 영문 부제 */
  subtitle: string;
  /** 카드 이모지 */
  emoji: string;
  /** 카드 그라데이션 */
  gradient: string;
  /** accent 색상 (Tailwind classes) */
  accent: {
    bg: string;
    text: string;
    ring: string;
  };
  /** 시설 vs 학원 */
  type: TenantType;
  /** 받는 사람 호칭 */
  usersLabel: string;
  /** 직원 호칭 */
  staffLabel: string;
  /** 시간대별 인사말 */
  greeting: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  /** KPI 카피 */
  kpis: { title: string; icon: "users" | "calendar" | "doc" | "check" }[];
};
