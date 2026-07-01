/**
 * app/preview/care-log/[id]/page.tsx — CareLog 인쇄 미리보기 Server Component
 *
 * Prisma에서 CareLog를 가져와서 평가단 제출용 HTML 문서로 렌더.
 * 인쇄 시: 브라우저 인쇄(Ctrl/Cmd+P) 또는 "인쇄하기" 버튼 클릭.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { PrintToolbar } from "@/app/preview/_components/PrintToolbar";
import "@/app/preview/print.css";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const careLog = await prisma.careLog.findUnique({ where: { id } });
  return {
    title: careLog ? `돌봄일지 미리보기 — ${careLog.date}` : "돌봄일지 미리보기",
  };
}

/** 카테고리별 배경/글꼴 색상 */
const CATEGORY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  식사:     { bg: "#dcfce7", text: "#166534", label: "🍽 식사" },
  학습:     { bg: "#dbeafe", text: "#1e40af", label: "📚 학습" },
  놀이:     { bg: "#ede9fe", text: "#6d28d9", label: "🎮 놀이" },
  투약:     { bg: "#ffedd5", text: "#9a3412", label: "💊 투약" },
  관찰:     { bg: "#ccfbf1", text: "#115e59", label: "🔍 관찰" },
  특별활동: { bg: "#fce7f3", text: "#9d174d", label: "🎨 특별활동" },
  기타:     { bg: "#f1f5f9", text: "#475569", label: "📋 기타" },
};

/** 날짜 포맷: YYYY-MM-DD → "2026년 6월 28일 (토)" */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return `${year}년 ${month}월 ${day}일 (${dayNames[d.getDay()]})`;
}

export default async function CareLogPreviewPage({ params }: Props) {
  const { id } = await params;
  const careLog = await prisma.careLog.findUnique({
    where: { id },
    include: {
      child: {
        select: { name: true, guardianName: true, guardianRelation: true },
      },
    },
  });

  if (!careLog) notFound();

  const catStyle = CATEGORY_STYLE[careLog.category] ?? CATEGORY_STYLE["기타"];

  // 인쇄용 인라인 스타일
  const s = {
    page: {
      display: "block" as const,
      width: "210mm",
      minHeight: "297mm",
      padding: "25mm",
      margin: "0 auto 20mm",
      background: "white",
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      boxSizing: "border-box" as const,
      fontFamily: '"Pretendard", "Malgun Gothic", "맑은 고딕", sans-serif',
      fontSize: "13px",
      lineHeight: "1.65",
      color: "#1a1a1a",
    },
    container: { maxWidth: "170mm", margin: "0 auto" },
    header: { textAlign: "center" as const, marginBottom: "20px", paddingBottom: "14px", borderBottom: "2px solid #1e40af" },
    docTitle: { fontSize: "20px", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", marginBottom: "4px" },
    docSubtitle: { fontSize: "11px", color: "#9ca3af" },
    meta: {
      display: "flex" as const, gap: "16px", flexWrap: "wrap" as const,
      padding: "10px 14px", background: "#f9fafb",
      border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "20px", fontSize: "12px",
    },
    sectionTitle: {
      fontSize: "12px", fontWeight: 700, color: "#111827",
      padding: "5px 12px", background: "#eff6ff",
      borderLeft: "3px solid #4f46e5", borderRadius: "0 6px 6px 0", marginBottom: "10px",
    },
    contentBox: {
      fontSize: "13px", lineHeight: "1.75", color: "#1f2937",
      whiteSpace: "pre-wrap" as const, padding: "12px",
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px",
    },
    sig: { marginTop: "32px", paddingTop: "14px", borderTop: "1px solid #d1d5db", display: "flex" as const, justifyContent: "flex-end" as const },
  };

  return (
    <>
      {/* ── Screen wrapper (hidden in print) ── */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", background: "#f1f5f9", minHeight: "100vh" }}>
        <PrintToolbar backHref={`/children/${careLog.childId}`} />
        <div style={s.page}>
          <div style={s.container}>
            {/* Header */}
            <div style={s.header}>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", letterSpacing: "0.05em", marginBottom: "4px" }}>서창지역아동센터</div>
              <div style={s.docTitle}>지역아동센터 아동 상담 일지</div>
              <div style={s.docSubtitle}>직종: 사회복지사 (생활복지사)</div>
            </div>

            {/* Meta */}
            <div style={s.meta}>
              <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600, color: "#374151" }}>작성일:</strong><span>{formatDate(careLog.date)}</span></span>
              <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600, color: "#374151" }}>아동명:</strong><span>{careLog.child.name}</span></span>
              <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600, color: "#374151" }}>보호자:</strong><span>{careLog.child.guardianName} ({careLog.child.guardianRelation})</span></span>
              <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600, color: "#374151" }}>작성자:</strong><span>{careLog.authorName}</span></span>
            </div>

            {/* Category */}
            <div style={{ marginBottom: "16px" }}>
              <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: catStyle.bg, color: catStyle.text }}>{catStyle.label}</span>
            </div>

            {/* Content */}
            <div style={{ marginBottom: "20px" }}>
              <div style={s.sectionTitle}>내용</div>
              <div style={s.contentBox}>{careLog.content}</div>
            </div>

            {/* Signature */}
            <div style={s.sig}>
              <div style={{ textAlign: "center" as const, minWidth: "120px" }}>
                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>작성자</div>
                <div style={{ width: "100px", height: "40px", borderBottom: "1px solid #374151", margin: "0 auto 4px" }} />
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{careLog.authorName}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>사회복지사</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Print-only (shown when printing via @media print) ── */}
      <div className="print-preview-page">
        <div style={s.container}>
          <div style={s.header}>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", letterSpacing: "0.05em", marginBottom: "4px" }}>서창지역아동센터</div>
            <div style={s.docTitle}>지역아동센터 아동 상담 일지</div>
            <div style={s.docSubtitle}>직종: 사회복지사 (생활복지사)</div>
          </div>
          <div style={s.meta}>
            <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600 }}>작성일:</strong>{formatDate(careLog.date)}</span>
            <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600 }}>아동명:</strong>{careLog.child.name}</span>
            <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600 }}>보호자:</strong>{careLog.child.guardianName} ({careLog.child.guardianRelation})</span>
            <span style={{ display: "flex", gap: "6px" }}><strong style={{ fontWeight: 600 }}>작성자:</strong>{careLog.authorName}</span>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: catStyle.bg, color: catStyle.text }}>{catStyle.label}</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div style={s.sectionTitle}>내용</div>
            <div style={s.contentBox}>{careLog.content}</div>
          </div>
          <div style={s.sig}>
            <div style={{ textAlign: "center" as const, minWidth: "120px" }}>
              <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>작성자</div>
              <div style={{ width: "100px", height: "40px", borderBottom: "1px solid #374151", margin: "0 auto 4px" }} />
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{careLog.authorName}</div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>사회복지사</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
