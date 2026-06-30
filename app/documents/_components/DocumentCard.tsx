"use client";

/**
 * DocumentCard — 문서 카드 (Link 또는 placeholder)
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  icon: React.ReactNode;
  iconBg: string; // e.g. "bg-indigo-100 text-indigo-600"
  title: string;
  subtitle: string;
  hint: string;
  /** placeholder (no link) */
  disabled?: boolean;
  className?: string;
};

export function DocumentCard({ href, icon, iconBg, title, subtitle, hint, disabled, className }: Props) {
  const inner = (
    <div className="flex items-start gap-3">
      <div className={cn("w-12 h-12 rounded-xl grid place-items-center shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
        <div className="text-[11px] text-slate-400 mt-2">{hint}</div>
      </div>
      {!disabled && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 mt-1" />}
    </div>
  );

  if (disabled || !href) {
    return <div className={cn("card-base p-5", className)}>{inner}</div>;
  }
  return (
    <Link href={href} className={cn("card-base card-hover p-5 group", className)}>
      {inner}
    </Link>
  );
}