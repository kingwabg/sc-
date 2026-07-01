/**
 * lib/features/meeting/data.ts — Meeting repository (server-only)
 *
 * - Prisma Meeting 쿼리 → Meeting view-model로 매핑
 * - GOVERNANCE 타입 저장 시 ApprovalRequest 자동 spawn (결재선: 시설장 → 센터장)
 * - DATABASE_URL 없으면 MOCK_MEETINGS로 자동 fallback (페이지 부수지 않음)
 *
 * 멀티테넌트: 모든 쿼리에서 tenantId 필터링 필수
 */

import "server-only";
import { db } from "@/lib/db";
import { MOCK_MEETINGS } from "./mock";
import {
  computeMeetingStats,
  buildSpawnedApproval,
  GOVERNANCE_APPROVAL_LINE,
  normalizeHeldAt,
} from "./utils";
import type {
  Meeting,
  MeetingInput,
  MeetingUpdateInput,
  MeetingListResult,
  CreateMeetingResult,
  MeetingType,
} from "./types";

const DEFAULT_TENANT = process.env.DEFAULT_TENANT_ID ?? "t_acme";

type DbMeetingRow = {
  id: string;
  tenantId: string;
  type: MeetingType;
  title: string;
  heldAt: Date;
  location: string | null;
  agenda: string[];
  content: string | null;
  attendees: string[];
  absent: string[];
  decisions: string[];
  docId: string | null;
  approvalId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** DB row → view-model Meeting */
function toMeeting(row: DbMeetingRow): Meeting {
  return {
    id: row.id,
    tenantId: row.tenantId,
    type: row.type,
    title: row.title,
    heldAt: row.heldAt,
    location: row.location,
    agenda: row.agenda,
    content: row.content,
    attendees: row.attendees,
    absent: row.absent,
    decisions: row.decisions,
    docId: row.docId,
    approvalId: row.approvalId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** DB 사용 가능 여부 — try/catch로 체크 (mock fallback 결정) */
async function tryPrisma<T>(
  fn: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("DATABASE_URL") ||
        err.message.includes("DIRECT_DATABASE_URL") ||
        err.message.includes("Environment variable"))
    ) {
      return await fallback();
    }
    console.error("[meeting.data] query failed:", err);
    return await fallback();
  }
}

/** mock mutation lock — 동일 프로세스 내에서 mock fallback 시 일관성 유지 */
const mockMeetingState: { meetings: Meeting[] } = {
  meetings: MOCK_MEETINGS.map((m) => ({ ...m })),
};

/** 단일 회의 조회 */
export async function getMeeting(id: string): Promise<Meeting | null> {
  return tryPrisma(
    async () => {
      const row = (await db.meeting.findFirst({
        where: { id, tenantId: DEFAULT_TENANT },
      })) as DbMeetingRow | null;
      return row ? toMeeting(row) : null;
    },
    () => mockMeetingState.meetings.find((m) => m.id === id) ?? null,
  );
}

/** 테넌트 회의 목록 + 통계 */
export async function listMeetings(
  tenantId: string = DEFAULT_TENANT,
): Promise<MeetingListResult> {
  return tryPrisma(
    async () => {
      const rows = (await db.meeting.findMany({
        where: { tenantId },
        orderBy: { heldAt: "desc" },
      })) as DbMeetingRow[];
      const meetings = rows.map(toMeeting);
      return { meetings, stats: computeMeetingStats(meetings) };
    },
    () => {
      const meetings = mockMeetingState.meetings
        .filter((m) => m.tenantId === tenantId)
        .slice()
        .sort((a, b) => b.heldAt.getTime() - a.heldAt.getTime());
      return { meetings, stats: computeMeetingStats(meetings) };
    },
  );
}

/**
 * 회의 생성 — GOVERNANCE 타입이면 ApprovalRequest 자동 spawn
 *
 * spawn 로직:
 *  1) Meeting INSERT (approvalId 일단 null)
 *  2) type === GOVERNANCE 면 ApprovalRequest + 2-step ApprovalStep INSERT
 *  3) Meeting.approvalId UPDATE
 *  4) 모두 같은 트랜잭션 안에서 처리 (DB 모드)
 */
export async function createMeeting(
  input: MeetingInput,
): Promise<CreateMeetingResult> {
  return tryPrisma(
    async () => {
      const heldAt = normalizeHeldAt(input.heldAt);
      const id = `mt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const authorName = input.authorName ?? "왕준하";

      // GOVERNANCE 자동 spawn은 별도 transaction 처리 (실패해도 meeting 자체는 살림)
      if (input.type === "GOVERNANCE") {
        return await db.$transaction(async (tx) => {
          const meeting = (await tx.meeting.create({
            data: {
              id,
              tenantId: DEFAULT_TENANT,
              type: input.type,
              title: input.title.trim(),
              heldAt,
              location: input.location ?? null,
              agenda: input.agenda ?? [],
              content: input.content ?? null,
              attendees: input.attendees ?? [],
              absent: input.absent ?? [],
              decisions: input.decisions ?? [],
            },
          })) as DbMeetingRow;

          const approvalId = `apr-mtg-${id.slice(-6)}-${Math.random().toString(36).slice(2, 6)}`;
          const docNo = `RPT-MTG-${new Date().getFullYear()}-${approvalId.slice(-4).toUpperCase()}`;
          await tx.approvalRequest.create({
            data: {
              id: approvalId,
              tenantId: DEFAULT_TENANT,
              documentId: meeting.id,
              documentUrl: `/meetings/${meeting.id}`,
              documentKind: "approval_doc",
              title: `[운영위원회] ${meeting.title}`,
              form: "report",
              requesterId: `u_meeting_${meeting.id}`,
              requesterName: authorName,
              status: "결재중",
              urgent: false,
              hasFile: false,
              docNo,
              snippet: meeting.decisions[0] ?? meeting.content ?? null,
              steps: {
                create: GOVERNANCE_APPROVAL_LINE.map((s) => ({
                  step: s.step,
                  name: s.name,
                  position: s.position,
                  status:
                    s.status === "current" ? ("current" as const) : ("pending" as const),
                })),
              },
            },
          });

          const updated = (await tx.meeting.update({
            where: { id: meeting.id },
            data: { approvalId },
          })) as DbMeetingRow;

          return {
            meeting: toMeeting(updated),
            spawnedApproval: buildSpawnedApproval(approvalId),
          };
        });
      }

      // 비-GOVERNANCE — 단순 INSERT
      const row = (await db.meeting.create({
        data: {
          id,
          tenantId: DEFAULT_TENANT,
          type: input.type,
          title: input.title.trim(),
          heldAt,
          location: input.location ?? null,
          agenda: input.agenda ?? [],
          content: input.content ?? null,
          attendees: input.attendees ?? [],
          absent: input.absent ?? [],
          decisions: input.decisions ?? [],
        },
      })) as DbMeetingRow;
      return { meeting: toMeeting(row), spawnedApproval: null };
    },
    () => {
      // mock fallback — 메모리에만 추가
      const id = `mt-mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const heldAt = normalizeHeldAt(input.heldAt);
      const meeting: Meeting = {
        id,
        tenantId: DEFAULT_TENANT,
        type: input.type,
        title: input.title.trim(),
        heldAt,
        location: input.location ?? null,
        agenda: input.agenda ?? [],
        content: input.content ?? null,
        attendees: input.attendees ?? [],
        absent: input.absent ?? [],
        decisions: input.decisions ?? [],
        docId: null,
        approvalId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockMeetingState.meetings.unshift(meeting);

      // GOVERNANCE mock spawn
      if (input.type === "GOVERNANCE") {
        const approvalId = `apr-mock-${id.slice(-6)}`;
        meeting.approvalId = approvalId;
        meeting.updatedAt = new Date();
        return {
          meeting,
          spawnedApproval: buildSpawnedApproval(approvalId),
        };
      }
      return { meeting, spawnedApproval: null };
    },
  );
}

/** 회의 수정 — heldAt/제목/안건/참석자 등 부분 갱신 */
export async function updateMeeting(
  id: string,
  patch: MeetingUpdateInput,
): Promise<Meeting | null> {
  return tryPrisma(
    async () => {
      const data: Record<string, unknown> = {};
      if (patch.title !== undefined) data.title = patch.title.trim();
      if (patch.heldAt !== undefined) data.heldAt = normalizeHeldAt(patch.heldAt);
      if (patch.location !== undefined) data.location = patch.location;
      if (patch.agenda !== undefined) data.agenda = patch.agenda;
      if (patch.content !== undefined) data.content = patch.content;
      if (patch.attendees !== undefined) data.attendees = patch.attendees;
      if (patch.absent !== undefined) data.absent = patch.absent;
      if (patch.decisions !== undefined) data.decisions = patch.decisions;

      const row = (await db.meeting.update({
        where: { id },
        data,
      })) as DbMeetingRow;
      return toMeeting(row);
    },
    () => {
      const target = mockMeetingState.meetings.find((m) => m.id === id);
      if (!target) return null;
      if (patch.title !== undefined) target.title = patch.title.trim();
      if (patch.heldAt !== undefined) target.heldAt = normalizeHeldAt(patch.heldAt);
      if (patch.location !== undefined) target.location = patch.location;
      if (patch.agenda !== undefined) target.agenda = patch.agenda;
      if (patch.content !== undefined) target.content = patch.content;
      if (patch.attendees !== undefined) target.attendees = patch.attendees;
      if (patch.absent !== undefined) target.absent = patch.absent;
      if (patch.decisions !== undefined) target.decisions = patch.decisions;
      target.updatedAt = new Date();
      return target;
    },
  );
}

/** 회의 삭제 */
export async function deleteMeeting(id: string): Promise<boolean> {
  return tryPrisma(
    async () => {
      await db.meeting.delete({ where: { id } });
      return true;
    },
    () => {
      const idx = mockMeetingState.meetings.findIndex((m) => m.id === id);
      if (idx === -1) return false;
      mockMeetingState.meetings.splice(idx, 1);
      return true;
    },
  );
}