// 연간계획 mock 데이터
//
// 향후 Supabase 연동 시 이 파일은 API 호출로 대체.
// 현재는 화면 렌더링 + 1단계 골격 검증용.

import type { AnnualPlan } from "./types";

export const MOCK_ANNUAL_PLANS: AnnualPlan[] = [
  {
    id: "annual-2026",
    year: 2026,
    title: "2026년 운영계획",
    status: "active",
    goals: [
      "아동 중심 돌봄 강화 — 정서 안정 프로그램 운영",
      "지역사회 연계 프로그램 확대 — 주민센터·도서관 협력",
      "종사자 역량 강화 — 월 1회 내부 교육",
    ],
    programs: [
      {
        id: "prog-psy-2026",
        name: "심리 안정 프로그램",
        targetGroup: "전체 아동",
        weeklyFrequency: 2,
        monthlyTargets: ["월 8회 진행", "참여율 80% 이상", "주 1회 개별 상담"],
        method: "소그룹 활동, 미술치료 연계, 개별 상담",
        materials: ["회화용 도구", "미술 재료", "감정 카드"],
      },
      {
        id: "prog-mentor-2026",
        name: "학습 멘토링",
        targetGroup: "초등 고학년 (4~6학년)",
        weeklyFrequency: 3,
        monthlyTargets: ["월 12회", "과제 수행률 70% 이상", "멘토 1인당 3명"],
        method: "1:1 멘토링, 그룹 스터디, 주제별 프로젝트",
        materials: ["교재", "문제집", "프린트 학습지"],
      },
      {
        id: "prog-community-2026",
        name: "지역사회 연계 프로그램",
        targetGroup: "전체 아동 + 보호자",
        weeklyFrequency: 1,
        monthlyTargets: ["월 4회", "월 1회 외부 체험"],
        method: "외부 강사 초빙, 현장 견학, 자원봉사자 연결",
        materials: ["체험학습비", "교통편", "보험"],
      },
    ],
    monthlyPlanIds: [
      "monthly-2026-1", "monthly-2026-2", "monthly-2026-3",
      "monthly-2026-4", "monthly-2026-5", "monthly-2026-6",
      "monthly-2026-7", "monthly-2026-8", "monthly-2026-9",
      "monthly-2026-10", "monthly-2026-11", "monthly-2026-12",
    ],
    evaluation: {
      highlights: [],
      improvements: [],
    },
    createdBy: "u_1",
    createdAt: "2026-01-05T09:00:00Z",
    approvedBy: "u_admin",
    approvedAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "annual-2027",
    year: 2027,
    title: "2027년 운영계획 (초안)",
    status: "draft",
    goals: [],
    programs: [],
    monthlyPlanIds: [],
    evaluation: {
      highlights: [],
      improvements: [],
    },
    createdBy: "u_1",
    createdAt: "2026-06-01T09:00:00Z",
  },
];