/**
 * Staff Feature Module — mock data
 */

import type { Staff, StaffAttendance, StaffPosition } from "./types";

export const MOCK_STAFF: Staff[] = [
  { id: "s01", tenantId: "t_acme", name: "김영미", loginId: "kimym", gender: "F", phone: "010-1111-2222", position: "所长", joinDate: "2020-03-01", status: "active" },
  { id: "s02", tenantId: "t_acme", name: "박은수", loginId: "parkes", gender: "F", phone: "010-2222-3333", position: "支援교사", joinDate: "2022-03-01", status: "active" },
  { id: "s03", tenantId: "t_acme", name: "김선영", loginId: "kimsy", gender: "F", phone: "010-3333-4444", position: "支援교사", joinDate: "2023-09-01", status: "active" },
  { id: "s04", tenantId: "t_acme", name: "이정훈", loginId: "leejh", gender: "M", phone: "010-4444-5555", position: "조리사", joinDate: "2021-03-01", status: "active" },
  { id: "s05", tenantId: "t_acme", name: "최지연", loginId: "choijy", gender: "F", phone: "010-5555-6666", position: "행정", joinDate: "2024-01-15", status: "active" },
];

const today = new Date().toISOString().slice(0, 10);

export const MOCK_STAFF_ATTENDANCES: StaffAttendance[] = [
  { id: "sa01", tenantId: "t_acme", staffId: "s01", date: today, clockIn: "08:30", clockOut: "17:30", authorId: "u_1" },
  { id: "sa02", tenantId: "t_acme", staffId: "s02", date: today, clockIn: "08:45", clockOut: "18:00", authorId: "u_1" },
  { id: "sa03", tenantId: "t_acme", staffId: "s03", date: today, clockIn: "09:00", clockOut: "18:30", authorId: "u_1" },
  { id: "sa04", tenantId: "t_acme", staffId: "s04", date: today, clockIn: "06:30", clockOut: "15:00", authorId: "u_1" },
  { id: "sa05", tenantId: "t_acme", staffId: "s05", date: today, clockIn: "09:00", note: "외출 14:00~15:00", authorId: "u_1" },
];

export const POSITION_LABELS: Record<StaffPosition, string> = {
  "所长": "所长",
  "支援교사": "지원교사",
  "조리사": "조리사",
  "행정": "행정",
  "기타": "기타",
};