"use client";

/**
 * ChildrenTable — ResourceTable을 사용하는 아동 도메인 어댑터
 *
 * 책임:
 *  - Child[] → ChildRow[] 매핑 (페이지네이션은 ResourceTable이 처리)
 *  - 6개 컬럼 정의
 *  - 펼침 패널(ChildExpandedPanel) 렌더링
 */

import { useMemo } from "react";
import Link from "next/link";
import { IconButton } from "rsuite";
import {
  AlertTriangle,
  ChevronRight,
  Stethoscope,
  UserCircle2,
  Pill,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ageFromBirthDate } from "@/lib/features/children/utils";
import type {
  Child,
  Attendance,
  AttendanceStatus,
} from "@/lib/features/children/types";
import { StatusEditor } from "./StatusEditor";
import type { TableOptions } from "@/components/ui/TableOptionsDrawer";
import {
  ResourceTable,
  type ColumnDef,
} from "@/components/ui/ResourceTable";

type ChildRow = {
  id: string;
  name: string;
  nameLast: string;
  nameFirst: string;
  gender: "M" | "F";
  age: number;
  grade: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  allergies: string[];
  attendance: Attendance | undefined;
  original: Child;
};

type Props = {
  children: Child[];
  attendanceMap: Record<string, Attendance>;
  options: TableOptions;
  onStatusChange: (
    childId: string,
    status: AttendanceStatus,
    time?: string,
    reason?: string,
  ) => void;
};

export function ChildrenTable({ children: list, attendanceMap, options, onStatusChange }: Props) {
  const rows: ChildRow[] = useMemo(
    () =>
      list.map((c) => ({
        id: c.id,
        name: c.name,
        nameLast: c.nameLast,
        nameFirst: c.nameFirst,
        gender: c.gender,
        age: ageFromBirthDate(c.birthDate),
        grade: c.grade ?? "-",
        guardianName: c.guardian.name,
        guardianRelation: c.guardian.relation,
        guardianPhone: c.guardian.phone,
        allergies: c.health.allergies,
        attendance: attendanceMap[c.id],
        original: c,
      })),
    [list, attendanceMap],
  );

  const columns: ColumnDef<ChildRow>[] = [
    /* 이름 (펼침 토글 + 아바타 + 성/이름 합친 풀네임 + 학년) */
    {
      key: "name",
      header: "이름",
      flexGrow: 2,
      minWidth: 50,
      sortable: options.sortable,
      resizable: options.resizable,
      fullText: options.fullText,
      cell: (row, { isExpanded, toggleExpand }) => (
        <div className="flex items-center gap-2 min-w-0">
          <IconButton
            size="xs"
            appearance="subtle"
            icon={
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 transition-transform text-slate-500",
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
          <Link
            href={`/children/${row.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2.5 min-w-0"
            prefetch={false}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold shrink-0",
                row.gender === "M"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-pink-100 text-pink-700",
              )}
            >
              {row.name?.[0] ?? "?"}
            </div>
            <div className="text-left min-w-0">
              <div className="font-semibold text-slate-900 text-[13px] truncate">
                {row.name} <span className="text-[10.5px] text-slate-400 font-normal">· {row.age}세 · {row.grade}</span>
              </div>
            </div>
          </Link>
        </div>
      ),
    },
    {
      key: "grade",
      header: "학년",
      width: 70,
      align: "center",
      minWidth: 50,
      cell: (row) => row.grade,
    },
    {
      key: "age",
      header: "나이",
      width: 70,
      align: "center",
      minWidth: 50,
      cell: (row) => `${row.age}세`,
    },
    {
      key: "guardian",
      header: "보호자",
      flexGrow: 2,
      minWidth: 50,
      cell: (row) => (
        <div className="text-[13px] text-slate-900 truncate">
          {row.guardianName}
          <span className="text-[11px] text-slate-500"> · {row.guardianRelation} · {row.guardianPhone}</span>
        </div>
      ),
    },
    {
      key: "allergies",
      header: "알레르기",
      flexGrow: 2,
      minWidth: 50,
      sortable: false,
      fullText: options.fullText,
      cell: (row) => {
        if (row.allergies.length === 0) {
          return <span className="text-slate-300 text-[12px]">없음</span>;
        }
        return (
          <div className="flex items-center gap-1 flex-wrap py-1">
            {row.allergies.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium"
              >
                <AlertTriangle className="w-3 h-3" />
                {a}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "attendance",
      header: "오늘 출석",
      flexGrow: 2,
      minWidth: 50,
      sortable: false,
      fullText: options.fullText,
      cell: (row) => {
        if (!row.attendance) {
          return <span className="text-slate-300 text-[12px]">미기록</span>;
        }
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <StatusEditor
              childId={row.id}
              attendance={row.attendance}
              onStatusChange={onStatusChange}
            />
          </div>
        );
      },
    },
  ];

  return (
    <ResourceTable
      data={rows}
      rowKey={(r) => r.id}
      options={options}
      columns={columns}
      renderExpanded={(row) => (
        <ChildExpandedPanel row={row} onStatusChange={onStatusChange} />
      )}
    />
  );
}

// ─── 펼쳐진 영역 ────────────────────────────────────────────────

function ChildExpandedPanel({
  row,
  onStatusChange,
}: {
  row: ChildRow;
  onStatusChange: Props["onStatusChange"];
}) {
  const c = row.original;
  const att = row.attendance;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50/70 border-l-4 border-brand-300 rounded-r-lg">
      {/* 보호자 정보 */}
      <section>
        <Header4 icon={UserCircle2}>보호자</Header4>
        <KV label="이름" value={c.guardian.name} />
        <KV label="관계" value={c.guardian.relation} />
        <KV label="연락처">
          <a href={`tel:${c.guardian.phone}`} className="text-brand-600 hover:underline">
            {c.guardian.phone}
          </a>
        </KV>
        {c.guardian.job && <KV label="직업" value={c.guardian.job} />}
        {c.emergencyContact && (
          <>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-2 mb-1 tracking-wider">
              비상 연락처
            </div>
            <KV label="이름" value={c.emergencyContact.name} />
            <KV label="연락처">
              <a
                href={`tel:${c.emergencyContact.phone}`}
                className="text-brand-600 hover:underline"
              >
                {c.emergencyContact.phone}
              </a>
            </KV>
          </>
        )}
      </section>

      {/* 보건 정보 */}
      <section>
        <Header4 icon={Stethoscope}>보건</Header4>
        <KV label="생년월일" value={c.birthDate} />
        <KV label="성별" value={c.gender === "M" ? "남" : "여"} />
        <KV label="정원 그룹" value={`${c.capacityGroup}명`} />
        <div className="mt-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
            알레르기
          </div>
          {c.health.allergies.length === 0 ? (
            <span className="text-[12px] text-slate-400">없음</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {c.health.allergies.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
        {c.health.medications.length > 0 && (
          <div className="mt-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
              복용약
            </div>
            <div className="text-[12px] text-slate-700 space-y-0.5">
              {c.health.medications.map((m) => (
                <div key={m} className="flex items-center gap-1">
                  <Pill className="w-3 h-3 text-violet-500" />
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}
        {c.health.notes && (
          <div className="mt-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
              메모
            </div>
            <p className="text-[12px] text-slate-700 leading-relaxed">{c.health.notes}</p>
          </div>
        )}
      </section>

      {/* 등록 / 출석 */}
      <section>
        <Header4 icon={ClipboardList}>등록 / 출석</Header4>
        <KV label="등록일" value={c.enrolledAt} />
        <KV label="상태" value={c.status === "active" ? "재학" : c.status} />
        {att && (
          <>
            <div className="mt-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
                오늘
              </div>
              <div className="text-[13px] text-slate-900 font-semibold">{att.status}</div>
              {att.arrivedAt && (
                <div className="text-[11px] text-slate-500 mt-0.5">
                  등원 {att.arrivedAt}
                  {att.leftAt && ` / 하원 ${att.leftAt}`}
                </div>
              )}
              {att.reason && (
                <div className="text-[11px] text-slate-500 mt-1">사유: {att.reason}</div>
              )}
              {att.guardianNotified && (
                <div className="text-[10px] text-emerald-600 mt-1">✓ 보호자 통보됨</div>
              )}
              <div className="mt-2">
                <StatusEditor
                  childId={c.id}
                  attendance={att}
                  onStatusChange={onStatusChange}
                />
              </div>
            </div>
          </>
        )}
        <div className="mt-2 flex gap-2">
          <Link
            href={`/children/${c.id}`}
            className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline"
          >
            상세 보기 →
          </Link>
          <Link
            href={`/children/${c.id}/documents`}
            className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline"
          >
            문서 →
          </Link>
        </div>
      </section>
    </div>
  );
}

function Header4({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700 mb-2 mt-1">
      <Icon className="w-3.5 h-3.5 text-brand-500" />
      {children}
    </h4>
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