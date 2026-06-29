/**
 * My Attendance — Mock 데이터
 *
 * 박은수 (s02, 지원교사) 기준 30일치 mock 근태.
 * 주말/공휴일은 결근/휴가로 설정, 평일은 출퇴근 표시.
 */
import type { AttendanceRow } from "./types";

const today = new Date();
const Y = today.getFullYear();
const M = today.getMonth(); // 0-11

function dateKey(year: number, month0: number, day: number): string {
  const d = new Date(year, month0, day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function pickStatus(dayOfWeek: number, day: number): { status: AttendanceRow["status"]; in?: string; out?: string } {
  // 토(6) / 일(0) — 주말
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // 가끔 토요 출근 모킹 (월 2회 정도)
    if (dayOfWeek === 6 && day % 14 === 0) {
      return { status: "출근", in: "08:45", out: "13:00" };
    }
    return { status: "미체크" };
  }
  // 매월 1~2번째 주는 출근, 3번째 주는 휴가 1회, 가끔 결근 1회
  const cycle = day % 30;
  if (cycle === 14 || cycle === 22) return { status: "휴가" };
  if (cycle === 18) return { status: "외출", in: "09:00", out: "18:30" };
  if (cycle === 9) return { status: "결근" };
  // 일반 출근 — 08:40~09:10 사이 랜덤, 퇴근 17:30~18:30
  const inHour = 8 + (day % 3 === 0 ? 1 : 0);
  const inMin = 35 + (day % 5) * 5;
  const outHour = 17 + (day % 4);
  const outMin = 30 + (day % 3) * 10;
  return {
    status: "출근",
    in: `${String(inHour).padStart(2, "0")}:${String(Math.min(inMin, 59)).padStart(2, "0")}`,
    out: `${String(outHour).padStart(2, "0")}:${String(Math.min(outMin, 59)).padStart(2, "0")}`,
  };
}

/** 현재 월 1일 ~ 말일까지의 일별 근태 mock */
export function getMockMonthRows(): AttendanceRow[] {
  const lastDay = new Date(Y, M + 1, 0).getDate();
  const rows: AttendanceRow[] = [];
  for (let d = 1; d <= lastDay; d++) {
    const dt = new Date(Y, M, d);
    const dow = dt.getDay();
    const { status, in: ci, out: co } = pickStatus(dow, d);
    const workMinutes =
      ci && co
        ? (parseInt(co.slice(0, 2)) * 60 + parseInt(co.slice(3, 5))) -
          (parseInt(ci.slice(0, 2)) * 60 + parseInt(ci.slice(3, 5)))
        : undefined;
    rows.push({
      date: dateKey(Y, M, d),
      status,
      clockIn: ci,
      clockOut: co,
      workMinutes: workMinutes && workMinutes > 0 ? workMinutes : undefined,
    });
  }
  return rows;
}
