"use client";

/**
 * DocumentIndexTable — 통합 문서 인덱스 테이블
 *
 * 5개 소스(HTML docs, HWP, child-card, care-log, child-document)에서
 * write-through로 등록된 모든 문서를 한 테이블에 표시.
 * 클릭 시 sourceUrl로 이동 (원본 위치).
 */
import { useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  FileUp,
  IdCard,
  NotebookPen,
  Paperclip,
  Search,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResourceTable,
  type ColumnDef,
} from "@/components/ui/ResourceTable";
import { DEFAULT_TABLE_OPTIONS } from "@/components/ui/TableOptionsDrawer";
import type {
  DocumentIndexEntry,
  DocumentKind,
} from "@/lib/documents/types";

const KIND_META: Record<DocumentKind, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  "html-doc":       { label: "HTML 문서", icon: FileText,    tone: "bg-indigo-100 text-indigo-700" },
  "hwp-doc":        { label: "HWP",      icon: FileUp,      tone: "bg-rose-100 text-rose-700" },
  "child-card":     { label: "아동카드",  icon: IdCard,      tone: "bg-blue-100 text-blue-700" },
  "care-log":       { label: "돌봄일지",  icon: NotebookPen, tone: "bg-emerald-100 text-emerald-700" },
  "child-document": { label: "아동문서",  icon: Paperclip,   tone: "bg-amber-100 text-amber-700" },
  "approval-doc":   { label: "결재문서",  icon: FileCheck2,  tone: "bg-purple-100 text-purple-700" },
};

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  const date = new Date(ts);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type Row = DocumentIndexEntry & { rowKey: string };

type Props = {
  entries: DocumentIndexEntry[];
  childNameById?: Record<string, string>;
};

export function DocumentIndexTable({ entries, childNameById = {} }: Props) {
  const rows: Row[] = useMemo(
    () => entries.map((e) => ({ ...e, rowKey: `${e.kind}::${e.id}` })),
    [entries],
  );

  const columns: ColumnDef<Row>[] = [
    {
      key: "kind",
      header: "종류",
      width: 130,
      minWidth: 100,
      align: "center",
      cell: (row) => {
        const meta = KIND_META[row.kind];
        const Icon = meta.icon;
        return (
          <span className={cn("inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded font-semibold", meta.tone)}>
            <Icon className="w-3.5 h-3.5" />
            {meta.label}
          </span>
        );
      },
    },
    {
      key: "title",
      header: "제목",
      flexGrow: 3,
      minWidth: 240,
      cell: (row) => (
        <Link
          href={row.sourceUrl}
          className="text-[13px] font-semibold text-slate-900 hover:text-brand-600 hover:underline truncate block"
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: "snippet",
      header: "미리보기",
      flexGrow: 2,
      minWidth: 180,
      cell: (row) =>
        row.snippet ? (
          <span className="text-[12px] text-slate-500 truncate block">{row.snippet}</span>
        ) : (
          <span className="text-slate-300 text-[12px]">—</span>
        ),
    },
    {
      key: "childId",
      header: "아동",
      width: 110,
      align: "center",
      minWidth: 80,
      cell: (row) =>
        row.childId ? (
          <Link
            href={`/children/${row.childId}`}
            className="text-[12px] text-brand-600 hover:underline"
          >
            {childNameById[row.childId] ?? row.childId}
          </Link>
        ) : (
          <span className="text-slate-300 text-[12px]">—</span>
        ),
    },
    {
      key: "authorName",
      header: "작성자",
      width: 110,
      align: "center",
      minWidth: 80,
      cell: (row) => (
        <span className="text-[12px] text-slate-700">{row.authorName}</span>
      ),
    },
    {
      key: "updatedAt",
      header: "수정",
      width: 110,
      align: "center",
      minWidth: 80,
      cell: (row) => (
        <span className="text-[12px] text-slate-500 tabular-nums">
          {formatRelative(row.updatedAt)}
        </span>
      ),
    },
  ];

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 grid place-items-center mb-3">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-[14px] font-semibold text-slate-700">아직 문서가 없어요</p>
        <p className="text-[12px] text-slate-500 mt-1">
          HTML 문서를 작성하거나, 아동카드/돌봄일지/아동문서를 추가하면 자동으로 여기에 보여요.
        </p>
      </div>
    );
  }

  return (
    <ResourceTable
      data={rows}
      rowKey={(r) => r.rowKey}
      options={{
        ...DEFAULT_TABLE_OPTIONS,
        density: "comfortable",
        expandable: false, // 문서 인덱스는 펼침 패널 없음
        fullText: false,
      }}
      columns={columns}
    />
  );
}

export { KIND_META };
