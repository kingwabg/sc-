/**
 * Attendance Feature — Data Generation & Cache
 */
import type { AttendanceStatus, AttendanceRow } from "./types";

/** 출석대장에 표시할 16명 (children.ts의 ID 순서) */
export const CHILD_IDS = [
  "c01", "c02", "c03", "c04", "c05", "c06",
  "c11", "c12", "c13", "c14", "c15",
  "c21", "c22", "c23", "c24", "c25",
] as const;

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

/** 캐시: 연도 → 월별 데이터 합본 */
export const cache = new Map<number, AttendanceRow[]>();

export { genMonth };
