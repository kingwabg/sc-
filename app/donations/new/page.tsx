/**
 * app/donations/new/page.tsx — 신규 후원 등록
 * 라우트 + 헤더만 (Form은 _components/NewDonationForm)
 */

import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  NEW_DONATION_TITLE,
  NEW_DONATION_DESC,
} from "@/lib/features/donation/labels";
import { NewDonationForm } from "./_components/NewDonationForm";

export default function NewDonationPage() {
  return (
    <AppShell>
      <NewDonationBody />
    </AppShell>
  );
}

function NewDonationBody() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/donations"
          className="inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          목록으로
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
            {NEW_DONATION_TITLE}
          </h1>
          <p className="text-[12px] text-slate-500 mt-1 m-0">{NEW_DONATION_DESC}</p>
        </div>
        <NewDonationForm />
      </div>
    </div>
  );
}
