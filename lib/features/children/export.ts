/**
 * Children CSV 내보내기 유틸
 */

import type { Child, AttendanceStatus } from "@/lib/features/children/types";

type Attendance = {
  childId: string;
  status: AttendanceStatus;
  arrivedAt?: string;
};

export function exportChildrenCSV(
  children: Child[],
  attendanceMap: Record<string, Attendance | undefined>,
): void {
  if (children.length === 0) return;
  const header = ["성", "이름", "학년", "나이", "보호자", "연락처", "알레르기", "오늘"];
  const rows = children.map((c) => {
    const a = attendanceMap[c.id];
    const age = Math.floor(
      (Date.now() - new Date(c.birthDate).getTime()) / (365.25 * 86400 * 1000),
    );
    return [
      c.nameLast,
      c.nameFirst,
      c.grade ?? "",
      age,
      c.guardian.name,
      c.guardian.phone,
      c.health.allergies.join("/"),
      a?.status ?? "",
    ].join(",");
  });
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const today = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `children_${today}.csv`;
  a.click();
}