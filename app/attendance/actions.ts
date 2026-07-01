/**
 * Attendance Server Actions
 * "use server" — Next.js App Router server action
 */
"use server";

import type { AbsenceReason } from "@/lib/features/attendance";
import { markAbsenceWithReason } from "@/lib/features/attendance";

export async function submitAbsenceReason(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const childId = formData.get("childId") as string;
  const date = formData.get("date") as string;
  const reason = formData.get("reason") as AbsenceReason;
  const note = (formData.get("note") as string) || undefined;
  const fileUrl = (formData.get("fileUrl") as string) || undefined;

  if (!childId || !date || !reason) {
    return { ok: false, error: "필수 항목이 누락되었습니다." };
  }

  const validReasons: AbsenceReason[] = ["DISEASE", "FAMILY", "SCHOOL", "OTHER"];
  if (!validReasons.includes(reason)) {
    return { ok: false, error: "유효하지 않은 사유입니다." };
  }

  try {
    markAbsenceWithReason(childId, date, reason, note, fileUrl);
    return { ok: true };
  } catch (err) {
    console.error("[submitAbsenceReason]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "서버 오류가 발생했습니다.",
    };
  }
}
