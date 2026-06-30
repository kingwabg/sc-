/**
 * Children Feature — Domain Types
 */
export type CapacityGroup = 30 | 40 | 50;

export type Guardian = {
  name: string;
  relation: "부" | "모" | "조부모" | "기타";
  type?: string;
  phone: string;
  job?: string;
  notes?: string;
};

export type Health = {
  allergies: string[];
  medications: string[];
  notes: string;
};

export type EmergencyContact = {
  name: string;
  phone: string;
};

export type GroupFilter = {
  /** 학년 매칭 (예: ["초3"]) */
  grades?: string[];
  /** 성별 매칭 (예: ["F"] = 여학생만) */
  genders?: ("M" | "F")[];
  /** 알레르기 매칭 (예: ["새우", "복숭아"]) — 1개 이상 보유 시 매칭 */
  allergies?: string[];
  /** 등록일 범위 (inclusive) */
  enrolledAfter?: string;
  enrolledBefore?: string;
  /** 출석 상태 매칭 (예: ["등원"]) — attendanceMap 기반 */
  statuses?: AttendanceStatus[];
};

export type ChildGroup = {
  id: string;
  label: string;
  parentId: string | null;
  /** 정원 (아동 capacityGroup과 매핑, null이면 capacityGroup 없이 폴더만) */
  capacity: number | null;
  order: number;
  /** 스마트 폴더 필터 — 비어있으면 단순 capacity 매칭, 있으면 동적 필터링 */
  filter?: GroupFilter;
};

export type AttendanceStatus = "등원" | "결석" | "조퇴" | "보건휴식" | "미등원";

export type Child = {
  id: string;
  tenantId: string;
  /**
   * 전체 이름 (호환용 — `${nameLast}${nameFirst}` 와 동일하게 유지).
   * 새 코드에서는 nameLast/nameFirst를 직접 사용하는 것을 권장.
   */
  name: string;
  /** 성 (surname) — 예: "김" */
  nameLast: string;
  /** 이름 (given name) — 예: "민준" */
  nameFirst: string;
  birthDate: string; // YYYY-MM-DD
  gender: "M" | "F";
  /** 아동 본인 휴대폰 (없을 수 있음) */
  phone?: string;
  photoUrl?: string;
  capacityGroup: CapacityGroup;
  grade?: string;
  /** 학교명 */
  school?: string;
  guardian: Guardian;
  emergencyContact?: EmergencyContact;
  health: Health;
  /** 입소일 */
  enrolledAt: string;
  /** 이전 입소일 (재입소 시) */
  previousEnrolledAt?: string;
  /** 퇴소일 */
  leftAt?: string;
  /** 주소 */
  address?: string;
  /** 이용유형 (예: "일반", "긴급", "맞춤" 등) */
  serviceType?: string;
  /** 함수기준 중위소득 (%) */
  medianIncomePct?: number;
  /** 담당자키즈콜ID */
  kidsCallId?: string;
  status: "active" | "leave" | "left";
  /**
   * 아동 카드 양식 필드 (서창지역아동센터 표준 양식 기준).
   * PDF 출력/공식 기록 카드에 사용. 모두 optional — 미입력 시 빈 칸.
   */
  card?: ChildCardMeta;
  physical?: ChildPhysical;
  observations?: ChildObservations;
  writtenBy?: ChildWrittenBy;
};

export type ChildCardMeta = {
  /** 아동카드번호 (예: "AC-2026-001") */
  number?: string;
  /** 신원구분 (예: "아동", "주민", "기타") */
  identityType?: string;
  /** 신원확인 (예: "주민등록등본", "护照") */
  identityVerified?: string;
  /** 입소의뢰기관 (예: "양산시청 아동청소년과") */
  referredBy?: string;
};

export type ChildPhysical = {
  /** 신장 (cm) */
  height?: number;
  /** 몸무게 (kg) */
  weight?: number;
  /** 체격 (예: "왜소" | "보통" | "건장") */
  buildType?: string;
  /** 얼굴형 (예: "계란형", "둥근형", "각진형") */
  faceShape?: string;
  /** 두발색상 (예: "흑색", "갈색", "금발") */
  hairColor?: string;
  /** 두발형태 (예: "긴머리", "단발", "숏컷") */
  hairStyle?: string;
  /** 182 신고 이력 (예: "무", "유") */
  reported182?: string;
  /** 기타 신체 특징 */
  otherFeatures?: string;
};

export type ChildObservations = {
  /** 조치사항 */
  actionsTaken?: string;
  /** 아동 비고사항 */
  notes?: string;
  /** 아동 안전환경 */
  safetyEnv?: string;
  /** 아동 학교생활 */
  schoolLife?: string;
  /** 상담자 관찰 의견 */
  counselorObs?: string;
  /** 지도·판정 */
  guidanceJudgement?: string;
  /** 급품 지급 사항 */
  goodsProvision?: string;
};

export type ChildWrittenBy = {
  /** 작성자명 */
  name?: string;
  /** 소속 (예: "서창지역아동센터") */
  org?: string;
  /** 직위 (예: "생활복지사") */
  position?: string;
  /** 작성년월일 (YYYY-MM-DD) */
  writtenAt?: string;
};

export type Attendance = {
  id: string;
  tenantId: string;
  childId: string;
  date: string;
  status: AttendanceStatus;
  arrivedAt?: string;
  leftAt?: string;
  reason?: string;
  guardianNotified: boolean;
  note?: string;
  authorId: string;
};

export type CareLogCategory = "식사" | "학습" | "놀이" | "투약" | "관찰" | "특별활동" | "기타";

export type CareLog = {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  category: CareLogCategory;
  title: string;
  content: string;
  mood?: "좋음" | "보통" | "나쁨";
  authorName: string;
  createdAt: number;
};
