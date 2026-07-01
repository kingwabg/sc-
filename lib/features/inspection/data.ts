/**
 * lib/features/inspection/data.ts
 *
 * P7 — 디지털 안전점검 데이터 레이어
 * - Server-only (PrismaClient)
 * - getInspectionsByTenant / getInspectionById / createInspection / updateItemResult
 */

import "server-only";
import { db } from "@/lib/db";
import type {
  InspectionVM,
  InspectionItemVM,
  CreateInspectionInput,
  UpdateItemResultInput,
} from "./types";
import {
  INSPECTION_CATEGORY_LABELS,
  INSPECTION_STATUS_LABELS,
  INSPECTION_STATUS_TONE,
} from "./labels";
import type { InspectionResult } from "@prisma/client";

// ─── Assembler ─────────────────────────────────────────

/** DB 행 → InspectionVM (view-model) */
function assembleInspection(row: {
  id: string;
  tenantId: string;
  category: import("@prisma/client").InspectionCategory;
  title: string;
  checkedAt: Date;
  checkedBy: string | null;
  status: import("@prisma/client").InspectionStatus;
  notes: string | null;
  items: {
    id: string;
    label: string;
    result: InspectionResult;
    note: string | null;
    position: number;
  }[];
}): InspectionVM {
  const statusTone = INSPECTION_STATUS_TONE[row.status];
  return {
    id: row.id,
    tenantId: row.tenantId,
    category: row.category,
    categoryLabel: INSPECTION_CATEGORY_LABELS[row.category],
    title: row.title,
    checkedAt: row.checkedAt,
    checkedBy: row.checkedBy,
    status: row.status,
    statusLabel: INSPECTION_STATUS_LABELS[row.status],
    statusTone,
    notes: row.notes,
    items: row.items
      .sort((a, b) => a.position - b.position)
      .map((item): InspectionItemVM => ({
        id: item.id,
        label: item.label,
        result: item.result,
        note: item.note,
        position: item.position,
      })),
  };
}

// ─── Queries ────────────────────────────────────────────

/**
 * 테넌트별 모든 점검 목록 (items 포함, 정렬: 최신순)
 */
export async function getInspectionsByTenant(
  tenantId: string,
): Promise<InspectionVM[]> {
  const rows = await db.inspection.findMany({
    where: { tenantId },
    orderBy: { checkedAt: "desc" },
    include: {
      items: { orderBy: { position: "asc" } },
    },
  });
  return rows.map(assembleInspection);
}

/**
 * 단일 점검 조회 (items 포함)
 */
export async function getInspectionById(
  inspectionId: string,
): Promise<InspectionVM | null> {
  const row = await db.inspection.findUnique({
    where: { id: inspectionId },
    include: {
      items: { orderBy: { position: "asc" } },
    },
  });
  if (!row) return null;
  return assembleInspection(row);
}

/**
 * 신규 점검 생성 + 항목 일괄 생성 (트랜잭션)
 */
export async function createInspection(
  input: CreateInspectionInput,
): Promise<InspectionVM> {
  const row = await db.inspection.create({
    data: {
      tenantId: input.tenantId,
      category: input.category,
      title: input.title,
      checkedBy: input.checkedBy ?? null,
      status: "PENDING",
      items: {
        create: input.items.map((item) => ({
          label: item.label,
          position: item.position,
          result: "PENDING",
        })),
      },
    },
    include: {
      items: { orderBy: { position: "asc" } },
    },
  });
  return assembleInspection(row);
}

/**
 * 항목별 결과 업데이트 + 점검 전체 상태 갱신
 *
  * - 모든 항목이 PASS/NA → InspectionStatus=PASSED
 * -任何一个 FAIL → InspectionStatus=FAILED
 * -그렇지 않으면 PENDING
 */
export async function updateItemResult(
  input: UpdateItemResultInput,
): Promise<void> {
  await db.$transaction(async (tx) => {
    // 1) 항목 result 갱신
    await tx.inspectionItem.update({
      where: { id: input.itemId },
      data: {
        result: input.result,
        note: input.note ?? null,
      },
    });

    // 2) 해당 inspectionId 추출
    const item = await tx.inspectionItem.findUnique({
      where: { id: input.itemId },
      select: { inspectionId: true },
    });
    if (!item) return;

    // 3) 전체 항목 상태 확인 후 Inspection.status 갱신
    const allItems = await tx.inspectionItem.findMany({
      where: { inspectionId: item.inspectionId },
      select: { result: true },
    });

    const hasFail = allItems.some((i) => i.result === "FAIL");
    const allResolved = allItems.every(
      (i) => i.result !== "PENDING",
    );

    let newStatus: import("@prisma/client").InspectionStatus = "PENDING";
    if (allResolved) {
      newStatus = hasFail ? "FAILED" : "PASSED";
    }

    await tx.inspection.update({
      where: { id: item.inspectionId },
      data: { status: newStatus },
    });
  });
}

/**
 * 점검 메모 업데이트
 */
export async function updateInspectionNotes(
  inspectionId: string,
  notes: string | null,
): Promise<void> {
  await db.inspection.update({
    where: { id: inspectionId },
    data: { notes },
  });
}
