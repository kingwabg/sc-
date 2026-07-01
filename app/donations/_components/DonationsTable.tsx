/**
 * app/donations/_components/DonationsTable.tsx
 *
 * 후원 목록 표시 — 상세행 확장 패턴
 * - ResourceTable 셸 사용
 */

import { Receipt, ExternalLink, ChevronRight } from "lucide-react";
import {
  ResourceTable,
  type ColumnDef,
} from "@/components/ui/ResourceTable";
import type { TableOptions } from "@/components/ui/TableOptionsDrawer";
import {
  DONATION_TYPE_LABEL,
  DONATION_TYPE_TONE,
  RECEIPT_LABEL,
} from "@/lib/features/donation/labels";
import { formatKRWPlain, formatDateKst } from "@/lib/features/donation/utils";
import type { Donation } from "@/lib/features/donation/types";
import Link from "next/link";

interface Props {
  donations: Donation[];
  options: TableOptions;
}

export function DonationsTable({ donations, options }: Props) {
  const columns: ColumnDef<Donation>[] = [
    {
      key: "donorName",
      header: "후원자",
      flexGrow: 1.6,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[12px] font-semibold">
            {row.donorName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 truncate">
              <Link
                href={`/donations/${row.id}`}
                className="hover:text-indigo-600 hover:underline"
              >
                {row.donorName}
              </Link>
            </div>
            {row.donorContact && (
              <div className="text-[11px] text-slate-400 tabular-nums">
                {row.donorContact}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "종류",
      flexGrow: 0.8,
      cell: (row) => {
        const tone = DONATION_TYPE_TONE[row.type];
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-medium border ${tone.bg} ${tone.text} ${tone.border}`}
          >
            {DONATION_TYPE_LABEL[row.type]}
          </span>
        );
      },
    },
    {
      key: "content",
      header: "금액 / 물품",
      flexGrow: 1.4,
      cell: (row) => {
        if (row.type === "CASH") {
          return (
            <span className="font-semibold text-slate-900 tabular-nums">
              {formatKRWPlain(row.amount)}
            </span>
          );
        }
        return (
          <div className="min-w-0">
            <div className="font-medium text-slate-900 truncate">
              {row.itemName ?? "—"}
            </div>
            {row.itemQty != null && (
              <div className="text-[11px] text-slate-400 tabular-nums">
                {row.itemQty}개
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "receivedAt",
      header: "접수일",
      flexGrow: 0.9,
      cell: (row) => (
        <span className="text-slate-600 tabular-nums">
          {formatDateKst(row.receivedAt)}
        </span>
      ),
    },
    {
      key: "receipt",
      header: "영수증",
      flexGrow: 1,
      cell: (row) => {
        if (row.receiptIssued && row.receiptNumber) {
          return (
            <a
              href={`/api/donations/${row.id}/receipt`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border ${RECEIPT_LABEL.ISSUED_TONE.bg} ${RECEIPT_LABEL.ISSUED_TONE.text} ${RECEIPT_LABEL.ISSUED_TONE.border} hover:opacity-80`}
            >
              <Receipt className="w-3 h-3" />
              {row.receiptNumber}
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </a>
          );
        }
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium border ${RECEIPT_LABEL.PENDING_TONE.bg} ${RECEIPT_LABEL.PENDING_TONE.text} ${RECEIPT_LABEL.PENDING_TONE.border}`}
          >
            {RECEIPT_LABEL.PENDING}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      flexGrow: 0.5,
      cell: (row) => (
        <Link
          href={`/donations/${row.id}`}
          className="inline-flex items-center text-slate-400 hover:text-indigo-600 text-[12px]"
        >
          상세
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      ),
    },
  ];

  if (donations.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-12 text-center">
        <div className="text-slate-500 font-medium">등록된 후원이 없습니다</div>
        <div className="text-[12px] text-slate-400 mt-1">
          새 후원을 등록하면 목록에 표시됩니다.
        </div>
      </div>
    );
  }

  return (
    <ResourceTable
      data={donations}
      rowKey={(d) => d.id}
      options={options}
      columns={columns}
      renderExpanded={(row) => (
        <div className="px-4 py-3 bg-slate-50 rounded-lg text-[12px] text-slate-600 space-y-1">
          {row.notes && (
            <div>
              <span className="text-slate-400">비고:</span> {row.notes}
            </div>
          )}
          <div className="flex gap-3">
            <Link
              href={`/donations/${row.id}`}
              className="text-indigo-600 hover:underline"
            >
              상세 보기 →
            </Link>
            <a
              href={`/api/donations/${row.id}/receipt`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              영수증 HTML →
            </a>
          </div>
        </div>
      )}
    />
  );
}
