"use client";

/**
 * StaffAttendanceTable — ResourceTable 어댑터 (인라인 출근/퇴근 편집)
 *
 * cell 안에서 useState로 editing 모드 관리.
 * 출근/퇴근 셀 클릭 시 input으로 전환, blur 시 onUpdate 콜백 호출.
 */

import { useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResourceTable,
  type ColumnDef,
  type ColumnCellHelpers,
} from "@/components/ui/ResourceTable";
import { POSITION_LABELS, workHours, type Staff, type StaffAttendance } from "@/lib/features/staff";

type StaffRow = {
  id: string;
  staff: Staff;
  att: StaffAttendance | undefined;
};

type Props = {
  rows: StaffRow[];
  onUpdate: (staffId: string, field: "clockIn" | "clockOut", value: string) => void;
};

export function StaffAttendanceTable({ rows, onUpdate }: Props) {
  // 각 row의 editing state를 한 곳에서 관리 (ResourceTable cell 안에서 쓸 수 없으므로)
  const [editingId, setEditingId] = useState<string | null>(null);

  function NameCell({ row }: { row: StaffRow }) {
    return (
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold",
            row.staff.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700",
          )}
        >
          {row.staff.name[0]}
        </div>
        <div className="font-semibold text-slate-900 text-[13px]">{row.staff.name}</div>
      </div>
    );
  }

  function TimeCell({
    row,
    field,
    fallback,
    isActive,
    helpers,
  }: {
    row: StaffRow;
    field: "clockIn" | "clockOut";
    fallback: string;
    isActive: boolean;
    helpers: ColumnCellHelpers<StaffRow>;
  }) {
    const isEditing = editingId === row.id && isActive;
    const value = row.att?.[field];

    if (isEditing) {
      return (
        <input
          type="time"
          defaultValue={value ?? fallback}
          className="h-8 px-2 border border-slate-200 rounded-md text-sm"
          onBlur={(e) => onUpdate(row.id, field, e.target.value)}
          autoFocus={field === "clockIn"}
        />
      );
    }
    return (
      <span
        onClick={(e) => {
          e.stopPropagation();
          setEditingId(row.id);
        }}
        className={cn(
          "text-[13px] font-semibold cursor-pointer",
          value
            ? field === "clockIn"
              ? "text-emerald-600"
              : "text-amber-600"
            : "text-slate-300",
        )}
      >
        {value ?? "—"}
      </span>
    );
  }

  const columns: ColumnDef<StaffRow>[] = [
    {
      key: "name",
      header: "이름",
      flexGrow: 2,
      minWidth: 50,
      cell: (row) => <NameCell row={row} />,
    },
    {
      key: "position",
      header: "직위",
      width: 110,
      align: "center",
      minWidth: 80,
      cell: (row) => (
        <span className="text-[12px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
          {POSITION_LABELS[row.staff.position]}
        </span>
      ),
    },
    {
      key: "clockIn",
      header: "출근 시간",
      width: 130,
      align: "center",
      minWidth: 50,
      cell: (row) => <TimeCell row={row} field="clockIn" fallback="09:00" isActive={true} helpers={undefined as never} />,
    },
    {
      key: "clockOut",
      header: "퇴근 시간",
      width: 130,
      align: "center",
      minWidth: 50,
      cell: (row) => <TimeCell row={row} field="clockOut" fallback="18:00" isActive={true} helpers={undefined as never} />,
    },
    {
      key: "workHours",
      header: "근무시간",
      width: 110,
      align: "center",
      minWidth: 50,
      cell: (row) => (
        <span className="text-[13px] font-bold text-slate-700 tabular-nums">
          {workHours(row.att?.clockIn, row.att?.clockOut)}
        </span>
      ),
    },
    {
      key: "edit",
      header: "수정",
      width: 90,
      align: "center",
      minWidth: 50,
      sortable: false,
      resizable: false,
      cell: (row) => {
        const isEditing = editingId === row.id;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingId(isEditing ? null : row.id);
            }}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-[12px] font-semibold transition bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-700"
          >
            <Pencil className="w-3 h-3" />
            {isEditing ? "완료" : "수정"}
          </button>
        );
      },
    },
  ];

  return (
    <ResourceTable
      data={rows}
      rowKey={(r) => r.id}
      columns={columns}
      options={{
        bordered: true,
        cellBordered: true,
        hover: true,
        resizable: true,
        sortable: true,
        paginated: false,
        pageSize: 50,
        wordWrap: false,
        fullText: false,
        expandable: false,
        density: "normal",
        loading: false,
        autoHeight: true,
        height: 520,
        minHeight: 0,
        maxHeight: 0,
        pageSizeRows: 50,
      }}
    />
  );
}