export type NoticeTag = {
  label: string;
  tone?: "red" | "blue" | "green" | "default";
};

export type Notice = {
  id: string;
  tag: NoticeTag;
  title: string;
  date: string;
};

export const NOTICES: Notice[] = [
  { id: "n1", tag: { label: "중요", tone: "red" }, title: "2026년 상반기 인사평가 안내", date: "06-27" },
  { id: "n2", tag: { label: "시스템", tone: "blue" }, title: "시스템 점검 안내 (6/29 02:00-06:00)", date: "06-26" },
  { id: "n3", tag: { label: "복지", tone: "green" }, title: "여름휴가 신청 기간 안내", date: "06-24" },
  { id: "n4", tag: { label: "사내" }, title: "사내 동호회 모집 안내", date: "06-22" },
  { id: "n5", tag: { label: "일반" }, title: "신규 입사자 환영회 안내", date: "06-20" },
];

export const TAG_TONE = {
  red: "bg-red-50 text-red-700 border-red-200",
  blue: "bg-blue-50 text-blue-800 border-blue-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  default: "bg-slate-50 text-slate-600 border-slate-200",
} as const;
