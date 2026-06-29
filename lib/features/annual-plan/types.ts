// 연간계획 (Annual Plan) 도메인 타입
//
// 연간계획 → 월간계획 12개 슬롯 → 운영일지 30개 슬롯의 부모 노드.
// AGENTS.md의 Feature Module 패턴을 따른다.

export type AnnualPlanStatus = "draft" | "active" | "done";

/** 연간 단위로 운영하는 반복 프로그램 (예: 심리안정, 학습멘토링, 방과후교실) */
export type Program = {
  id: string;
  name: string;
  /** 대상 그룹 (전체 아동 / 초등 고학년 / 중학생 등) */
  targetGroup: string;
  /** 주당 진행 횟수 */
  weeklyFrequency: number;
  /** 월별 목표 (문장 리스트) */
  monthlyTargets: string[];
  /** 진행 방식/방법 */
  method: string;
  /** 필요 준비물 */
  materials: string[];
};

export type AnnualEvaluation = {
  /** 종합 점수 0~100, 미평가 시 undefined */
  score?: number;
  /** 요약 코멘트 */
  summary?: string;
  /** 잘된 점들 */
  highlights: string[];
  /** 개선할 점들 */
  improvements: string[];
  /** 평가자 이름 */
  evaluatedBy?: string;
  /** 평가 일시 (ISO) */
  evaluatedAt?: string;
};

export type AnnualPlan = {
  id: string;
  /** 예: 2026 */
  year: number;
  /** 연간계획 제목 (예: "2026년 운영계획") */
  title: string;
  status: AnnualPlanStatus;
  /** 연 단위 목표 (KPI 또는 큰 방향) */
  goals: string[];
  /** 연간 프로그램 목록 */
  programs: Program[];
  /** 자동 생성된 12개 월간계획 ID (status가 draft여도 미리 슬롯 잡아둠) */
  monthlyPlanIds: string[];
  /** 연말 평가 (status=done이거나 평가 시작 시 채워짐) */
  evaluation: AnnualEvaluation;
  /** 작성자 */
  createdBy: string;
  /** 작성 일시 (ISO) */
  createdAt: string;
  /** 승인자 */
  approvedBy?: string;
  /** 승인 일시 */
  approvedAt?: string;
};