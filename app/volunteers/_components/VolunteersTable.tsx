"use client";

/**
 * VolunteersTable — ResourceTable을 사용하는 자원봉사자 도메인 어댑터
 */

import { useMemo } from "react";
import { IconButton, Dropdown, Whisper } from "rsuite";
import {
  Phone,
  ChevronRight,
  Building2,
  MoreVertical,
  Pencil,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VOLUNTEER_TYPE_LABELS, type Volunteer } from "@/lib/volunteer";
import type { TableOptions } from "@/components/ui/TableOptionsDrawer";
import {
  ResourceTable,
  type ColumnDef,
} from "@/components/ui/ResourceTable";

type VolunteerRow = {
  id: string;
  name: string;
  gender: "M" | "F";
  phone: string;
  type: Volunteer["type"];
  startDate: string;
  endDate?: string;
  organization?: string;
  status: Volunteer["status"];
  original: Volunteer;
};

type Props = {
  volunteers: Volunteer[];
  options: TableOptions;
  onEdit?: (v: Volunteer) => void;
  onDelete?: (v: Volunteer) => void;
};

export function VolunteersTable({ volunteers, options, onEdit, onDelete }: Props) {
  const rows: VolunteerRow[] = useMemo(
    () => volunteers.map((v) => ({
      id: v.id,
      name: v.name,
      gender: v.gender,
      phone: v.phone,
      type: v.type,
      startDate: v.startDate,
      endDate: v.endDate,
      organization: v.organization,
      status: v.status,
      original: v,
    })),
    [volunteers],
  );

  const typeTone = (t: Volunteer["type"]) => {
    switch (t) {
      case "공익근무자": return "bg-rose-50 text-rose-700";
      case "자원봉사자": return "bg-emerald-50 text-emerald-700";
      case "실습생":     return "bg-blue-50 text-blue-700";
      default:          return "bg-slate-50 text-slate-600";
    }
  };

  const statusTone = (s: Volunteer["status"]) => {
    switch (s) {
      case "active":    return "bg-emerald-100 text-emerald-700";
      case "completed": return "bg-slate-100 text-slate-600";
      case "paused":    return "bg-amber-100 text-amber-700";
    }
  };

  const statusLabel = (s: Volunteer["status"]) => {
    switch (s) {
      case "active":    return "활동중";
      case "completed": return "완료";
      case "paused":    return "일시중단";
    }
  };

  const columns: ColumnDef<VolunteerRow>[] = [
    /* 이름 (성별 아바타 + 이름) */
    {
      key: "name",
      header: "이름",
      flexGrow: 2,
      minWidth: 140,
      sortable: options.sortable,
      resizable: options.resizable,
      fullText: options.fullText,
      cell: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold shrink-0",
              row.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700",
            )}
          >
            {row.name[0]}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 text-[13px] truncate">{row.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{row.id}</div>
          </div>
        </div>
      ),
    },
    /* 구분 */
    {
      key: "type",
      header: "구분",
      width: 110,
      align: "center",
      minWidth: 80,
      sortable: options.sortable,
      resizable: options.resizable,
      cell: (row) => (
        <span className={cn("inline-block text-[12px] px-2 py-0.5 rounded font-semibold", typeTone(row.type))}>
          {VOLUNTEER_TYPE_LABELS[row.type] ?? row.type}
        </span>
      ),
    },
    /* 연락처 */
    {
      key: "phone",
      header: "연락처",
      width: 160,
      minWidth: 50,
      sortable: options.sortable,
      resizable: options.resizable,
      fullText: options.fullText,
      cell: (row) =>
        row.phone ? (
          <a
            href={`tel:${row.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[13px] text-brand-600 hover:underline inline-flex items-center gap-1"
          >
            <Phone className="w-3 h-3" />
            {row.phone}
          </a>
        ) : (
          <span className="text-slate-300 text-[12px]">—</span>
        ),
    },
    /* 소속 */
    {
      key: "organization",
      header: "소속",
      flexGrow: 2,
      minWidth: 140,
      sortable: options.sortable,
      resizable: options.resizable,
      fullText: options.fullText,
      cell: (row) =>
        row.organization ? (
          <span className="text-[13px] text-slate-700 inline-flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-slate-400" />
            {row.organization}
          </span>
        ) : (
          <span className="text-slate-300 text-[12px]">—</span>
        ),
    },
    /* 활동 시작 */
    {
      key: "startDate",
      header: "활동 시작",
      width: 120,
      align: "center",
      minWidth: 50,
      sortable: options.sortable,
      resizable: options.resizable,
      cell: (row) => row.startDate,
    },
    /* 활동 종료 */
    {
      key: "endDate",
      header: "활동 종료",
      width: 120,
      align: "center",
      minWidth: 50,
      sortable: options.sortable,
      resizable: options.resizable,
      cell: (row) => row.endDate ?? <span className="text-slate-300 text-[12px]">계속</span>,
    },
    /* 상태 */
    {
      key: "status",
      header: "상태",
      width: 90,
      align: "center",
      minWidth: 50,
      sortable: options.sortable,
      resizable: options.resizable,
      cell: (row) => (
        <span className={cn("inline-block text-[11px] px-2 py-0.5 rounded font-semibold", statusTone(row.status))}>
          {statusLabel(row.status)}
        </span>
      ),
    },
    /* 액션 */
    ...(onEdit || onDelete
      ? [
          {
            key: "actions",
            header: " ",
            width: 70,
            align: "center" as const,
            minWidth: 50,
            sortable: false,
            resizable: false,
            cell: (row: VolunteerRow) => {
              const original = volunteers.find((x) => x.id === row.id);
              if (!original) return null;
              return (
                <Whisper
                  placement="bottomEnd"
                  speaker={
                    <Dropdown.Menu>
                      {onEdit && (
                        <Dropdown.Item
                          icon={<Pencil className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e?.stopPropagation?.();
                            onEdit(original);
                          }}
                        >
                          수정
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item
                        icon={<UserCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => (window.location.href = `/volunteers/${original.id}`)}
                      >
                        상세
                      </Dropdown.Item>
                      {onDelete && (
                        <>
                          <Dropdown.Item divider />
                          <Dropdown.Item
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={(e) => {
                              e?.stopPropagation?.();
                              onDelete(original);
                            }}
                          >
                            삭제
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown.Menu>
                  }
                >
                  <IconButton
                    size="sm"
                    appearance="subtle"
                    icon={<MoreVertical className="w-4 h-4" />}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                </Whisper>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <ResourceTable
      data={rows}
      rowKey={(r) => r.id}
      options={options}
      columns={columns}
    />
  );
}