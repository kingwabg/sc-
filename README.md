# Officex Care

다우오피스(DaouOffice) 스타일 B2B SaaS 그룹웨어 — 지역아동센터 운영 모듈.
Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## 핵심 기능

- **아동 관리** — 출석/결석/보건휴식 + 일별 돌봄 일지
- **종사자 관리** — 출퇴근 근태 + 직위 분류 (지원교사/사회복지사/조리사 등)
- **운영 일지** — 정부24 양식 기반 일지 작성/통계 (정원/출석/결석/프로그램 15컬럼)
- **전자 결재** — 다우오피스 스타일 결재함 (대기/수신/참조/예약/완료/부서 등)
- **메일** — 받은/보낸/예약/중요 메일함 + 외부 메일 연동 (Google/Naver/Daum/IMAP)
- **내 근태** — 종사자 본인 출퇴근 + 주간 근태 요약
- **홈/일정/게시판/조직도** — 공통 그룹웨어 기능

## 디자인

- **Pretendard** 폰트, Indigo primary (`#4F46E5`), modern/playful 톤
- 반응형: 모바일 (~640) / 태블릿 (~1024) / 데스크탑 (1280+)
- AppShell (좌측 사이드바) + 페이지별 grid 레이아웃

## 실행

Node.js 22.12.0 이상을 사용한다. `nvm`을 쓰는 경우 저장소 루트에서 아래처럼 맞춘다.

```bash
nvm use
npm install
npm run dev          # http://localhost:3000
npm run build        # 프로덕션 빌드
npm run typecheck    # tsc --noEmit
```

## 프로젝트 구조

```
officex-care/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 루트 레이아웃 (Pretendard 폰트)
│   ├── portal/                  # 홈 대시보드
│   ├── children/                # 아동 관리 (목록 + 상세)
│   ├── staff/                   # 종사자 관리
│   ├── daily-log/               # 운영 일지 (목록 + 통계)
│   ├── approval/                # 전자 결재 (홈 + 결재함 + 작성)
│   ├── mail/                    # 메일 (홈 + 외부 연동)
│   ├── my-attendance/           # 내 근태
│   ├── documents/, docs/, ...   # 기타 그룹웨어 페이지
│   └── _components/             # 페이지별 사이드바/모달/테이블
├── components/
│   ├── layout/                  # AppShell, TopHeader, Sidebar
│   └── editor/                  # RichEditor (TipTap)
├── lib/
│   ├── features/                # Feature module (각 도메인별 types/data/utils)
│   ├── store/                   # localStorage 영속화 (settings/children/staff/ui)
│   ├── data/                    # 결재/메일/portal mock 데이터
│   ├── types/                   # 도메인 타입
│   └── staff.ts, children.ts    # 호환성 wrapper
├── AGENTS.md                    # AI agent 개발 가이드
└── scripts/setup-hooks.sh       # git hooks 설치
```

## Feature Module 패턴

각 도메인은 `lib/features/{feature}/` 아래에 모듈화:

```
lib/features/children/
├── types.ts      # 도메인 타입
├── data.ts       # mock 데이터
├── utils.ts      # 헬퍼 (ageFromBirthDate, statusTone 등)
└── index.ts      # barrel export
```

페이지 컴포넌트는 200줄 이하 유지 — 무거우면 `_components/`로 분리.
자세한 규칙은 `AGENTS.md` 참고.

## Git workflow

`.githooks/post-commit` hook이 모든 commit 후 자동으로 `origin main`에 push.

**다른 머신에서 clone 후:**
```bash
sh scripts/setup-hooks.sh    # .githooks 활성화
```

**자동 push 잠시 끄기:**
```bash
OFFICEX_AUTO_PUSH=0 git commit -m "wip"   # 한 번만 끄기
```

## 데이터 영속화

현재 `lib/store/*` 가 `localStorage` 기반 mock. 추후 Supabase 교체 시:

- `lib/store/{feature}.ts` 의 `get*`/`save*` 함수만 실제 API 호출로 교체
- 페이지 컴포넌트는 수정 불필요 (interface 동일)

## 노트

- 다우오피스 보수적 디자인 거부 — modern/playful 톤 유지
- 표 위주 페이지는 viewport 끝까지 폭 활용, 글 위주 페이지는 카드 내부 max-w
- 모든 페이지에서 한국어 UI (영문 브랜드만)
