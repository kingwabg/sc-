/**
 * Daily Log — 통계 (Statistics) 도메인
 *
 * 정부24 사회보장정보원 「지역아동센터 운영관리」 통계 양식 기반
 * - 정원 / 현원 / 출석 / 결석 / 종사자교육 / 프로그램 등 운영 현황
 */

import { MOCK_DAILY_LOGS } from "@/lib/features/daily-log/data";

export type StatsPeriod = "week" | "month" | "year";

export type DailyStatsRow = {
  date: string;          // YYYY-MM-DD
  dayOfWeek: string;     // 월/화/...
  hours: string;         // 09:00~18:00
  manager: string;       // 담당자명
  capacity: number;      // 정원
  enrolled: number;      // 현재 (등록 인원)
  measure: number;       // 조치
  present: number;       // 출석
  notReturned: number;   // 미복귀
  attendanceRate: number;// 출석률 (%)
  absent: number;        // 결석
  excused: number;       // 공결
  staffEdu: number;      // 종사자교육
  staff: number;         // 종사자
  programs: number;      // 프로그램
  notReturned2: number;  // 미복귀(?)
  staff2: number;        // 종사자(?)
  edu: number;           // 교육
  holiday: number;       // 공휴
  etc: number | null;    // 기타
  status: "ok" | "warn" | "none";
  memo: string;          // 확인 메모
};

const MANAGERS = ["운영반", "최하은", "김선영", "박은수", "이정훈"];

function dayOfWeek(date: string): string {
  const d = new Date(date + "T00:00:00");
  return ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
}

function pseudo(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pickManager(date: string): string {
  const d = new Date(date + "T00:00:00");
  const idx = (d.getDate() + d.getMonth()) % MANAGERS.length;
  return MANAGERS[idx];
}

function generateRow(date: string): DailyStatsRow {
  const d = new Date(date + "T00:00:00");
  const dow = d.getDay();
  const isWeekend = dow === 0;
  const rnd = pseudo(d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate());
  const capacity = isWeekend ? 35 : 35;
  const enrolled = isWeekend ? 30 : 34 + Math.floor(rnd() * 2);
  const absent = isWeekend ? 0 : Math.floor(rnd() * 4);
  const excused = isWeekend ? 0 : rnd() < 0.3 ? 1 : 0;
  const notReturned = rnd() < 0.2 ? 1 : 0;
  const present = Math.max(0, enrolled - absent - excused - notReturned);
  const rate = enrolled > 0 ? Math.round((present / enrolled) * 100) : 0;
  const programs = dow === 0 || dow === 6 ? 0 : Math.floor(rnd() * 3);
  const staffEdu = rnd() < 0.4 ? 1 : 0;
  const staff = rnd() < 0.3 ? 1 : 0;
  const edu = rnd() < 0.5 ? 1 : 0;
  const holiday = isWeekend ? 1 : 0;

  return {
    date,
    dayOfWeek: dayOfWeek(date),
    hours: isWeekend ? "휴관" : "09:00 ~ 18:00",
    manager: isWeekend ? "-" : pickManager(date),
    capacity,
    enrolled,
    measure: 0,
    present,
    notReturned,
    attendanceRate: rate,
    absent,
    excused,
    staffEdu,
    staff,
    programs,
    notReturned2: 0,
    staff2: staff,
    edu,
    holiday,
    etc: null,
    status: rate >= 90 ? "ok" : rate >= 70 ? "warn" : "warn",
    memo: programs > 0 ? `프로그램 ${programs}건` : isWeekend ? "주말" : "-",
  };
}

/** 30일치 mock 통계 (오늘 기준 과거 30일) */
export const MOCK_DAILY_STATS: DailyStatsRow[] = (() => {
  const out: DailyStatsRow[] = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    out.push(generateRow(iso));
  }
  return out.reverse();
})();

/** 일지 데이터에서 통계 만들기 (fallback) */
export function buildStatsFromLogs(): DailyStatsRow[] {
  return MOCK_DAILY_LOGS.map((log: { date: string }) => generateRow(log.date));
}