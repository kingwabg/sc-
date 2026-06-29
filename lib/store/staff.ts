/**
 * Staff (종사자) + StaffAttendance 저장소
 */
import type { Staff, StaffAttendance } from "../staff";
import type { Volunteer, VolunteerAttendance } from "../volunteer";
import { readLS, writeLS } from "./_ls";

const STAFF_KEY = "officex:extra-staff";
const STAFF_ATT_KEY = "officex:staff-att-overrides";
const VOL_KEY = "officex:extra-volunteers";
const VOL_ATT_KEY = "officex:volunteer-att-overrides";

// ─── Staff ────────────────────────────────────────────────
export function getExtraStaff(): Staff[] {
  return readLS<Staff[]>(STAFF_KEY, []);
}

export function addExtraStaff(staff: Staff): Staff[] {
  const next = [...getExtraStaff(), staff];
  writeLS(STAFF_KEY, next);
  return next;
}

// ─── Staff Attendance ─────────────────────────────────────
export type StaffAttendanceMap = Record<string, StaffAttendance>;

export function getStaffAttendanceOverrides(): StaffAttendanceMap {
  return readLS<StaffAttendanceMap>(STAFF_ATT_KEY, {});
}

export function setStaffAttendanceOverride(staffId: string, att: StaffAttendance): StaffAttendanceMap {
  const next = { ...getStaffAttendanceOverrides(), [staffId]: att };
  writeLS(STAFF_ATT_KEY, next);
  return next;
}

// ─── Volunteer ────────────────────────────────────────────
export function getExtraVolunteers(): Volunteer[] {
  return readLS<Volunteer[]>(VOL_KEY, []);
}

export function addExtraVolunteer(vol: Volunteer): Volunteer[] {
  const next = [...getExtraVolunteers(), vol];
  writeLS(VOL_KEY, next);
  return next;
}

// ─── Volunteer Attendance ─────────────────────────────────
export type VolunteerAttendanceMap = Record<string, VolunteerAttendance>;

export function getVolunteerAttendanceOverrides(): VolunteerAttendanceMap {
  return readLS<VolunteerAttendanceMap>(VOL_ATT_KEY, {});
}

export function setVolunteerAttendanceOverride(volunteerId: string, att: VolunteerAttendance): VolunteerAttendanceMap {
  const next = { ...getVolunteerAttendanceOverrides(), [volunteerId]: att };
  writeLS(VOL_ATT_KEY, next);
  return next;
}