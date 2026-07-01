/**
 * lib/features/audit/data.ts
 * Prisma 기반 크로스체크 쿼리 — Server Component only
 */

import { db } from "@/lib/db";
import {
  computeDocExpiryLight,
} from "@/lib/features/documents/data";
import type {
  ConflictItem,
  ConflictType,
  CrossCheckResult,
  AuditSummary,
} from "./types";
import { computeSeverity, signalByRate, signalByCount, recentDays } from "./utils";

// ─── Attendance + CareLog 충돌 조회 ─────────────────────────
//
// DailyLog (tenant 수준) ↔ Attendance (child 수준) 직접 조인 불가.
// 대신 CareLog (childId linking)를 돌봄일지 대리로 사용.
// 충돌 유형:
//   ATTENDANCE_NO_LOG  — Attendance PRESENT/absent but no CareLog
//   LOG_NO_ATTENDANCE  — CareLog exists but Attendance is ABSENT or absent
//
async function findAttendanceCareLogConflicts(
  tenantId: string,
  from: string,
  to: string,
): Promise<ConflictItem[]> {
  // 1) Attendance records in range for this tenant's children
  const attendances = await db.attendance.findMany({
    where: {
      child: { tenantId },
      date: { gte: from, lte: to },
    },
    include: { child: { select: { id: true, name: true } } },
  });

  // 2) CareLog records in range
  const careLogs = await db.careLog.findMany({
    where: {
      child: { tenantId },
      date: { gte: from, lte: to },
    },
    select: { childId: true, date: true },
  });

  // careLogSet: "childId|date" → true
  const careLogSet = new Set(careLogs.map((c) => `${c.childId}|${c.date}`));

  const conflicts: ConflictItem[] = [];

  for (const att of attendances) {
    const key = `${att.childId}|${att.date}`;
    const hasCareLog = careLogSet.has(key);
    const isAbsent = att.status === "결석";

    if (!hasCareLog && isAbsent) {
      // 결석인데 일지도 없음 → 무시 (결석 자체가 정상 기록)
      continue;
    }
    if (!hasCareLog) {
      // 출석인데 일지 없음
      conflicts.push({
        childId: att.child.id,
        childName: att.child.name,
        date: att.date,
        attendanceStatus: att.status,
        careLogExists: false,
        conflictType: "ATTENDANCE_NO_LOG",
        severity: computeSeverity("ATTENDANCE_NO_LOG"),
      });
    }
  }

  // careLog 있되 attendance가 ABSENT/없는 경우
  const attendanceMap = new Map(
    attendances.map((a) => [`${a.childId}|${a.date}`, a.status]),
  );
  for (const cl of careLogs) {
    const attStatus = attendanceMap.get(`${cl.childId}|${cl.date}`);
    if (attStatus === "결석") {
      conflicts.push({
        childId: cl.childId,
        childName: "", // fill from lookup below
        date: cl.date,
        attendanceStatus: attStatus,
        careLogExists: true,
        conflictType: "LOG_NO_ATTENDANCE",
        severity: computeSeverity("LOG_NO_ATTENDANCE"),
      });
    }
  }

  // Fill childName for LOG_NO_ATTENDANCE conflicts
  if (conflicts.some((c) => c.conflictType === "LOG_NO_ATTENDANCE" && !c.childName)) {
    const childIds = [...new Set(conflicts.filter((c) => !c.childName).map((c) => c.childId))];
    const children = await db.child.findMany({
      where: { id: { in: childIds } },
      select: { id: true, name: true },
    });
    const childMap = new Map(children.map((c) => [c.id, c.name]));
    for (const c of conflicts) {
      if (!c.childName && childMap.has(c.childId)) {
        c.childName = childMap.get(c.childId)!;
      }
    }
  }

  return conflicts;
}

// ─── 아동 상담 기록률 ────────────────────────────────────────
async function computeConsultationRate(tenantId: string): Promise<number> {
  const children = await db.child.count({ where: { tenantId, status: "active" } });
  if (children === 0) return 100;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const from = thirtyDaysAgo.toISOString().slice(0, 10);
  const to = new Date().toISOString().slice(0, 10);

  const childrenWithConsultation = await db.careLog.groupBy({
    by: ["childId"],
    where: {
      child: { tenantId },
      date: { gte: from, lte: to },
      category: "관찰",
    },
  });

  if (children === 0) return 100;
  return Math.round((childrenWithConsultation.length / children) * 100);
}

// ─── 결재 서류 보관율 ────────────────────────────────────────
async function computeDocumentRate(tenantId: string): Promise<number> {
  const children = await db.child.count({ where: { tenantId, status: "active" } });
  if (children === 0) return 100;

  const docsWithFiles = await db.childDocument.count({
    where: { child: { tenantId } },
  });

  return Math.round((Math.min(docsWithFiles, children) / children) * 100);
}

// ─── 후원금 매칭율 ───────────────────────────────────────────
async function computeSponsorshipRate(_tenantId: string): Promise<number> {
  // P9에서 구현 — 현재는 Mock 85%
  return 85;
}

// ─── 공개 API ────────────────────────────────────────────────

/**
 * 특정 기간 내 모든儿童的 Attendance ↔ CareLog 충돌 반환
 */
export async function crossCheckByDateRange(
  tenantId: string,
  from: string,
  to: string,
): Promise<ConflictItem[]> {
  return findAttendanceCareLogConflicts(tenantId, from, to);
}

/**
 * 평가 대비 신호등 집계 (P6 부터 docExpiry 포함 — 5개 카드)
 */
export async function computeAuditSummary(
  tenantId: string,
): Promise<AuditSummary> {
  const { from, to } = recentDays(30);

  const [consultation, document, consistencyCount, sponsorship, docExpiry] =
    await Promise.all([
      computeConsultationRate(tenantId),
      computeDocumentRate(tenantId),
      findAttendanceCareLogConflicts(tenantId, from, to).then((c) => c.length),
      computeSponsorshipRate(tenantId),
      computeDocExpiryLight(tenantId),
    ]);

  return {
    consultation: {
      rate: consultation,
      light: signalByRate(consultation),
    },
    document: {
      rate: document,
      light: signalByRate(document),
    },
    consistency: {
      conflictCount: consistencyCount,
      light: signalByCount(consistencyCount),
    },
    sponsorship: {
      rate: sponsorship,
      light: signalByRate(sponsorship),
    },
    docExpiry: {
      expiringSoonCount: docExpiry.expiringSoonCount,
      expiredCount: docExpiry.expiredCount,
      light: docExpiry.light,
    },
  };
}
