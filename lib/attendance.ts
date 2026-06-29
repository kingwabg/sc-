// Attendance — 출석 데이터 (월별/연도별 생성)
// 출결대장 그리드용 mock

import type { AttendanceStatus } from "./children";

export type AttendanceRow = {
  childId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  arrivedAt?: string;
  leftAt?: string;
  reason?: string;
};

/** 특정 연/월에 대한 출석 데이터 생성 (mock) */
function genMonth(year: number, month1to12: number): AttendanceRow[] {
  const daysInMonth = new Date(year, month1to12, 0).getDate();
  const rows: AttendanceRow[] = [];
  // 시드 기반 의사 난수 (같은 입력이면 같은 결과)
  let seed = year * 100 + month1to12;
  const rng = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month1to12).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dow = new Date(year, month1to12 - 1, d).getDay(); // 0=일, 6=토
    // 주말은 모두 미등원
    if (dow === 0 || dow === 6) continue;
    // 16명 아이들
    for (const childId of CHILD_IDS) {
      const r = rng();
      let status: AttendanceStatus;
      let arrivedAt: string | undefined;
      let leftAt: string | undefined;
      let reason: string | undefined;

      if (r < 0.78) status = "등원";
      else if (r < 0.85) status = "결석";
      else if (r < 0.92) status = "미등원";
      else if (r < 0.96) status = "조퇴";
      else status = "보건휴식";

      if (status === "등원") {
        const h = 8 + Math.floor(rng() * 2);
        const m = Math.floor(rng() * 60);
        arrivedAt = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        // 30% 확률로 하원시간도 기록
        if (rng() < 0.3) {
          leftAt = "18:00";
        }
      } else if (status === "조퇴") {
        arrivedAt = "09:00";
        leftAt = "13:00";
        reason = "병원 진료";
      } else if (status === "보건휴식") {
        arrivedAt = "09:00";
        reason = "두통";
      } else if (status === "결석" || status === "미등원") {
        reason = status === "결석" ? "감기로 인한 병가" : undefined;
      }

      rows.push({ childId, date, status, arrivedAt, leftAt, reason });
    }
  }
  return rows;
}

// 출석대장에 표시할 16명 (children.ts의 ID 순서)
const CHILD_IDS = [
  "c01", "c02", "c03", "c04", "c05", "c06",
  "c11", "c12", "c13", "c14", "c15",
  "c21", "c22", "c23", "c24", "c25",
];

/** 캐시: 연도 → 월별 데이터 합본 */
const cache = new Map<number, AttendanceRow[]>();

export function getAttendanceForYear(year: number): AttendanceRow[] {
  if (cache.has(year)) return cache.get(year)!;
  const all: AttendanceRow[] = [];
  for (let m = 1; m <= 12; m++) {
    all.push(...genMonth(year, m));
  }
  cache.set(year, all);
  return all;
}

export function getAttendanceForMonth(year: number, month1to12: number): AttendanceRow[] {
  return genMonth(year, month1to12);
}

/** 한 달 출석률 통계 */
export function monthlyStats(
  rows: AttendanceRow[],
): { present: number; absent: number; leave: number; sick: number; rate: number } {
  const present = rows.filter((r) => r.status === "등원").length;
  const leave = rows.filter((r) => r.status === "조퇴").length;
  const sick = rows.filter((r) => r.status === "보건휴식").length;
  const absent = rows.filter((r) => r.status === "결석" || r.status === "미등원").length;
  const valid = present + leave + sick + absent;
  const rate = valid > 0 ? Math.round(((present + leave * 0.5) / valid) * 100) : 0;
  return { present, absent, leave, sick, rate };
}

/** 일자별 × 아동 매트릭스용 빠른 조회 */
export function attendanceMap(rows: AttendanceRow[]): Record<string, Record<string, AttendanceRow>> {
  const m: Record<string, Record<string, AttendanceRow>> = {};
  for (const r of rows) {
    if (!m[r.date]) m[r.date] = {};
    m[r.date][r.childId] = r;
  }
  return m;
}

/** 월의 영업일 수 (월~금) */
export function businessDaysInMonth(year: number, month1to12: number): number {
  const daysInMonth = new Date(year, month1to12, 0).getDate();
  let n = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month1to12 - 1, d).getDay();
    if (dow !== 0 && dow !== 6) n++;
  }
  return n;
}

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