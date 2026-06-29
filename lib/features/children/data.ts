/**
 * Children Feature — Mock Data
 */
import type { Child, Attendance, CareLog } from "./types";

export const MOCK_CHILDREN: Child[] = [
  // 30명 정원
  { id: "c01", tenantId: "t_acme", name: "김민준", birthDate: "2017-05-12", gender: "M", capacityGroup: 30, grade: "초3", guardian: { name: "김영희", relation: "모", phone: "010-1234-5678", job: "회사원" }, health: { allergies: ["복숭아"], medications: [], notes: "" }, enrolledAt: "2024-03-02", status: "active" },
  { id: "c02", tenantId: "t_acme", name: "이서윤", birthDate: "2018-02-23", gender: "F", capacityGroup: 30, grade: "초2", guardian: { name: "이정숙", relation: "모", phone: "010-2345-6789" }, health: { allergies: [], medications: [], notes: "" }, enrolledAt: "2024-03-02", status: "active" },
  { id: "c03", tenantId: "t_acme", name: "박지호", birthDate: "2016-09-08", gender: "M", capacityGroup: 30, grade: "초4", guardian: { name: "박철수", relation: "부", phone: "010-3456-7890" }, health: { allergies: ["우유"], medications: [], notes: "천식 주의" }, enrolledAt: "2023-09-01", status: "active" },
  { id: "c04", tenantId: "t_acme", name: "최예준", birthDate: "2019-11-15", gender: "M", capacityGroup: 30, grade: "초1", guardian: { name: "최미영", relation: "모", phone: "010-4567-8901" }, health: { allergies: [], medications: [], notes: "" }, enrolledAt: "2024-09-01", status: "active" },
  { id: "c05", tenantId: "t_acme", name: "정하은", birthDate: "2017-08-30", gender: "F", capacityGroup: 30, grade: "초3", guardian: { name: "정수진", relation: "모", phone: "010-5678-9012" }, health: { allergies: ["땅콩"], medications: [], notes: "" }, enrolledAt: "2024-03-02", status: "active" },
  { id: "c06", tenantId: "t_acme", name: "강유나", birthDate: "2018-06-18", gender: "F", capacityGroup: 30, grade: "초2", guardian: { name: "강동원", relation: "부", phone: "010-6789-0123" }, health: { allergies: [], medications: [], notes: "" }, enrolledAt: "2024-03-02", status: "active" },
  // 40명 정원
  { id: "c11", tenantId: "t_acme", name: "윤서아", birthDate: "2017-01-22", gender: "F", capacityGroup: 40, grade: "초3", guardian: { name: "윤지영", relation: "모", phone: "010-1111-2222" }, health: { allergies: [], medications: [], notes: "" }, enrolledAt: "2024-03-02", status: "active" },
  { id: "c12", tenantId: "t_acme", name: "임도윤", birthDate: "2016-04-11", gender: "M", capacityGroup: 40, grade: "초4", guardian: { name: "임성환", relation: "부", phone: "010-3333-4444" }, health: { allergies: ["게"], medications: [], notes: "" }, enrolledAt: "2023-09-01", status: "active" },
  { id: "c13", tenantId: "t_acme", name: "한지우", birthDate: "2018-12-03", gender: "F", capacityGroup: 40, grade: "초2", guardian: { name: "한승우", relation: "부", phone: "010-5555-6666" }, health: { allergies: [], medications: [], notes: "ADHD 진단" }, enrolledAt: "2024-03-02", status: "active" },
  { id: "c14", tenantId: "t_acme", name: "오현우", birthDate: "2019-07-19", gender: "M", capacityGroup: 40, grade: "초1", guardian: { name: "오은지", relation: "모", phone: "010-7777-8888" }, health: { allergies: [], medications: [], notes: "" }, enrolledAt: "2024-09-01", status: "active" },
  { id: "c15", tenantId: "t_acme", name: "서지안", birthDate: "2017-09-25", gender: "F", capacityGroup: 40, grade: "초3", guardian: { name: "서민정", relation: "모", phone: "010-9999-0000" }, health: { allergies: [], medications: [], notes: "" }, enrolledAt: "2024-03-02", status: "active" },
  // 50명 정원
  { id: "c21", tenantId: "t_acme", name: "권수호", birthDate: "2015-11-08", gender: "M", capacityGroup: 50, grade: "초5", guardian: { name: "권오수", relation: "부", phone: "010-2222-3333" }, health: { allergies: [], medications: [], notes: "" }, enrolledAt: "2023-09-01", status: "active" },
  { id: "c22", tenantId: "t_acme", name: "문채원", birthDate: "2016-03-14", gender: "F", capacityGroup: 50, grade: "초4", guardian: { name: "문지훈", relation: "부", phone: "010-4444-5555" }, health: { allergies: ["계란"], medications: [], notes: "" }, enrolledAt: "2023-09-01", status: "active" },
  { id: "c23", tenantId: "t_acme", name: "신우진", birthDate: "2017-06-02", gender: "M", capacityGroup: 50, grade: "초3", guardian: { name: "신미경", relation: "모", phone: "010-6666-7777" }, health: { allergies: [], medications: [], notes: "" }, enrolledAt: "2024-03-02", status: "active" },
  { id: "c24", tenantId: "t_acme", name: "백서연", birthDate: "2018-10-20", gender: "F", capacityGroup: 50, grade: "초2", guardian: { name: "백종현", relation: "부", phone: "010-8888-9999" }, health: { allergies: [], medications: [], notes: "" }, enrolledAt: "2024-03-02", status: "active" },
  { id: "c25", tenantId: "t_acme", name: "남하준", birthDate: "2019-04-17", gender: "M", capacityGroup: 50, grade: "초1", guardian: { name: "남은우", relation: "모", phone: "010-1212-3434" }, health: { allergies: ["밀가루"], medications: [], notes: "" }, enrolledAt: "2024-09-01", status: "active" },
];

const _today = new Date().toISOString().slice(0, 10);

export const MOCK_ATTENDANCES: Attendance[] = [
  { id: "a01", tenantId: "t_acme", childId: "c01", date: _today, status: "등원", arrivedAt: "09:15", guardianNotified: true, authorId: "u_1" },
  { id: "a02", tenantId: "t_acme", childId: "c02", date: _today, status: "등원", arrivedAt: "09:18", guardianNotified: true, authorId: "u_1" },
  { id: "a03", tenantId: "t_acme", childId: "c03", date: _today, status: "조퇴", arrivedAt: "09:20", leftAt: "13:00", reason: "병원 진료", guardianNotified: true, authorId: "u_1" },
  { id: "a04", tenantId: "t_acme", childId: "c04", date: _today, status: "결석", reason: "감기로 인한 병가", guardianNotified: true, authorId: "u_1" },
  { id: "a05", tenantId: "t_acme", childId: "c05", date: _today, status: "등원", arrivedAt: "09:22", guardianNotified: true, authorId: "u_1" },
  { id: "a06", tenantId: "t_acme", childId: "c06", date: _today, status: "등원", arrivedAt: "09:30", guardianNotified: true, authorId: "u_1" },
  { id: "a11", tenantId: "t_acme", childId: "c11", date: _today, status: "등원", arrivedAt: "09:10", guardianNotified: true, authorId: "u_1" },
  { id: "a12", tenantId: "t_acme", childId: "c12", date: _today, status: "결석", reason: "가족 여행", guardianNotified: true, authorId: "u_1" },
  { id: "a13", tenantId: "t_acme", childId: "c13", date: _today, status: "보건휴식", arrivedAt: "09:25", reason: "두통", guardianNotified: true, authorId: "u_1" },
  { id: "a14", tenantId: "t_acme", childId: "c14", date: _today, status: "등원", arrivedAt: "09:05", guardianNotified: true, authorId: "u_1" },
  { id: "a15", tenantId: "t_acme", childId: "c15", date: _today, status: "미등원", guardianNotified: false, authorId: "u_1" },
  { id: "a21", tenantId: "t_acme", childId: "c21", date: _today, status: "등원", arrivedAt: "09:12", guardianNotified: true, authorId: "u_1" },
  { id: "a22", tenantId: "t_acme", childId: "c22", date: _today, status: "등원", arrivedAt: "09:08", guardianNotified: true, authorId: "u_1" },
  { id: "a23", tenantId: "t_acme", childId: "c23", date: _today, status: "등원", arrivedAt: "09:17", guardianNotified: true, authorId: "u_1" },
  { id: "a24", tenantId: "t_acme", childId: "c24", date: _today, status: "결석", reason: "학교 행사", guardianNotified: true, authorId: "u_1" },
  { id: "a25", tenantId: "t_acme", childId: "c25", date: _today, status: "조퇴", arrivedAt: "09:18", leftAt: "12:30", reason: "조부모 모심", guardianNotified: true, authorId: "u_1" },
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
  // 2026년
  { id: "cl-001", childId: "c01", date: minus(0), category: "식사", title: "오후 간식", content: "요거트, 과일, 빵 — 잘 먹음", mood: "좋음", authorName: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 30 },
  { id: "cl-002", childId: "c01", date: minus(0), category: "학습", title: "국어 독해 연습", content: "본문 읽고 질문에 답하기, 정답률 80%", mood: "보통", authorName: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 },
  { id: "cl-003", childId: "c01", date: minus(1), category: "관찰", title: "친구와 갈등", content: "블록놀이 중 의견 충돌 → 교사 중재 후 합의", mood: "보통", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 },
  { id: "cl-004", childId: "c01", date: minus(2), category: "특별활동", title: "여름 풍경 그리기", content: "파스텔로 바다/하늘 그림, 자신감 표현 향상", mood: "좋음", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 48 },
  { id: "cl-005", childId: "c02", date: minus(0), category: "놀이", title: "축구 게임", content: "팀 나눠서 진행, 골키퍼 역할 자원", mood: "좋음", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 45 },
  { id: "cl-006", childId: "c02", date: minus(1), category: "식사", title: "점심", content: "김치찌개, 계란말이 — 잘 먹음", mood: "좋음", authorName: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 25 },
  { id: "cl-007", childId: "c03", date: dateInYear(2026, 6, 12), category: "관찰", title: "조퇴 (병원)", content: "병원 진료로 인한 조퇴, 보호자 연락 완료", mood: "보통", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 5 },
  { id: "cl-008", childId: "c03", date: dateInYear(2026, 6, 5), category: "놀이", title: "물놀이", content: "물총놀이, 너무 신나서 잠시 주의 필요", mood: "좋음", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7 },
  // 2025년
  { id: "cl-101", childId: "c01", date: dateInYear(2025, 12, 18), category: "특별활동", title: "크리스마스 파티", content: "선물 교환, 케이크 데코레이션 참여", mood: "좋음", authorName: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 200 },
  { id: "cl-102", childId: "c01", date: dateInYear(2025, 11, 5), category: "학습", title: "수학 문제 풀이", content: "구구단 6단~9단 복습, 정확도 상승", mood: "좋음", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 240 },
  { id: "cl-103", childId: "c01", date: dateInYear(2025, 8, 20), category: "관찰", title: "새 친구 적응", content: "새로 온 친구에게 먼저 다가가 잘 도와줌", mood: "좋음", authorName: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 310 },
  { id: "cl-104", childId: "c02", date: dateInYear(2025, 12, 24), category: "특별활동", title: "송년회", content: "댄스 공연, 노래 부르기, 매우 적극적", mood: "좋음", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 200 },
  { id: "cl-105", childId: "c02", date: dateInYear(2025, 6, 15), category: "관찰", title: "리더십 발휘", content: "팀 활동 중 자연스럽게 리더 역할", mood: "좋음", authorName: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 380 },
  // 2024년
  { id: "cl-201", childId: "c01", date: dateInYear(2024, 9, 2), category: "관찰", title: "입소 첫 주", content: "낯가림이 있었지만 3일차부터 적응", mood: "보통", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 680 },
  { id: "cl-202", childId: "c01", date: dateInYear(2024, 11, 10), category: "학습", title: "한글 자음 연습", content: "ㄱ~ㅇ까지 읽기 가능, 쓰기는 연습 중", mood: "좋음", authorName: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 620 },
  { id: "cl-203", childId: "c02", date: dateInYear(2024, 3, 15), category: "놀이", title: "친구 사귀기", content: "처음엔 혼자 놀았으나 점차 같이 놀기 시작", mood: "좋음", authorName: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 850 },
];
