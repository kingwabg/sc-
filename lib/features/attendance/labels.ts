/**
 * Attendance Feature — UI Labels & Color Tokens
 */
import type { AttendanceStatus } from "../children/types";
import type { AbsenceReason } from "./types";

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  "등원": "등원",
  "결석": "결석",
  "조퇴": "조퇴",
  "보건휴식": "보건",
  "미등원": "미등원",
};

export const STATUS_TONE: Record<AttendanceStatus, { bg: string; text: string; cell: string }> = {
  "등원": { bg: "bg-emerald-100", text: "text-emerald-700", cell: "bg-emerald-100 text-emerald-700" },
  "결석": { bg: "bg-red-100", text: "text-red-700", cell: "bg-red-100 text-red-700" },
  "조퇴": { bg: "bg-amber-100", text: "text-amber-700", cell: "bg-amber-100 text-amber-700" },
  "보건휴식": { bg: "bg-blue-100", text: "text-blue-700", cell: "bg-blue-100 text-blue-700" },
  "미등원": { bg: "bg-slate-200", text: "text-slate-600", cell: "bg-slate-100 text-slate-500" },
};

/** 결석 사유 라벨 */
export const ABSENCE_REASON_LABEL: Record<AbsenceReason, string> = {
  DISEASE: "질병",
  FAMILY: "가정사정",
  SCHOOL: "학교행사",
  OTHER: "기타",
};
