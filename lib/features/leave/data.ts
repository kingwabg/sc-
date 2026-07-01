/**
 * 휴가(Leave) Feature Module — mock 데이터
 */
import type { LeaveBalance, LeaveRecord, CompanyLeaveEntry, LeaveYearInfo, LeaveKind } from "./types";

// ─── 내 연차 잔여 (12종) ────────────────────────────────
export const MY_LEAVE_BALANCES: LeaveBalance[] = [
  { kind: "annual",        total: 15, used: 3,  remaining: 12 },
  { kind: "half",          total: 4,  used: 1,  remaining: 3  },
  { kind: "sick",          total: 30, used: 0,  remaining: 30 },
  { kind: "condolence",    total: 5,  used: 0,  remaining: 5  },
  { kind: "public",        total: 1,  used: 0,  remaining: 1  },
  { kind: "menstrual",     total: 1,  used: 0,  remaining: 1  },
  { kind: "childcare",     total: 0,  used: 0,  remaining: 0  },
  { kind: "pregnancy",     total: 0,  used: 0,  remaining: 0  },
  { kind: "commuting",     total: 0,  used: 0,  remaining: 0  },
  { kind: "family",        total: 3,  used: 0,  remaining: 3  },
  { kind: "reinstatement", total: 0,  used: 0,  remaining: 0  },
  { kind: "etc",           total: 0,  used: 0,  remaining: 0  },
];

// ─── 내 휴가 기록 (예정 + 지난) ─────────────────────────
export const MY_LEAVE_RECORDS: LeaveRecord[] = [
  // 예정
  {
    id: "lr-001",
    kind: "annual",
    status: "대기",
    days: 3,
    startDate: "2025-07-14",
    endDate: "2025-07-16",
    reason: "여름 휴가",
    appliedAt: "2025-07-01",
  },
  {
    id: "lr-002",
    kind: "half",
    status: "승인",
    days: 0.5,
    startDate: "2025-07-10",
    endDate: "2025-07-10",
    reason: "개인 사정",
    appliedAt: "2025-07-03",
  },
  // 지난
  {
    id: "lr-003",
    kind: "annual",
    status: "승인",
    days: 2,
    startDate: "2025-06-20",
    endDate: "2025-06-21",
    reason: "여름 휴가",
    appliedAt: "2025-06-10",
  },
  {
    id: "lr-004",
    kind: "half",
    status: "승인",
    days: 0.5,
    startDate: "2025-05-15",
    endDate: "2025-05-15",
    reason: "개인 사정",
    appliedAt: "2025-05-08",
  },
  {
    id: "lr-005",
    kind: "sick",
    status: "승인",
    days: 1,
    startDate: "2025-04-22",
    endDate: "2025-04-22",
    reason: "감기",
    appliedAt: "2025-04-22",
  },
  {
    id: "lr-006",
    kind: "condolence",
    status: "승인",
    days: 2,
    startDate: "2025-03-15",
    endDate: "2025-03-16",
    reason: "가족 경조",
    appliedAt: "2025-03-14",
  },
];

// ─── 월별 사용 내역 (연차내역 페이지용) ─────────────────
export const MONTHLY_LEAVE_HISTORY: { month: string; records: LeaveRecord[] }[] = [
  {
    month: "2025년 7월",
    records: [MY_LEAVE_RECORDS[0], MY_LEAVE_RECORDS[1]],
  },
  {
    month: "2025년 6월",
    records: [MY_LEAVE_RECORDS[2]],
  },
  {
    month: "2025년 5월",
    records: [MY_LEAVE_RECORDS[3]],
  },
  {
    month: "2025년 4월",
    records: [MY_LEAVE_RECORDS[4]],
  },
  {
    month: "2025년 3월",
    records: [MY_LEAVE_RECORDS[5]],
  },
];

// ─── 전사 휴가 현황 (admin) ─────────────────────────────
export const COMPANY_LEAVE_ENTRIES: CompanyLeaveEntry[] = [
  {
    staffId: "s1",
    name: "김영미",
    position: "所长",
    department: "운영",
    balances: [
      { kind: "annual", total: 18, used: 5, remaining: 13 },
    ],
  },
  {
    staffId: "s2",
    name: "박은수",
    position: "지원교사",
    department: "돌봄",
    balances: [
      { kind: "annual", total: 15, used: 3, remaining: 12 },
    ],
  },
  {
    staffId: "s3",
    name: "김선영",
    position: "지원교사",
    department: "돌봄",
    balances: [
      { kind: "annual", total: 12, used: 7, remaining: 5 },
    ],
  },
  {
    staffId: "s4",
    name: "이서준",
    position: "원감",
    department: "운영",
    balances: [
      { kind: "annual", total: 18, used: 10, remaining: 8 },
    ],
  },
  {
    staffId: "s5",
    name: "정예린",
    position: "مدير",
    department: "운영",
    balances: [
      { kind: "annual", total: 15, used: 2, remaining: 13 },
    ],
  },
];

// ─── 근속연수 + 회계연도 ────────────────────────────────
export const MY_LEAVE_YEAR_INFO: LeaveYearInfo = {
  hireDate: "2020-03-01",
  tenureYears: 5,
  tenureMonths: 4,
  fiscalYearStart: "2025-07-01",
  fiscalYearEnd: "2026-06-30",
  totalAnnualDays: 15,
};
