# Office Portal — Database Layer

이 폴더는 office portal의 **Supabase / Postgres 데이터베이스 정의**를 포함합니다.

## 구성

```
prisma/
├── schema.prisma    # Prisma schema (10개 domain, 27개 모델)
├── seed.ts          # Mock 데이터 이관 스크립트
prisma.config.ts     # Prisma 7+ config (DATABASE_URL 위치)
docs/db/
└── erd.md           # Mermaid ERD 다이어그램
```

## 모델 그룹 (27개)

| Group | 모델 | 비고 |
|---|---|---|
| Tenant | `Tenant`, `User` | 멀티테넌트 루트 |
| Child | `Child`, `ChildCardMeta`, `ChildPhysical`, `ChildObservations`, `Attendance`, `CareLog`, `ChildDocument` | 아동 + PDF 카드 + 출석 + 돌봄일지 |
| Staff | `Staff`, `StaffAttendance` | 종사자 + 근태 |
| Volunteer | `Volunteer`, `VolunteerAttendance` | 봉사자 + 등원 |
| Member | `Member` | 조합원 |
| Doc | `Doc`, `DocumentIndex` | HTML/HWP + 통합 인덱스 |
| Approval | `ApprovalRequest`, `ApprovalStep` | 결재함 |
| Plan | `AnnualPlan`, `Program`, `MonthlyPlan`, `WeeklyGoal`, `DailyLog` | 운영 계획 |

## 데이터 속성

- **String[]/Json**: Postgres-native 사용. SQLite 미지원
- **Date**: `String` (YYYY-MM-DD) — 기존 mock 데이터 호환
- **DateTime**: `DateTime` (Prisma/Postgres 표준)
- **ID**: `@default(cuid())` (Prisma 7 표준)
- **FK onDelete**: Cascade (Tenant 삭제 시 연쇄 정리)
- **Unique 제약**: `(childId, date)` for Attendance 등

## 다음 단계 (Supabase 붙이기)

### 1) Supabase 프로젝트 생성

- https://supabase.com → New project
- Project URL과 database password 저장

### 2) DATABASE_URL 설정

`.env.local`에 추가:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
```

### 3) Prisma 마이그레이션

```bash
npx prisma migrate dev --name init
```

### 4) Mock 데이터 시드

```bash
npx prisma db seed
```

### 5) Prisma Client 생성 (이미 완료됨)

```bash
npx prisma generate
```

### 6) DB GUI로 검증

```bash
npx prisma studio
```

→ `http://localhost:5555` 에서 모든 테이블 확인.

## Prisma 7 주의사항

- `datasource.url` 은 `prisma.config.ts` 또는 환경변수 `DATABASE_URL` 사용 (schema 에서 deprecated)
- PrismaClient 직접 연결 시 `@prisma/adapter-pg` 같은 adapter 사용 권장
- 현재 schema는 v7.8.0 기준

## 사용 가능한 npm scripts

```bash
npm run db:generate   # Prisma Client 생성
npm run db:migrate    # schema → DB 마이그레이션
npm run db:seed       # Mock 데이터 시드
npm run db:studio     # DB GUI
npm run db:format     # schema 자동 정렬
```

## 임포트 예시 (Prisma 7)

```ts
// lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// 사용
import { prisma } from "@/lib/db/prisma";
const children = await prisma.child.findMany();
```
