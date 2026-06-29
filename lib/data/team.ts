export type TeamMember = {
  id: string;
  name: string;
  initial: string;
  color: string;
  status: "out" | "vacation" | "late";
  statusText: string;
};

export type AttendanceStat = {
  label: string;
  count: number;
  color: string;
  widthPct: number;
};

export const ATTENDANCE_STATS: AttendanceStat[] = [
  { label: "출근", count: 12, color: "bg-emerald-500", widthPct: 67 },
  { label: "외근", count: 3, color: "bg-blue-500", widthPct: 17 },
  { label: "휴가", count: 2, color: "bg-violet-500", widthPct: 11 },
  { label: "지각", count: 1, color: "bg-amber-500", widthPct: 6 },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "t1", name: "박지영", initial: "박", color: "bg-blue-100 text-blue-800", status: "out", statusText: "외근" },
  { id: "t2", name: "이서준", initial: "이", color: "bg-red-100 text-red-700", status: "vacation", statusText: "휴가" },
  { id: "t3", name: "최은우", initial: "최", color: "bg-emerald-100 text-emerald-700", status: "late", statusText: "지각 09:32" },
  { id: "t4", name: "정하늘", initial: "정", color: "bg-violet-100 text-violet-700", status: "out", statusText: "외근" },
];

export const MEMBER_STATUS_TONE = {
  out: "bg-blue-50 text-blue-800",
  vacation: "bg-violet-50 text-violet-700",
  late: "bg-amber-50 text-amber-700",
} as const;
