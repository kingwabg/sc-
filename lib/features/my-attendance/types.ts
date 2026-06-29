/**
 * My Attendance — 도메인 타입
 *
 * 기존 StaffAttendance는 기본 출퇴근 정보만 가지고 있어 캘린더/통계에 부족해서
 * 추가로 Status / WorkMinutes 같은 필드를 가진 AttendanceRow 타입을 정의.
 */

/** 하루 근태 상태 — 출근/결근/휴가/외출/미체크 */
export type AttendanceStatus =
  | "출근"
  | "결근"
  | "휴가"
  | "외출"
  | "미체크";

/** 날짜 1일 분량의 근태 (캘린더 셀) */
export type AttendanceRow = {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  clockIn?: string; // HH:mm
  clockOut?: string; // HH:mm
  workMinutes?: number; // 근무 시간(분)
  note?: string; // 비고 (외출, 조퇴 등)
};

/** 월간 통계 — 다우오피스 스타일 (누적/기본/잔여/연장/주휴) */
export type AttendanceMonthlyStats = {
  workDays: number; // 근무일수
  absentDays: number; // 결근
  leaveDays: number; // 휴가
  totalWorkMinutes: number; // 누적 근무 시간(분)
  baseWorkMinutes: number; // 기본 근무 시간(분)
  overtimeMinutes: number; // 연장 근무 시간(분)
};

export type AttendanceSummary = {
  thisMonth: AttendanceMonthlyStats;
  rows: AttendanceRow[]; // 이번달 일별
};
