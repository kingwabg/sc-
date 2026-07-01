/**
 * Attendance Feature — Public API (barrel)
 */
export type { AttendanceRow, AttendanceStatus, AbsenceReason } from "./types";
export {
  CHILD_IDS,
  cache,
  genMonth,
  markAbsenceWithReason,
  getAbsenceReason,
  type AbsenceReasonEntry,
} from "./data";
export {
  getAttendanceForYear,
  getAttendanceForMonth,
  monthlyStats,
  attendanceMap,
  businessDaysInMonth,
} from "./utils";
export { STATUS_LABEL, STATUS_TONE, ABSENCE_REASON_LABEL } from "./labels";
