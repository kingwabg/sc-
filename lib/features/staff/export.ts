/**
 * Staff CSV 내보내기 유틸
 */

import { POSITION_LABELS, type Staff } from "@/lib/staff";

export function exportStaffCSV(staff: Staff[], today: string): void {
  if (staff.length === 0) return;
  const header = ["ID", "이름", "직위", "연락처", "이메일", "입사일", "상태"];
  const rows = staff.map((s) =>
    [
      s.id,
      s.name,
      POSITION_LABELS[s.position],
      s.phone,
      s.email ?? "",
      s.joinDate,
      s.status === "active" ? "재직" : s.status === "leave" ? "휴직" : "퇴직",
    ].join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `staff_${today}.csv`;
  a.click();
}