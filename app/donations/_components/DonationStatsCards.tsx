/**
 * app/donations/_components/DonationStatsCards.tsx
 *
 * 4개 통계 카드 (전체 / 후원금 합계 / 후원물품 / 영수증 발급)
 * - Server or Client Component 모두에서 import 가능 (단순 표시)
 * - NOTE: index.ts barrel 에서 data.ts(server-only)도 re-export 하므로
 *   client component에서는 직접 labels/utils/types 에서 import (server-only 격리)
 */
import {
  STATS_TOTAL_LABEL,
  STATS_CASH_LABEL,
  STATS_GOODS_LABEL,
  STATS_RECEIPT_LABEL,
} from "@/lib/features/donation/labels";
import { formatKRWPlain } from "@/lib/features/donation/utils";
import type { DonationStats } from "@/lib/features/donation/types";
import { Coins, Package, FileCheck2, ListChecks } from "lucide-react";

interface Props {
  stats: DonationStats;
}

function StatCard({
  icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  tone: { bg: string; text: string };
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-4 py-4">
      <div className="flex items-center gap-2">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone.bg} ${tone.text}`}
        >
          {icon}
        </div>
        <div className="text-[12px] text-slate-500 font-medium">{label}</div>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}

export function DonationStatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={<ListChecks className="w-4.5 h-4.5" />}
        tone={{ bg: "bg-slate-100", text: "text-slate-700" }}
        label={STATS_TOTAL_LABEL}
        value={`${stats.totalCount}건`}
        sub={`금전 ${stats.cashCount} · 물품 ${stats.goodsCount}`}
      />
      <StatCard
        icon={<Coins className="w-4.5 h-4.5" />}
        tone={{ bg: "bg-indigo-100", text: "text-indigo-700" }}
        label={STATS_CASH_LABEL}
        value={formatKRWPlain(stats.cashTotal)}
        sub={`${stats.cashCount}건`}
      />
      <StatCard
        icon={<Package className="w-4.5 h-4.5" />}
        tone={{ bg: "bg-emerald-100", text: "text-emerald-700" }}
        label={STATS_GOODS_LABEL}
        value={`${stats.goodsCount}건`}
        sub="물품 후원"
      />
      <StatCard
        icon={<FileCheck2 className="w-4.5 h-4.5" />}
        tone={{ bg: "bg-amber-100", text: "text-amber-700" }}
        label={STATS_RECEIPT_LABEL}
        value={`${stats.receiptIssuedCount}건`}
        sub={`미발급 ${stats.receiptPendingCount}건`}
      />
    </div>
  );
}
