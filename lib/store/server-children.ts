/**
 * Server-side Children Store (Prisma-backed)
 *
 * 마이그레이션 패턴:
 *   Domain Child (features/children/types.ts)  ⟷  Prisma Child (schema.prisma)
 *
 *   flat scalar nameLast/nameFirst + nested    ⟷  fully denormalized scalars
 *     object guardian / health / etc.
 *
 * 페이지 레벨 가드 패턴은 `canUseDb` 참고.
 */

import { db, isDatabaseReady } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Child } from "@/lib/features/children/types";
import type { Child as PrismaChild } from "@prisma/client";

/**
 * Prisma row → domain Child 타입 매핑
 *
 * Prisma 컬럼                    → Domain 필드
 * ──────────────────────────────────────────────────
 * guardianName/Relation/Type/Phone/Job/Notes  → guardian{}
 * emergencyContactName/Phone                  → emergencyContact{}
 * allergies[]/medications[]/healthNotes       → health{}
 * capacityGroup (Int)                         → capacityGroup (30|40|50)
 * authorId/name                               → writtenBy{}
 * cardMeta/physical/observations             → 별도 1:1 테이블 → 매핑 생략 (optional)
 */
export function mapPrismaChildToDomain(row: PrismaChild): Child {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    nameLast: row.nameLast,
    nameFirst: row.nameFirst,
    birthDate: row.birthDate,
    gender: row.gender,
    phone: row.phone ?? undefined,
    photoUrl: row.photoUrl ?? undefined,
    capacityGroup: row.capacityGroup as 30 | 40 | 50,
    grade: row.grade ?? undefined,
    school: row.school ?? undefined,
    guardian: {
      name: row.guardianName,
      relation: row.guardianRelation,
      type: row.guardianType ?? undefined,
      phone: row.guardianPhone,
      job: row.guardianJob ?? undefined,
      notes: row.guardianNotes ?? undefined,
    },
    emergencyContact:
      row.emergencyContactName && row.emergencyContactPhone
        ? { name: row.emergencyContactName, phone: row.emergencyContactPhone }
        : undefined,
    health: {
      allergies: row.allergies,
      medications: row.medications,
      notes: row.healthNotes,
    },
    enrolledAt: row.enrolledAt,
    previousEnrolledAt: row.previousEnrolledAt ?? undefined,
    leftAt: row.leftAt ?? undefined,
    address: row.address ?? undefined,
    serviceType: row.serviceType ?? undefined,
    medianIncomePct: row.medianIncomePct ?? undefined,
    kidsCallId: row.kidsCallId ?? undefined,
    status: row.status,
    writtenBy:
      row.authorName
        ? { name: row.authorName, org: undefined, position: undefined, writtenAt: undefined }
        : undefined,
  };
}

/**
 * DB 사용 가능 여부 확인
 */
export function canUseDb(): boolean {
  return isDatabaseReady();
}

/**
 * Counts (DB 가용 시에만 사용)
 */
export async function countChildrenByTenant(tenantId: string): Promise<number> {
  if (!canUseDb()) return 0;
  return db.child.count({ where: { tenantId } });
}

/**
 * 페이지를 무효화 (mutate 후 호출)
 */
export function invalidateChildrenPage(): void {
  revalidatePath("/children");
}
