/**
 * 비종사자 (공익 / 자원봉사자) — Volunteer / Part-time
 * 단순 출석 (등원/결석) 관리 대상 — 출근/퇴근 없음
 */

export type VolunteerType = "공익근무자" | "자원봉사자" | "실습생" | "기타";

export type Volunteer = {
  id: string;
  tenantId: string;
  name: string;
  gender: "M" | "F";
  phone: string;
  type: VolunteerType;
  /** 활동 시작일 */
  startDate: string; // YYYY-MM-DD
  /** 활동 종료일 (null = 계속) */
  endDate?: string;
  organization?: string; // 소속 (학교, 기관 등)
  note?: string;
  status: "active" | "completed" | "paused";
};

// 비종사자 출석 (등원 / 결석)
export type VolunteerAttendance = {
  id: string;
  tenantId: string;
  volunteerId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
  reason?: string; // 결석 시 사유
  authorId: string;
};

// ─── Mock Data ──────────────────────────────────────────────
export const MOCK_VOLUNTEERS: Volunteer[] = [
  { id: "v01", tenantId: "t_acme", name: "정서윤", gender: "F", phone: "010-7777-8888", type: "공익근무자", startDate: "2026-01-10", organization: "OO구청", status: "active" },
  { id: "v02", tenantId: "t_acme", name: "강동현", gender: "M", phone: "010-8888-9999", type: "자원봉사자", startDate: "2026-03-01", organization: "OO대학교 사회복지학과", status: "active" },
  { id: "v03", tenantId: "t_acme", name: "문지환", gender: "M", phone: "010-9999-0000", type: "실습생", startDate: "2026-06-01", organization: "OO대학교 아동복지학과", endDate: "2026-08-31", status: "active" },
  { id: "v04", tenantId: "t_acme", name: "윤하은", gender: "F", phone: "010-1212-3434", type: "자원봉사자", startDate: "2025-09-01", status: "completed" },
];

const today = new Date().toISOString().slice(0, 10);

export const MOCK_VOLUNTEER_ATTENDANCES: VolunteerAttendance[] = [
  { id: "va01", tenantId: "t_acme", volunteerId: "v01", date: today, present: true, authorId: "u_1" },
  { id: "va02", tenantId: "t_acme", volunteerId: "v02", date: today, present: false, reason: "개인 사정", authorId: "u_1" },
  { id: "va03", tenantId: "t_acme", volunteerId: "v03", date: today, present: true, authorId: "u_1" },
];

// ─── Helpers ─────────────────────────────────────────────────
export const VOLUNTEER_TYPE_LABELS: Record<VolunteerType, string> = {
  "공익근무자": "공익근무자",
  "자원봉사자": "자원봉사자",
  "실습생": "실습생",
  "기타": "기타",
};

export function getVolunteerById(id: string): Volunteer | undefined {
  return MOCK_VOLUNTEERS.find((v) => v.id === id);
}

export function getVolunteerAttendanceByDate(volunteerId: string, date: string): VolunteerAttendance | undefined {
  return MOCK_VOLUNTEER_ATTENDANCES.find(
    (a) => a.volunteerId === volunteerId && a.date === date,
  );
}
