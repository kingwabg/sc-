/**
 * Volunteer Feature Module — utility functions
 */

import type { Volunteer, VolunteerAttendance } from "./types";
import { MOCK_VOLUNTEERS, MOCK_VOLUNTEER_ATTENDANCES } from "./data";

export function getVolunteerById(id: string): Volunteer | undefined {
  return MOCK_VOLUNTEERS.find((v) => v.id === id);
}

export function getVolunteerAttendanceByDate(volunteerId: string, date: string): VolunteerAttendance | undefined {
  return MOCK_VOLUNTEER_ATTENDANCES.find(
    (a) => a.volunteerId === volunteerId && a.date === date,
  );
}