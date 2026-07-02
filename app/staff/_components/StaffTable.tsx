"use client";

/**
 * StaffTable — ResourceTable을 사용하는 종사자 도메인 어댑터
 *
 * 책임:
 *  - Staff[] → StaffRow[] 매핑
 *  - 9개 컬럼 정의 (+ 옵션 액션 컬럼)
 *  - 펼침 패널(StaffExpandedPanel) 렌더링
 */

import { useMemo } from "react";
import { IconButton, Dropdown, Whisper } from "rsuite";
import {
  Phone,
  ChevronRight,
  Mail,
  Clock,
  UserCircle2,
  Briefcase,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  POSITION_LABELS,
  workHours,
  type Staff,
  type StaffAttendance,
} from "@/lib/staff";
import type { TableOptions } from "@/components/ui/TableOptionsDrawer";
import {
  ResourceTable,
  type ColumnDef,
} from "@/components/ui/ResourceTable";

type StaffRow = {
  id: string;
  name: string;
  gender: "M" | "F";
  loginId: string;
  position: Staff["position"];
  phone: string;
  email: string;
  joinDate: string;
  status: Staff["status"];
  clockIn?: string;
  clockOut?: string;
  original: Staff;
  attendance?: StaffAttendance;
};

type Props = {
  staff: Staff[];
  attendanceMap: Record<string, StaffAttendance>;
  options: TableOptions;
  onEdit?: (s: Staff) => void;
  onDelete?: (s: Staff) => void;
};

export function StaffTable({ staff, attendanceMap, options, onEdit, onDelete }: Props) {
  const rows: StaffRow[] = useMemo(
    () =>
      staff.map((s) => {
        const att = attendanceMap[s.id];
        return {
          id: s.id,
          name: s.name,
          gender: s.gender,
          loginId: s.loginId,
          position: s.position,
          phone: s.phone,
          email: s.email ?? "",
          joinDate: s.joinDate,
          status: s.status,
          clockIn: att?.clockIn,
          clockOut: att?.clockOut,
          original: s,
          attendance: att,
        };
      }),
    [staff, attendanceMap],
  );

  const columns: ColumnDef<StaffRow>[] = [
    /* 이름 (펼침 토글 + 직원 정보) */
    {
      key: "name",
      header: "이름",
      flexGrow: 3,
      minWidth: 170,
      align: "center",
      sortable: options.sortable,
      resizable: options.resizable,
      fullText: options.fullText,
      cell: (row, { isExpanded, toggleExpand }) => (
        <div className="flex items-center justify-center gap-2 min-w-0 h-full">
          <IconButton
            size="xs"
            appearance="subtle"
            icon={
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-transform text-slate-500",
                  isExpanded && "rotate-90 text-brand-600",
                )}
              />
            }
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              toggleExpand();
            }}
            aria-label={isExpanded ? "접기" : "펼치기"}
            title={isExpanded ? "상세 접기" : "상세 펼치기"}
          />
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "w-9 h-9 rounded-full grid place-items-center text-[13px] font-bold shrink-0",
                row.gender === "M"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-pink-100 text-pink-700",
              )}
            >
              {row.name[0]}
            </div>
            <div className="min-w-0 leading-none">
              <span className="font-semibold text-slate-900 text-[13px]">{row.name}</span>
              <span className="text-[10.5px] text-slate-400 font-normal"> · {row.id}</span>
            </div>
          </div>
        </div>
      ),
    },
    /* 직위 */
    {
      key: "position",
      header: "직위",
      width: 112,
      align: "center",
      minWidth: 50,
      sortable: options.sortable,
      resizable: options.resizable,
      fullText: options.fullText,
      cell: (row) => (
        <span
          className={cn(
            "inline-flex h-6 items-center justify-center rounded-full border px-2.5 text-[11.5px] font-semibold leading-none",
            positionTone(row.position),
          )}
        >
          {POSITION_LABELS[row.position] ?? row.position}
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
            className="inline-flex h-7 items-center gap-1.5 rounded-md bg-slate-50 px-2 text-[12.5px] font-medium tabular-nums text-slate-700 ring-1 ring-inset ring-slate-200 transition hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800 dark:hover:text-sky-300"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {row.phone}
          </a>
        ) : (
          <span className="text-slate-300 text-[12px]">—</span>
        ),
    },
    /* 이메일 */
    {
      key: "email",
      header: "이메일",
      flexGrow: 2,
      minWidth: 140,
      sortable: options.sortable,
      resizable: options.resizable,
      fullText: options.fullText,
      cell: (row) =>
        row.email ? (
          <span className="text-[12px] text-slate-600 truncate inline-flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            {row.email}
          </span>
        ) : (
          <span className="text-slate-300 text-[12px]">—</span>
        ),
    },
    /* 입사일 */
    {
      key: "joinDate",
      header: "입사일",
      width: 120,
      align: "center",
      minWidth: 50,
      sortable: options.sortable,
      resizable: options.resizable,
      fullText: options.fullText,
      cell: (row) => row.joinDate,
    },
    /* 출근 */
    {
      key: "clockIn",
      header: "출근",
      width: 90,
      align: "center",
      minWidth: 50,
      sortable: options.sortable,
      resizable: options.resizable,
      cell: (row) =>
        row.clockIn ? (
          <span className="text-[13px] font-semibold text-emerald-600 tabular-nums">
            {row.clockIn}
          </span>
        ) : (
          <span className="text-slate-300 text-[12px]">—</span>
        ),
    },
    /* 퇴근 */
    {
      key: "clockOut",
      header: "퇴근",
      width: 90,
      align: "center",
      minWidth: 50,
      sortable: options.sortable,
      resizable: options.resizable,
      cell: (row) =>
        row.clockOut ? (
          <span className="text-[13px] font-semibold text-amber-600 tabular-nums">
            {row.clockOut}
          </span>
        ) : (
          <span className="text-slate-300 text-[12px]">—</span>
        ),
    },
    /* 근무시간 */
    {
      key: "workHours",
      header: "근무시간",
      width: 110,
      align: "center",
      minWidth: 50,
      fullText: options.fullText,
      cell: (row) => (
        <span className="text-[13px] font-semibold text-slate-700 tabular-nums">
          {workHours(row.clockIn, row.clockOut)}
        </span>
      ),
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
      cell: (row) => {
        const tone =
          row.status === "active"
            ? "bg-emerald-100 text-emerald-700"
            : row.status === "leave"
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-600";
        const label =
          row.status === "active"
            ? "재직"
            : row.status === "leave"
              ? "휴직"
              : "퇴직";
        return (
          <span
            className={`inline-block text-[11px] px-2 py-0.5 rounded font-semibold ${tone}`}
          >
            {label}
          </span>
        );
      },
    },
    /* 액션 메뉴 — onEdit/onDelete 둘 다 없으면 컬럼 자체를 생략 */
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
            cell: (row: StaffRow) => {
              const original = staff.find((x) => x.id === row.id);
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
                        onClick={() => (window.location.href = `/staff/${original.id}`)}
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
      expandedRowHeight={160}
      renderExpanded={(row) => <StaffExpandedPanel row={row} />}
    />
  );
}

function positionTone(position: Staff["position"]) {
  switch (position) {
    case "所长":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/35 dark:text-violet-200";
    case "支援교사":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/35 dark:text-sky-200";
    case "조리사":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/35 dark:text-emerald-200";
    case "행정":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300";
  }
}

// ─── 펼쳐진 영역 ────────────────────────────────────────────────

function StaffExpandedPanel({ row }: { row: StaffRow }) {
  const s = row.original;
  const att = row.attendance;
  const tenureYears = computeTenure(s.joinDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50/70 border-l-4 border-brand-300 rounded-r-lg">
      {/* 연락처 / 계정 */}
      <section>
        <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700 mb-2 mt-1">
          <Phone className="w-3.5 h-3.5 text-brand-500" />
          연락처
        </h4>
        <KV label="전화">
          <a href={`tel:${s.phone}`} className="text-brand-600 hover:underline">
            {s.phone}
          </a>
        </KV>
        {s.email && (
          <KV label="이메일">
            <a href={`mailto:${s.email}`} className="text-brand-600 hover:underline">
              {s.email}
            </a>
          </KV>
        )}
        <KV label="로그인 ID" value={s.loginId} />
        <KV label="성별" value={s.gender === "M" ? "남" : "여"} />
      </section>

      {/* 입사 / 직위 */}
      <section>
        <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700 mb-2 mt-1">
          <Briefcase className="w-3.5 h-3.5 text-brand-500" />
          근속 / 직위
        </h4>
        <KV label="입사일" value={s.joinDate} />
        <KV label="근속기간" value={tenureYears} />
        <KV label="직위" value={POSITION_LABELS[s.position] ?? s.position} />
        <KV
          label="상태"
          value={
            s.status === "active"
              ? "재직"
              : s.status === "leave"
                ? "휴직"
                : "퇴직"
          }
        />
      </section>

      {/* 오늘 출석 */}
      <section>
        <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700 mb-2 mt-1">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          오늘 출퇴근
        </h4>
        {att ? (
          <>
            <KV label="출근">
              {att.clockIn ? (
                <span className="font-semibold text-emerald-600 tabular-nums">
                  {att.clockIn}
                </span>
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </KV>
            <KV label="퇴근">
              {att.clockOut ? (
                <span className="font-semibold text-amber-600 tabular-nums">
                  {att.clockOut}
                </span>
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </KV>
            <KV label="근무시간" value={workHours(att.clockIn, att.clockOut)} />
            {att.note && <KV label="비고" value={att.note} />}
          </>
        ) : (
          <p className="text-[12px] text-slate-400">오늘 출근 기록 없음</p>
        )}
      </section>
    </div>
  );
}

function KV({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2 py-0.5 text-[12px]">
      <span className="text-slate-400 min-w-[60px] text-[11px]">{label}</span>
      <span className="text-slate-800 flex-1">{children ?? value ?? "—"}</span>
    </div>
  );
}

function computeTenure(joinDate: string): string {
  const start = new Date(joinDate);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const m = months % 12;
  if (months < 0) return "-";
  if (years === 0) return `${m}개월`;
  if (m === 0) return `${years}년`;
  return `${years}년 ${m}개월`;
}
