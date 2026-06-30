/**
 * prisma/seed.ts — Mock 데이터를 Postgres(Supabase)로 이관
 *
 * 실행:
 *   1) .env.local에 DATABASE_URL 설정
 *   2) npx prisma migrate dev (스키마 적용)
 *   3) npx prisma db seed (이 스크립트 실행)
 *
 * 안전하게:
 *   - 기존 데이터 전부 삭제 후 재생성 (idempotent)
 *   - 외부 시스템 부작용 없음 (mock 데이터 그대로)
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL 환경변수가 비어있음. .env.local 또는 DATABASE_URL export 후 다시 시도하세요.");
  process.exit(1);
}

// Prisma 7 — adapter 패턴으로 connection 명시
// transaction pooler (pgbouncer=true) + connection_limit=1 → prepared statements 안전
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const TENANT_ID = "t_acme";
const TODAY = new Date().toISOString().slice(0, 10);

async function main() {
  console.log("🧹  Resetting all data...");
  await resetAll();

  console.log("🏢  Tenant + Users...");
  await prisma.tenant.create({
    data: {
      id: TENANT_ID,
      slug: "t_acme",
      name: "서창지역아동센터",
      emoji: "🏠",
      gradient: "from-orange-500-to-rose-500",
      accentBg: "bg-orange-100",
      accentText: "text-orange-700",
      memberCount: 32,
    },
  });

  const users = await Promise.all([
    prisma.user.create({ data: { id: "u_1", tenantId: TENANT_ID, email: "center@example.com", name: "왕준하", role: "owner", loginId: "center", position: "센터장", department: "행정", avatarColor: "violet" } }),
    prisma.user.create({ data: { id: "u_2", tenantId: TENANT_ID, email: "park@example.com", name: "박은수", role: "admin", loginId: "parkes", position: "생활복지사", avatarColor: "orange" } }),
    prisma.user.create({ data: { id: "u_3", tenantId: TENANT_ID, email: "kim@example.com", name: "김선영", role: "admin", loginId: "kimsy", position: "생활복지사", avatarColor: "emerald" } }),
    prisma.user.create({ data: { id: "u_4", tenantId: TENANT_ID, email: "lee@example.com", name: "이정훈", role: "member", loginId: "leejh", position: "조리사", avatarColor: "amber" } }),
  ]);
  console.log(`    ${users.length} users`);

  console.log("🧒  Children +1:1 + child logs...");
  const children = await prisma.child.createMany({
    data: [
      {
        id: "c01", tenantId: TENANT_ID,
        name: "박서연", nameLast: "박", nameFirst: "서연",
        birthDate: "2018-04-15", gender: "F", capacityGroup: 30, grade: "초2", school: "서울초등학교",
        guardianName: "박지원", guardianRelation: "모", guardianType: "양육",
        guardianPhone: "010-2345-6789", guardianJob: "간호사", guardianNotes: "연락 잘 됨, 알레르기 주의 필요",
        emergencyContactName: "박지원", emergencyContactPhone: "010-2345-6789",
        allergies: ["새우", "복숭아"], medications: ["알레르기약 (세티리진)"],
        healthNotes: "운동 후 호흡곤란 주의",
        enrolledAt: "2024-03-02",
        address: "서울특별시 강남구 테헤란로 123", serviceType: "일반",
        medianIncomePct: 75, kidsCallId: "staff_001", status: "active",
        authorId: "u_3", authorName: "김선영",
      },
      {
        id: "c02", tenantId: TENANT_ID,
        name: "장민서", nameLast: "장", nameFirst: "민서",
        birthDate: "2019-07-22", gender: "M", capacityGroup: 30, grade: "초1", school: "서울초등학교",
        guardianName: "장성훈", guardianRelation: "부", guardianType: "친권",
        guardianPhone: "010-9876-5432", guardianJob: "회사원",
        emergencyContactName: "장성훈", emergencyContactPhone: "010-9876-5432",
        allergies: [], medications: [],
        healthNotes: "내성적, 조용한 편",
        enrolledAt: "2024-09-01",
        address: "서울특별시 서초구 서초대로 456", serviceType: "일반",
        medianIncomePct: 50, kidsCallId: "staff_002", status: "active",
        authorId: "u_2", authorName: "박은수",
      },
      {
        id: "c03", tenantId: TENANT_ID,
        name: "한지유", nameLast: "한", nameFirst: "지유",
        birthDate: "2016-11-08", gender: "F", capacityGroup: 30, grade: "초5", school: "서울중학교",
        guardianName: "한소영", guardianRelation: "모", guardianType: "양육",
        guardianPhone: "010-5555-7777", guardianJob: "교사",
        emergencyContactName: "한소영", emergencyContactPhone: "010-5555-7777",
        allergies: ["복숭아"], medications: [],
        healthNotes: "리더십 활발, 친구들과 잘 어울림",
        enrolledAt: "2023-09-01", previousEnrolledAt: "2022-03-01",
        address: "서울특별시 송파구 올림픽로 789", serviceType: "맞춤",
        medianIncomePct: 110, kidsCallId: "staff_001", status: "active",
        authorId: "u_1", authorName: "왕준하",
      },
    ],
  });
  console.log(`    ${children.count} children`);

  await prisma.childCardMeta.createMany({
    data: [
      { childId: "c01", number: "AC-2024-031", identityType: "아동", identityVerified: "주민등록등본", referredBy: "강남구청 아동청소년과" },
      { childId: "c02", number: "AC-2024-058", identityType: "아동", identityVerified: "주민등록등본", referredBy: "서초구청 가족센터" },
      { childId: "c03", number: "AC-2023-014", identityType: "아동", identityVerified: "주민등록등본", referredBy: "송파구청 아동보호팀" },
    ],
  });

  await prisma.childPhysical.createMany({
    data: [
      { childId: "c01", height: 128, weight: 26, buildType: "보통", faceShape: "계란형", hairColor: "흑색", hairStyle: "단발" },
      { childId: "c02", height: 122, weight: 24, buildType: "마른", faceShape: "둥근형", hairColor: "흑색", hairStyle: "숏컷" },
      { childId: "c03", height: 148, weight: 42, buildType: "보통", faceShape: "계란형", hairColor: "흑색", hairStyle: "긴머리" },
    ],
  });

  await prisma.childObservations.createMany({
    data: [
      { childId: "c01", learning: "학업 성적 중상위, 친구들과 사이 좋음. 체육 활동 적극적.", social: "또래와 협력 잘 함. 새로운 활동에 호기심 많음.", interests: "그림 그리기, 요가" },
      { childId: "c02", learning: "초등 1학년 진학 후 적응 중. 수업 집중도 보통.", social: "신규 적응 중 — 1:1 관심 필요.", interests: "블록놀이, 동물 이야기" },
      { childId: "c03", learning: "중학교 진학(2026 예정). 학업 의지 강함. 친구 리더 역할.", social: "또래 관계·학업 모두 양호. 자기주장 강하나 협력도 좋음.", interests: "독서, 과학 실험" },
    ],
  });

  await prisma.attendance.createMany({
    data: [
      { childId: "c01", date: TODAY, status: "등원",     authorId: "u_1" },
      { childId: "c02", date: TODAY, status: "결석", note: "개인 사정", authorId: "u_1" },
      { childId: "c03", date: TODAY, status: "보건휴식", note: "두통",   authorId: "u_1" },
    ],
  });

  await prisma.careLog.createMany({
    data: [
      { id: "cl-001", childId: "c01", date: TODAY, category: "식사",   content: "요거트, 과일 — 알레르기 약 복용 후 잘 먹음",  authorId: "u_3", authorName: "김선영 선생님" },
      { id: "cl-002", childId: "c01", date: TODAY, category: "관찰",   content: "첫 주라 낯가림 있음, 2일차부터 친구와 같이 놀기 시작", authorId: "u_2", authorName: "박은수 선생님" },
      { id: "cl-003", childId: "c02", date: TODAY, category: "놀이",   content: "혼자 조용히 블록 쌓기, 집중력 좋음",          authorId: "u_3", authorName: "김선영 선생님" },
      { id: "cl-004", childId: "c03", date: TODAY, category: "학습",   content: "분수 문제 풀이, 이해도 양호",                authorId: "u_2", authorName: "박은수 선생님" },
    ],
  });

  await prisma.documentIndex.createMany({
    data: [
      { id: "idx-c01", tenantId: TENANT_ID, kind: "child_card", title: "박서연 — 아동카드", sourceUrl: "/children/c01", childId: "c01", authorId: "u_3", authorName: "김선영" },
      { id: "idx-cl001", tenantId: TENANT_ID, kind: "care_log", title: "오후 간식", snippet: "요거트, 과일 — 알레르기 약 복용 후 잘 먹음", sourceUrl: "/children/c01", childId: "c01", authorId: "u_3", authorName: "김선영 선생님" },
    ],
  });

  console.log("👩‍🏫  Staff...");
  await prisma.staff.createMany({
    data: [
      { id: "s01", tenantId: TENANT_ID, userId: "u_1", name: "김영미", loginId: "kimym", gender: "F", phone: "010-1111-2222", position: "소장",       joinDate: "2020-03-01", status: "active" },
      { id: "s02", tenantId: TENANT_ID, userId: "u_2", name: "박은수", loginId: "parkes", gender: "F", phone: "010-2222-3333", position: "지원교사",   joinDate: "2022-03-01", status: "active" },
      { id: "s03", tenantId: TENANT_ID, userId: "u_3", name: "김선영", loginId: "kimsy", gender: "F", phone: "010-3333-4444", position: "지원교사",   joinDate: "2023-09-01", status: "active" },
      { id: "s04", tenantId: TENANT_ID, userId: "u_4", name: "이정훈", loginId: "leejh", gender: "M", phone: "010-4444-5555", position: "조리사",     joinDate: "2021-03-01", status: "active" },
      { id: "s05", tenantId: TENANT_ID,                 name: "최지연", loginId: "choijy", gender: "F", phone: "010-5555-6666", position: "행정",       joinDate: "2024-01-15", status: "active" },
    ],
  });

  await prisma.staffAttendance.createMany({
    data: [
      { id: "sa01", staffId: "s01", date: TODAY, clockIn: "08:30", clockOut: "17:30", workMinutes: 540, status: "출근", authorId: "u_1" },
      { id: "sa02", staffId: "s02", date: TODAY, clockIn: "08:45", clockOut: "18:00", workMinutes: 555, status: "출근", authorId: "u_1" },
      { id: "sa03", staffId: "s03", date: TODAY, clockIn: "09:00", clockOut: "18:30", workMinutes: 570, status: "출근", authorId: "u_1" },
      { id: "sa04", staffId: "s04", date: TODAY, clockIn: "06:30", clockOut: "15:00", workMinutes: 510, status: "출근", authorId: "u_1" },
      { id: "sa05", staffId: "s05", date: TODAY, clockIn: "09:00",                workMinutes: 0,   status: "외출", note: "외출 14:00~15:00", authorId: "u_1" },
    ],
  });

  console.log("🤝  Volunteers...");
  await prisma.volunteer.createMany({
    data: [
      { id: "v01", tenantId: TENANT_ID, name: "정서윤", gender: "F", phone: "010-7777-8888", type: "공익근무자", startDate: "2026-01-10", organization: "OO구청",                  status: "active" },
      { id: "v02", tenantId: TENANT_ID, name: "강동현", gender: "M", phone: "010-8888-9999", type: "자원봉사자", startDate: "2026-03-01", organization: "OO대학교 사회복지학과",  status: "active" },
      { id: "v03", tenantId: TENANT_ID, name: "문지환", gender: "M", phone: "010-9999-0000", type: "실습생",   startDate: "2026-06-01", organization: "OO대학교 아동복지학과",  endDate: "2026-08-31", status: "active" },
      { id: "v04", tenantId: TENANT_ID, name: "윤하은", gender: "F", phone: "010-1212-3434", type: "자원봉사자", startDate: "2025-09-01", endDate: "2026-05-31",                                   status: "completed" },
    ],
  });

  await prisma.volunteerAttendance.createMany({
    data: [
      { volunteerId: "v01", date: TODAY, present: true,          authorId: "u_1" },
      { volunteerId: "v02", date: TODAY, present: false, reason: "개인 사정", authorId: "u_1" },
      { volunteerId: "v03", date: TODAY, present: true,          authorId: "u_1" },
    ],
  });

  console.log("👥  Members...");
  await prisma.member.createMany({
    data: [
      { id: "m01", tenantId: TENANT_ID, userId: "u_1", name: "양산애사희적합동조합", type: "법인", contribution: 5_000_000, joinDate: "2018-04-01", status: "active" },
      { id: "m02", tenantId: TENANT_ID,             name: "김영미", type: "개인", contribution:   100_000, joinDate: "2020-03-15", status: "active" },
      { id: "m03", tenantId: TENANT_ID,             name: "박은수", type: "개인", contribution:   100_000, joinDate: "2022-03-15", status: "active" },
    ],
  });

  console.log("📄  Docs + 통합 인덱스...");
  await prisma.doc.createMany({
    data: [
      { id: "d-doc-001", tenantId: TENANT_ID, title: "5월 야외활동 계획", kind: "html", content: "<h1>5월 야외활동 계획</h1><p>5월에 다 같이 공원 나갑니다.</p>", authorId: "u_1", authorName: "왕준하" },
      { id: "d-doc-002", tenantId: TENANT_ID, title: "안전점검 체크리스트", kind: "html", content: "<h1>안전점검</h1><ul><li>출입문</li><li>소화기</li></ul>", authorId: "u_2", authorName: "박은수" },
    ],
  });

  await prisma.documentIndex.createMany({
    data: [
      { id: "idx-doc-001", tenantId: TENANT_ID, kind: "html_doc", title: "5월 야외활동 계획", snippet: "5월에 다 같이 공원 나갑니다.", sourceUrl: "/docs/d-doc-001", authorId: "u_1", authorName: "왕준하" },
      { id: "idx-doc-002", tenantId: TENANT_ID, kind: "html_doc", title: "안전점검 체크리스트", snippet: "출입문 소화기 등 점검 항목", sourceUrl: "/docs/d-doc-002", authorId: "u_2", authorName: "박은수" },
    ],
  });

  console.log("✋  Approvals...");
  const apr1 = await prisma.approvalRequest.create({
    data: {
      id: "apr-001",
      tenantId: TENANT_ID,
      documentId: "d-doc-001",
      documentUrl: "/docs/d-doc-001",
      documentKind: "html_doc",
      title: "5월 야외활동 계획",
      form: "report",
      requesterId: "u_1", requesterName: "왕준하",
      status: "결재중",
      urgent: true, hasFile: false,
      docNo: "RPT-2026-7777", snippet: "5월에 다 같이 공원 나갑니다.",
      steps: {
        create: [
          { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: new Date() },
          { step: 2, name: "왕준하", position: "센터장",   status: "current" },
        ],
      },
    },
  });

  await prisma.documentIndex.create({
    data: {
      id: `approval-${apr1.id}`, tenantId: TENANT_ID, kind: "approval_doc",
      title: apr1.title, snippet: apr1.snippet, sourceUrl: `/approval/doc/${apr1.id}`,
      authorId: apr1.requesterId, authorName: apr1.requesterName,
      meta: { form: apr1.form, docNo: apr1.docNo, status: apr1.status },
    },
  });

  console.log("📅  Annual Plan + Programs + Monthly + Weekly + Daily...");
  const annual = await prisma.annualPlan.create({
    data: {
      id: "ap-2026", tenantId: TENANT_ID,
      year: 2026, title: "2026년 운영계획", status: "active",
      goals: ["아동 보호·돌봄 강화", "학습 멘토링 확대", "지역사회 연계"],
      createdBy: "왕준하",
      programs: {
        create: [
          { id: "prog-psy", name: "심리안정 프로그램", targetGroup: "전체 아동", weeklyFrequency: 2, method: "미술·음악 활동", monthlyTargets: ["월 2회"], materials: ["그림 재료"] },
          { id: "prog-tutor", name: "학습 멘토링", targetGroup: "초등 고학년", weeklyFrequency: 3, method: "1:1 멘토링", monthlyTargets: ["국어 4회, 수학 4회"], materials: ["교재", "학습지"] },
        ],
      },
    },
  });

  const monthlyCreated = await Promise.all([1, 2, 3].map((m) =>
    prisma.monthlyPlan.create({
      data: {
        annualPlanId: annual.id, year: 2026, month: m, status: m === 1 ? "active" : "draft",
        progressPct: m === 1 ? 60 : undefined,
        weeklyGoals: {
          create: [
            { weekNumber: 1, goal: "안전교육 강화", activities: ["소방 대피 훈련", "안전 동영상 시청"] },
            { weekNumber: 2, goal: "학습 점검",     activities: ["시험 대비 학습", "교재 점검"] },
            { weekNumber: 3, goal: "여가 활동",     activities: ["공원 나들이"] },
          ],
        },
      },
    }),
  ));

  await prisma.dailyLog.createMany({
    data: [
      { id: "dl-001", tenantId: TENANT_ID, monthlyPlanId: monthlyCreated[0].id, date: "2026-01-15", title: "안전교육 첫날", authorName: "박은수", authorRole: "지원교사", status: "approved", content: "<p>소화기 사용법 교육</p>" },
      { id: "dl-002", tenantId: TENANT_ID, monthlyPlanId: monthlyCreated[0].id, date: "2026-01-16", title: "미술활동",     authorName: "김선영", authorRole: "지원교사", status: "approved", content: "<p>그림 그리기</p>" },
    ],
  });

  console.log("✅  Seed complete.\n");
  console.log("📊 Summary:");
  console.log(`   Tenant: 1`);
  console.log(`   Users: ${users.length}`);
  console.log(`   Children: ${children.count}`);
  console.log(`   Programs: 2 · Monthly plans: 3 · Daily logs: 2`);
}

async function resetAll() {
  // 역순으로 삭제 (FK 의존성 때문에)
  await prisma.approvalStep.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.weeklyGoal.deleteMany();
  await prisma.monthlyPlan.deleteMany();
  await prisma.program.deleteMany();
  await prisma.annualPlan.deleteMany();
  await prisma.doc.deleteMany();
  await prisma.documentIndex.deleteMany();
  await prisma.volunteerAttendance.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.staffAttendance.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.member.deleteMany();
  await prisma.careLog.deleteMany();
  await prisma.childDocument.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.childObservations.deleteMany();
  await prisma.childPhysical.deleteMany();
  await prisma.childCardMeta.deleteMany();
  await prisma.child.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
