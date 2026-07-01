/**
 * app/donations/[id]/_components/DonationDetailActions.tsx
 *
 * Client Component — 상세 페이지 액션 (영수증 발급/보기/목록)
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "rsuite";
import {
  FileCheck2,
  ExternalLink,
  Printer,
  RefreshCw,
} from "lucide-react";
import {
  RECEIPT_ISSUE_LABEL,
  RECEIPT_VIEW_LABEL,
} from "@/lib/features/donation/labels";
import { useToast } from "@/components/ui/Toast";

interface Props {
  donationId: string;
  receiptIssued: boolean;
  receiptNumber: string | null;
}

export function DonationDetailActions({
  donationId,
  receiptIssued,
  receiptNumber,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [issuing, setIssuing] = useState(false);

  async function handleIssue() {
    setIssuing(true);
    try {
      const res = await fetch(`/api/donations/${donationId}/issue`, {
        method: "POST",
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `발급 실패 (${res.status})`);
      }
      const data = (await res.json()) as { receiptNumber: string };
      toast.success(`영수증 ${data.receiptNumber} 발급 완료`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("영수증 발급에 실패했습니다");
    } finally {
      setIssuing(false);
    }
  }

  function handleViewReceipt() {
    window.open(`/api/donations/${donationId}/receipt`, "_blank", "noopener");
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!receiptIssued ? (
        <Button
          appearance="primary"
          size="sm"
          loading={issuing}
          disabled={issuing}
          onClick={handleIssue}
          startIcon={<FileCheck2 className="w-3.5 h-3.5" />}
        >
          {RECEIPT_ISSUE_LABEL}
        </Button>
      ) : (
        <>
          <Button
            appearance="primary"
            size="sm"
            onClick={handleViewReceipt}
            startIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            {RECEIPT_VIEW_LABEL}
          </Button>
          <Button
            appearance="default"
            size="sm"
            onClick={() => window.print()}
            startIcon={<Printer className="w-3.5 h-3.5" />}
          >
            인쇄
          </Button>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {receiptNumber}
          </span>
        </>
      )}
      <Button
        appearance="subtle"
        size="sm"
        onClick={() => router.refresh()}
        startIcon={<RefreshCw className="w-3.5 h-3.5" />}
      >
        새로고침
      </Button>
    </div>
  );
}
