/**
 * app/donations/_components/DonationTypeFilter.tsx
 *
 * 금전/물품 타입 필터 (segmented)
 */

import { DONATION_TYPE_LABEL, DONATION_TYPE_TONE } from "@/lib/features/donation/labels";
import type { DonationType } from "@/lib/features/donation/types";
import { cn } from "@/lib/utils";

export type DonationTypeFilter = "all" | DonationType;

interface Props {
  value: DonationTypeFilter;
  counts: Record<DonationTypeFilter, number>;
  onChange: (v: DonationTypeFilter) => void;
}

export function DonationTypeFilterChips({ value, counts, onChange }: Props) {
  const opts: { id: DonationTypeFilter; label: string }[] = [
    { id: "all", label: "전체" },
    { id: "CASH", label: DONATION_TYPE_LABEL.CASH },
    { id: "GOODS", label: DONATION_TYPE_LABEL.GOODS },
  ];

  return (
    <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 gap-1">
      {opts.map((o) => {
        const isActive = value === o.id;
        const tone =
          o.id === "CASH"
            ? DONATION_TYPE_TONE.CASH
            : o.id === "GOODS"
            ? DONATION_TYPE_TONE.GOODS
            : null;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition",
              isActive
                ? tone
                  ? `${tone.bg} ${tone.text} shadow-sm`
                  : "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {o.label}
            <span
              className={cn(
                "ml-1.5 text-[11px] tabular-nums",
                isActive ? "opacity-80" : "opacity-60",
              )}
            >
              {counts[o.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
