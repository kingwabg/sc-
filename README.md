# Office Portal

다우오피스(DaouOffice) 홈 대시보드 클론. Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## 구조

```
office-portal/
├── app/
│   ├── layout.tsx            # 루트 레이아웃 (Pretendard 폰트, html lang)
│   ├── globals.css           # Tailwind base + 디자인 토큰
│   ├── page.tsx              # /         — 홈 대시보드
│   └── servicemap/
│       └── page.tsx          # /servicemap — 서비스 카탈로그
├── components/
│   ├── layout/               # TopHeader, Sidebar, AppShell (공용 셸)
│   ├── dashboard/            # Greeting, StatStrip, 카드 6종, Card 래퍼
│   └── service/              # ServiceGrid, ServiceTile, ServiceAside
├── lib/
│   ├── data/                 # mock 데이터 (메일, 결재, 일정, 공지, 팀, 게시글, 서비스)
│   └── format-date.ts        # 한국식 날짜 포매터
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── postcss.config.mjs
```

## 실행

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버
npm run typecheck    # tsc --noEmit
```

## 노트

- `/workspace/officex` (port 3000) 가 이미 돌고 있어 데모는 `PORT=3001 npm run start` 로 띄웠음
- 브랜드 `Office` 만 영어, 그 외 UI 한국어
- `lib/data/*` 만 바꾸면 실제 API 붙일 때 그대로 매핑 가능
- `lucide-react` 사용 — 아이콘 추가/교체 시 `services.ts` 에서 한 줄만 바꾸면 됨
- 인터랙티브 컴포넌트(`InboxCard`, `Sidebar`, `ServiceGrid`) 만 `"use client"`, 나머지는 RSC
