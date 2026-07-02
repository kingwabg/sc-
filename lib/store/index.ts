/**
 * Tenant Store — 도메인별 모듈을 re-export
 * 기존 코드 호환을 위해 모든 함수를 단일 인덱스로 노출
 */

// Settings
export {
  DEFAULT_TENANT_SETTINGS,
  getTenantSettings,
  saveTenantSettings,
} from "./settings";
export type { TenantSettings } from "./settings";

// Children
export {
  getExtraChildren,
  addExtraChild,
  updateExtraChild,
  removeExtraChild,
  getAttendanceOverrides,
  setAttendanceOverride,
  clearAttendanceOverrides,
  getExtraCareLogs,
  addExtraCareLog,
} from "./children";
export type { AttendanceMap } from "./children";

// Staff / Volunteer
export {
  getExtraStaff,
  addExtraStaff,
  getStaffAttendanceOverrides,
  setStaffAttendanceOverride,
  getExtraVolunteers,
  addExtraVolunteer,
  getVolunteerAttendanceOverrides,
  setVolunteerAttendanceOverride,
} from "./staff";
export type { StaffAttendanceMap, VolunteerAttendanceMap } from "./staff";

// UI / badges / favorites / sidebar / mail accounts
export {
  THEME_MODE_EVENT,
  applyThemeMode,
  getThemeMode,
  setThemeMode,
  getSidebarCollapsed,
  setSidebarCollapsed,
  getFavoriteHrefs,
  addFavoriteHref,
  removeFavoriteHref,
  reorderFavorites,
  getMailUnreadCount,
  setMailUnreadCount,
  getApprovalPendingCount,
  setApprovalPendingCount,
  getTodayScheduleCount,
  setTodayScheduleCount,
  getMailAccounts,
  addMailAccount,
  removeMailAccount,
  updateMailAccount,
} from "./ui";
export type { ThemeMode } from "./ui";
