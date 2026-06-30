/**
 * Children Feature — Domain Types
 */
export type CapacityGroup = 30 | 40 | 50;

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
  guardian: {
    name: string;
    relation: "부" | "모" | "조부모" | "기타";
    /** 보호자 유형 (예: "양육", "친권", "후견" 등) */
    type?: string;
    phone: string;
    job?: string;
    /** 비고 */
    notes?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
  };
  health: {
    allergies: string[];
    medications: string[];
    notes: string;
  };
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
