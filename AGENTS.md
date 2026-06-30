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
- `lib/` root에 feature-specific 파일 배치 (types.ts, data.ts 등)
- 도메인 UI에 `RSuite Table` / `dnd-kit` 직접 import — **셸 사용** (1.6 참조)

### 1.2 page.tsx의 역할

page.tsx는 **오직** 아래만 담당:
1. `AppShell`로 감싸기
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

### 1.6 공통 셸 (도메인 무관) — 반드시 사용

데이터 테이블 / 그룹 사이드바는 도메인마다 새로 만들지 말고 다음 두 셸을 사용한다.

#### `components/ui/ResourceTable<T>` — RSuite Table 래퍼

페이지네이션, 펼침, density, 기본 하단 바가 캡슐화된 제네릭 셸.
도메인은 `columns` + `renderExpanded`만 주입.

```tsx
import { ResourceTable, type ColumnDef } from "@/components/ui/ResourceTable";

type StaffRow = { id: string; name: string; /* ... */ };

const columns: ColumnDef<StaffRow>[] = [
  { key: "name", header: "이름", flexGrow: 2, cell: (row) => <NameCell row={row} /> },
  // ...
];

<ResourceTable
  data={rows}
  rowKey={(r) => r.id}
  options={tableOptions}
  columns={columns}
  renderExpanded={(row) => <StaffExpandedPanel row={row} />}
/>
```

**ColumnDef.cell 시그니처**:
```ts
cell: (row: T, helpers: {
  isExpanded: boolean;
  toggleExpand: () => void;
  density: TableDensity;
}) => React.ReactNode
```

**bottomBar 슬롯** — 기본 카운트+페이지네이션 외 다른 UI가 필요하면 override.

#### `components/templates/tree-resource-shell/TreeResourceShell` — dnd-kit 그룹 사이드바

계층형 그룹 CRUD + DnD + portal 호버 액션. 도메인은 `groups`만 주입.

```tsx
import { TreeResourceShell, type TreeShellGroup } from "@/components/templates/tree-resource-shell/TreeResourceShell";

const groups: TreeShellGroup[] = [
  { id: "all", label: "전체", parentId: null, order: 0, meta: { isSystem: true } },
  { id: "g_관리", label: "관리", parentId: null, order: 1 },
  // ...
];

<TreeResourceShell
  groups={groups}
  selectedId={selectedId}
  counts={counts}
  title="도메인 이름"
  headerIcon={<Icon />}
  totalLabel="총 인원"
  onSelect={(id) => { /* 도메인 ID → 도메인 상태로 매핑 */ }}
  onAdd={onAddGroup}             // 선택 — 미지정 시 추가 버튼 비활성
  onUpdate={onUpdateGroup}       // 선택
  onDelete={onDeleteGroup}       // 선택 — { ok, reason? } 반환
  onMove={onMoveGroup}           // 선택 — { ok, reason? } 반환
  onOpenOptions={onOpen}         // 선택 — 호버 시 필터 아이콘 노출
  showRootAdd={true}             // 최상위 추가 버튼 (default true)
  headerAction={<PlusButton />}  // 헤더 우측 커스텀 액션
  addRootLabel="폴더 추가"       // 기본 라벨
  confirmDelete={(g) => confirm(`"${g.label}" 삭제?`)}
/>
```

**시스템 노드** (`meta.isSystem: true`): "all" 같은 자동 노드. CRUD/드래그 불가, 펼침 토글만.

**그룹 노드 클릭 처리** — `onSelect`에서 페이지 상태 변경 안 함 (카테고리 표기용). 실제 데이터 필터는 자식 노드에서.

---

## 2. 기존 파일 리팩토링 우선순위

### P1 (권장 — 셸 적용으로 더 깔끔)
| 파일 | 현재 줄 수 | 비고 |
|------|-----------|------|
| `app/attendance/members/page.tsx` | 369줄 | 인라인 테이블 2개 → ResourceTable로 교체 |
| `app/my-attendance/page.tsx` | 확인 후 | 위 패턴 적용 |
| `app/board/page.tsx` | 19줄 (Placeholder) | 셸 적용 불가 (구현 전) |

### P2 (나중에)
- `lib/children.ts` → `lib/features/children/mock.ts`로 이동 + 리명명
- `lib/tenant-store.ts` → `lib/store/index.ts` 완전 통합
- `lib/volunteer.ts` → `lib/features/volunteer/`로 이동
- `lib/staff.ts` → `lib/features/staff/`로 이동

### 완료된 리팩토링 (2026-06-30)
- `app/children/page.tsx` — 965 → 413줄, _components/ 4개 추출
- `app/staff/page.tsx` — 283 → 221줄, _components/ 2개 추출
- `app/children/_components/ChildrenSidebar.tsx` — 567 → 70줄 (TreeResourceShell 어댑터)
- `app/staff/_components/StaffSidebar.tsx` — flat → 트리 (관리/교육/운영/기타)
- `app/volunteers/` — 셸 패턴 풀스택 신규 (sidebar + table + modal + page)
- `components/ui/ResourceTable.tsx` — 신규
- `components/templates/tree-resource-shell/TreeResourceShell.tsx` — 신규
- `components/ui/TableOptionsDrawer.tsx` — UX 개선 (프리셋 + 평이화 + 2-tier)

---

## 3. 새 기능 추가 절차

**절대 순서:**

```
1. lib/features/{feature}/types.ts     ← 타입 정의 먼저
2. lib/features/{feature}/data.ts      ← mock 데이터
3. lib/features/{feature}/store.ts     ← localStorage 로직
4. lib/features/{feature}/api.ts       ← API 호출 (추후)
5. lib/features/{feature}/utils.ts     ← 헬퍼 함수
6. app/{feature}/_components/          ← UI 컴포넌트 (셸 사용!)
   ├── FeatureSidebar.tsx (TreeResourceShell 어댑터)
   ├── FeatureTable.tsx   (ResourceTable 어댑터)
   ├── FeaturePageHeader.tsx
   ├── FeatureListToolbar.tsx
   └── FeatureModal.tsx
7. app/{feature}/page.tsx              ← page.tsx (셸 조립)
```

**page.tsx가 200줄 넘으면 → 즉시 `_components/` 분할.**

**셸 사용 결정**:
- 데이터 테이블 패턴 → `ResourceTable`
- 그룹/계층형 사이드바 → `TreeResourceShell`
- 둘 다 해당 없으면 → 자체 구현 (예: daily-log, board)

---

## 4. 현재 라이브러리 현황

### ✅ 잘 정리된 것
- `lib/store/_ls.ts` — SSR-safe localStorage helper
- `lib/store/settings.ts` — tenant 설정
- `lib/store/ui.ts` — sidebar / favorites / badge
- `lib/store/staff.ts` — staff/volunteer attendance
- `lib/store/children.ts` — children extra/groups/attendance
- `lib/types/approval.ts` — 결재 타입
- `lib/types/mail.ts` — 메일 타입
- `lib/features/children/` — Feature module 정착
- `lib/features/staff/export.ts` — CSV 내보내기
- `app/approval/_components/` — 결재 sidebar/form 분리
- `app/mail/_components/` — 메일 sidebar/modal 분리
- `app/children/_components/` — PageHeader/Toolbar/Table/Sidebar 분리
- `app/staff/_components/` — PageHeader/Toolbar/Table/Sidebar 분리
- `app/volunteers/_components/` — Sidebar/Table/Modal 분리
- `components/ui/ResourceTable.tsx` — 공통 테이블 셸
- `components/templates/tree-resource-shell/TreeResourceShell.tsx` — 공통 사이드바 셸
- `components/ui/TableOptionsDrawer.tsx` — UX 개선 (프리셋/평이화/2-tier)

### ⚠️ 리팩토링 필요
- `app/attendance/members/page.tsx` — 인라인 테이블 2개 (ResourceTable 교체 검토)
- `app/my-attendance/page.tsx` — 확인 필요
- `lib/children.ts` — root level, feature module로 이동 필요
- `lib/tenant-store.ts` — legacy alias, lib/store/index.ts로 완전 이전 필요
- `lib/tenant-store-types.ts` — legacy, 통합 필요

### ❌ 제거 대상
- `lib/attendance.ts` — 사용처 확인 후 `lib/features/`로 이동 또는 삭제
- `lib/child-documents.ts` — 사용처 확인

---

## 5. 현재 Dev Server 상태

- URL: `http://localhost:3001` (3000은 다른 next-server 점유)
- 상태: ✅ 실행 중
- 주의: `next build` 후 `rm -rf .next` + dev 재시작 필수 (청크 404 버그)

---

## 6. Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Pretendard font
- **State**: localStorage via `lib/store/_ls.ts` (추후 Supabase)
- **Table**: RSuite Table — `components/ui/ResourceTable.tsx` 래퍼 사용
- **Drag & Drop**: @dnd-kit/core — `components/templates/tree-resource-shell/` 셸 사용
- **Editor**: TipTap (`@tiptap/react`) in `components/editor/RichEditor.tsx`
- **Icons**: Lucide React
- **Package Manager**: npm (pnpm은 sharp 빌드 이슈 있음)

---

## 7. 라우트 맵

```
/ (Home/Dashboard)
/login, /signup, /demo-auth
/my-attendance        ← 근태 打卡 (member)
/attendance           ← 근태 home
/attendance/members   ← 전체 출결 (admin)
/approval             ← 결재 home
/approval/new         ← 새 결재 작성
/approval/{folder}    ← 결재함별 (pending/received/cc/scheduled/period/draft/search/approved/dept)
/mail                 ← 메일 home
/mail/connect         ← 외부 메일 연동
/children             ← 아동 목록 (셸 적용 완료)
/children/[id]        ← 아동 상세
/children/attendance  ← 아동 출결
/documents            ← 문서 관리
/daily-log            ← 일지 (자체 패턴, 셸 미적용)
/board                ← 게시판 (Placeholder, 미구현)
/calendar             ← 일정
/monthly-plan         ← 월계획
/org                  ← 조직도
/staff                ← 직원 (셸 적용 완료)
/volunteers           ← 비종사자 (셸 적용 완료)
/servicemap           ← 서비스맵
/settings             ← 설정
```

---

## 8. 파일별 현재 상태 요약

| 경로 | 상태 | 설명 |
|------|------|------|
| `app/children/page.tsx` | 🟢 OK | 413줄, _components/ 분리 완료 (200줄 룰 미달이지만 책임 분리 OK) |
| `app/children/[id]/page.tsx` | 🟡 P2 | _components/ 일부 분리, 추가 정리 여지 |
| `app/children/_components/` | 🟢 OK | Sidebar/Table/Header/Toolbar/StatusCount/StatusFilter 분리 |
| `app/staff/page.tsx` | 🟢 OK | 221줄, _components/ 분리 완료 |
| `app/staff/_components/` | 🟢 OK | Sidebar/Table/Header/Toolbar 분리 |
| `app/volunteers/page.tsx` | 🟢 OK | 셸 풀스택 신규 |
| `app/volunteers/_components/` | 🟢 OK | Sidebar/Table/Modal 분리 |
| `app/attendance/members/page.tsx` | 🟡 P1 | 369줄, 인라인 테이블 2개 — ResourceTable 적용 검토 |
| `app/approval/page.tsx` | 🟡 P1 | 149줄, _components/ 분리 양호 |
| `lib/children.ts` | 🟡 P2 | root level, feature module로 이동 |
| `lib/staff.ts` | 🟡 P2 | root level, feature module로 이동 |
| `lib/volunteer.ts` | 🟡 P2 | root level, feature module로 이동 |
| `lib/tenant-store.ts` | 🟡 P2 | legacy alias, lib/store/index.ts 통합 |
| `components/editor/RichEditor.tsx` | 🟢 OK | 공유 에디터, 문제 없음 |
| `components/ui/ResourceTable.tsx` | 🟢 OK | 공통 셸 |
| `components/templates/tree-resource-shell/TreeResourceShell.tsx` | 🟢 OK | 공통 셸 |
| `components/ui/TableOptionsDrawer.tsx` | 🟢 OK | UX 개선 완료 |
| `lib/store/` | 🟢 OK | 모듈화 잘 되어 있음 |
| `lib/types/` | 🟢 OK | 도메인별 분리 양호 |
| `lib/features/` | 🟢 OK | children, staff 정착 |

---

## 9. 셸 사용 예시 (참고용)

### 자원봉사자 페이지 (셸 풀스택 예시)

`app/volunteers/page.tsx`:
```tsx
import { VolunteersSidebar } from "./_components/VolunteersSidebar"; // TreeResourceShell 어댑터
import { VolunteersTable } from "./_components/VolunteersTable";     // ResourceTable 어댑터
import { AddVolunteerModal } from "./_components/AddVolunteerModal";

export default function VolunteersPage() {
  return (
    <AppShell>
      <Suspense fallback={null}><VolunteersBody /></Suspense>
    </AppShell>
  );
}

function VolunteersBody() {
  // state, derived, handlers만
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">
        <VolunteersSidebar selectedType={typeFilter} counts={typeCounts}
          onSelect={setTypeFilter} onAdd={() => setShowAddModal(true)} />
        <div className="min-w-0 space-y-3">
          <PageHeader ... />
          <ListToolbar ... />
          <VolunteersTable volunteers={filtered} options={tableOptions} />
        </div>
      </div>
      {showAddModal && <AddVolunteerModal ... />}
    </>
  );
}
```

### 새 도메인 추가 시 (체크리스트)

- [ ] `lib/features/{name}/types.ts` — 타입
- [ ] `lib/features/{name}/data.ts` — mock
- [ ] `app/{name}/_components/{Name}Sidebar.tsx` — TreeResourceShell 어댑터
- [ ] `app/{name}/_components/{Name}Table.tsx` — ResourceTable 어댑터
- [ ] `app/{name}/_components/{Name}PageHeader.tsx`
- [ ] `app/{name}/_components/{Name}ListToolbar.tsx`
- [ ] `app/{name}/_components/{Name}Modal.tsx` (필요 시)
- [ ] `app/{name}/page.tsx` — 조립만
- [ ] typecheck + dev 서버 검증

---

## 10. 커밋 컨벤션

```
type(scope): 한국어/영어 요약

- 변경점 1
- 변경점 2
- 변경점 3

Net change: X added / Y deleted across N files.
```

**타입**: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`
**scope**: 도메인 또는 영역 (`children`, `staff`, `ui`, `volunteers`)

`.githooks/post-commit`이 자동으로 `origin main`에 push.
- 끄기 (한 번): `OFFICEX_AUTO_PUSH=0 git commit -m "..."`
- 끄기 (영구): `chmod -x .githooks/post-commit`
