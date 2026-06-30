/**
 * Staff Feature Module — utility functions
 */

import type { Staff, StaffAttendance } from "./types";
import { MOCK_STAFF, MOCK_STAFF_ATTENDANCES } from "./data";

export function getStaffById(id: string): Staff | undefined {
  return MOCK_STAFF.find((s) => s.id === id);
}

export function getStaffAttendanceByDate(staffId: string, date: string): StaffAttendance | undefined {
  return MOCK_STAFF_ATTENDANCES.find(
    (a) => a.staffId === staffId && a.date === date,
  );
}

export function workHours(clockIn?: string, clockOut?: string): string {
  if (!clockIn || !clockOut) return "—";
  const [ih, im] = clockIn.split(":").map(Number);
  const [oh, om] = clockOut.split(":").map(Number);
  const mins = oh * 60 + om - (ih * 60 + im);
  if (mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}