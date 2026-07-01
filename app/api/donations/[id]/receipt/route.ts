/**
 * app/api/donations/[id]/receipt/route.ts
 *
 * GET /api/donations/[id]/receipt — 후원 영수증 HTML (인쇄용)
 *
 * 디자인:
 *  - A4 인쇄 최적화 (@media print)
 *  - Pretendard + 흑백 미니멀 (공식 영수증 톤)
 *  - 후원자 / 후원 종류 / 금액(또는 물품) / 영수증 번호 / 발급일 / 비고
 *  - 회계 검증용 푸터
 *
 * query:
 *  - (없음) — 후원 row의 최신 receiptNumber / issuedAt 사용
 *
 * 응답:
 *  - 200 text/html (브라우저에서 바로 열어서 인쇄 가능)
 *  - 404 — 존재하지 않거나 미발급 후원
 */

import { NextRequest, NextResponse } from "next/server";
import { getDonation, issueReceipt } from "@/lib/features/donation/data";
import {
  formatKRWPlain,
  formatDateKo,
  generateReceiptNumber,
  currentYear,
} from "@/lib/features/donation/utils";
import {
  RECEIPT_TITLE,
  RECEIPT_INSTITUTION,
  RECEIPT_FOOTER,
  DONATION_TYPE_LABEL,
} from "@/lib/features/donation/labels";

export const dynamic = "force-dynamic";

/** ─── 영수증 HTML 빌더 ─────────────────────────────────── */
function buildReceiptHTML(opts: {
  donorName: string;
  donorContact: string | null;
  type: "CASH" | "GOODS";
  amount: number | null;
  itemName: string | null;
  itemQty: number | null;
  receivedAt: Date;
  receiptNumber: string;
  issuedAt: Date;
  notes: string | null;
}): string {
  const {
    donorName,
    donorContact,
    type,
    amount,
    itemName,
    itemQty,
    receivedAt,
    receiptNumber,
    issuedAt,
    notes,
  } = opts;

  const typeText = DONATION_TYPE_LABEL[type]; // "후원금" / "후원물품"
  const contentRow =
    type === "CASH"
      ? `<div class="value">${formatKRWPlain(amount ?? 0)}</div>`
      : `<div class="value">${escapeHtml(itemName ?? "")}${
          itemQty != null ? ` × <strong>${itemQty}</strong>개` : ""
        }</div>`;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>${RECEIPT_TITLE} — ${escapeHtml(receiptNumber)}</title>
  <style>
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
      margin: 0;
      padding: 40px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.6;
    }
    .receipt {
      max-width: 720px;
      margin: 0 auto;
      border: 2px solid #0f172a;
      padding: 36px 40px;
      background: #ffffff;
    }
    .top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .institution {
      font-size: 13px;
      color: #475569;
      margin-top: 6px;
    }
    .receipt-no {
      text-align: right;
    }
    .receipt-no .label {
      font-size: 11px;
      color: #64748b;
      letter-spacing: 0.05em;
    }
    .receipt-no .value {
      font-size: 18px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th, td {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      vertical-align: top;
    }
    th {
      width: 32%;
      background: #f8fafc;
      font-weight: 600;
      color: #475569;
      font-size: 13px;
    }
    td {
      font-size: 15px;
    }
    .amount-row td {
      font-size: 22px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: #0f172a;
    }
    .amount-row .value {
      letter-spacing: -0.02em;
    }
    .footer {
      margin-top: 36px;
      padding-top: 18px;
      border-top: 1px dashed #cbd5e1;
      font-size: 11px;
      color: #64748b;
      line-height: 1.7;
    }
    .footer strong {
      color: #0f172a;
    }
    .issuer-sign {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      gap: 24px;
    }
    .sign-block {
      flex: 1;
      text-align: center;
      font-size: 12px;
      color: #475569;
    }
    .sign-line {
      border-bottom: 1px solid #0f172a;
      height: 60px;
      margin-bottom: 4px;
    }
    .sign-stamp {
      width: 60px;
      height: 60px;
      margin: 4px auto 4px;
      border: 2px dashed #cbd5e1;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
    .no-print {
      margin: 16px 0 24px;
      padding: 12px 16px;
      background: #f1f5f9;
      border-radius: 8px;
      font-size: 13px;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="no-print">
      인쇄하려면 <strong>Cmd/Ctrl + P</strong>를 누르세요. (용지: A4, 여백: 기본)
    </div>

    <div class="top">
      <div>
        <h1 class="title">${RECEIPT_TITLE}</h1>
        <div class="institution">${RECEIPT_INSTITUTION}</div>
      </div>
      <div class="receipt-no">
        <div class="label">RECEIPT NO.</div>
        <div class="value">${escapeHtml(receiptNumber)}</div>
      </div>
    </div>

    <table>
      <tr>
        <th>후원자</th>
        <td>${escapeHtml(donorName)}${
    donorContact
      ? ` <span style="color:#64748b;font-size:13px;">(${escapeHtml(donorContact)})</span>`
      : ""
  }</td>
      </tr>
      <tr>
        <th>후원 종류</th>
        <td>${typeText}</td>
      </tr>
      <tr class="amount-row">
        <th>${type === "CASH" ? "금액" : "물품"}</th>
        <td>${contentRow}</td>
      </tr>
      <tr>
        <th>접수일</th>
        <td>${formatDateKo(receivedAt)}</td>
      </tr>
      <tr>
        <th>발급일</th>
        <td>${formatDateKo(issuedAt)}</td>
      </tr>
      ${
        notes
          ? `<tr>
        <th>비고</th>
        <td>${escapeHtml(notes)}</td>
      </tr>`
          : ""
      }
    </table>

    <div class="issuer-sign">
      <div class="sign-block">
        <div class="sign-line"></div>
        <div>후원자 확인</div>
      </div>
      <div class="sign-block">
        <div class="sign-stamp">(인)</div>
        <div>${RECEIPT_INSTITUTION} 담당자</div>
      </div>
    </div>

    <div class="footer">
      <strong>${RECEIPT_INSTITUTION}</strong><br>
      ${RECEIPT_FOOTER}<br>
      발행번호 ${escapeHtml(receiptNumber)} · 발급일 ${formatDateKo(issuedAt)}
    </div>
  </div>
</body>
</html>`;
}

/** HTML escape — donorName/notes는 사용자 입력 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await ctx.params;

  const donation = await getDonation(id);
  if (!donation) {
    return new NextResponse("후원을 찾을 수 없습니다", { status: 404 });
  }

  // 영수증 발급이 안 된 경우 자동 발급 (멱등)
  let receiptNumber = donation.receiptNumber;
  let issuedAt = donation.updatedAt;

  if (!receiptNumber || !donation.receiptIssued) {
    try {
      const issued = await issueReceipt(id);
      receiptNumber = issued.receiptNumber;
      issuedAt = issued.issuedAt;
    } catch (err) {
      // 발급 실패 → 임시 preview 번호로라도 표시 (개발/POC 친화)
      receiptNumber = generateReceiptNumber(currentYear(), []);
      issuedAt = new Date();
      console.warn("[receipt] issueReceipt failed, using preview:", err);
    }
  }

  const html = buildReceiptHTML({
    donorName: donation.donorName,
    donorContact: donation.donorContact,
    type: donation.type,
    amount: donation.amount,
    itemName: donation.itemName,
    itemQty: donation.itemQty,
    receivedAt: donation.receivedAt,
    receiptNumber,
    issuedAt,
    notes: donation.notes,
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
