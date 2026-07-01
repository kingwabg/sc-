/**
 * lib/features/inspection/labels.ts
 *
 * P7 — 디지털 안전점검 한국어 라벨
 */

import type { InspectionCategory, InspectionStatus, InspectionResult } from "@prisma/client";

// ─── 카테고리 라벨 ────────────────────────────────────────

export const INSPECTION_CATEGORY_LABELS: Record<InspectionCategory, string> = {
  FIRE_SAFETY: "소방 안전",
  HYGIENE: "위생 점검",
  EDUCATION: "5대 안전 교육",
  EMERGENCY: "응급/피난",
  ETC: "기타",
};

export const INSPECTION_CATEGORY_TONE: Record<InspectionCategory, string> = {
  FIRE_SAFETY: "red",
  HYGIENE: "blue",
  EDUCATION: "green",
  EMERGENCY: "orange",
  ETC: "slate",
};

export const INSPECTION_CATEGORY_EMOJI: Record<InspectionCategory, string> = {
  FIRE_SAFETY: "🔥",
  HYGIENE: "🧴",
  EDUCATION: "📚",
  EMERGENCY: "🚨",
  ETC: "📋",
};

// ─── 상태 라벨 ────────────────────────────────────────────

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  PASSED: "합격",
  FAILED: "불합격",
  PENDING: "대기",
};

export const INSPECTION_STATUS_TONE: Record<InspectionStatus, "green" | "red" | "yellow"> = {
  PASSED: "green",
  FAILED: "red",
  PENDING: "yellow",
};

// ─── 항목 결과 라벨 ───────────────────────────────────────

export const INSPECTION_RESULT_LABELS: Record<InspectionResult, string> = {
  PASS: "적합",
  FAIL: "부적합",
  NA: "해당없음",
  PENDING: "미확인",
};

export const INSPECTION_RESULT_TONE: Record<InspectionResult, "green" | "red" | "gray" | "yellow"> = {
  PASS: "green",
  FAIL: "red",
  NA: "gray",
  PENDING: "yellow",
};

// ─── 페이지 텍스트 ────────────────────────────────────────

export const INSPECTION_PAGE_TITLE = "디지털 안전점검";
export const INSPECTION_PAGE_DESC =
  "시설 안전 점검표를 모바일에서 체크리스트로 작성하고 평가단에 제출합니다.";
export const INSPECTION_EMPTY_TITLE = "아직 점검 기록이 없습니다";
export const INSPECTION_EMPTY_DESC = "신규 점검을 시작하여 시설 안전 상태를 기록하세요.";

// ─── 점검 템플릿 ─────────────────────────────────────────

export interface InspectionTemplate {
  category: InspectionCategory;
  title: string;
  items: string[];
}

/**消防点検テンプレート — 소방 안전 점검 템플릿 5항목 */
export const FIRE_SAFETY_TEMPLATE: InspectionTemplate = {
  category: "FIRE_SAFETY",
  title: "소방 안전 점검",
  items: [
    "소화기 비치 및 관리 상태 정상",
    "소화기 압력계 눈금 정상 (녹색 영역)",
    "피난 유도등 점등 상태 정상",
    "피난구 확보 및 통로 장애물 없음",
    "소방 registration 증 서류 비치",
  ],
};

/** hygene template */
export const HYGIENE_TEMPLATE: InspectionTemplate = {
  category: "HYGIENE",
  title: "위생 점검",
  items: [
    "손소독제 비치 및 사용 기록 관리",
    "환기 상태良好 (창문/공조 시스템)",
    "생활室 청소 상태 양호",
    "음식물 쓰레기 보관 시설 정상",
    "화장실 청소 상태 양호",
  ],
};

/** education template */
export const EDUCATION_TEMPLATE: InspectionTemplate = {
  category: "EDUCATION",
  title: "5대 안전 교육",
  items: [
    "5대 안전 교육 계획서 보유",
    "교육 진행 기록 (출석부) 관리",
    "교육 자료 비치 및 최신성 확보",
    "교육 평가 결과 기록",
    "안전 사고 대응 매뉴얼 비치",
  ],
};

/** emergency template */
export const EMERGENCY_TEMPLATE: InspectionTemplate = {
  category: "EMERGENCY",
  title: "응급/피난 현황",
  items: [
    "응급의료품 비치 및 유효기간 확인",
    "비상 연락망 게시 상태",
    "피난 훈련 실시 기록 보유",
    "대피로 확보 및 유도 표지 정상",
    "소방대 편성 및 활동 기록 관리",
  ],
};

export const ALL_INSPECTION_TEMPLATES: InspectionTemplate[] = [
  FIRE_SAFETY_TEMPLATE,
  HYGIENE_TEMPLATE,
  EDUCATION_TEMPLATE,
  EMERGENCY_TEMPLATE,
];
