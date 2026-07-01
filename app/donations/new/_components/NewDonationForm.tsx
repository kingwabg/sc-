/**
 * app/donations/new/_components/NewDonationForm.tsx
 *
 * 신규 후원 등록 폼 (금전/물품 분기)
 * - new/page.tsx에서 분리 (200줄 룰)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, InputGroup, InputNumber, Textarea, Button } from "rsuite";
import { ArrowLeft, Coins, Package, Save } from "lucide-react";
import Link from "next/link";
import {
  DONATION_TYPE_TONE,
  NEW_DONATION_TITLE,
  NEW_DONATION_DESC,
  SUBMIT_LABEL,
  CANCEL_LABEL,
  TYPE_CASH_LABEL,
  TYPE_GOODS_LABEL,
  FIELD_DONOR_NAME,
  FIELD_DONOR_CONTACT,
  FIELD_TYPE,
  FIELD_AMOUNT,
  FIELD_ITEM_NAME,
  FIELD_ITEM_QTY,
  FIELD_RECEIVED_AT,
  FIELD_NOTES,
} from "@/lib/features/donation/labels";
import { useToast } from "@/components/ui/Toast";
import type { DonationType } from "@/lib/features/donation/types";

export type FormState = {
  donorName: string;
  donorContact: string;
  type: DonationType;
  amount: string;
  itemName: string;
  itemQty: string;
  receivedAt: string;
  notes: string;
};

const INITIAL: FormState = {
  donorName: "",
  donorContact: "",
  type: "CASH",
  amount: "",
  itemName: "",
  itemQty: "",
  receivedAt: new Date().toISOString().slice(0, 10),
  notes: "",
};

export function NewDonationForm() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setType(t: DonationType) {
    setForm((f) => ({
      ...f,
      type: t,
      amount: t === "CASH" ? f.amount : "",
      itemName: t === "GOODS" ? f.itemName : "",
      itemQty: t === "GOODS" ? f.itemQty : "",
    }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.donorName.trim()) {
      setError("후원자 이름을 입력해 주세요");
      return;
    }
    if (form.type === "CASH") {
      const a = Number(form.amount);
      if (!form.amount || isNaN(a) || a <= 0) {
        setError("금액을 0보다 큰 숫자로 입력해 주세요");
        return;
      }
    } else {
      if (!form.itemName.trim()) {
        setError("물품명을 입력해 주세요");
        return;
      }
      const q = Number(form.itemQty);
      if (!form.itemQty || isNaN(q) || q <= 0) {
        setError("수량을 0보다 큰 숫자로 입력해 주세요");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload =
        form.type === "CASH"
          ? {
              donorName: form.donorName.trim(),
              donorContact: form.donorContact.trim() || null,
              type: form.type,
              amount: Number(form.amount),
              receivedAt: form.receivedAt || undefined,
              notes: form.notes.trim() || null,
            }
          : {
              donorName: form.donorName.trim(),
              donorContact: form.donorContact.trim() || null,
              type: form.type,
              itemName: form.itemName.trim(),
              itemQty: Number(form.itemQty),
              receivedAt: form.receivedAt || undefined,
              notes: form.notes.trim() || null,
            };

      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `등록 실패 (${res.status})`);
      }
      const created = (await res.json()) as { id: string };
      toast.success(`${form.donorName} 후원 등록 완료`);
      router.push(`/donations/${created.id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "등록 중 오류 발생");
      toast.error("후원 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 후원 종류 선택 */}
      <div>
        <label className="block text-[13px] font-medium text-slate-700 mb-2">
          {FIELD_TYPE} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <TypeOption
            active={form.type === "CASH"}
            onClick={() => setType("CASH")}
            icon={<Coins className="w-4 h-4" />}
            title={TYPE_CASH_LABEL}
            subtitle="금액 입력"
            tone={DONATION_TYPE_TONE.CASH}
          />
          <TypeOption
            active={form.type === "GOODS"}
            onClick={() => setType("GOODS")}
            icon={<Package className="w-4 h-4" />}
            title={TYPE_GOODS_LABEL}
            subtitle="물품명 + 수량"
            tone={DONATION_TYPE_TONE.GOODS}
          />
        </div>
      </div>

      {/* 후원자 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label={FIELD_DONOR_NAME} required>
          <Input
            value={form.donorName}
            onChange={(v) => patch("donorName", v)}
            placeholder="홍길동"
          />
        </FormField>
        <FormField label={FIELD_DONOR_CONTACT}>
          <Input
            value={form.donorContact}
            onChange={(v) => patch("donorContact", v)}
            placeholder="010-1234-5678 (선택)"
          />
        </FormField>
      </div>

      {/* 타입별 분기 필드 */}
      {form.type === "CASH" ? (
        <FormField label={FIELD_AMOUNT} required>
          <InputGroup>
            <Input
              value={form.amount}
              onChange={(v) => patch("amount", String(v).replace(/[^\d]/g, ""))}
              placeholder="100000"
              inputMode="numeric"
            />
            <InputGroup.Addon>원</InputGroup.Addon>
          </InputGroup>
          <p className="text-[11px] text-slate-400 mt-1">
            {form.amount && Number(form.amount).toLocaleString("ko-KR")}원
          </p>
        </FormField>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3">
          <FormField label={FIELD_ITEM_NAME} required>
            <Input
              value={form.itemName}
              onChange={(v) => patch("itemName", v)}
              placeholder="아동 간식 (스낵팩)"
            />
          </FormField>
          <FormField label={FIELD_ITEM_QTY} required>
            <InputGroup>
              <InputNumber
                value={form.itemQty ? Number(form.itemQty) : null}
                onChange={(v) =>
                  patch("itemQty", v == null ? "" : String(v))
                }
                min={1}
                placeholder="30"
              />
              <InputGroup.Addon>개</InputGroup.Addon>
            </InputGroup>
          </FormField>
        </div>
      )}

      {/* 접수일 + 비고 */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3">
        <FormField label={FIELD_RECEIVED_AT}>
          <Input
            type="date"
            value={form.receivedAt}
            onChange={(v) => patch("receivedAt", v)}
          />
        </FormField>
        <FormField label={FIELD_NOTES}>
          <Textarea
            value={form.notes}
            onChange={(v) => patch("notes", v)}
            rows={2}
            placeholder="비고 (예: 정기 후원, 행사 지원 등)"
          />
        </FormField>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-[13px]">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <Link
          href="/donations"
          className="inline-flex items-center h-9 px-4 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-medium"
        >
          {CANCEL_LABEL}
        </Link>
        <Button
          type="submit"
          appearance="primary"
          loading={submitting}
          startIcon={<Save className="w-3.5 h-3.5" />}
          disabled={submitting}
        >
          {SUBMIT_LABEL}
        </Button>
      </div>
    </form>
  );
}

// ─── Sub-components ──────────────────────────────────────

function TypeOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: { bg: string; text: string; border: string };
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
        active
          ? `${tone.bg} ${tone.border} ring-2 ring-offset-1 ring-indigo-200`
          : "bg-white border-slate-200 hover:border-slate-300"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          active ? tone.bg + " " + tone.text : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`text-[13px] font-semibold ${active ? tone.text : "text-slate-900"}`}>
          {title}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>
      </div>
    </button>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
