/**
 * Staff Feature Module — mock data
 */

import type {
  Staff,
  StaffAttendance,
  StaffProfile,
  SalaryTable,
  SalaryStepEntry,
} from "./types";

// ── 호봉표 (2026 직위별 1~30호봉) ─────────────────────────────
const BASE_급여: Record<string, number> = {
  "시설장":    4_500_000,
  "팀장":      3_800_000,
  "사회복지사": 3_200_000,
  "보육교사":   2_800_000,
  "생활지도사": 2_600_000,
  "사무국장":   3_500_000,
  "조리사":     2_400_000,
  "기타":       2_200_000,
};

function buildSteps(position: string): SalaryStepEntry[] {
  const base = BASE_급여[position] ?? 2_200_000;
  return Array.from({ length: 30 }, (_, i) => {
    const step = i + 1;
    // 매년 약 3% 인상
    const monthly = Math.round(base * Math.pow(1.03, step - 1));
    return { step, monthlySalary: monthly };
  });
}

export const SALARY_TABLE_2026: SalaryTable = {
  "시설장":    buildSteps("시설장"),
  "팀장":      buildSteps("팀장"),
  "사회복지사": buildSteps("사회복지사"),
  "보육교사":   buildSteps("보육교사"),
  "생활지도사": buildSteps("생활지도사"),
  "사무국장":   buildSteps("사무국장"),
  "조리사":     buildSteps("조리사"),
  "기타":       buildSteps("기타"),
};

// ── Mock Staff (5명) ──────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10);

export const MOCK_STAFF: Staff[] = [
  {
    id: "s01", tenantId: "t-001", name: "김영미", loginId: "kimym",
    gender: "F", phone: "010-5811-4237", position: "所长",
    joinDate: "2020-03-01", status: "active",
  },
  {
    id: "s02", tenantId: "t-001", name: "이소연", loginId: "leeso",
    gender: "F", phone: "010-2345-6789", position: "支援교사",
    joinDate: "2021-03-01", status: "active",
  },
  {
    id: "s03", tenantId: "t-001", name: "정미경", loginId: "jungmk",
    gender: "F", phone: "010-3456-7890", position: "支援교사",
    joinDate: "2022-09-01", status: "active",
  },
  {
    id: "s04", tenantId: "t-001", name: "박동수", loginId: "parkds",
    gender: "M", phone: "010-4567-8901", position: "조리사",
    joinDate: "2019-03-01", status: "active",
  },
  {
    id: "s05", tenantId: "t-001", name: "최지연", loginId: "choijy",
    gender: "F", phone: "010-5678-9012", position: "행정",
    joinDate: "2023-01-15", status: "active",
  },
];

export const MOCK_STAFF_ATTENDANCES: StaffAttendance[] = [
  { id: "sa01", tenantId: "t-001", staffId: "s01", date: TODAY, clockIn: "08:30", clockOut: "17:30", authorId: "u_1" },
  { id: "sa02", tenantId: "t-001", staffId: "s02", date: TODAY, clockIn: "08:45", clockOut: "18:00", authorId: "u_1" },
  { id: "sa03", tenantId: "t-001", staffId: "s03", date: TODAY, clockIn: "09:00", clockOut: "18:30", authorId: "u_1" },
  { id: "sa04", tenantId: "t-001", staffId: "s04", date: TODAY, clockIn: "06:30", clockOut: "15:00", authorId: "u_1" },
  { id: "sa05", tenantId: "t-001", staffId: "s05", date: TODAY, clockIn: "09:00", note: "외출 14:00~15:00", authorId: "u_1" },
];

export const POSITION_LABELS: Record<string, string> = {
  "所长": "소장",
  "支援교사": "지원교사",
  "조리사": "조리사",
  "행정": "행정",
  "기타": "기타",
};

// ── Mock StaffProfile (상세 데이터) ────────────────────────────
export const MOCK_STAFF_PROFILES: StaffProfile[] = [
  {
    ...MOCK_STAFF[0],
    basic: {
      serialNo: "2020-001", nameKr: "김영미", nameCn: "金英美", nameEn: "Kim Young-Mi",
      juminNo: "920412-1******", department: "시설장실", joinDate: "2020-03-01",
      facilityJoinDate: "2020-03-01", position: "시설장", workStatus: "재직",
      salaryStep: 7, fullTime: "Y", gender: "F",
      recruitType: "신규", employmentType: "정규직", workType: "상근",
      phone: "02-1234-5678", mobile: "010-5811-4237",
      email: "kimym@officex.or.kr",
      seniorityBasis: "시설입사일", address: "서울특별시 강남구 테헤란로 123",
      privacyConsent: "Y", workContract: "每周 5일, 09:00~18:00",
      duties: "시설 전체 운영 및 관리",
      accidentReport: "해당없음",
    },
    newHire: {
      recruitAnnouncement: "2020년 제1차 시설장 공개채용",
      applicationDoc: "제출완료",
      criminalRecordCheck: "Y",
      childAbusePledge: "Y",
      employmentInsurance: "Y",
      industrialAccident: "Y",
      nationalPension: "Y",
      healthInsurance: "Y",
      residentRegistration: "Y",
      graduationCertificate: "제출완료",
    },
    education: [
      { id: "e01-1", schoolName: "연세대학교", degree: "대학교", major: "사회복지학", graduateDate: "2010-02-15", graduationType: "졸업" },
      { id: "e01-2", schoolName: "서울대학교 대학원", degree: "석사", major: "사회복지학", graduateDate: "2012-08-20", graduationType: "졸업" },
    ],
    family: [
      { id: "f01-1", relation: "배우자", name: "이민수", birthDate: "1988-05-10", job: "회사원", cohabit: "Y" },
      { id: "f01-2", relation: "자녀", name: "이서연", birthDate: "2015-09-22", job: "초등학생", cohabit: "Y" },
      { id: "f01-3", relation: "부", name: "김영호", birthDate: "1958-03-15", job: "은퇴", cohabit: "N" },
    ],
    photo: { url: undefined, uploadedAt: undefined },
  },
  {
    ...MOCK_STAFF[1],
    basic: {
      serialNo: "2021-002", nameKr: "이소연", nameCn: "李素娟", nameEn: "Lee So-Yeon",
      juminNo: "910715-2******", department: "사회복지팀", joinDate: "2021-03-01",
      facilityJoinDate: "2021-03-01", position: "사회복지사", workStatus: "재직",
      salaryStep: 6, fullTime: "Y", gender: "F",
      recruitType: "신규", employmentType: "정규직", workType: "상근",
      phone: "02-1234-5679", mobile: "010-2345-6789",
      email: "leeso@officex.or.kr",
      seniorityBasis: "시설입사일", address: "서울특별시 서초구 방배로 45",
      privacyConsent: "Y", workContract: "每周 5일, 09:00~18:00",
      duties: "이용자 상담 및 사례관리",
      accidentReport: "해당없음",
    },
    newHire: {
      recruitAnnouncement: "2021년 사회복지사 채용",
      applicationDoc: "제출완료",
      criminalRecordCheck: "Y",
      childAbusePledge: "Y",
      employmentInsurance: "Y",
      industrialAccident: "Y",
      nationalPension: "Y",
      healthInsurance: "Y",
      residentRegistration: "Y",
      graduationCertificate: "제출완료",
    },
    education: [
      { id: "e02-1", schoolName: "이화여자대학교", degree: "대학교", major: "사회복지학", graduateDate: "2015-02-14", graduationType: "졸업" },
    ],
    family: [
      { id: "f02-1", relation: "배우자", name: "김철수", birthDate: "1987-11-30", job: "교사", cohabit: "Y" },
      { id: "f02-2", relation: "자녀", name: "김지민", birthDate: "2018-04-05", job: "", cohabit: "Y" },
    ],
    photo: { url: undefined, uploadedAt: undefined },
  },
  {
    ...MOCK_STAFF[2],
    basic: {
      serialNo: "2022-003", nameKr: "정미경", nameCn: "鄭美京", nameEn: "Jung Mi-Kyung",
      juminNo: "930820-1******", department: "보육팀", joinDate: "2022-09-01",
      facilityJoinDate: "2022-09-01", position: "보육교사", workStatus: "재직",
      salaryStep: 5, fullTime: "Y", gender: "F",
      recruitType: "신규", employmentType: "정규직", workType: "상근",
      phone: "02-1234-5680", mobile: "010-3456-7890",
      email: "jungmk@officex.or.kr",
      seniorityBasis: "시설입사일", address: "서울특별시 동작구 사평대로 78",
      privacyConsent: "Y", workContract: "每周 5일, 08:00~17:00",
      duties: "영유아 보육 및 교육활동",
      accidentReport: "해당없음",
    },
    newHire: {
      criminalRecordCheck: "Y",
      childAbusePledge: "Y",
      employmentInsurance: "Y",
      industrialAccident: "Y",
      nationalPension: "Y",
      healthInsurance: "Y",
      residentRegistration: "Y",
      graduationCertificate: "제출완료",
    },
    education: [
      { id: "e03-1", schoolName: "한국교원대학교", degree: "대학교", major: "유아교육학", graduateDate: "2020-02-12", graduationType: "졸업" },
    ],
    family: [
      { id: "f03-1", relation: "모", name: "정영희", birthDate: "1962-07-20", job: "주부", cohabit: "N" },
      { id: "f03-2", relation: "부", name: "정철호", birthDate: "1959-12-03", job: "자영업", cohabit: "N" },
    ],
    photo: { url: undefined, uploadedAt: undefined },
  },
  {
    ...MOCK_STAFF[3],
    basic: {
      serialNo: "2019-004", nameKr: "박동수", nameCn: "朴東洙", nameEn: "Park Dong-Su",
      juminNo: "870312-1******", department: "조리팀", joinDate: "2019-03-01",
      facilityJoinDate: "2019-03-01", position: "조리사", workStatus: "재직",
      salaryStep: 8, fullTime: "Y", gender: "M",
      recruitType: "신규", employmentType: "정규직", workType: "상근",
      phone: "02-1234-5681", mobile: "010-4567-8901",
      email: "parkds@officex.or.kr",
      seniorityBasis: "시설입사일", address: "경기도 성남시 수정판교로 156",
      privacyConsent: "Y", workContract: "每周 5일, 06:00~15:00",
      duties: "식단 운영 및 급식 조리",
      accidentReport: "해당없음",
    },
    newHire: {
      criminalRecordCheck: "Y",
      childAbusePledge: "Y",
      employmentInsurance: "Y",
      industrialAccident: "Y",
      nationalPension: "Y",
      healthInsurance: "Y",
      residentRegistration: "Y",
      graduationCertificate: "제출완료",
    },
    education: [
      { id: "e04-1", schoolName: "고등학교", degree: "고등학교", major: "실업계", graduateDate: "2005-02-10", graduationType: "졸업" },
    ],
    family: [
      { id: "f04-1", relation: "배우자", name: "박영희", birthDate: "1988-09-14", job: "미용사", cohabit: "Y" },
      { id: "f04-2", relation: "자녀", name: "박서준", birthDate: "2012-06-30", job: "중학생", cohabit: "Y" },
      { id: "f04-3", relation: "자녀", name: "박서윤", birthDate: "2016-11-11", job: "", cohabit: "Y" },
    ],
    photo: { url: undefined, uploadedAt: undefined },
  },
  {
    ...MOCK_STAFF[4],
    basic: {
      serialNo: "2023-005", nameKr: "최지연", nameCn: "崔智娟", nameEn: "Choi Ji-Yeon",
      juminNo: "950503-2******", department: "사무국", joinDate: "2023-01-15",
      facilityJoinDate: "2023-01-15", position: "사무국장", workStatus: "재직",
      salaryStep: 4, fullTime: "Y", gender: "F",
      recruitType: "신규", employmentType: "정규직", workType: "상근",
      phone: "02-1234-5682", mobile: "010-5678-9012",
      email: "choijy@officex.or.kr",
      seniorityBasis: "시설입사일", address: "서울특별시 영등포구 여의대로 92",
      privacyConsent: "Y", workContract: "每周 5일, 09:00~18:00",
      duties: "총무 및 회계 업무",
      accidentReport: "해당없음",
    },
    newHire: {
      criminalRecordCheck: "Y",
      childAbusePledge: "Y",
      employmentInsurance: "Y",
      industrialAccident: "Y",
      nationalPension: "Y",
      healthInsurance: "Y",
      residentRegistration: "Y",
      graduationCertificate: "제출완료",
    },
    education: [
      { id: "e05-1", schoolName: "서울디지털대학교", degree: "대학교", major: "경영학", graduateDate: "2022-02-18", graduationType: "졸업" },
    ],
    family: [
      { id: "f05-1", relation: "모", name: "최순실", birthDate: "1965-03-08", job: "주부", cohabit: "Y" },
    ],
    photo: { url: undefined, uploadedAt: undefined },
  },
];
