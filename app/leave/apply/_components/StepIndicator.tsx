/**
 * app/leave/apply/_components/StepIndicator.tsx — 3-step 진행 표시
 */

"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  steps: string[];
  current: number; // 0-based
}

export function StepIndicator({ steps, current }: Props) {
  return (
    <ol className="flex items-center gap-1 mb-4">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-1 flex-1">
            <span
              className={cn(
                "w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold flex-shrink-0 transition",
                done
                  ? "bg-emerald-600 text-white"
                  : active
                    ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500"
                    : "bg-slate-100 text-slate-400",
              )}
            >
              {done ? <Check className="w-3 h-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs",
                active ? "text-slate-900 font-semibold" : "text-slate-500",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "flex-1 h-0.5 mx-1",
                  done ? "bg-emerald-300" : "bg-slate-200",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}