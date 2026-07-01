/**
 * app/meetings/new/page.tsx — 신규 회의록 작성
 *
 * 라우트 + 헤더만 (Form은 _components/NewMeetingForm)
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { NewMeetingForm } from "./_components/NewMeetingForm";
import {
  NEW_MEETING_TITLE,
  NEW_MEETING_DESC,
  MEETING_PAGE_DESC_GOVERNANCE,
} from "@/lib/features/meeting/labels";

export default function NewMeetingPage() {
  return (
    <AppShell>
      <NewMeetingBody />
    </AppShell>
  );
}

function NewMeetingBody() {
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
        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
            {NEW_MEETING_TITLE}
          </h1>
          <p className="text-[12px] text-slate-500 mt-1 m-0">{NEW_MEETING_DESC}</p>
          <p className="text-[11px] text-indigo-600 mt-1 m-0">
            {MEETING_PAGE_DESC_GOVERNANCE}
          </p>
        </div>
        <NewMeetingForm />
      </div>
    </div>
  );
}