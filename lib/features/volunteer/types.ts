/**
 * Volunteer Feature Module — domain types
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