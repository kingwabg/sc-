"use client";

/** Screen-only toolbar: print button + back link */
export function PrintToolbar({ backHref }: { backHref: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 20px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        marginBottom: "24px",
      }}
    >
      <button
        onClick={() => window.print()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        🖨 인쇄하기
      </button>
      <a
        href={backHref}
        style={{
          padding: "8px 16px",
          background: "#f1f5f9",
          color: "#374151",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        ← 이전
      </a>
    </div>
  );
}
