/**
 * app/meetings/[id]/page.tsx — 회의록 상세
 *
 * Server Component
 *  - getMeeting(id) → Meeting
 *  - 클라이언트 컴포넌트에 위임 (보기/수정 토글)
 *  - 미존재 시 notFound
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getMeeting } from "@/lib/features/meeting/data";
import { MeetingDetail } from "./_components/MeetingDetail";
import {
  MEETING_PAGE_TITLE,
  MEETING_TYPE_LABEL,
} from "@/lib/features/meeting/labels";
import type { Meeting } from "@/lib/features/meeting/types";

export default async function MeetingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const meeting = await getMeeting(params.id);
  if (!meeting) {
    notFound();
  }
  return (
    <AppShell>
      <MeetingDetailPageBody
        meeting={JSON.parse(JSON.stringify(meeting)) as Meeting}
      />
    </AppShell>
  );
}

function MeetingDetailPageBody({ meeting }: { meeting: Meeting }) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          목록으로
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-5">
        <div className="mb-4 flex items-end justify-between flex-wrap gap-2">
          <div>
            <div className="text-[11px] text-slate-400 m-0">
              {MEETING_PAGE_TITLE} · {MEETING_TYPE_LABEL[meeting.type]}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
              {meeting.title}
            </h1>
          </div>
        </div>
        <MeetingDetail initial={meeting} />
      </div>
    </div>
  );
}