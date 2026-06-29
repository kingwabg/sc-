export type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  color: string;
  isNow?: boolean;
};

export const SCHEDULE: ScheduleItem[] = [
  { id: "s1", time: "09:00", title: "데일리 스크럼", subtitle: "프로덕트팀 · 온라인", color: "bg-blue-500" },
  { id: "s2", time: "11:00", title: "클라이언트 미팅 (A사)", subtitle: "서울 본사 5층 대회의실", color: "bg-red-500", isNow: true },
  { id: "s3", time: "13:00", title: "점심", subtitle: "동료 3명과 약속", color: "bg-slate-400" },
  { id: "s4", time: "14:30", title: "디자인 리뷰", subtitle: "디자인팀 · 화상회의", color: "bg-emerald-500" },
  { id: "s5", time: "16:00", title: "주간회의", subtitle: "임원 회의실", color: "bg-amber-500" },
];
