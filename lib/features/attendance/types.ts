/**
 * Attendance Feature — Domain Types
 */
import type { AttendanceStatus } from "../children/types";

export type { AttendanceStatus } from "../children/types";

/** 결석 사유枚举 */
export type AbsenceReason = "DISEASE" | "FAMILY" | "SCHOOL" | "OTHER";

export type AttendanceRow = {
  childId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  arrivedAt?: string;
  leftAt?: string;
  reason?: string;
  /** 결석 시 사유 */
  absenceReason?: AbsenceReason;
  /** 결석 시 비고 */
  reasonNote?: string;
};
