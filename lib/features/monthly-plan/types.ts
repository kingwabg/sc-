// 월간계획 (Monthly Plan) 도메인 타입
//
// 연간계획 → 월간계획 → 운영일지의 중간 노드.
// 연간에서 12개 슬롯이 자동 생성되며, 월간이 활성화되면 30개 일지 슬롯이 lazy 생성된다.

import type { Program } from "../annual-plan/types";

export type MonthlyPlanStatus = "draft" | "active" | "done";

/** 주차별 목표 (월 4~5주차) */
export type WeeklyGoal = {
  /** 1~5 */
  weekNumber: number;
  /** 그 주차의 핵심 목표 */
  goal: string;
  /** 주차별 활동 목록 */
  activities: string[];
};

/**
 * 프로그램 × 주차 실행 매트릭스.
 * 운영일지 작성 시 어떤 프로그램이 언제 예정되어 있는지 미리 보여주기 위함.
 */
export type ProgramExecution = {
  programId: Program["id"];
  weekNumber: number;
  /** 실제 해당 주차에 실행했는지 여부 (default: false) */
  executed: boolean;
};

export type MonthlyEvaluation = {
  /** 진행률 0~100 */
  progressPct?: number;
  /** 달성한 KPI (자유 텍스트 리스트) */
  kpiAchieved: string[];
  /** 운영 노트 */
  notes?: string;
  /** 평가자 */
  evaluatedBy?: string;
  /** 평가 일시 (ISO) */
  evaluatedAt?: string;
};

export type MonthlyPlan = {
  id: string;
  /** 부모 연간계획 ID */
  annualPlanId: string;
  year: number;
  /** 1~12 */
  month: number;
  status: MonthlyPlanStatus;
  /** 주차별 목표 */
  weeklyGoals: WeeklyGoal[];
  /** 프로그램 × 주차 매트릭스 */
  programExecutions: ProgramExecution[];
  /** 운영일지 슬롯 ID 목록 (월 시작 시 lazy 생성) */
  dailyLogIds: string[];
  evaluation: MonthlyEvaluation;
};