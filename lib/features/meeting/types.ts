/**
 * lib/features/meeting/types.ts
 *
 * P10 — 회의록 3종 (아동자치 / 운영위원회 / 종사자) 도메인 타입
 *
 * - Prisma MeetingType enum 재노출 (의존성 격리)
 * - Meeting: DB row view-model (Date는 Date로 정규화)
 * - MeetingInput: 신규 작성 폼 입력 DTO
 * - MeetingUpdateInput: 수정 입력 DTO
 * - CreateMeetingResult: create 반환 (생성된 Meeting + 자동 spawn된 결재 정보)
 * - MeetingStats: 목록 페이지 통계 카드용
 */

import type { MeetingType } from "@prisma/client";

export type { MeetingType };

/** 회의 단일 항목 (DB row → UI view-model) */
export interface Meeting {
  id: string;
  tenantId: string;
  type: MeetingType;
  title: string;
  /** 회의 일시 (day + time) */
  heldAt: Date;
  location: string | null;
  agenda: string[];
  content: string | null;
  attendees: string[];
  absent: string[];
  decisions: string[];
  /** 첨부 PDF/HWP id (Doc 모델 연결 — 추후) */
  docId: string | null;
  /** GOVERNANCE 결재 시 자동 spawn된 ApprovalRequest id */
  approvalId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 신규 작성 입력 (create용) */
export interface MeetingInput {
  type: MeetingType;
  title: string;
  heldAt: Date | string; // 폼에서는 string으로 보내도 됨 (parse)
  location?: string | null;
  agenda?: string[];
  content?: string | null;
  attendees?: string[];
  absent?: string[];
  decisions?: string[];
  /** 작성자 표시명 (mock 시 기본값) */
  authorName?: string;
}

/** 수정 입력 (update용) — 부분 갱신 */
export interface MeetingUpdateInput {
  title?: string;
  heldAt?: Date | string;
  location?: string | null;
  agenda?: string[];
  content?: string | null;
  attendees?: string[];
  absent?: string[];
  decisions?: string[];
}

/** 자동 spawn된 결재 정보 (GOVERNANCE 저장 시 반환) */
export interface SpawnedApproval {
  approvalId: string;
  docNo: string;
  status: string;
  /** 결재선 — 결재자 이름 / 직위 / 상태 */
  line: Array<{ step: number; name: string; position: string; status: string }>;
}

/** create 결과 — Meeting + (있으면) 자동 spawn된 결재 정보 */
export interface CreateMeetingResult {
  meeting: Meeting;
  spawnedApproval: SpawnedApproval | null;
}

/** 목록 페이지 통계 — type별 건수 + 결재 진행/완료 건수 */
export interface MeetingStats {
  totalCount: number;
  childCouncilCount: number;
  governanceCount: number;
  staffCount: number;
  /** GOVERNANCE 중 결재 자동 spawn된 건수 */
  approvalSpawnedCount: number;
  /** 결재가 완료된 GOVERNANCE 건수 (approvalId 있고 status '완료') */
  approvalCompletedCount: number;
}

/** 목록 + 통계를 한 번에 반환 */
export interface MeetingListResult {
  meetings: Meeting[];
  stats: MeetingStats;
}