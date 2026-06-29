/**
 * Children Feature — Domain Types
 */
export type CapacityGroup = 30 | 40 | 50;

export type AttendanceStatus = "등원" | "결석" | "조퇴" | "보건휴식" | "미등원";

export type Child = {
  id: string;
  tenantId: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: "M" | "F";
  photoUrl?: string;
  capacityGroup: CapacityGroup;
  grade?: string;
  guardian: {
    name: string;
    relation: "부" | "모" | "조부모" | "기타";
    phone: string;
    job?: string;
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
  enrolledAt: string;
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
