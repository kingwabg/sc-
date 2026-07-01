/**
 * lib/features/leave/labels.ts — 휴가 종류별 한국어 라벨 + 설명 + 색상
 */
import type { LeaveType, LeaveStatus } from "./types";

// ─── LeaveType 라벨 ──────────────────────────────────────

export interface LeaveTypeLabel {
  label: string;
  description: string;
  /** Tailwind text- 색상 클래스 */
  color: string;
  /** bg- 색상 클래스 */
  bgColor: string;
  /** border- 색상 클래스 */
  borderColor: string;
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, LeaveTypeLabel> = {
  ANNUAL: {
    label: "연차",
    description: "근속기간별 부여되는 유급 휴가",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  MATERNITY: {
    label: "출산휴가",
    description: "출산 전후 90일 (단태아)",
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  MATERNITY_MULTI: {
    label: "출산휴가(다태아)",
    description: "출산 전후 120일 (다태아)",
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  SPOUSE_CARE: {
    label: "배우자돌봄휴가",
    description: "배우자 출산 시 10일",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  FAMILY_CARE: {
    label: "가족돌봄휴가",
    description: " 가족 질병·부상 시 1년内有급 90일",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  REFRESH: {
    label: "Refresh휴가",
    description: "3년 근속 시 1일, 5년 시 3일",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
  EARLY_LEAVE: {
    label: "조퇴",
    description: "당일 조퇴 (반차 아님)",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  LATE_ARRIVAL: {
    label: "지각",
    description: "당일 지각",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  FAMILY_EVENT: {
    label: "경조사",
    description: "본인/배우자 가족의 경조사",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  OFFICIAL: {
    label: "공가",
    description: "법정 공가 (병역·시험 등)",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-300",
  },
  SICK: {
    label: "병가",
    description: "질병 치료를 위한 휴가",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  HALF_DAY: {
    label: "반차",
    description: "오전/오후 반일 휴가 (0.5일)",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
  },
};

// ─── LeaveStatus 라벨 ────────────────────────────────────

export interface LeaveStatusLabel {
  label: string;
  color: string;
  bgColor: string;
}

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, LeaveStatusLabel> = {
  PENDING: {
    label: "대기",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  APPROVED: {
    label: "승인",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  REJECTED: {
    label: "반려",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  CANCELLED: {
    label: "취소",
    color: "text-slate-500",
    bgColor: "bg-slate-100",
  },
  USED: {
    label: "사용완료",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
};
