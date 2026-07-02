/**
 * Staff Feature Module — domain types
 */

// ── 기존 타입 (하위 호환) ─────────────────────────────────────────
export type StaffPosition =
  | "所长"    // 소장
  | "支援교사" // 지원교사
  | "조리사"  // 조리사
  | "행정"   // 행정
  | "기타";  // 기타

export type Staff = {
  id: string;
  tenantId: string;
  name: string;
  /** 로그인 ID (추후 인증 연계) */
  loginId: string;
  gender: "M" | "F";
  phone: string;
  position: StaffPosition;
  joinDate: string; // YYYY-MM-DD
  email?: string;
  status: "active" | "leave" | "retired";
};

// 근태 (Staff Attendance — 출근/퇴근)
export type StaffAttendance = {
  id: string;
  tenantId: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  clockIn?: string;   // HH:mm
  clockOut?: string;  // HH:mm
  note?: string;
  authorId: string; // 수정한 관리자 ID
};

// ── 5 탭용 타입 ─────────────────────────────────────────────────

/** 채용구분 */
export type RecruitType = "신규" | "재직자전형" | "경력자" | "계약직";
/** 고용구분 */
export type EmploymentType = "정규직" | "무기계약직" | "기간제" | "일용직" | "파견직";
/** 근무형태 */
export type WorkType = "상근" | "비상근" | "시간제" | "일일근무";
/** 호봉 기준 직위 */
export type SalaryStepPosition = "시설장" | "팀장" | "사회복지사" | "보육교사" | "생활지도사" | "사무국장" | "조리사" | "기타";
/** 근무상태 */
export type WorkStatus = "재직" | "휴직" | "퇴사" | "정직";

/** 1) 기본사항 */
export interface StaffBasicInfo {
  serialNo: string;           // 직렬번호 (e.g. "2020-001")
  nameKr: string;              // 한글명
  nameCn?: string;             // 한자명
  nameEn?: string;             // 영문명
  juminNo: string;             // 주민번호 (마스킹 표시용 원본)
  department: string;          // 부서
  joinDate: string;            // 입사일 YYYY-MM-DD
  hourlyPosition?: string;     // 시간구직위
  facilityJoinDate?: string;   // 시설입사일
  position: string;            // 직위
  workStatus: WorkStatus;      // 근무상태
  salaryStep: number;          // 호봉 (1~30)
  recruitType?: RecruitType;   // 채용구분
  employmentType?: EmploymentType; // 고용구분
  workType?: WorkType;         // 근무형태
  tempType?: string;           // 임시구분
  salaryStepTargetMonth?: string; // 승호대상월 YYYY-MM
  fullTime?: "Y" | "N";       // 상근여부
  civilianSupportType?: string; // 민간지원인력구분
  gender?: "M" | "F";          // 성별
  accidentReport?: string;     // 사고구보고
  duties?: string;             // 담당업무
  resignationDate?: string;    // 퇴사일
  resignationReason?: string;  // 퇴사사유
  phone?: string;              // 전화
  mobile?: string;              // 휴대폰
  email?: string;               // 이메일
  seniorityBasis?: string;     // 연차기준
  address?: string;             // 현주소
  privacyConsent?: "Y" | "N" | "미동의"; // 개인정보동의
  privacyConsentFile?: string;  // 개인정보동의파일
  remarks?: string;             // 특이사항
  workContract?: string;       // 근무계약조건
}

/** 2) 신규등록 */
export interface StaffNewHireInfo {
  recruitAnnouncement?: string;  // 채용공고
  applicationDoc?: string;        // 입사서류
  criminalRecordCheck?: "Y" | "N" | "미제출"; // 성범죄경력조회
  childAbusePledge?: "Y" | "N" | "미제출";    // 아동학대금지서약
  employmentInsurance?: "Y" | "N" | "미적용"; // 고용보험
  industrialAccident?: "Y" | "N" | "미적용";  // 산재보험
  nationalPension?: "Y" | "N" | "미적용";     // 국민연금
  healthInsurance?: "Y" | "N" | "미적용";     // 건강보험
  residentRegistration?: "Y" | "N" | "미제출";  // 주민등록등본
  graduationCertificate?: string; // 졸업증명서
  etcDoc1?: string; etcDoc2?: string; etcDoc3?: string; // 기타서류
}

/** 3) 학력사항 */
export interface StaffEducation {
  id: string;
  schoolName: string;
  degree: "고등학교" | "전문대학" | "대학교" | "대학원" | "석사" | "박사";
  major?: string;
  enterDate?: string;   // 입학일
  graduateDate?: string; // 졸업일
  graduationType?: "졸업" | "중퇴" | "재학" | "휴학";
  remarks?: string;
}

/** 4) 가족사항 */
export interface StaffFamily {
  id: string;
  relation: string;      // 관계
  name: string;          // 성명
  birthDate?: string;    // 생년월일 YYYY-MM-DD
  age?: number;          // 나이
  job?: string;          // 직업
  cohabit?: "Y" | "N";   // 동거여부
  remarks?: string;
}

/** 5) 사진 */
export interface StaffPhoto {
  url?: string;
  fileName?: string;
  uploadedAt?: string;
}

// ── 전체 Staff 상세 프로필 (목록용 Staff + 5 탭 데이터) ─────────
export interface StaffProfile extends Staff {
  basic: StaffBasicInfo;
  newHire: StaffNewHireInfo;
  education: StaffEducation[];
  family: StaffFamily[];
  photo?: StaffPhoto;
}

// ── 호봉표 ─────────────────────────────────────────────────────
export interface SalaryStepEntry {
  step: number;       // 1~30
  monthlySalary: number;  // 월급여 (원)
}

export type SalaryTable = Partial<Record<string, SalaryStepEntry[]>>;
