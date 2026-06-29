"use client";

/**
 * StaffTable — RSuite Table (옵션 + 행 펼침 적용 버전)
 */
import { useMemo, useState } from "react";
import {
  Table,
  Pagination,
  IconButton,
  Dropdown,
  Whisper,
} from "rsuite";
import {
  Phone,
  ChevronRight,
  Mail,
  CalendarDays,
  Clock,
  UserCircle2,
  Briefcase,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { POSITION_LABELS, workHours, type Staff, type StaffAttendance } from "@/lib/staff";
import type { TableOptions, TableDensity } from "@/components/ui/TableOptionsDrawer";

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

const ROW_HEIGHT: Record<TableDensity, number> = {
  compact: 36,
  normal: 46,
  comfortable: 56,
};
const HEADER_HEIGHT: Record<TableDensity, number> = {
  compact: 36,
  normal: 40,
  comfortable: 44,
};

export function StaffTable({ staff, attendanceMap, options, onEdit, onDelete }: Props) {
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

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

  const pageRows = useMemo(
    () => rows.slice((page - 1) * options.pageSize, page * options.pageSize),
    [rows, page, options.pageSize],
  );

  function toggleExpand(id: string) {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <>
      <Table
        data={pageRows}
        rowKey="id"
        height={options.autoHeight ? undefined : options.height || 520}
        autoHeight={options.autoHeight}
        minHeight={options.minHeight > 0 ? options.minHeight : undefined}
        maxHeight={options.maxHeight > 0 ? options.maxHeight : undefined}
        hover={options.hover}
        bordered={options.bordered}
        cellBordered={options.cellBordered}
        loading={options.loading}
        headerHeight={HEADER_HEIGHT[options.density]}
        rowHeight={ROW_HEIGHT[options.density]}
        wordWrap={options.wordWrap}
        expandedRowKeys={expandedIds}
        onExpandChange={(expanded, rowData: StaffRow) =>
          setExpandedIds((prev) =>
            expanded
              ? Array.from(new Set([...prev, rowData.id]))
              : prev.filter((id) => id !== rowData.id),
          )
        }
        renderRowExpanded={(rowData?: StaffRow) =>
          rowData ? <StaffExpandedPanel row={rowData} /> : null
        }
        rowExpandedHeight={160}
        locale={{ emptyMessage: "검색 결과가 없습니다", loading: "불러오는 중…" }}
      >
        {/* 이름 (펼침 토글 + 직원 정보) — flexGrow로 자동 폭, minWidth=140으로 이름 최소 보장 */}
        <Table.Column flexGrow={3}
          minWidth={140}
          sortable={options.sortable}
          resizable={options.resizable}
          fullText={options.fullText}
        >
          <Table.HeaderCell>이름</Table.HeaderCell>
          <Table.Cell>
            {(row: StaffRow) => {
              const open = expandedIds.includes(row.id);
              return (
                <div className="flex items-center gap-2 min-w-0">
                  <IconButton
                    size="xs"
                    appearance="subtle"
                    icon={
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 transition-transform text-slate-500",
                          open && "rotate-90 text-brand-600",
                        )}
                      />
                    }
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toggleExpand(row.id);
                    }}
                    aria-label={open ? "접기" : "펼치기"}
                    title={open ? "상세 접기" : "상세 펼치기"}
                  />
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full grid place-items-center text-[13px] font-bold shrink-0",
                        row.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700",
                      )}
                    >
                      {row.name[0]}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-slate-900 text-[13px] truncate">{row.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{row.id}</div>
                    </div>
                  </div>
                </div>
              );
            }}
          </Table.Cell>
        </Table.Column>

        {/* 직위 */}
        <Table.Column
          width={100}
          align="center"
          sortable={options.sortable}
          resizable={options.resizable}
          fullText={options.fullText}
          minWidth={50}
        >
          <Table.HeaderCell>직위</Table.HeaderCell>
          <Table.Cell>
            {(row: StaffRow) => (
              <span className="inline-block text-[12px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                {POSITION_LABELS[row.position] ?? row.position}
              </span>
            )}
          </Table.Cell>
        </Table.Column>

        {/* 연락처 */}
        <Table.Column
          width={160}
          sortable={options.sortable}
          resizable={options.resizable}
          fullText={options.fullText}
          minWidth={50}
        >
          <Table.HeaderCell>연락처</Table.HeaderCell>
          <Table.Cell>
            {(row: StaffRow) =>
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
              )
            }
          </Table.Cell>
        </Table.Column>

        {/* 이메일 — flexGrow로 자동 폭 */}
        <Table.Column flexGrow={2}
          minWidth={140}
          sortable={options.sortable}
          resizable={options.resizable}
          fullText={options.fullText}
        >
          <Table.HeaderCell>이메일</Table.HeaderCell>
          <Table.Cell>
            {(row: StaffRow) =>
              row.email ? (
                <span className="text-[12px] text-slate-600 truncate inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {row.email}
                </span>
              ) : (
                <span className="text-slate-300 text-[12px]">—</span>
              )
            }
          </Table.Cell>
        </Table.Column>

        {/* 입사일 */}
        <Table.Column
          width={120}
          align="center"
          sortable={options.sortable}
          resizable={options.resizable}
          fullText={options.fullText}
          minWidth={50}
        >
          <Table.HeaderCell>입사일</Table.HeaderCell>
          <Table.Cell dataKey="joinDate" />
        </Table.Column>

        {/* 출근 */}
        <Table.Column width={90} align="center" sortable={options.sortable}
          resizable={options.resizable}
          minWidth={50}>
          <Table.HeaderCell>출근</Table.HeaderCell>
          <Table.Cell>
            {(row: StaffRow) =>
              row.clockIn ? (
                <span className="text-[13px] font-semibold text-emerald-600 tabular-nums">
                  {row.clockIn}
                </span>
              ) : (
                <span className="text-slate-300 text-[12px]">—</span>
              )
            }
          </Table.Cell>
        </Table.Column>

        {/* 퇴근 */}
        <Table.Column width={90} align="center" sortable={options.sortable}
          resizable={options.resizable}
          minWidth={50}>
          <Table.HeaderCell>퇴근</Table.HeaderCell>
          <Table.Cell>
            {(row: StaffRow) =>
              row.clockOut ? (
                <span className="text-[13px] font-semibold text-amber-600 tabular-nums">
                  {row.clockOut}
                </span>
              ) : (
                <span className="text-slate-300 text-[12px]">—</span>
              )
            }
          </Table.Cell>
        </Table.Column>

        {/* 근무시간 */}
        <Table.Column
          width={110} align="center" fullText={options.fullText}
          minWidth={50}
        >
          <Table.HeaderCell>근무시간</Table.HeaderCell>
          <Table.Cell>
            {(row: StaffRow) => (
              <span className="text-[13px] font-semibold text-slate-700 tabular-nums">
                {workHours(row.clockIn, row.clockOut)}
              </span>
            )}
          </Table.Cell>
        </Table.Column>

        {/* 상태 */}
        <Table.Column
          width={90}
          align="center"
          sortable={options.sortable}
          resizable={options.resizable}
          minWidth={50}
        >
          <Table.HeaderCell>상태</Table.HeaderCell>
          <Table.Cell>
            {(row: StaffRow) => {
              const tone =
                row.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : row.status === "leave"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600";
              const label = row.status === "active" ? "재직" : row.status === "leave" ? "휴직" : "퇴직";
              return (
                <span className={`inline-block text-[11px] px-2 py-0.5 rounded font-semibold ${tone}`}>
                  {label}
                </span>
              );
            }}
          </Table.Cell>
        </Table.Column>

        {/* 액션 메뉴 */}
        {(onEdit || onDelete) && (
          <Table.Column
          width={70} align="center" verticalAlign="middle" fixed="right"
          minWidth={50}
        >
            <Table.HeaderCell> </Table.HeaderCell>
            <Table.Cell>
              {(row: StaffRow) => {
                const original: Staff | undefined = staff.find((x) => x.id === row.id);
                if (!original) return null;
                return (
                  <Whisper
                    placement="bottomEnd"
                    speaker={
                      <Dropdown.Menu>
                        {onEdit && (
                          <Dropdown.Item
                            icon={<Pencil className="w-3.5 h-3.5" />}
                            onClick={(e) => { e?.stopPropagation?.(); onEdit(original); }}
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
                              onClick={(e) => { e?.stopPropagation?.(); onDelete(original); }}
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
              }}
            </Table.Cell>
          </Table.Column>
        )}
      </Table>

      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-3 border-t border-slate-100 bg-slate-50/60 text-[12px] text-slate-600">
        <span>
          총 <strong className="text-slate-900">{rows.length}</strong>명
          {options.paginated && (
            <> · {(page - 1) * options.pageSize + 1}–{Math.min(page * options.pageSize, rows.length)} 표시</>
          )}
        </span>
        {options.paginated && rows.length > options.pageSize && (
          <Pagination
            prev
            next
            first
            last
            total={rows.length}
            limit={options.pageSize}
            activePage={page}
            onChangePage={setPage}
            maxButtons={5}
            size="sm"
          />
        )}
      </div>
    </>
  );
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
          <a href={`tel:${s.phone}`} className="text-brand-600 hover:underline">{s.phone}</a>
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
            s.status === "active" ? "재직" :
            s.status === "leave" ? "휴직" : "퇴직"
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
                <span className="font-semibold text-emerald-600 tabular-nums">{att.clockIn}</span>
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </KV>
            <KV label="퇴근">
              {att.clockOut ? (
                <span className="font-semibold text-amber-600 tabular-nums">{att.clockOut}</span>
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

function KV({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
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
