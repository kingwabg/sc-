/**
 * 휴가(Leave) Feature Module — 타입 정의
 */

// ─── 휴가 종류 (12종) ────────────────────────────────────
export type LeaveKind =
  | "annual"        // 연차
  | "half"          // 반차
  | "sick"          // 병가
  | "condolence"    // 경조
  | "public"        // 공가
  | "menstrual"     // 생리휴가
  | "childcare"     // 육아휴직
  | "pregnancy"     // 임산부 휴가
  | "commuting"     // 출산
  | "family"        // 가족돌봄
  | "reinstatement" // 복귀
  | "etc";          // 기타

export const LEAVE_KIND_LABELS: Record<LeaveKind, string> = {
  annual:        "연차",
  half:          "반차",
  sick:          "병가",
  condolence:   "경조",
  public:        "공가",
  menstrual:     "생리휴가",
  childcare:     "육아휴직",
  pregnancy:     "임산부 휴가",
  commuting:     "출산휴가",
  family:        "가족돌봄",
  reinstatement: "복귀휴가",
  etc:           "기타",
};

export const LEAVE_KIND_EMOJIS: Record<LeaveKind, string> = {
  annual:        "🏖️",
  half:          "🌤️",
  sick:          "🏥",
  condolence:    "🪷",
  public:        "🏛️",
  menstrual:     "🌸",
  childcare:     "👶",
  pregnancy:     "🤰",
  commuting:     "🎉",
  family:        "🏠",
  reinstatement: "🔄",
  etc:           "📋",
};

// ─── 휴가 잔여/사용 정보 ─────────────────────────────────
export type LeaveBalance = {
  kind: LeaveKind;
  total: number;   // 총 일수
  used: number;    // 사용 일수
  remaining: number; // 잔여 일수
};

// ─── 휴가 신청 상태 ─────────────────────────────────────
export type LeaveStatus = "대기" | "승인" | "반려" | "취소";

// ─── 개인 휴가 기록 (한 건) ──────────────────────────────
export type LeaveRecord = {
  id: string;
  kind: LeaveKind;
  status: LeaveStatus;
  days: number;       // 일수
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  reason?: string;    // 사유
  appliedAt: string;   // 신청일
};

// ─── 전사 휴가 현황 (admin용) ───────────────────────────
export type CompanyLeaveEntry = {
  staffId: string;
  name: string;
  position: string;
  department: string;
  balances: LeaveBalance[];
};

// ─── 근속연수 + 회계연도 ────────────────────────────────
export type LeaveYearInfo = {
  hireDate: string;          // 입사일 YYYY-MM-DD
  tenureYears: number;       // 근속연수
  tenureMonths: number;     //残余月
  fiscalYearStart: string;   // 회계연도 시작 (2025-07-01)
  fiscalYearEnd: string;     // 회계연도 종료
  totalAnnualDays: number;   // 총 연차 일수
};
