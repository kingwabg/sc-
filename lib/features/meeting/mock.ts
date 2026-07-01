/**
 * lib/features/meeting/mock.ts
 *
 * Fallback mock 데이터 — DATABASE_URL이 없을 때 사용.
 * 3종 회의 (아동자치 / 운영위원회 / 종사자) × 1건 = 3건
 *  - CHILD_COUNCIL: 결재 없음 (approvalId null)
 *  - GOVERNANCE: 결재 자동 spawn (approvalId 채워짐)
 *  - STAFF: 결재 없음
 */

import type { Meeting } from "./types";

function asDate(s: string): Date {
  return new Date(s);
}

const FIXED_DATE = "2026-06-15T09:00:00.000Z";

export const MOCK_MEETINGS: Meeting[] = [
  // ─── CHILD_COUNCIL — 아동자치회의 ─────────────────────
  {
    id: "mt-child-001",
    tenantId: "t_acme",
    type: "CHILD_COUNCIL",
    title: "2026년 6월 아동자치회의",
    heldAt: asDate("2026-06-08T15:00:00.000Z"),
    location: "본관 1층 회의실",
    agenda: ["여름 프로그램 일정 논의", "야외활동 장소 선정", "아동 건의사항 청취"],
    content:
      "## 안건\n- 여름 프로그램 일정\n- 야외활동 장소\n\n## 논의\n- 7월 둘째 주 해운대 해수욕장 야외활동 합의\n- 아동 대표 3명 선정",
    attendees: ["김민준", "이서윤", "박지호", "최예은", "왕준하(사회)"],
    absent: ["정현우"],
    decisions: [
      "7월 둘째 주 해운대 해수욕장 야외활동 진행",
      "아동 대표 3명 — 김민준, 이서윤, 박지호",
    ],
    docId: null,
    approvalId: null,
    createdAt: asDate(FIXED_DATE),
    updatedAt: asDate(FIXED_DATE),
  },

  // ─── GOVERNANCE — 운영위원회 (결재 자동 트리거됨) ─────
  {
    id: "mt-gov-001",
    tenantId: "t_acme",
    type: "GOVERNANCE",
    title: "2026년 2분기 운영위원회",
    heldAt: asDate("2026-06-20T14:00:00.000Z"),
    location: "본관 2층 임원회의실",
    agenda: [
      "2026년 상반기 사업보고",
      "후원금 사용 내역 결산",
      "하반기 프로그램 계획 심의",
      "안전점검 결과 보고",
    ],
    content:
      "## 안건\n- 상반기 사업보고\n- 후원금 결산\n- 하반기 계획\n\n## 결정\n- 후원금 1,200만원 사용 적정 승인\n- 하반기 신규 프로그램 '심리안정 프로그램' 시행",
    attendees: ["왕준하(센터장)", "박은수(시설장)", "김선영(지원교사)", "외부 위원 2인"],
    absent: [],
    decisions: [
      "후원금 1,200만원 사용 적정 승인",
      "하반기 '심리안정 프로그램' 시행 의결",
      "안전점검 결과 — 적합 판정",
    ],
    docId: null,
    /** mock 시점에서도 결재 spawn mock id */
    approvalId: "apr-mock-mt-gov-001",
    createdAt: asDate(FIXED_DATE),
    updatedAt: asDate(FIXED_DATE),
  },

  // ─── STAFF — 종사자회의 ──────────────────────────────
  {
    id: "mt-staff-001",
    tenantId: "t_acme",
    type: "STAFF",
    title: "2026년 6월 종사자회의",
    heldAt: asDate("2026-06-25T18:00:00.000Z"),
    location: "본관 1층 회의실",
    agenda: [
      "6월 운영일지 회고",
      "7월 일정 공유",
      "아동 케어 사례 공유",
      "행정 서류 점검",
    ],
    content:
      "## 안건\n- 6월 회고\n- 7월 일정\n- 사례 공유\n\n## 결정\n- 7월 둘째 주 해외연수 일정 합의\n- 학부모 상담 시간 — 매주 화 16시",
    attendees: ["왕준하", "박은수", "김선영", "최은영"],
    absent: [],
    decisions: [
      "7월 둘째 주 해운대 야외활동은 외부강사 1명 추가 섭외",
      "학부모 상담 시간 — 매주 화 16시로 통일",
    ],
    docId: null,
    approvalId: null,
    createdAt: asDate(FIXED_DATE),
    updatedAt: asDate(FIXED_DATE),
  },
];