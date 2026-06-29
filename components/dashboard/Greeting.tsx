"use client";

import { Plus, Send, CalendarPlus, MessageCircle } from "lucide-react";
import { formatKoreanDate } from "@/lib/format-date";
import { useTenant } from "@/lib/tenant-context";
import { getGreetingByTime } from "@/lib/tenants";

export function Greeting() {
  const { tenant } = useTenant();
  const greet = tenant ? getGreetingByTime(tenant) : "안녕하세요 👋";
  const label = tenant?.label ?? "Office";

  return (
    <section className="flex items-end justify-between gap-6 flex-wrap mb-5">
      <div>
        <div className="flex items-center gap-2 text-[13px] text-slate-500 mb-1">
          {tenant && (
            <span className={`px-1.5 py-0.5 rounded ${tenant.accent.bg} ${tenant.accent.text} text-[11px] font-semibold`}>
              {tenant.label}
            </span>
          )}
          <span>{formatKoreanDate()}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0 mb-1.5">
          김민수님, {greet}
        </h1>
        <p className="text-slate-500 text-sm m-0">
          {tenant ? (
            <>
              오늘도 <b className="text-brand-700 font-bold">{label}</b>에서 보람된 하루 보내세요.
            </>
          ) : (
            <>오늘도 좋은 하루 되세요.</>
          )}
          {" "}처리할 결재 <b className="text-brand-700 font-bold">3건</b>, 안 읽은 메일{" "}
          <b className="text-brand-700 font-bold">12건</b>이 있어요.
        </p>
      </div>
      <div className="flex gap-2">
        <QuickBtn icon={<Plus className="w-3.5 h-3.5" />} label="결재 작성" tone="blue" />
        <QuickBtn icon={<Send className="w-3.5 h-3.5" />} label="메일 쓰기" tone="green" />
        <QuickBtn icon={<CalendarPlus className="w-3.5 h-3.5" />} label="일정 등록" tone="amber" />
        <QuickBtn icon={<MessageCircle className="w-3.5 h-3.5" />} label="메신저" tone="purple" />
      </div>
    </section>
  );
}

const TONE_MAP = {
  blue: "bg-blue-50 text-brand-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-500",
  purple: "bg-violet-50 text-violet-600",
} as const;

function QuickBtn({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: keyof typeof TONE_MAP;
}) {
  return (
    <button className="h-10 px-3.5 rounded-[10px] bg-white border border-slate-200 shadow-sm text-[13px] font-medium text-slate-900 hover:border-brand-600 hover:text-brand-700 transition flex items-center gap-2">
      <span className={`w-6 h-6 rounded-md grid place-items-center ${TONE_MAP[tone]}`}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}