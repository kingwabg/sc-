/**
 * Volunteer Feature Module — mock data
 */

import type { Volunteer, VolunteerAttendance, VolunteerType } from "./types";

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

export const VOLUNTEER_TYPE_LABELS: Record<VolunteerType, string> = {
  "공익근무자": "공익근무자",
  "자원봉사자": "자원봉사자",
  "실습생": "실습생",
  "기타": "기타",
};