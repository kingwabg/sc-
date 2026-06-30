/**
 * Staff Feature Module — domain types
 */

export type StaffPosition =
  | "所长"    // 소장
  | "支援교사" // 지원교사
  | "조리사"  // 조리사
  | "행정"   // 행정
  | "기타";  // 기타

export type Staff = {
  id: string;
  tenantId: string;
  name: string;
  /** 로그인 ID (추후 인증 연계) */
  loginId: string;
  gender: "M" | "F";
  phone: string;
  position: StaffPosition;
  joinDate: string; // YYYY-MM-DD
  email?: string;
  status: "active" | "leave" | "retired";
};

// 근태 (Staff Attendance — 출근/퇴근)
export type StaffAttendance = {
  id: string;
  tenantId: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  clockIn?: string;   // HH:mm
  clockOut?: string;  // HH:mm
  note?: string;
  authorId: string; // 수정한 관리자 ID
};