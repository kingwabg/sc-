/**
 * scripts/seed-approval-folders.ts
 * P11-3 결재 folder별 mock 데이터 시드
 *
 * 실행:
 *   npx tsx scripts/seed-approval-folders.ts
 *
 * 특징:
 *   - 12개 folder별 2~3건 (총 30+건)
 *   - 다양한 form + status
 *   - db.$transaction + upsert → idempotent
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL 환경변수가 설정되지 않음.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const TENANT_ID = "t_acme";

// ─── Folder → ApprovalListItem 매핑 ────────────────────────
// (lib/features/approval-folder/data.ts 와 동기화)
interface StepSeed {
  step: number;
  name: string;
  position: string;
  status: "pending" | "current" | "approved" | "rejected";
  actedAt?: Date;
  comment?: string;
}

interface ApprovalSeed {
  id: string;
  date: string;
  form: import("@prisma/client").ApprovalFormKey;
  urgent: boolean;
  title: string;
  hasFile: boolean;
  docNo: string;
  status: import("@prisma/client").ApprovalRequestStatus;
  steps: StepSeed[];
}

const SEEDS: ApprovalSeed[] = [
  // standby
  { id: "s1", date: "2024-07-01", form: "leave",    urgent: true,  title: "7월 연차 휴가 신청 (3일)",          hasFile: false, docNo: "2024-휴가-00001", status: "결재중", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-01T10:00:00Z") },
      { step: 2, name: "김선영", position: "지원교사", status: "current" },
      { step: 3, name: "김영미", position: "所长",     status: "pending" },
    ]},
  { id: "s2", date: "2024-07-02", form: "expense",  urgent: false, title: "고객사 미팅 식대 지출",              hasFile: false, docNo: "2024-지출-00002", status: "결재중", steps: [
      { step: 1, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-02T09:00:00Z") },
      { step: 2, name: "이정호", position: "지원교사", status: "current" },
      { step: 3, name: "박은수", position: "지원교사", status: "pending" },
    ]},
  { id: "s3", date: "2024-07-03", form: "report",   urgent: false, title: "6월 월간 업무 보고서",              hasFile: false, docNo: "2024-보고-00003",  status: "결재중", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-03T08:30:00Z") },
      { step: 2, name: "김선영", position: "지원교사", status: "current" },
      { step: 3, name: "김영미", position: "所长",     status: "pending" },
    ]},

  // inbox
  { id: "i1", date: "2024-07-01", form: "purchase", urgent: false, title: "사무용품 구매 품의 (필요 3종)",       hasFile: false, docNo: "2024-구매-00004", status: "결재중", steps: [
      { step: 1, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-07-01T14:00:00Z") },
      { step: 2, name: "김선영", position: "지원교사", status: "current" },
    ]},
  { id: "i2", date: "2024-07-02", form: "education", urgent: true,  title: "사회保险褶 研修 (7/15)",             hasFile: false, docNo: "2024-교육-00005", status: "결재중", steps: [
      { step: 1, name: "이정호", position: "지원교사", status: "rejected", actedAt: new Date("2024-07-02T11:00:00Z"), comment: "신청 기간 초과" },
      { step: 2, name: "김선영", position: "지원교사", status: "pending" },
    ]},

  // cc
  { id: "c1", date: "2024-07-01", form: "report",   urgent: false, title: "시설 점검 결과 보고 (월간)",         hasFile: false, docNo: "2024-보고-00006", status: "결재중", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-01T16:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "current" },
    ]},
  { id: "c2", date: "2024-07-03", form: "memo",     urgent: false, title: "사무실 이전 품의",                  hasFile: false, docNo: "2024-품의-00007", status: "결재중", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-03T09:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-03T10:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "pending" },
    ]},

  // expected
  { id: "e1", date: "2024-07-05", form: "leave",    urgent: false, title: "7월 20일 반차 신청",                 hasFile: false, docNo: "2024-휴가-00008", status: "결재중", steps: [
      { step: 1, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-05T08:00:00Z") },
      { step: 2, name: "박은수", position: "지원교사", status: "current" },
    ]},
  { id: "e2", date: "2024-07-08", form: "expense",  urgent: false, title: "8월 사업 추진 경비 사전 품의",        hasFile: false, docNo: "2024-지출-00009", status: "결재중", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-08T09:30:00Z") },
      { step: 2, name: "김선영", position: "지원교사", status: "current" },
      { step: 3, name: "김영미", position: "所长",     status: "pending" },
    ]},

  // default (완료)
  { id: "d1", date: "2024-06-28", form: "report",   urgent: false, title: "5월 업무 완료 보고",                hasFile: false, docNo: "2024-보고-00010", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-06-28T10:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-06-28T11:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-06-28T12:00:00Z") },
    ]},
  { id: "d2", date: "2024-06-29", form: "expense",  urgent: false, title: "6월 통화료 정산",                   hasFile: false, docNo: "2024-지출-00011", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-06-29T09:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-06-29T10:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-06-29T11:00:00Z") },
    ]},

  // draft (기안 중)
  { id: "dr1", date: "2024-07-03", form: "purchase", urgent: false, title: "사무용품 보충 구매 (초안)",         hasFile: false, docNo: "",              status: "결재중", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "current" },
    ]},
  { id: "dr2", date: "2024-07-04", form: "education", urgent: false, title: "의 하반기 研修 신청 (초안)",        hasFile: false, docNo: "",              status: "결재중", steps: [
      { step: 1, name: "이정호", position: "지원교사", status: "current" },
    ]},

  // temporary
  { id: "t1", date: "2024-07-02", form: "leave",    urgent: false, title: "7월 10일~12일 연차 (임시 저장)",   hasFile: false, docNo: "",              status: "결재중", steps: [] },

  // sign (완료)
  { id: "sn1", date: "2024-07-01", form: "memo",     urgent: false, title: "기관 운영비 심의 요청",            hasFile: false, docNo: "2024-품의-00012", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-01T10:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-01T11:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-07-01T12:00:00Z") },
    ]},
  { id: "sn2", date: "2024-06-30", form: "report",   urgent: true,  title: "평가 대비 자체점검 보고서",         hasFile: false, docNo: "2024-보고-00013", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-06-30T09:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-06-30T10:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-06-30T11:00:00Z") },
    ]},
  { id: "sn3", date: "2024-06-29", form: "expense",  urgent: false, title: "사무실 임대료 (7월)",               hasFile: false, docNo: "2024-지출-00014", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-06-29T09:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-06-29T10:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-06-29T11:00:00Z") },
    ]},

  // ccbox
  { id: "cb1", date: "2024-07-01", form: "report",   urgent: false, title: "평가 준비 현황 보고 (참조)",        hasFile: false, docNo: "2024-보고-00015", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-01T10:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-01T11:00:00Z") },
    ]},
  { id: "cb2", date: "2024-07-02", form: "education", urgent: false, title: "7월 교육 계획的通知 (열람)",        hasFile: false, docNo: "2024-교육-00016", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-02T09:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-02T10:00:00Z") },
    ]},

  // inboxbox
  { id: "ib1", date: "2024-07-03", form: "expense",  urgent: false, title: "사업별 정산 보고서 (수신)",         hasFile: false, docNo: "2024-정산-00017", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-03T09:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-03T10:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-07-03T11:00:00Z") },
    ]},
  { id: "ib2", date: "2024-07-04", form: "report",   urgent: false, title: "주간工作计划 (수신)",                 hasFile: false, docNo: "2024-보고-00018", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-04T09:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-04T10:00:00Z") },
    ]},

  // sendbox
  { id: "sb1", date: "2024-07-01", form: "memo",     urgent: false, title: "기관연합 설명 자료 발송",            hasFile: false, docNo: "2024-품의-00019", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-01T10:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-01T11:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-07-01T12:00:00Z") },
    ]},
  { id: "sb2", date: "2024-07-02", form: "education", urgent: false, title: "7월 교육 수강 결과 발송",           hasFile: false, docNo: "2024-교육-00020", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-02T09:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-02T10:00:00Z") },
    ]},
  { id: "sb3", date: "2024-07-03", form: "report",   urgent: false, title: "기관 성과 보고서 발송",             hasFile: false, docNo: "2024-보고-00021", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-07-03T09:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-07-03T10:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-07-03T11:00:00Z") },
    ]},

  // appr (공문)
  { id: "ap1", date: "2024-06-25", form: "memo",     urgent: false, title: "긴급 시설 교체 건의 공문",          hasFile: false, docNo: "2024-공문-00022", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-06-25T10:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-06-25T11:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-06-25T12:00:00Z") },
    ]},
  { id: "ap2", date: "2024-06-28", form: "report",   urgent: true,  title: "평가 인증 자료 (공문)",             hasFile: false, docNo: "2024-공문-00023", status: "완료", steps: [
      { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date("2024-06-28T09:00:00Z") },
      { step: 2, name: "김영미", position: "所长",     status: "approved", actedAt: new Date("2024-06-28T10:00:00Z") },
      { step: 3, name: "이정호", position: "지원교사", status: "approved", actedAt: new Date("2024-06-28T11:00:00Z") },
    ]},
];

async function main() {
  console.log(`Seeding ${SEEDS.length} approval requests for tenant: ${TENANT_ID}`);

  await prisma.$transaction(async (tx) => {
    for (const seed of SEEDS) {
      const req = await tx.approvalRequest.upsert({
        where: { id: seed.id },
        update: {
          status: seed.status,
          urgent: seed.urgent,
          docNo: seed.docNo || null,
        },
        create: {
          id: seed.id,
          tenantId: TENANT_ID,
          documentId: `doc-${seed.id}`,
          documentUrl: `/docs/${seed.id}`,
          documentKind: "other",
          title: seed.title,
          form: seed.form,
          requesterId: "u1",
          requesterName: "홍길동",
          status: seed.status,
          urgent: seed.urgent,
          hasFile: seed.hasFile,
          docNo: seed.docNo || null,
          createdAt: new Date(seed.date),
          completedAt:
            seed.status === "완료" || seed.status === "반려" || seed.status === "회수"
              ? new Date(seed.date + "T18:00:00Z")
              : null,
        },
      });

      // upsert steps
      for (const step of seed.steps) {
        await tx.approvalStep.upsert({
          where: { requestId_step: { requestId: req.id, step: step.step } },
          update: {
            name: step.name,
            position: step.position,
            status: step.status,
            actedAt: step.actedAt ?? null,
            comment: step.comment ?? null,
          },
          create: {
            requestId: req.id,
            step: step.step,
            name: step.name,
            position: step.position,
            status: step.status,
            actedAt: step.actedAt ?? null,
            comment: step.comment ?? null,
          },
        });
      }
    }
  });

  const count = await prisma.approvalRequest.count({ where: { tenantId: TENANT_ID } });
  console.log(`✅ Done — ${count} approval requests in DB for tenant ${TENANT_ID}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
