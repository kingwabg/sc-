import type { ChildDocument } from "./types";

export const MOCK_CHILD_DOCUMENTS: ChildDocument[] = [
  // ── c01: 김민준 ──
  { id: "doc-001", childId: "c01", title: "주민등록등본", category: "신분증", kind: "file", fileType: "pdf", fileSize: 245_000, issuedAt: "2024-03-02", uploadedBy: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 400, tags: ["필수"] },
  { id: "doc-002", childId: "c01", title: "예방접종 기록 (DTaP 추가)", category: "예방접종", kind: "file", fileType: "pdf", fileSize: 180_000, issuedAt: "2025-09-12", uploadedBy: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 280, tags: [] },
  { id: "doc-003", childId: "c01", title: "2025 건강검진 결과", category: "건강검진", kind: "file", fileType: "pdf", fileSize: 320_000, issuedAt: "2025-05-10", uploadedBy: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 410 },
  { id: "doc-004", childId: "c01", title: "알레르기 진단서 — 복숭아", category: "알레르기 진단", kind: "file", fileType: "pdf", fileSize: 410_000, issuedAt: "2024-04-15", expiresAt: "2027-04-15", uploadedBy: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 450, tags: ["만료 1년 전"] },
  { id: "doc-005", childId: "c01", title: "보호자 동의서 — 야외활동", category: "보호자 동의", kind: "file", fileType: "pdf", fileSize: 95_000, issuedAt: "2026-04-01", uploadedBy: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90 },

  // ── c02: 이서윤 ──
  { id: "doc-101", childId: "c02", title: "주민등록등본", category: "신분증", kind: "file", fileType: "pdf", fileSize: 232_000, issuedAt: "2024-03-02", uploadedBy: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 400 },
  { id: "doc-102", childId: "c02", title: "예방접종 기록", category: "예방접종", kind: "file", fileType: "pdf", fileSize: 175_000, issuedAt: "2024-03-10", uploadedBy: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 380 },
  { id: "doc-103", childId: "c02", title: "보호자 동의서 — 특별활동", category: "보호자 동의", kind: "file", fileType: "pdf", fileSize: 88_000, issuedAt: "2026-05-15", uploadedBy: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 50 },

  // ── c03: 박지호 (천식 주의) ──
  { id: "doc-201", childId: "c03", title: "주민등록등본", category: "신분증", kind: "file", fileType: "pdf", fileSize: 240_000, issuedAt: "2023-09-01", uploadedBy: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 700 },
  { id: "doc-202", childId: "c03", title: "천식 진단서", category: "알레르기 진단", kind: "file", fileType: "pdf", fileSize: 380_000, issuedAt: "2023-09-05", expiresAt: "2026-09-05", uploadedBy: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 690, tags: ["⚠️ 30일 내 만료"] },
  { id: "doc-203", childId: "c03", title: "2026 건강검진 결과", category: "건강검진", kind: "file", fileType: "pdf", fileSize: 290_000, issuedAt: "2026-03-12", uploadedBy: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 110 },
  { id: "doc-204", childId: "c03", title: "보호자 동의서 — 약물투여", category: "보호자 동의", kind: "file", fileType: "pdf", fileSize: 95_000, issuedAt: "2026-01-10", expiresAt: "2026-07-10", uploadedBy: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 170, tags: ["⚠️ 30일 내 만료"] },

  // ── c13: 한지우 (ADHD) ──
  { id: "doc-301", childId: "c13", title: "ADHD 진단서", category: "개별교육계획(IEP)", kind: "file", fileType: "pdf", fileSize: 520_000, issuedAt: "2024-04-20", expiresAt: "2027-04-20", uploadedBy: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 460, tags: ["IEP"] },
  { id: "doc-302", childId: "c13", title: "개별교육계획서 2026", category: "개별교육계획(IEP)", kind: "file", fileType: "pdf", fileSize: 680_000, issuedAt: "2026-03-01", expiresAt: "2026-12-31", uploadedBy: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120, tags: ["IEP", "⚠️ 검토 필요"] },
];

export const MOCK_TEXT_DOCUMENTS: ChildDocument[] = [
  {
    id: "txt-001", childId: "c01", title: "분노 조절 상담 (6/15)",
    category: "아동상담", kind: "text",
    issuedAt: "2026-06-15",
    content: "<h2>1. 관찰 배경</h2><p>최근 2주간 수업 중 <b>분노 조절 어려움</b>이 관찰됨. 블록놀이 중 친구와 의견 충돌 시 즉시 소리를 지르거나 물건을 던지는 행동이 3회 발생.</p><h2>2. 상담 내용</h2><p>조용한 방에서 1:1로 진행. 아이는 자신의 감정을 <i>'빨개짐'</i>이라고 표현함.</p><h3>감정 카드를 활용한 대안 제안</h3><ul><li>분노 단계에서 '쉬는 카드' 사용</li><li>5분간 별도 공간에서 호흡하기</li><li>함께 그림으로 감정 표현</li></ul><h2>3. 후속 조치</h2><p>주 2회 감정 카드를 활용한 연습 진행 예정. 2주 후 재평가.</p>",
    excerpt: "분노 조절 어려움이 관찰됨. 조용한 방에서 1:1 상담 진행, 감정 카드 활용한 대안 제안...",
    uploadedBy: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 13,
    tags: ["1:1 상담", "감정코칭"],
  },
  {
    id: "txt-002", childId: "c01", title: "학부모 상담 — 가정환경 변화",
    category: "보호자 상담", kind: "text",
    issuedAt: "2026-06-08",
    content: "<h2>참석자</h2><ul><li>김영희 보호자(모)</li><li>박은수 선생님</li></ul><h2>안건</h2><p>최근 아이의 <b>수면 부족</b> 및 아침 등원 거부 증가에 대한 논의.</p><h2>보호자 보고</h2><p>보호자: 한 달 전부터 아버지가 해외 출장 시작, 아이가 잠들기 전까지 안심하지 못함. 새벽 1-2시 수면, 7시 등원 어려움.</p><h2>합의 사항</h2><ol><li>2주간 등원 시간 30분 늦추기 (9:30 →)</li><li>취침 전 루틴 안정화 (20:30 잠자리)</li><li>주 1회 안아주기 시간 (수업 전 5분)</li></ol><p>2주 후 재상담 예정.</p>",
    excerpt: "수면 부족 및 아침 등원 거부 논의. 2주간 등원 시간 늦추기로 합의...",
    uploadedBy: "박은수 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    tags: ["가정환경"],
  },
  {
    id: "txt-003", childId: "c01", title: "관찰일지 — 바깥놀이",
    category: "관찰일지", kind: "text",
    issuedAt: "2026-06-26",
    content: "<h2>장소</h2><p>놀이터, 오후 3시</p><h2>관찰 내용</h2><p>3-4명 조로 축구 게임 진행. <b>김민준</b> 학생은 골키퍼 자원. 첫 10분간 적극 참여, 후반기에 친구들이 승패에 민감해지자 자리를 비움.</p><h2>교사 개입</h2><p>자리 비운 후 화장실 갔다 오라고 자연스럽게 유도. 5분 후 다시 참여. <i>'잠깐 쉬는 거였어요'</i>라고 말함.</p><h2>종합 평가</h2><p>사회성 발달 순항. 승패 스트레스 받는 상황에서의 자기 조절 능력 향상 필요.</p>",
    excerpt: "3-4명 조 축구 게임. 골키퍼 자원, 후반에 자리를 비웠다가 5분 후 복귀...",
    uploadedBy: "김선영 선생님", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    tags: ["바깥놀이"],
  },
];
