/**
 * Attendance Feature — Public API (barrel)
 */
export type { AttendanceRow, AttendanceStatus } from "./types";
export { CHILD_IDS, cache, genMonth } from "./data";
export {
  getAttendanceForYear,
  getAttendanceForMonth,
  monthlyStats,
  attendanceMap,
  businessDaysInMonth,
} from "./utils";
export { STATUS_LABEL, STATUS_TONE } from "./labels";
