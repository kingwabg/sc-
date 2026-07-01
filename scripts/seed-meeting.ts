/**
 * scripts/seed-meeting.ts
 * P10 — 회의록 3종 시드 데이터 + 운영위원회 결재 자동 트리거 검증
 *
 * 실행:
 *   npx tsx scripts/seed-meeting.ts
 *
 * 특징:
 *   - Prisma 7 + @prisma/adapter-pg (Supabase Transaction pooler 호환)
 *   - upsert 패턴 → idempotent
 *   - Meeting 모델 + MeetingType enum 사용
 *   - 3종 회의 × 1건 = 3건 시드
 *     1. mt-child-001 — CHILD_COUNCIL (아동자치회의) — 결재 없음
 *     2. mt-gov-001  — GOVERNANCE    (운영위원회)   — 결재 자동 spawn (apr-mtg-gov-001)
 *     3. mt-staff-001 — STAFF        (종사자회의)   — 결재 없음
 *
 * 검증:
 *   npx tsx scripts/seed-meeting.ts
 *   GET /meetings → 3건 표시 + 통계 카드 (전체 3 / 아동자치 1 / 운영위원회 1 / 종사자 1 / 결재진행 1)
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL 환경변수가 설정되지 않음.");
  console.error(".env.local에 추가하거나 DATABASE_URL=... 인라인으로 실행하세요.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const TENANT_ID = "t_acme";

/** YYYY-MM-DD + HH:mm KST → UTC Date */
function dateKst(yyyyMmDd: string, hhmm: string = "14:00"): Date {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh - 9, mm));
}

// ─── 시드 케이스 3건 ─────────────────────────────────────────

const CASE_CHILD_COUNCIL = {
  id:        "mt-child-001",
  tenantId:  TENANT_ID,
  type:      "CHILD_COUNCIL" as const,
  title:     "2026년 6월 아동자치회의",
  heldAt:    dateKst("2026-06-08", "15:00"),
  location:  "본관 1층 회의실",
  agenda:    ["여름 프로그램 일정 논의", "야외활동 장소 선정", "아동 건의사항 청취"],
  content:
    "## 안건\n- 여름 프로그램 일정\n- 야외활동 장소\n\n## 논의\n- 7월 둘째 주 해운대 해수욕장 야외활동 합의\n- 아동 대표 3명 선정",
  attendees: ["김민준", "이서윤", "박지호", "최예은", "왕준하(사회)"],
  absent:    ["정현우"],
  decisions: [
    "7월 둘째 주 해운대 해수욕장 야외활동 진행",
    "아동 대표 3명 — 김민준, 이서윤, 박지호",
  ],
  docId:     null,
  approvalId: null,
};

const CASE_GOVERNANCE_APPROVAL_ID = "apr-mtg-gov-001";

const CASE_GOVERNANCE = {
  id:        "mt-gov-001",
  tenantId:  TENANT_ID,
  type:      "GOVERNANCE" as const,
  title:     "2026년 2분기 운영위원회",
  heldAt:    dateKst("2026-06-20", "14:00"),
  location:  "본관 2층 임원회의실",
  agenda:    [
    "2026년 상반기 사업보고",
    "후원금 사용 내역 결산",
    "하반기 프로그램 계획 심의",
    "안전점검 결과 보고",
  ],
  content:
    "## 안건\n- 상반기 사업보고\n- 후원금 결산\n- 하반기 계획\n\n## 결정\n- 후원금 1,200만원 사용 적정 승인\n- 하반기 신규 프로그램 '심리안정 프로그램' 시행",
  attendees: ["왕준하(센터장)", "박은수(시설장)", "김선영(지원교사)", "외부 위원 2인"],
  absent:    [],
  decisions: [
    "후원금 1,200만원 사용 적정 승인",
    "하반기 '심리안정 프로그램' 시행 의결",
    "안전점검 결과 — 적합 판정",
  ],
  docId:     null,
  approvalId: CASE_GOVERNANCE_APPROVAL_ID,
};

const CASE_STAFF = {
  id:        "mt-staff-001",
  tenantId:  TENANT_ID,
  type:      "STAFF" as const,
  title:     "2026년 6월 종사자회의",
  heldAt:    dateKst("2026-06-25", "18:00"),
  location:  "본관 1층 회의실",
  agenda:    [
    "6월 운영일지 회고",
    "7월 일정 공유",
    "아동 케어 사례 공유",
    "행정 서류 점검",
  ],
  content:
    "## 안건\n- 6월 회고\n- 7월 일정\n- 사례 공유\n\n## 결정\n- 7월 둘째 주 해외연수 일정 합의\n- 학부모 상담 시간 — 매주 화 16시",
  attendees: ["왕준하", "박은수", "김선영", "최은영"],
  absent:    [],
  decisions: [
    "7월 둘째 주 해운대 야외활동은 외부강사 1명 추가 섭외",
    "학부모 상담 시간 — 매주 화 16시로 통일",
  ],
  docId:     null,
  approvalId: null,
};

// ─── Governance 결재 시드 (2-step) ────────────────────────────

const GOVERNANCE_APPROVAL_LINE = [
  { step: 1, name: "박은수", position: "시설장", status: "current" as const },
  { step: 2, name: "왕준하", position: "센터장", status: "pending" as const },
];

// ─── helpers ──────────────────────────────────────────────────

type MeetingCase = {
  id: string;
  tenantId: string;
  type: "CHILD_COUNCIL" | "GOVERNANCE" | "STAFF";
  title: string;
  heldAt: Date;
  location: string;
  agenda: string[];
  content: string;
  attendees: string[];
  absent: string[];
  decisions: string[];
  docId: string | null;
  approvalId: string | null;
};

async function upsertMeeting(c: MeetingCase) {
  await prisma.meeting.upsert({
    where: { id: c.id },
    update: {
      type:       c.type,
      title:      c.title,
      heldAt:     c.heldAt,
      location:   c.location,
      agenda:     c.agenda,
      content:    c.content,
      attendees:  c.attendees,
      absent:     c.absent,
      decisions:  c.decisions,
      docId:      c.docId,
      approvalId: c.approvalId,
    },
    create: {
      id:         c.id,
      tenantId:   c.tenantId,
      type:       c.type,
      title:      c.title,
      heldAt:     c.heldAt,
      location:   c.location,
      agenda:     c.agenda,
      content:    c.content,
      attendees:  c.attendees,
      absent:     c.absent,
      decisions:  c.decisions,
      docId:      c.docId,
      approvalId: c.approvalId,
    },
  });
  const tag = c.type === "CHILD_COUNCIL" ? "🧒" : c.type === "GOVERNANCE" ? "🏛️" : "👥";
  const approvalBadge = c.approvalId ? `✓ ${c.approvalId}` : "—";
  console.log(`  [Mt]  ${c.id} → ${tag} ${c.title} (${c.type}) · 결재 ${approvalBadge}`);
}

async function upsertGovernanceApproval() {
  const meeting = CASE_GOVERNANCE;
  await prisma.approvalRequest.upsert({
    where: { id: CASE_GOVERNANCE_APPROVAL_ID },
    update: {
      title:        `[운영위원회] ${meeting.title}`,
      documentUrl:  `/meetings/${meeting.id}`,
      documentKind: "approval_doc",
      status:       "결재중",
      snippet:      meeting.decisions[0] ?? meeting.content ?? null,
    },
    create: {
      id:            CASE_GOVERNANCE_APPROVAL_ID,
      tenantId:      TENANT_ID,
      documentId:    meeting.id,
      documentUrl:   `/meetings/${meeting.id}`,
      documentKind:  "approval_doc",
      title:         `[운영위원회] ${meeting.title}`,
      form:          "report",
      requesterId:   "u_meeting_seed",
      requesterName: "왕준하",
      status:        "결재중",
      urgent:        false,
      hasFile:       false,
      docNo:         "RPT-MTG-2026-0001",
      snippet:       meeting.decisions[0] ?? meeting.content ?? null,
      steps: {
        create: GOVERNANCE_APPROVAL_LINE.map((s) => ({
          step:     s.step,
          name:     s.name,
          position: s.position,
          status:   s.status,
        })),
      },
    },
  });
  console.log(`  [Apr] ${CASE_GOVERNANCE_APPROVAL_ID} → [운영위원회] ${meeting.title} (결재중, 2-step)`);
}

async function main() {
  console.log("🗂️   Seeding meeting minutes (3종) + governance approval spawn...\n");

  console.log("[회의록 3건]");
  await upsertMeeting(CASE_CHILD_COUNCIL);
  await upsertMeeting(CASE_GOVERNANCE);
  await upsertMeeting(CASE_STAFF);

  console.log("\n[운영위원회 결재 자동 트리거 — 1건]");
  await upsertGovernanceApproval();

  // ─── 검증 쿼리 ──────────────────────────────────────────────
  console.log("\n✅  검증 — 생성된 Meeting:");
  const meetings = await prisma.meeting.findMany({
    where: { tenantId: TENANT_ID },
    orderBy: { heldAt: "asc" },
  });
  let childCount = 0;
  let govCount = 0;
  let staffCount = 0;
  let approvalCount = 0;
  for (const m of meetings) {
    if (m.type === "CHILD_COUNCIL") childCount++;
    else if (m.type === "GOVERNANCE") {
      govCount++;
      if (m.approvalId) approvalCount++;
    } else if (m.type === "STAFF") {
      staffCount++;
    }
    const tag = m.type === "CHILD_COUNCIL" ? "🧒" : m.type === "GOVERNANCE" ? "🏛️" : "👥";
    const approvalBadge = m.approvalId ? `✓ 결재 ${m.approvalId}` : "—";
    console.log(
      `   ${tag} ${m.id} · ${m.heldAt.toISOString().slice(0, 10)} · ${approvalBadge} · ${m.title}`,
    );
  }

  // 결재 step 검증
  const aprSteps = await prisma.approvalStep.findMany({
    where: { requestId: CASE_GOVERNANCE_APPROVAL_ID },
    orderBy: { step: "asc" },
  });
  console.log(`\n   결재선 (${aprSteps.length} step):`);
  for (const s of aprSteps) {
    console.log(`     ${s.step}. ${s.position} ${s.name} [${s.status}]`);
  }

  console.log(`
📊  시드 요약:
   - 회의 총 ${meetings.length}건 (아동자치 ${childCount} · 운영위원회 ${govCount} · 종사자 ${staffCount})
   - 결재 자동 spawn ${approvalCount}건 (운영위원회만 해당)

🧭  확인 URL:
   - 목록:   http://localhost:3001/meetings
   - 신규:   http://localhost:3001/meetings/new
   - 상세:   http://localhost:3001/meetings/${CASE_GOVERNANCE.id}
   - 결재:   http://localhost:3001/approval/doc/${CASE_GOVERNANCE_APPROVAL_ID}
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });