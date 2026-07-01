# Database Migration Guide

`/tmp/sc-` 의 mock localStorage 데이터 → **Supabase Postgres + Prisma** 로 마이그레이션 가이드.

## 현황

| 자원 | 상태 |
|---|---|
| `prisma/schema.prisma` | ✅ 597줄 — 15 enum + 23 model, 모든 도메인 커버 |
| `prisma/seed.ts` | ✅ 329줄 mock seed |
| `prisma generate` | ✅ Client 생성됨 (`@prisma/client` 7.8.0) |
| `lib/db.ts` | ✅ Prisma Client singleton (server-side only) |
| `lib/supabase/{client,server,types}.ts` | ✅ Browser/Server 분기 + env-fallback |
| `@prisma/adapter-pg`, `@prisma/client`, `@supabase/ssr`, `@supabase/supabase-js` | ✅ 설치 완료 |
| `lib/store/server-children.ts` | ✅ 패턴 시연 (toDomain 매퍼 작성 필요) |
| `.env.local` | ❌ **없음** |
| `prisma/migrations/` | ❌ **비어있음** |

## DB 연결 단계 (5분)

### A. Supabase Cloud 무료 프로젝트

1. https://supabase.com → 로그인 → New Project
   - Region: Singapore (가까움) 또는 Northeast Asia
   - Password: 알파벳+숫자 16자
   - Plan: Free (500MB Postgres, 5GB bandwidth)

2. Settings → Database → Connection string (Transaction, port 5432)
   ```
   postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```

3. Settings → API → Project URL + Anon Public Key 복사

### B. .env.local

```bash
cd /tmp/sc-
cp .env.local.example .env.local  # 있으면
# 없으면 그냥 생성
cat > .env.local <<EOF
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EOF
```

### C. 마이그레이션 + Seed

```bash
cd /tmp/sc-
npx prisma db push         # 스키마를 DB에 즉시 반영 (dev 용)
npx prisma db seed         # prisma/seed.ts 의 mock 데이터를 DB로
npx prisma studio          # GUI 로 확인 (브라우저에서)
```

### D. Supabase RLS (multi-tenant 격리)

```sql
-- Supabase SQL Editor 에서 실행
ALTER TABLE "Child" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
-- 모든 tenant-scoped 테이블에 대해 반복

CREATE POLICY "tenant_isolation" ON "Child"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);
```

## 페이지 마이그레이션 패턴

가장 깔끔한 단계별 접근:

### Phase 1: server component + Prisma 직접 호출

```tsx
// app/children/page.tsx (rewrite as server component)
import { db } from "@/lib/db";
import { mapPrismaChildToDomain } from "@/lib/store/server-children";

export default async function ChildrenPage() {
  const rows = await db.child.findMany({ orderBy: { name: "asc" } });
  const children = rows.map(mapPrismaChildToDomain);
  return <ChildrenTable data={children} />;
}
```

- `features/children/_components/ChildrenTable.tsx` 와 domain 타입은 동일 → 무변경
- `lib/store/children.ts` (LS 버전)는 그대로 — 다른 페이지 호환성 유지

### Phase 2: mutations 도 server actions 로

```tsx
// app/children/actions.ts
"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createChildAction(formData: FormData) {
  await db.child.create({ data: parseForm(formData) });
  revalidatePath("/children");
}

// form component
<form action={createChildAction}>
  ...
</form>
```

### Phase 3: features 모듈의 mutation 쪽도 LS → server action

```tsx
// before (client-side)
import { addExtraChild } from "@/lib/store/children";
addExtraChild(newChild);

// after (server action)
import { createChildAction } from "@/app/children/actions";
formData = toFormData(newChild);
await createChildAction(formData);
```

## 모듈별 마이그레이션 우선순위

| 모듈 | 크기 | 의존성 | 가치 |
|---|---|---|---|
| **children** | Large (10+ UI 페이지) | 핵심 도메인 | ★★★★★ |
| **staff / volunteer** | Medium | 비슷 패턴 | ★★★★ |
| **attendance** | Heavy (월별 그리드) | children FK | ★★★★ |
| **settings** | Small | tenant-scoped | ★★★ |
| **approval** | Large | multi-tenant 보안 | ★★★★★ |
| **documents** | Medium | child+staff | ★★★ |
| **annual / monthly / daily plans** | Medium | tenant+programs | ★★★ |

## 빠른 시작 (URL 있으면)

```bash
cd /tmp/sc-

# 1. env 채움 (위 2단계)
cp .env.local.example .env.local && vi .env.local

# 2. 스키마 + 데이터 한 번에
npx prisma db push
npx prisma db seed

# 3. dev server에서 pgAdmin 또는 Studio 로 확인
npx prisma studio   # http://localhost:5555/

# 4. 페이지 전환 — app/children/page.tsx 를 server component 로 rewrite (위 Phase 1 예시)
```

## 주의 — store 변경 시 호환성 깨지지 않게

- 현재 `lib/store/{children,staff,settings}.ts` 의 LS 버전은 변경 안 함
- `lib/store/server-{domain}.ts` 시리즈 새 파일로 Prisma 버전 추가
- `lib/store/index.ts` 의 facade 는 그대로 — caller 무영향
- 각 page.tsx 를 server component 로 점진적 전환

## 실시간 데이터 흐름

```
[브라우저]
   fetch from app/api/...

[Next.js server]
   ├── server component → lib/db (Prisma)
   └── server actions → lib/db (Prisma)

[Prisma → Postgres (Supabase)]
   db.child.findMany() ...

[RLS]
   tenant 격리 자동 강제
```

LS 는 임시 fallback 으로만 사용 — 운영에선 RLS 가 모든 격리 보장.
