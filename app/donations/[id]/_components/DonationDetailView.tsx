/**
 * app/donations/[id]/_components/DonationDetailView.tsx
 *
 * 후원 상세 본문 (Server Component에 임포트 — sub-component 모음)
 *  - 헤더 (제목/타입/영수증 상태/액션)
 *  - 후원 정보 행
 *  - 영수증 미리보기 (iframe)
 */

import Link from "next/link";
import { Receipt, ArrowLeft, Calendar, Hash, User } from "lucide-react";
import {
  DETAIL_TITLE,
  DONATION_TYPE_LABEL,
  DONATION_TYPE_TONE,
  RECEIPT_LABEL,
} from "@/lib/features/donation/labels";
import {
  formatKRWPlain,
  formatDateKst,
  formatDateKo,
} from "@/lib/features/donation/utils";
import type { Donation } from "@/lib/features/donation/types";
import { DonationDetailActions } from "./DonationDetailActions";

export function DonationDetailView({ donation }: { donation: Donation }) {
  const tone = DONATION_TYPE_TONE[donation.type];
  const isCash = donation.type === "CASH";

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/donations"
          className="inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          목록으로
        </Link>
        <span className="text-[11px] text-slate-400 tabular-nums">
          ID: {donation.id}
        </span>
      </div>

      {/* 헤더 카드 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                {DETAIL_TITLE}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-medium border ${tone.bg} ${tone.text} ${tone.border}`}
              >
                {DONATION_TYPE_LABEL[donation.type]}
              </span>
              {donation.receiptIssued && donation.receiptNumber && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-medium border ${RECEIPT_LABEL.ISSUED_TONE.bg} ${RECEIPT_LABEL.ISSUED_TONE.text} ${RECEIPT_LABEL.ISSUED_TONE.border}`}
                >
                  {RECEIPT_LABEL.ISSUED}
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-500 mt-1 m-0">
              후원자 · 후원 내용 · 영수증 발급
            </p>
          </div>

          <DonationDetailActions
            donationId={donation.id}
            receiptIssued={donation.receiptIssued}
            receiptNumber={donation.receiptNumber}
          />
        </div>
      </div>

      {/* 본문 2컬럼 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 좌측: 후원 정보 */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-5 space-y-4">
          <h2 className="text-[14px] font-semibold text-slate-900 m-0">
            후원 정보
          </h2>

          <DetailRow icon={<User className="w-3.5 h-3.5" />} label="후원자">
            {donation.donorName}
            {donation.donorContact && (
              <span className="ml-2 text-[12px] text-slate-400 tabular-nums">
                ({donation.donorContact})
              </span>
            )}
          </DetailRow>

          {isCash ? (
            <DetailRow icon={<Receipt className="w-3.5 h-3.5" />} label="후원금">
              <span className="text-2xl font-bold tabular-nums text-slate-900">
                {formatKRWPlain(donation.amount)}
              </span>
            </DetailRow>
          ) : (
            <>
              <DetailRow icon={<Receipt className="w-3.5 h-3.5" />} label="물품명">
                <span className="font-medium">{donation.itemName ?? "—"}</span>
              </DetailRow>
              <DetailRow icon={<Receipt className="w-3.5 h-3.5" />} label="수량">
                <span className="font-medium tabular-nums">
                  {donation.itemQty ?? 0}개
                </span>
              </DetailRow>
            </>
          )}

          <DetailRow icon={<Calendar className="w-3.5 h-3.5" />} label="접수일">
            {formatDateKst(donation.receivedAt)}
          </DetailRow>

          {donation.notes && (
            <DetailRow icon={<Receipt className="w-3.5 h-3.5" />} label="비고">
              <p className="text-[13px] text-slate-700 m-0 whitespace-pre-wrap">
                {donation.notes}
              </p>
            </DetailRow>
          )}

          {donation.receiptNumber && (
            <DetailRow icon={<Hash className="w-3.5 h-3.5" />} label="영수증 번호">
              <span className="font-mono font-medium tabular-nums">
                {donation.receiptNumber}
              </span>
              <span className="ml-2 text-[11px] text-slate-400">
                (발급 {formatDateKo(donation.updatedAt)})
              </span>
            </DetailRow>
          )}
        </div>

        {/* 우측: 영수증 미리보기 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-5 py-5 space-y-3">
          <h2 className="text-[14px] font-semibold text-slate-900 m-0">
            영수증 미리보기
          </h2>
          {donation.receiptIssued ? (
            <>
              <div className="text-[12px] text-slate-500">
                우측 버튼으로 새 창에서 영수증을 인쇄할 수 있습니다.
              </div>
              <div className="aspect-[3/4] border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <iframe
                  src={`/api/donations/${donation.id}/receipt`}
                  className="w-full h-full"
                  title={`영수증 ${donation.receiptNumber}`}
                />
              </div>
              <div className="text-[11px] text-slate-400 text-center">
                영수증 번호 {donation.receiptNumber}
              </div>
            </>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <div className="text-[13px] font-medium text-slate-700">
                아직 영수증이 발급되지 않았습니다
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                상단 [영수증 발급] 버튼으로 발급하세요.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-1.5 text-[12px] text-slate-500 w-24 shrink-0">
        {icon}
        {label}
      </div>
      <div className="flex-1 min-w-0 text-[13px] text-slate-900">{children}</div>
    </div>
  );
}
