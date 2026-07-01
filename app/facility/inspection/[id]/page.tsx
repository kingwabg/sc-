/**
 * app/facility/inspection/[id]/page.tsx
 *
 * P7 — 점검 체크리스트 상세 페이지 (Server Component)
 * - inspection 조회 → InspectionChecklistClient 전달
 */

import { AppShell } from "@/components/layout/AppShell";
import { notFound } from "next/navigation";
import { getInspectionById } from "@/lib/features/inspection";
import { InspectionChecklistClient } from "../_components/InspectionChecklistClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InspectionDetailPage({ params }: Props) {
  const { id } = await params;
  const inspection = await getInspectionById(id);

  if (!inspection) {
    notFound();
  }

  return (
    <AppShell>
      <InspectionChecklistClient inspection={inspection} />
    </AppShell>
  );
}
