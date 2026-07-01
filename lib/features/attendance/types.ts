/**
 * Attendance Feature — Domain Types
 */
import type { AttendanceStatus } from "../children/types";

export type { AttendanceStatus } from "../children/types";

export type AttendanceRow = {
  childId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  arrivedAt?: string;
  leftAt?: string;
  reason?: string;
};
