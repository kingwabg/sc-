# AGENTS.md — Officex-Care Architecture

> 새 기능을 만들거나 기존 파일을 수정할 때 반드시 이 문서를 읽고 진행한다.

---

## 1. 설계 원칙

### 1.1 핵심 규칙: Feature Module 분리

**모든 도메인(approval, mail, children 등)은 독립된 모듈이야.**

```
lib/features/{feature}/
├── types.ts        ← 이 도메인 전용 TypeScript 타입
├── data.ts         ← mock 데이터
├── store.ts        ← localStorage 읽기/쓰기 (서버 컴포넌에서 절대 import 금지)
├── api.ts          ← Supabase/API 호출 (추후)
└── utils.ts        ← 이 도메인 전용 헬퍼 함수

app/{feature}/
├── page.tsx              ← page.tsx: 최소한의 라우팅 + 상태만
├── _components/          ← 이 페이지 전용 UI (export 안 됨)
│   ├── FeatureSidebar.tsx
│   ├── FeatureList.tsx
│   └── FeatureModal.tsx
└── [sub]/page.tsx
```

**절대 하지 말 것:**
- page.tsx에 200줄 이상 작성 금지 (200줄 넘으면 강제 분리)
- 타입 / mock 데이터 / store 로직을 page.tsx 안에 직접 정의 금지
- `lib/` root에 feature-specific 파일放量 (types.ts, data.ts 등)

### 1.2 page.tsx의 역할

page.tsx는 **오직** 아래만负责:
1. `AppShell`으로 감싸기
2. `useState` / `useEffect` — hydration-safe localStorage 읽기
3. event handler 정의 (`router.push`, `store.save()` 등)
4. 자식 컴포넌트 조립 (inline JSX는 테이블 한 줄 정도 수준만)

**그 외 모든 것은 `_components/` 또는 `lib/features/`로 분리.**

### 1.3 이름 규칙

| 파일/함수 | 네이밍 | 예시 |
|-----------|--------|------|
| page.tsx 내 하위 컴포넌트 | `PascalCase` + `function` 키워드 | `function ApprovalDocTable(...)` |
| `_components/` 내 파일 | `PascalCase.tsx` | `ApprovalSidebar.tsx` |
| store 읽기 함수 | `get` + 名詞 | `getAttendanceOverrides()` |
| store 쓰기 함수 | `set` + 名詞 | `setAttendanceOverride()` |
| localStorage 키 | `ox:{domain}-{name}` | `ox:children-extra` |
| API 함수 | `fetch` + 名詞 / `save` + 名詞 | `fetchApprovalDocs()` |

### 1.4 lib/features/{feature}/store.ts 규칙

```ts
// lib/features/{feature}/store.ts

// ✅ localStorage 키는 module-level 상수
const STORAGE_KEY = "ox:{feature}-{name}";

// ✅ 읽기: SSR-safe (typeof window 체크)
export function get...(): T {
  if (typeof window === "undefined") return defaultValue;
  return readLS<T>(STORAGE_KEY, defaultValue);
}

// ✅ 쓰기
export function set...(data: T): void {
  writeLS(STORAGE_KEY, data);
}

// ❌ 절대 server component에서 import하지 말 것
// ❌ page.tsx에서 직접 localStorage read/write 금지
```

### 1.5 hydration-safe localStorage

`lib/store/_ls.ts`의 `readLS` / `writeLS`를 반드시 사용. 직접 `localStorage.getItem` 금지.

---

## 2. 기존 파일 리팩토링 우선순위

### P0 (즉시 분리 — 혼자 만들면 깨짐)
| 파일 | 현재 줄 수 | 분할 방법 |
|------|-----------|-----------|
| `app/children/page.tsx` | **965줄** | `lib/features/children/types.ts` + `data.ts` + `store.ts` + `_components/ChildrenTable.tsx` + `_components/AddChildModal.tsx` |
| `app/children/[id]/page.tsx` | **~700줄** | `lib/features/children-detail/types.ts` + `store.ts` + `_components/ChildProfile.tsx` + `_components/ChildHealthCard.tsx` + `_components/CareLogSection.tsx` |

### P1 (권장 — 유지보수성)
| 파일 | 현재 줄 수 | 분할 방법 |
|------|-----------|-----------|
| `app/daily-log/page.tsx` | 확인 후 결정 | 위 패턴 적용 |
| `app/my-attendance/page.tsx` | 확인 후 결정 | 위 패턴 적용 |

### P2 (나중에)
- `lib/children.ts` → `lib/features/children/mock.ts`로 이동 + 리명명
- `lib/tenant-store.ts` → `lib/store/index.ts` 완전 통합

---

## 3. 새 기능 추가 절차

**절대 순서:**

```
1. lib/features/{feature}/types.ts     ← 타입 정의 먼저
2. lib/features/{feature}/data.ts      ← mock 데이터
3. lib/features/{feature}/store.ts      ← localStorage 로직
4. lib/features/{feature}/api.ts        ← API 호출 (추후)
5. lib/features/{feature}/utils.ts      ← 헬퍼 함수
6. app/{feature}/_components/           ← UI 컴포넌트
7. app/{feature}/page.tsx              ← page.tsx (최종 조립)
```

**page.tsx가 200줄 넘으면 → 즉시 `_components/` 분할.**

---

## 4. 현재 라이브러리 현황

### ✅ 잘 정리된 것
- `lib/store/_ls.ts` — SSR-safe localStorage helper
- `lib/store/settings.ts` — tenant 설정
- `lib/store/ui.ts` — sidebar / favorites / badge
- `lib/store/staff.ts` — staff/volunteer attendance
- `lib/types/approval.ts` — 결재 타입
- `lib/types/mail.ts` — 메일 타입
- `lib/data/approvals.ts` — 결재 mock
- `lib/data/mail-detail.ts` — 메일 mock
- `lib/data/portal-mail.ts` — 포탈 inbox mock
- `app/approval/_components/` — 결재 sidebar/form 분리
- `app/mail/_components/` — 메일 sidebar/modal 분리

### ⚠️ 리팩토링 필요
- `app/children/page.tsx` — 965줄, 모든 게 한 파일
- `app/children/[id]/page.tsx` — ~700줄
- `lib/children.ts` — root level, feature module로 이동 필요
- `lib/tenant-store.ts` — legacy alias, lib/store/index.ts로 완전 이전 필요
- `lib/tenant-store-types.ts` — legacy, 통합 필요
- `lib/children.ts` 내 `MOCK_CHILDREN`, `MOCK_ATTENDANCES` → `lib/features/children/data.ts`로 이동

### ❌ 제거 대상
- `lib/attendance.ts` — 사용처 확인 후 `lib/features/`로 이동 또는 삭제
- `lib/child-documents.ts` — 사용처 확인
- `lib/volunteer.ts` — 사용처 확인

---

## 5. 현재 Dev Server 상태

- URL: `http://localhost:3000`
- 상태: ✅ 실행 중
- 주의: `next build` 후 `rm -rf .next` + dev 재시작 필수 (청크 404 버그)

---

## 6. Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Pretendard font
- **State**: localStorage via `lib/store/_ls.ts` (추후 Supabase)
- **Editor**: TipTap (`@tiptap/react`) in `components/editor/RichEditor.tsx`
- **Icons**: Lucide React
- **Package Manager**: npm (pnpm은 sharp 빌드 이슈 있음)

---

## 7. 라우트 맵

```
/ (Home/Dashboard)
/login, /signup, /demo-auth
/my-attendance        ← 근태打卡 (member)
/attendance           ← 근태 home
/attendance/members   ← 전체 출결 (admin)
/approval             ← 결재 home
/approval/new         ← 새 결재 작성
/approval/{folder}    ← 결재함별 (pending/received/cc/scheduled/period/draft/search/approved/dept)
/mail                 ← 메일 home
/mail/connect         ← 외부 메일 연동
/children             ← 아동 목록 (P0 refactor)
/children/[id]        ← 아동 상세 (P0 refactor)
/children/attendance  ← 아동 출결
/documents            ← 문서 관리
/daily-log            ← 일지
/board                ← 게시판
/calendar             ← 일정
/monthly-plan         ← 월계획
/org                  ← 조직도
/staff                ← 직원
/volunteers           ←志愿者
/servicemap           ← 서비스맵
/settings             ← 설정
```

---

## 8. 파일별 현재 상태 요약

| 경로 | 상태 | 설명 |
|------|------|------|
| `app/children/page.tsx` | 🔴 P0 | 965줄, 전부 한 파일. 타입/data/store 분리 필요 |
| `app/children/[id]/page.tsx` | 🔴 P0 | ~700줄, 동일 문제 |
| `app/approval/page.tsx` | 🟡 P1 | 149줄, 분리 양호하지만 `ApprovalDocTable`도 _components로 분리 권장 |
| `app/approval/_components/NewApprovalForm.tsx` | 🟡 P1 | TipTap 에디터 포함, 커지면 분리 검토 |
| `lib/children.ts` | 🟡 P1 | root level, feature module로 이동 |
| `lib/tenant-store.ts` | 🟡 P1 | legacy alias, 완전 제거 및 lib/store/index.ts 통합 |
| `components/editor/RichEditor.tsx` | 🟢 OK | 공유 에디터, 문제 없음 |
| `lib/store/` | 🟢 OK | 모듈화 잘 되어 있음 |
| `lib/types/` | 🟢 OK | 도메인별 분리 양호 |
| `lib/data/` | 🟢 OK | 도메인별 분리 양호 |
