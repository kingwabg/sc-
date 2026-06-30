/**
 * Children Feature — Mock Data
 */
import type { Child, Attendance, CareLog } from "./types";

export const MOCK_CHILDREN: Child[] = [
  // 임시 3명 (테스트용)
  { id: "c01", tenantId: "t_acme", name: "김민준", nameLast: "김", nameFirst: "민준", birthDate: "2017-05-12", gender: "M", capacityGroup: 30, grade: "초3", guardian: { name: "김영희", relation: "모", phone: "010-1234-5678", job: "회사원" }, health: { allergies: ["복숭아"], medications: [], notes: "" }, enrolledAt: "2024-03-02", status: "active" },
  { id: "c02", tenantId: "t_acme", name: "이서윤", nameLast: "이", nameFirst: "서윤", birthDate: "2018-02-23", gender: "F", capacityGroup: 30, grade: "초2", guardian: { name: "이정숙", relation: "모", phone: "010-2345-6789" }, health: { allergies: [], medications: [], notes: "" }, enrolledAt: "2024-03-02", status: "active" },
  { id: "c03", tenantId: "t_acme", name: "박지호", nameLast: "박", nameFirst: "지호", birthDate: "2016-09-08", gender: "M", capacityGroup: 30, grade: "초4", guardian: { name: "박철수", relation: "부", phone: "010-3456-7890" }, health: { allergies: ["우유"], medications: [], notes: "천식 주의" }, enrolledAt: "2023-09-01", status: "active" },
];

const _today = new Date().toISOString().slice(0, 10);

export const MOCK_ATTENDANCES: Attendance[] = [
  { id: "a01", tenantId: "t_acme", childId: "c01", date: _today, status: "등원", arrivedAt: "09:15", guardianNotified: true, authorId: "u_1" },
  { id: "a02", tenantId: "t_acme", childId: "c02", date: _today, status: "등원", arrivedAt: "09:18", guardianNotified: true, authorId: "u_1" },
  { id: "a03", tenantId: "t_acme", childId: "c03", date: _today, status: "조퇴", arrivedAt: "09:20", leftAt: "13:00", reason: "병원 진료", guardianNotified: true, authorId: "u_1" },
];

// ─── CareLog (돌봄 일지) mock ────────────────────────────────────
const todayDate = new Date();
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const minus = (days: number) => {
  const d = new Date(todayDate);
  d.setDate(d.getDate() - days);
  return ymd(d);
};
const dateInYear = (year: number, month1to12: number, day: number) =>
  `${year}-${String(month1to12).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const MOCK_CARE_LOGS: CareLog[] = [
  // 임시 3명 기준 (테스트용)
  { id: "cl-001", childId: "c01", date: minus(0), category: "식사", title: "오후 간식", content: "요거트, 과일, 빵 — 잘 먹음", mood: "좋음", authorName: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 30 },
  { id: "cl-002", childId: "c02", date: minus(0), category: "놀이", title: "축구 게임", content: "팀 나눠서 진행, 골키퍼 역할 자원", mood: "좋음", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 45 },
  { id: "cl-003", childId: "c03", date: minus(0), category: "관찰", title: "조퇴 (병원)", content: "병원 진료로 인한 조퇴, 보호자 연락 완료", mood: "보통", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 5 },
];
