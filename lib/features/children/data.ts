/**
 * Children Feature — Mock Data
 */
import type { Child, Attendance, CareLog } from "./types";

export const MOCK_CHILDREN: Child[] = [
  // 임시 3명 (테스트용 — 모든 새 필드 채움)
  {
    id: "c01",
    tenantId: "t_acme",
    name: "박서연",
    nameLast: "박",
    nameFirst: "서연",
    birthDate: "2018-04-15",
    gender: "F",
    capacityGroup: 30,
    grade: "초2",
    school: "서울초등학교",
    guardian: {
      name: "박지원",
      relation: "모",
      type: "양육",
      phone: "010-2345-6789",
      job: "간호사",
      notes: "연락 잘 됨, 알레르기 주의 필요",
    },
    health: {
      allergies: ["새우", "복숭아"],
      medications: ["알레르기약 (세티리진)"],
      notes: "운동 후 호흡곤란 주의",
    },
    enrolledAt: "2024-03-02",
    address: "서울특별시 강남구 테헤란로 123",
    serviceType: "일반",
    medianIncomePct: 75,
    kidsCallId: "staff_001",
    status: "active",
    card: {
      number: "AC-2024-031",
      identityType: "아동",
      identityVerified: "주민등록등본",
      referredBy: "강남구청 아동청소년과",
    },
    physical: {
      height: 128,
      weight: 26,
      buildType: "보통",
      faceShape: "계란형",
      hairColor: "흑색",
      hairStyle: "단발",
      reported182: "무",
    },
    observations: {
      actionsTaken: "입소 초기 적응기간 보호자 동반 등원 (1주)",
      notes: "알레르기(새우·복숭아) 주의 필요. 초등 입학 후 친구관계 원만.",
      safetyEnv:
        "부모와 함께 거주. 부모님 맞벌이로 오후 6시 이후 센터 이용. 집 근처 공원 자주 방문.",
      schoolLife: "학업 성적 중상위, 친구들과 사이 좋음. 체육 활동 적극적.",
      counselorObs: "또래와 협력 잘 함. 새로운 활동에 호기심 많음.",
      goodsProvision: "학습용文具 세트, 간식 제공",
    },
    writtenBy: {
      name: "김선영",
      org: "서창지역아동센터",
      position: "생활복지사",
      writtenAt: "2024-03-05",
    },
  },
  {
    id: "c02",
    tenantId: "t_acme",
    name: "장민서",
    nameLast: "장",
    nameFirst: "민서",
    birthDate: "2019-07-22",
    gender: "M",
    capacityGroup: 30,
    grade: "초1",
    school: "서울초등학교",
    guardian: {
      name: "장성훈",
      relation: "부",
      type: "친권",
      phone: "010-9876-5432",
      job: "회사원",
    },
    health: {
      allergies: [],
      medications: [],
      notes: "내성적, 조용한 편",
    },
    enrolledAt: "2024-09-01",
    address: "서울특별시 서초구 서초대로 456",
    serviceType: "일반",
    medianIncomePct: 50,
    kidsCallId: "staff_002",
    status: "active",
    card: {
      number: "AC-2024-058",
      identityType: "아동",
      identityVerified: "주민등록등본",
      referredBy: "서초구청 가족센터",
    },
    physical: {
      height: 122,
      weight: 24,
      buildType: "마른",
      faceShape: "둥근형",
      hairColor: "흑색",
      hairStyle: "숏컷",
      reported182: "무",
    },
    observations: {
      actionsTaken: "분리불안 관찰 — 첫 2주 보호자 연락 강화",
      notes: "내성적 성향. 조용한 놀이 선호.",
      safetyEnv: "부+모+형제 1명 거주. 아파트 단독 거주. 안전 양호.",
      schoolLife: "초등 1학년 진학 후 적응 중. 수업 집중도 보통.",
      counselorObs: "신규 적응 중 — 1:1 관심 필요.",
      guidanceJudgement: "정서 안정화 지원 지속",
    },
    writtenBy: {
      name: "박은수",
      org: "서창지역아동센터",
      position: "생활복지사",
      writtenAt: "2024-09-03",
    },
  },
  {
    id: "c03",
    tenantId: "t_acme",
    name: "한지유",
    nameLast: "한",
    nameFirst: "지유",
    birthDate: "2016-11-08",
    gender: "F",
    capacityGroup: 30,
    grade: "초5",
    school: "서울중학교",
    guardian: {
      name: "한소영",
      relation: "모",
      type: "양육",
      phone: "010-5555-7777",
      job: "교사",
    },
    health: {
      allergies: ["복숭아"],
      medications: [],
      notes: "리더십 활발, 친구들과 잘 어울림",
    },
    enrolledAt: "2023-09-01",
    previousEnrolledAt: "2022-03-01",
    address: "서울특별시 송파구 올림픽로 789",
    serviceType: "맞춤",
    medianIncomePct: 110,
    kidsCallId: "staff_001",
    status: "active",
    card: {
      number: "AC-2023-014",
      identityType: "아동",
      identityVerified: "주민등록등본",
      referredBy: "송파구청 아동보호팀",
    },
    physical: {
      height: 148,
      weight: 42,
      buildType: "보통",
      faceShape: "계란형",
      hairColor: "흑색",
      hairStyle: "긴머리",
      reported182: "무",
    },
    observations: {
      actionsTaken: "맞춤형 돌봄 — 학습 멘토링 + 진로 프로그램 연계",
      notes: "재입소 사례(2022→2023). 모자가정. 센터 또래와 친밀도 높음.",
      safetyEnv:
        "모+자녀 거주. 한부모 가구. 양호하나 정서적 지원 필요. 기본수급 수급자.",
      schoolLife: "중학교 진학(2026 예정). 학업 의지 강함. 친구 리더 역할.",
      counselorObs:
        "또래 관계·학업 모두 양호. 자기주장 강하나 협력도 좋음. 장기적 진로 설계 필요.",
      guidanceJudgement: "맞춤형 — 진로 멘토링 지속",
      goodsProvision: "학습 교재비 지원, 교복비 지원(중학교 진학 시)",
    },
    writtenBy: {
      name: "왕준하",
      org: "서창지역아동센터",
      position: "센터장",
      writtenAt: "2023-09-05",
    },
  },
];

const _today = new Date().toISOString().slice(0, 10);

export const MOCK_ATTENDANCES: Attendance[] = [
  { id: "a01", tenantId: "t_acme", childId: "c01", date: _today, status: "등원", arrivedAt: "09:05", guardianNotified: true, authorId: "u_1" },
  { id: "a02", tenantId: "t_acme", childId: "c02", date: _today, status: "결석", reason: "개인 사정", guardianNotified: true, authorId: "u_1" },
  { id: "a03", tenantId: "t_acme", childId: "c03", date: _today, status: "보건휴식", arrivedAt: "09:20", reason: "두통", guardianNotified: true, authorId: "u_1" },
];

// ─── CareLog (돌봄 일지) mock ────────────────────────────────────
const todayDate = new Date();
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const minus = (days: number) => {
  const d = new Date(todayDate);
  d.setDate(d.getDate() - days);
  return ymd(d);
};
const dateInYear = (year: number, month1to12: number, day: number) =>
  `${year}-${String(month1to12).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const MOCK_CARE_LOGS: CareLog[] = [
  // 임시 3명 기준 (테스트용)
  { id: "cl-001", childId: "c01", date: minus(0), category: "식사", title: "오후 간식", content: "요거트, 과일 — 알레르기 약 복용 후 잘 먹음", mood: "좋음", authorName: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 30 },
  { id: "cl-002", childId: "c01", date: minus(0), category: "관찰", title: "신규 적응", content: "첫 주라 낯가림 있음, 2일차부터 친구와 같이 놀기 시작", mood: "보통", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 90 },
  { id: "cl-003", childId: "c02", date: minus(0), category: "놀이", title: "블록놀이", content: "혼자 조용히 블록 쌓기, 집중력 좋음", mood: "보통", authorName: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 45 },
  { id: "cl-004", childId: "c03", date: minus(0), category: "학습", title: "수학 문제 풀이", content: "분수 문제 풀이, 이해도 양호", mood: "좋음", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 },
];
