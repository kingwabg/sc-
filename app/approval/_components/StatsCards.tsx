"use client";

import Link from "next/link";
import { Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "blue" | "emerald" | "red" | "amber";
  suffix?: string;
}

const TONE_CLASSES = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-700",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "bg-red-100 text-red-600",
    text: "text-red-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "bg-amber-100 text-amber-600",
    text: "text-amber-700",
  },
};

function StatCard({ label, value, href, icon: Icon, tone, suffix }: StatCardProps) {
  const c = TONE_CLASSES[tone];
  return (
    <Link
      href={href}
      className={cn(
        "flex-1 min-w-0 p-5 rounded-2xl border shadow-card bg-white",
        "hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums leading-none">
            {value}
            {suffix && <span className="text-base font-medium text-slate-400 ml-0.5">{suffix}</span>}
          </p>
        </div>
        <div className={cn("w-10 h-10 rounded-xl grid place-items-center shrink-0", c.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
        <span>상세 보기</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  );
}

export function StatsCards() {
  // mock – 실제 데이터는 approvalService에서 가져옴
  const stats = [
    { label: "결재 대기", value: 3, href: "/approval/standby", icon: Clock, tone: "blue" as const },
    { label: "기안 진행", value: 5, href: "/approval/draft", icon: Clock, tone: "amber" as const },
    { label: "완료", value: 12, href: "/approval/sign", icon: CheckCircle2, tone: "emerald" as const },
    { label: "반려", value: 1, href: "/approval/ccbox", icon: XCircle, tone: "red" as const },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
