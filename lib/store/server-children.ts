/**
 * Server-side Children Store (Prisma-backed) — 마이그레이션 패턴
 *
 * ⚠️ 이 모듈은 시연용. 실제 마이그레이션 시 도메인 `Child` ↔ Prisma `Child` 정렬 작업 필요:
 *
 *   Domain Child (features/children/types.ts)  ⟷  Prisma Child (schema.prisma)
 *   ─────────────────────────────────────────────────────────────────────
 *   flat scalar nameLast/nameFirst + nested    ⟷  fully denormalized scalars
 *     object guardian / health / etc.
 *
 *   통합 매퍼 필요:
 *     toDomainChild(prismaRow): Child
 *     toPrismaChildInput(child): Prisma.ChildUncheckedCreateInput
 *
 * 페이지 레벨 가드 패턴은 아래의 `canUseDb` 참고.
 */

import { db, isDatabaseReady } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * 페이지 가드. 호출 예:
 *
 *   // app/children/page.tsx (server component)
 *   export default async function Page() {
 *     if (await canUseDb()) {
 *       const children = await db.child.findMany();
 *       return <ChildrenList children={mapToDomain(children)} />;
 *     }
 *     return <ChildrenClientMOCK />;  // current behavior
 *   }
 *
 * 이 패턴의 장점: features/* 무변경, 페이지에서 분기 1번.
 */
export async function canUseDb(): Promise<boolean> {
  return isDatabaseReady();
}

/**
 * Prisma row → domain Child 매핑 (현재는 placeholder — 실제 필드 alignment 필요)
 *
 * 실제 구현 시:
 *  1) features/children/types.ts 의 Child 필드 목록 추출
 *  2) 각 필드에 대응되는 Prisma 컬럼 매핑
 *  3) nested objects (guardian, health) 는 Prisma 의 denormalized columns 에서 합성
 *
 * TODO: 완성 후 export
 */
// export function mapPrismaChildToDomain(row: PrismaChild): Child { ... }

/**
 * Counts (DB 가용 시에만 사용)
 */
export async function countChildrenByTenant(tenantId: string): Promise<number> {
  if (!isDatabaseReady()) return 0;
  return db.child.count({ where: { tenantId } });
}

/**
 * 페이지를 무효화 (mutate 후 호출)
 */
export function invalidateChildrenPage(): void {
  revalidatePath("/children");
}
