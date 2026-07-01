/**
 * app/meetings/_components/MeetingsTable.tsx
 *
 * 회의록 목록 테이블 — ResourceTable 셸 사용
 * - 회의 종류 배지 / 일시 / 참석자 / 결정사항 / 결재 상태
 */

import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import {
  ResourceTable,
  type ColumnDef,
} from "@/components/ui/ResourceTable";
import type { TableOptions } from "@/components/ui/TableOptionsDrawer";
import {
  MEETING_TYPE_LABEL,
  MEETING_TYPE_TONE,
  APPROVAL_STATUS_LABEL,
  MEETING_EMPTY_TITLE,
  MEETING_EMPTY_DESC,
} from "@/lib/features/meeting/labels";
import {
  formatDateKst,
  formatDateTimeKo,
  compactNames,
  joinOrDash,
} from "@/lib/features/meeting/utils";
import type { Meeting } from "@/lib/features/meeting/types";

interface Props {
  meetings: Meeting[];
  options: TableOptions;
}

export function MeetingsTable({ meetings, options }: Props) {
  const columns: ColumnDef<Meeting>[] = [
    {
      key: "type",
      header: "종류",
      flexGrow: 1.2,
      cell: (row) => {
        const tone = MEETING_TYPE_TONE[row.type];
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-medium border ${tone.bg} ${tone.text} ${tone.border}`}
          >
            {MEETING_TYPE_LABEL[row.type]}
          </span>
        );
      },
    },
    {
      key: "title",
      header: "회의 제목",
      flexGrow: 2.4,
      cell: (row) => (
        <div className="min-w-0">
          <Link
            href={`/meetings/${row.id}`}
            className="font-medium text-slate-900 truncate hover:text-indigo-600 hover:underline"
          >
            {row.title}
          </Link>
          {row.location && (
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {row.location}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "heldAt",
      header: "일시",
      flexGrow: 1.2,
      cell: (row) => (
        <span className="text-slate-600 tabular-nums">
          {formatDateTimeKo(row.heldAt)}
        </span>
      ),
    },
    {
      key: "attendees",
      header: "참석자",
      flexGrow: 1.4,
      cell: (row) => (
        <span className="text-slate-600 text-[12.5px]">
          {compactNames(row.attendees, 2)}
        </span>
      ),
    },
    {
      key: "decisions",
      header: "결정",
      flexGrow: 1.4,
      cell: (row) => (
        <span className="text-slate-600 text-[12.5px]">
          {compactNames(row.decisions, 1)}
        </span>
      ),
    },
    {
      key: "approval",
      header: "결재",
      flexGrow: 1.1,
      cell: (row) => {
        if (row.type !== "GOVERNANCE") {
          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium border ${APPROVAL_STATUS_LABEL.NONE_TONE.bg} ${APPROVAL_STATUS_LABEL.NONE_TONE.text} ${APPROVAL_STATUS_LABEL.NONE_TONE.border}`}
            >
              {APPROVAL_STATUS_LABEL.NONE}
            </span>
          );
        }
        if (row.approvalId) {
          return (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border ${APPROVAL_STATUS_LABEL.SPAWNED_TONE.bg} ${APPROVAL_STATUS_LABEL.SPAWNED_TONE.text} ${APPROVAL_STATUS_LABEL.SPAWNED_TONE.border}`}
            >
              <ShieldCheck className="w-3 h-3" />
              {APPROVAL_STATUS_LABEL.SPAWNED}
            </span>
          );
        }
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium border ${APPROVAL_STATUS_LABEL.PENDING_TONE.bg} ${APPROVAL_STATUS_LABEL.PENDING_TONE.text} ${APPROVAL_STATUS_LABEL.PENDING_TONE.border}`}
          >
            {APPROVAL_STATUS_LABEL.PENDING}
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
          href={`/meetings/${row.id}`}
          className="inline-flex items-center text-slate-400 hover:text-indigo-600 text-[12px]"
        >
          상세
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      ),
    },
  ];

  if (meetings.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-12 text-center">
        <div className="text-slate-500 font-medium">{MEETING_EMPTY_TITLE}</div>
        <div className="text-[12px] text-slate-400 mt-1">
          {MEETING_EMPTY_DESC}
        </div>
      </div>
    );
  }

  return (
    <ResourceTable
      data={meetings}
      rowKey={(m) => m.id}
      options={options}
      columns={columns}
      renderExpanded={(row) => (
        <div className="px-4 py-3 bg-slate-50 rounded-lg text-[12px] text-slate-600 space-y-1">
          <div>
            <span className="text-slate-400">안건:</span> {joinOrDash(row.agenda)}
          </div>
          {row.absent.length > 0 && (
            <div>
              <span className="text-slate-400">결석자:</span> {joinOrDash(row.absent)}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Link
              href={`/meetings/${row.id}`}
              className="text-indigo-600 hover:underline"
            >
              상세 보기 →
            </Link>
          </div>
        </div>
      )}
    />
  );
}