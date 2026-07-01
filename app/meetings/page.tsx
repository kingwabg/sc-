/**
 * app/meetings/page.tsx — 회의록 목록 (Server Component)
 *
 * - 3종 회의 (아동자치 / 운영위원회 / 종사자) 탭 전환
 * - listMeetings() → meetings + stats
 * - Client Component에 위임 (탭 인터랙션)
 * - DB 없을 때 MOCK_MEETINGS fallback (페이지 정상 동작)
 */

import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { listMeetings } from "@/lib/features/meeting/data";
import {
  MEETING_PAGE_TITLE,
  MEETING_PAGE_DESC,
  MEETING_PAGE_DESC_GOVERNANCE,
  NEW_BUTTON_LABEL,
} from "@/lib/features/meeting/labels";
import { MeetingsListClient } from "./_components/MeetingsListClient";
import type { Meeting, MeetingStats } from "@/lib/features/meeting/types";

export default async function MeetingsPage() {
  const { meetings, stats } = await listMeetings();

  return (
    <AppShell>
      <Suspense fallback={null}>
        <MeetingsPageBody
          initialMeetings={JSON.parse(JSON.stringify(meetings)) as Meeting[]}
          stats={stats}
        />
      </Suspense>
    </AppShell>
  );
}

function MeetingsPageBody({
  initialMeetings,
  stats,
}: {
  initialMeetings: Meeting[];
  stats: MeetingStats;
}) {
  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                {MEETING_PAGE_TITLE}
              </h1>
              <span className="text-[12px] text-slate-400 tabular-nums">
                {stats.totalCount}건
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-1 m-0">
              {MEETING_PAGE_DESC}
            </p>
            <p className="text-[11px] text-indigo-600 mt-0.5 m-0">
              {MEETING_PAGE_DESC_GOVERNANCE}
            </p>
          </div>
          <Link
            href="/meetings/new"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {NEW_BUTTON_LABEL}
          </Link>
        </div>
      </div>

      <MeetingsListClient initialMeetings={initialMeetings} stats={stats} />
    </div>
  );
}