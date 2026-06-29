// Multi-tenant configuration
// 4 verticals sharing the same platform (결재/메신저/문서/일정) but
// differentiated by type: facility pair (지역아동센터, 요양원) vs academy pair (요양학원, 간호학원)

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

export const TENANTS: Record<TenantId, Tenant> = {
  "child-center": {
    id: "child-center",
    label: "지역아동센터",
    shortLabel: "지역아동센터",
    subtitle: "Community Child Center",
    emoji: "🧒",
    gradient: "from-amber-400 to-orange-500",
    accent: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      ring: "ring-amber-200",
    },
    type: "facility",
    usersLabel: "아동",
    staffLabel: "돌봄교사",
    greeting: {
      morning: "오늘도 아이들의 밝은 하루를 응원합니다 ☀️",
      afternoon: "오후 활동도 활기차게 진행해볼까요?",
      evening: "오늘 하루도 수고하셨어요 🌙",
    },
    kpis: [
      { title: "오늘 등원 아동", icon: "users" },
      { title: "돌봄 일지", icon: "doc" },
      { title: "이번 주 프로그램", icon: "calendar" },
      { title: "학부모 알림 발송", icon: "check" },
    ],
  },
  "nursing-home": {
    id: "nursing-home",
    label: "요양원",
    shortLabel: "요양원",
    subtitle: "Senior Care Facility",
    emoji: "🏥",
    gradient: "from-teal-400 to-emerald-500",
    accent: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      ring: "ring-teal-200",
    },
    type: "facility",
    usersLabel: "입소자",
    staffLabel: "요양보호사",
    greeting: {
      morning: "어르신들의 편안한 하루를 함께 합니다 ☀️",
      afternoon: "오후 산책·활동 시간입니다",
      evening: "오늘 밤值班도 안전하게 마무리해요 🌙",
    },
    kpis: [
      { title: "입소자 현황", icon: "users" },
      { title: "오늘 투약", icon: "check" },
      { title: "바이탈 체크", icon: "doc" },
      { title: "가족 소통", icon: "calendar" },
    ],
  },
  "care-academy": {
    id: "care-academy",
    label: "요양학원",
    shortLabel: "요양학원",
    subtitle: "Care Worker Academy",
    emoji: "📚",
    gradient: "from-indigo-400 to-blue-500",
    accent: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      ring: "ring-indigo-200",
    },
    type: "academy",
    usersLabel: "수강생",
    staffLabel: "강사",
    greeting: {
      morning: "오늘의 강의를 시작해볼까요? 📖",
      afternoon: "수강생 진도를 확인하세요",
      evening: "내일 강의 준비도 미리 🌙",
    },
    kpis: [
      { title: "재원 수강생", icon: "users" },
      { title: "오늘 출석", icon: "check" },
      { title: "강의 시간표", icon: "calendar" },
      { title: "자격증 발급", icon: "doc" },
    ],
  },
  "nursing-academy": {
    id: "nursing-academy",
    label: "간호학원",
    shortLabel: "간호학원",
    subtitle: "Nursing Assistant Academy",
    emoji: "⚕️",
    gradient: "from-rose-400 to-pink-500",
    accent: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      ring: "ring-rose-200",
    },
    type: "academy",
    usersLabel: "수강생",
    staffLabel: "강사",
    greeting: {
      morning: "내일을 돌볼 인재를 키웁니다 ⚕️",
      afternoon: "실습·강의 일정을 확인하세요",
      evening: "오늘도 한 걸음 성장했습니다 🌙",
    },
    kpis: [
      { title: "재원 수강생", icon: "users" },
      { title: "임상실습 매칭", icon: "calendar" },
      { title: "국가시험 준비", icon: "doc" },
      { title: "출석률", icon: "check" },
    ],
  },
};

export const TENANT_LIST: Tenant[] = Object.values(TENANTS);

export const FACILITY_TENANTS = TENANT_LIST.filter((t) => t.type === "facility");
export const ACADEMY_TENANTS = TENANT_LIST.filter((t) => t.type === "academy");

export function getTenant(id: string | null | undefined): Tenant | null {
  if (!id) return null;
  return (TENANTS as Record<string, Tenant>)[id] ?? null;
}

export function getGreetingByTime(t: Tenant): string {
  const h = new Date().getHours();
  if (h < 12) return t.greeting.morning;
  if (h < 18) return t.greeting.afternoon;
  return t.greeting.evening;
}
// 데모용 기본 테넌트 — 첫 진입 시 자동 선택
export const MOCK_TENANT = TENANT_LIST[0]; // child-center
