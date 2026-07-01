/**
 * app/donations/page.tsx — 후원금/물품 대장 목록
 *
 * Server Component
 *  - listDonations() → donations + stats
 *  - <DonationsListClient> Client Component에 위임 (필터/검색/표시옵션 인터랙션)
 *  - DB 없을 때 MOCK_DONATIONS fallback (페이지 정상 동작)
 */

import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { listDonations } from "@/lib/features/donation/data";
import {
  DONATION_PAGE_TITLE,
  DONATION_PAGE_DESC,
} from "@/lib/features/donation/labels";
import { DonationsListClient } from "./_components/DonationsListClient";
import type { Donation, DonationStats } from "@/lib/features/donation/types";

export default async function DonationsPage() {
  // tenantId는 data.ts 내부에서 DEFAULT_TENANT 사용
  const { donations, stats } = await listDonations();

  return (
    <AppShell>
      <Suspense fallback={null}>
        <DonationsPageBody
          initialDonations={JSON.parse(JSON.stringify(donations)) as Donation[]}
          stats={stats}
        />
      </Suspense>
    </AppShell>
  );
}

function DonationsPageBody({
  initialDonations,
  stats,
}: {
  initialDonations: Donation[];
  stats: DonationStats;
}) {
  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                {DONATION_PAGE_TITLE}
              </h1>
              <span className="text-[12px] text-slate-400 tabular-nums">
                {stats.totalCount}건
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-1 m-0">
              {DONATION_PAGE_DESC}
            </p>
          </div>
          <Link
            href="/donations/new"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            신규 후원 등록
          </Link>
        </div>
      </div>

      <DonationsListClient initialDonations={initialDonations} stats={stats} />
    </div>
  );
}
