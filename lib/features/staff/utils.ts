/**
 * Staff Feature Module — utility functions
 */

import type { Staff, StaffAttendance, StaffProfile } from "./types";
import { MOCK_STAFF, MOCK_STAFF_ATTENDANCES, MOCK_STAFF_PROFILES } from "./data";

export function getStaffById(id: string): Staff | undefined {
  return MOCK_STAFF.find((s) => s.id === id);
}

export function getStaffAttendanceByDate(staffId: string, date: string): StaffAttendance | undefined {
  return MOCK_STAFF_ATTENDANCES.find(
    (a) => a.staffId === staffId && a.date === date,
  );
}

export function getStaffProfileById(id: string): StaffProfile | undefined {
  return MOCK_STAFF_PROFILES.find((p) => p.id === id);
}

export function workHours(clockIn?: string, clockOut?: string): string {
  if (!clockIn || !clockOut) return "—";
  const [ih, im] = clockIn.split(":").map(Number);
  const [oh, om] = clockOut.split(":").map(Number);
  const mins = oh * 60 + om - (ih * 60 + im);
  if (mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ── 5 탭용 유틸 ──────────────────────────────────────────────

/**
 * 주민번호 마스킹: 920412-1****** → 920412-1******
 * 뒤 7자리 중 뒤 6자리를 *로
 */
export function formatJumin(jumin: string): string {
  // 앞 7자리(뒤에 - 포함) 그대로, 뒤 7자리 중 뒤 6자리 *
  const matched = jumin.match(/^(\d{6})-?(\d{1})(\d{6})$/);
  if (!matched) return jumin;
  return `${matched[1]}-${matched[2]}******`;
}

/**
 * 전화번호 포맷: 01058114237 → 010-5811-4237
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

/**
 * 성명 마스킹: 김영미 → 김○미 (실시간 검색 노출용)
 */
export function maskName(name: string): string {
  if (!name || name.length < 2) return name;
  if (name.length === 2) return name[0] + "○";
  return name[0] + "○".repeat(name.length - 2) + name[name.length - 1];
}

/**
 * 근속연수 계산 (년, 개월)
 * 입사일 기준 오늘까지
 */
export function calcYearsOfService(joinDate: string): { years: number; months: number } {
  const join = new Date(joinDate);
  const now = new Date();
  let years = now.getFullYear() - join.getFullYear();
  let months = now.getMonth() - join.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  const dayDiff = now.getDate() - join.getDate();
  if (dayDiff < 0) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  return { years, months };
}

/**
 * 호봉 → 만기년수 (년)
 * 1호봉 = 입사当年, 이후每年 +1
 */
export function salaryStepToYears(step: number): number {
  return Math.max(0, step - 1);
}

/**
 * 부서명 → 부서코드 (간이 매핑)
 */
export function deptCode(name: string): string {
  const map: Record<string, string> = {
    "시설장실": "D001",
    "사회복지팀": "D002",
    "보육팀": "D003",
    "조리팀": "D004",
    "사무국": "D005",
  };
  return map[name] ?? "D000";
}
