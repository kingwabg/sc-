/**
 * app/preview/daily-log/[id]/page.tsx — DailyLog 인쇄 미리보기 Server Component
 *
 * Prisma에서 DailyLog를 가져와서 평가단 제출용 HTML 문서로 렌더.
 * content 필드는 이미정부 공식 양식 HTML이므로 그대로 dangerouslySetInnerHTML로 렌더.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { PrintToolbar } from "@/app/preview/_components/PrintToolbar";
import "@/app/preview/print.css";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const log = await prisma.dailyLog.findUnique({ where: { id } });
  return {
    title: log ? `운영일지 미리보기 — ${log.date}` : "운영일지 미리보기",
  };
}

/** 날짜 포맷: YYYY-MM-DD → "2026년 6월 28일 (토)" */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return `${year}년 ${month}월 ${day}일 (${dayNames[d.getDay()]})`;
}

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  draft:   { label: "임시저장", bg: "#f1f5f9", color: "#475569" },
  pending: { label: "검토중",   bg: "#fef3c7", color: "#92400e" },
  approved:{ label: "승인완료", bg: "#dcfce7", color: "#166534" },
};

export default async function DailyLogPreviewPage({ params }: Props) {
  const { id } = await params;
  const dailyLog = await prisma.dailyLog.findUnique({
    where: { id },
    include: { tenant: { select: { name: true } } },
  });

  if (!dailyLog) notFound();

  const statusMeta = STATUS_META[dailyLog.status] ?? STATUS_META["draft"];

  const s = {
    page: {
      display: "block" as const, width: "210mm", minHeight: "297mm",
      padding: "25mm", margin: "0 auto 20mm", background: "white",
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)", boxSizing: "border-box" as const,
      fontFamily: '"Pretendard", "Malgun Gothic", "맑은 고딕", sans-serif',
      fontSize: "13px", lineHeight: "1.65", color: "#1a1a1a",
    },
    container: { maxWidth: "170mm", margin: "0 auto" },
    header: { textAlign: "center" as const, marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #1e40af" },
    docTitle: { fontSize: "20px", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", marginBottom: "4px" },
    docSubtitle: { fontSize: "11px", color: "#9ca3af" },
    meta: {
      display: "flex" as const, gap: "16px", flexWrap: "wrap" as const,
      padding: "10px 14px", background: "#f9fafb",
      border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "20px", fontSize: "12px",
    },
    sig: { marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #d1d5db", display: "flex" as const, justifyContent: "flex-end" as const },
  };

  return (
    <>
      {/* ── Screen wrapper ── */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", background: "#f1f5f9", minHeight: "100vh" }}>
        <PrintToolbar backHref="/daily-log" />

        <div style={s.page}>
          <div style={s.container}>
            {/* Header */}
            <div style={s.header}>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", letterSpacing: "0.05em", marginBottom: "4px" }}>{dailyLog.tenant.name}</div>
              <div style={s.docTitle}>{dailyLog.title}</div>
              <div style={s.docSubtitle}>{formatDate(dailyLog.date)} · {dailyLog.authorRole} {dailyLog.authorName}</div>
            </div>

            {/* Meta */}
            <div style={s.meta}>
              <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600, color: "#374151" }}>작성일:</strong>{formatDate(dailyLog.date)}</span>
              <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600, color: "#374151" }}>작성자:</strong>{dailyLog.authorName}</span>
              <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600, color: "#374151" }}>직책:</strong>{dailyLog.authorRole}</span>
              <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: statusMeta.bg, color: statusMeta.color }}>{statusMeta.label}</span>
            </div>

            {/* HTML Content */}
            <div dangerouslySetInnerHTML={{ __html: dailyLog.content }} />

            {/* Signature */}
            <div style={s.sig}>
              <div style={{ textAlign: "center" as const, minWidth: "120px" }}>
                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>작성자</div>
                <div style={{ width: "100px", height: "40px", borderBottom: "1px solid #374151", margin: "0 auto 4px" }} />
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{dailyLog.authorName}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>{dailyLog.authorRole}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Print-only ── */}
      <div className="print-preview-page">
        <div style={s.container}>
          <div style={s.header}>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", letterSpacing: "0.05em", marginBottom: "4px" }}>{dailyLog.tenant.name}</div>
            <div style={s.docTitle}>{dailyLog.title}</div>
            <div style={s.docSubtitle}>{formatDate(dailyLog.date)} · {dailyLog.authorRole} {dailyLog.authorName}</div>
          </div>
          <div style={s.meta}>
            <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600 }}>작성일:</strong>{formatDate(dailyLog.date)}</span>
            <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600 }}>작성자:</strong>{dailyLog.authorName}</span>
            <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600 }}>직책:</strong>{dailyLog.authorRole}</span>
            <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: statusMeta.bg, color: statusMeta.color }}>{statusMeta.label}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: dailyLog.content }} />
          <div style={s.sig}>
            <div style={{ textAlign: "center" as const, minWidth: "120px" }}>
              <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>작성자</div>
              <div style={{ width: "100px", height: "40px", borderBottom: "1px solid #374151", margin: "0 auto 4px" }} />
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{dailyLog.authorName}</div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>{dailyLog.authorRole}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
