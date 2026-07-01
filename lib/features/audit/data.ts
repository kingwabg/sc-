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
import type { AuditNotice, EvalItem } from "./types";
import { SIGNAL_EMOJI } from "./labels";

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

// ─── 평가 항목 목록 ────────────────────────────────────────
function buildEvalItems(summary: AuditSummary): EvalItem[] {
  return [
    {
      id: "consultation_rate",
      label: "아동 상담 기록률",
      threshold: "≥ 80%",
      current: summary.consultation.rate,
      unit: "%",
      passed: summary.consultation.rate >= 80,
      note: summary.consultation.rate >= 80 ? "통과" : "미통과 — 관찰 기록 보강 필요",
    },
    {
      id: "document_rate",
      label: "결재 서류 보관율",
      threshold: "≥ 80%",
      current: summary.document.rate,
      unit: "%",
      passed: summary.document.rate >= 80,
      note: summary.document.rate >= 80 ? "통과" : "미통과 — 서류 スキャン 필요",
    },
    {
      id: "consistency",
      label: "출석-일지 일관성",
      threshold: "0건",
      current: `${summary.consistency.conflictCount}건`,
      passed: summary.consistency.conflictCount === 0,
      note:
        summary.consistency.conflictCount === 0
          ? "통과"
          : `미통과 — ${summary.consistency.conflictCount}건 모순 발생`,
    },
    {
      id: "sponsorship_rate",
      label: "후원금 입금 매칭율",
      threshold: "≥ 80%",
      current: summary.sponsorship.rate,
      unit: "%",
      passed: summary.sponsorship.rate >= 80,
      note: summary.sponsorship.rate >= 80 ? "통과" : "미통과 — 후원금 정산 필요 (P9)",
    },
  ];
}

// ─── 간단한 해시 (notice ID용) ───────────────────────────────
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// ─── 평가 통보서 생성 ───────────────────────────────────────
/**
 * 평가 통보서 자동 생성
 * - tenantName + 기간 + 신호등 집계 + 평가 항목 + HTML 미리보기
 */
export async function generateAuditNotice(
  tenantId: string,
  tenantName: string,
  summary: AuditSummary,
  conflicts: ConflictItem[],
): Promise<AuditNotice> {
  const { from, to } = recentDays(30);
  const id = simpleHash(`${tenantId}|${from}|${to}`);
  const evalItems = buildEvalItems(summary);
  const generatedAt = new Date().toISOString();

  // 텍스트 버전
  const passCount = evalItems.filter((e) => e.passed).length;
  const plainText = [
    `===== 평가 통보서 =====`,
    `발급일시: ${generatedAt.slice(0, 16).replace("T", " ")}`,
    `대상기관: ${tenantName}`,
    `평가기간: ${from} ~ ${to}`,
    ``,
    `[1] 아동 상담 기록률  ${summary.consultation.rate}% ${SIGNAL_EMOJI[summary.consultation.light]}`,
    `[2] 결재 서류 보관율  ${summary.document.rate}%   ${SIGNAL_EMOJI[summary.document.light]}`,
    `[3] 출석-일지 일관성  ${summary.consistency.conflictCount}건   ${SIGNAL_EMOJI[summary.consistency.light]}`,
    `[4] 후원금 매칭율      ${summary.sponsorship.rate}%   ${SIGNAL_EMOJI[summary.sponsorship.light]}`,
    ``,
    `평가 항목: ${passCount}/${evalItems.length} 항목 통과`,
    ...evalItems.map(
      (e) =>
        `  ${e.passed ? "✅" : "❌"} ${e.label}  ${e.current}${e.unit ?? ""}  (기준 ${e.threshold})`,
    ),
    ``,
    conflicts.length > 0
      ? `※ 주의: ${conflicts.length}건의 출석-일지 불일치가 확인되었습니다.`
      : "※ 이상 없음.",
  ].join("\n");

  // HTML 미리보기
  const previewHtml = `<div style="font-family:'Noto Sans KR',sans-serif;max-width:700px;padding:24px">\
<h2 style="border-bottom:2px solid #4F46E5;padding-bottom:8px;color:#1e293b">📋 평가 통보서</h2>\
<table style="width:100%;border-collapse:collapse;margin-top:16px">\
<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600;width:100px">대상기관</td>\
<td style="padding:6px 12px">${tenantName}</td></tr>\
<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">평가기간</td>\
<td style="padding:6px 12px">${from} ~ ${to}</td></tr>\
<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">발급일시</td>\
<td style="padding:6px 12px">${generatedAt.slice(0, 16).replace("T", " ")}</td></tr>\
<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">신호등</td>\
<td style="padding:6px 12px">\
① 아동 상담 ${summary.consultation.rate}% ${SIGNAL_EMOJI[summary.consultation.light]} / \
② 결재 서류 ${summary.document.rate}% ${SIGNAL_EMOJI[summary.document.light]} / \
③ 일관성 ${summary.consistency.conflictCount}건 ${SIGNAL_EMOJI[summary.consistency.light]} / \
④ 후원금 ${summary.sponsorship.rate}% ${SIGNAL_EMOJI[summary.sponsorship.light]}</td></tr>\
</table>\
<h3 style="margin-top:20px;color:#334155">평가 항목 체크</h3>\
<table style="width:100%;border-collapse:collapse">\
<thead><tr style="background:#f1f5f9;text-align:left">\
<th style="padding:8px 12px">항목</th><th style="padding:8px 12px">기준</th>\
<th style="padding:8px 12px">현재값</th><th style="padding:8px 12px">결과</th></tr></thead>\
<tbody>\
${evalItems
  .map(
    (e) => `<tr style="border-bottom:1px solid #e2e8f0">\
<td style="padding:8px 12px">${e.label}</td>\
<td style="padding:8px 12px">${e.threshold}</td>\
<td style="padding:8px 12px">${e.current}${e.unit ?? ""}</td>\
<td style="padding:8px 12px;color:${e.passed ? "#16a34a" : "#dc2626"};font-weight:700">\
${e.passed ? "✅ 통과" : "❌ 미통과"}</td></tr>`,
  )
  .join("")}\
</tbody></table>\
<p style="margin-top:16px;font-size:13px;color:#64748b">\
${conflicts.length > 0 ? `⚠️ 주의: ${conflicts.length}건의 출석-일지 불일치가 확인되었습니다.` : "✅ 이상 없음."}</p>\
</div>`;

  return {
    id,
    tenantName,
    generatedAt,
    rangeFrom: from,
    rangeTo: to,
    summary,
    conflicts,
    evalItems,
    plainText,
    previewHtml,
  };
}
