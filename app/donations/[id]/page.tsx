/**
 * app/donations/[id]/page.tsx — 후원 상세 (라우트만)
 *
 * Server Component: getDonation(id) → DonationDetailView 위임
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getDonation } from "@/lib/features/donation/data";
import { DonationDetailView } from "./_components/DonationDetailView";

export const dynamic = "force-dynamic";

export default async function DonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const donation = await getDonation(id);

  if (!donation) {
    notFound();
  }

  return (
    <AppShell>
      <Suspense fallback={null}>
        <DonationDetailView donation={donation} />
      </Suspense>
    </AppShell>
  );
}
