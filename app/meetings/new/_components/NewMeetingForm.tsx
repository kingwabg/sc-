/**
 * app/meetings/new/_components/NewMeetingForm.tsx
 *
 * 신규 회의록 작성 폼
 * - 회의 종류 선택 (아동자치 / 운영위원회 / 종사자)
 * - 운영위원회 선택 시 결재 자동 트리거 안내 배너
 * - POST /api/meetings
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Textarea, Button } from "rsuite";
import { Save, Users, Building2, Briefcase, ShieldCheck, Info } from "lucide-react";
import {
  MEETING_TYPE_LABEL,
  MEETING_TYPE_TONE,
  FIELD_TYPE,
  FIELD_TITLE,
  FIELD_HELD_AT,
  FIELD_LOCATION,
  FIELD_AGENDA,
  FIELD_CONTENT,
  FIELD_ATTENDEES,
  FIELD_ABSENT,
  FIELD_DECISIONS,
  SUBMIT_LABEL,
  SUBMITTING_LABEL,
  CANCEL_LABEL,
  APPROVAL_TRIGGER_TITLE,
  APPROVAL_TRIGGER_DESC_GOVERNANCE,
  APPROVAL_TRIGGER_DESC_OTHER,
} from "@/lib/features/meeting/labels";
import { useToast } from "@/components/ui/Toast";
import type { MeetingType, CreateMeetingResult } from "@/lib/features/meeting/types";

export type FormState = {
  type: MeetingType;
  title: string;
  heldAt: string; // YYYY-MM-DDTHH:mm (datetime-local)
  location: string;
  agenda: string;
  content: string;
  attendees: string;
  absent: string;
  decisions: string;
};

const INITIAL: FormState = {
  type: "STAFF",
  title: "",
  heldAt: new Date().toISOString().slice(0, 16),
  location: "",
  agenda: "",
  content: "",
  attendees: "",
  absent: "",
  decisions: "",
};

function parseLines(s: string): string[] {
  return s
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function NewMeetingForm() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setType(t: MeetingType) {
    setForm((f) => ({ ...f, type: t }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("회의 제목을 입력해 주세요");
      return;
    }
    if (!form.heldAt) {
      setError("회의 일시를 입력해 주세요");
      return;
    }
    const heldAtDate = new Date(form.heldAt);
    if (isNaN(heldAtDate.getTime())) {
      setError("회의 일시가 올바른 날짜 형식이 아닙니다");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: form.type,
        title: form.title.trim(),
        heldAt: heldAtDate.toISOString(),
        location: form.location.trim() || null,
        agenda: parseLines(form.agenda),
        content: form.content.trim() || null,
        attendees: parseLines(form.attendees),
        absent: parseLines(form.absent),
        decisions: parseLines(form.decisions),
      };

      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `등록 실패 (${res.status})`);
      }
      const created = (await res.json()) as CreateMeetingResult;
      const meeting = created.meeting;

      if (created.spawnedApproval) {
        toast.success(
          `${MEETING_TYPE_LABEL[meeting.type]} 회의록 저장 — 결재 자동 생성 (${created.spawnedApproval.docNo})`,
        );
      } else {
        toast.success(`${MEETING_TYPE_LABEL[meeting.type]} 회의록 저장 완료`);
      }
      router.push(`/meetings/${meeting.id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "등록 중 오류 발생");
      toast.error("회의록 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  const isGovernance = form.type === "GOVERNANCE";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 결재 자동 트리거 안내 배너 */}
      <div
        className={`rounded-xl border px-3 py-2.5 text-[12.5px] flex items-start gap-2 ${
          isGovernance
            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
            : "bg-slate-50 border-slate-200 text-slate-600"
        }`}
      >
        {isGovernance ? (
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
        ) : (
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
        )}
        <div>
          <div className="font-semibold">{APPROVAL_TRIGGER_TITLE}</div>
          <div className="mt-0.5">
            {isGovernance
              ? APPROVAL_TRIGGER_DESC_GOVERNANCE
              : APPROVAL_TRIGGER_DESC_OTHER}
          </div>
        </div>
      </div>

      {/* 회의 종류 선택 */}
      <div>
        <label className="block text-[13px] font-medium text-slate-700 mb-2">
          {FIELD_TYPE} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <TypeOption
            active={form.type === "CHILD_COUNCIL"}
            onClick={() => setType("CHILD_COUNCIL")}
            icon={<Users className="w-4 h-4" />}
            title={MEETING_TYPE_LABEL.CHILD_COUNCIL}
            subtitle="아동자치 회의"
            tone={MEETING_TYPE_TONE.CHILD_COUNCIL}
          />
          <TypeOption
            active={form.type === "GOVERNANCE"}
            onClick={() => setType("GOVERNANCE")}
            icon={<Building2 className="w-4 h-4" />}
            title={MEETING_TYPE_LABEL.GOVERNANCE}
            subtitle="결재 자동 생성"
            tone={MEETING_TYPE_TONE.GOVERNANCE}
          />
          <TypeOption
            active={form.type === "STAFF"}
            onClick={() => setType("STAFF")}
            icon={<Briefcase className="w-4 h-4" />}
            title={MEETING_TYPE_LABEL.STAFF}
            subtitle="종사자 회의"
            tone={MEETING_TYPE_TONE.STAFF}
          />
        </div>
      </div>

      {/* 제목 / 일시 / 장소 */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-3">
        <FormField label={FIELD_TITLE} required>
          <Input
            value={form.title}
            onChange={(v) => patch("title", v)}
            placeholder="2026년 7월 회의"
          />
        </FormField>
        <FormField label={FIELD_HELD_AT} required>
          <Input
            type="datetime-local"
            value={form.heldAt}
            onChange={(v) => patch("heldAt", v)}
          />
        </FormField>
        <FormField label={FIELD_LOCATION}>
          <Input
            value={form.location}
            onChange={(v) => patch("location", v)}
            placeholder="본관 1층 회의실"
          />
        </FormField>
      </div>

      {/* 안건 / 결정사항 / 참석자 / 결석자 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label={FIELD_AGENDA}>
          <Textarea
            value={form.agenda}
            onChange={(v) => patch("agenda", v)}
            rows={4}
            placeholder={"안건 1\n안건 2"}
          />
        </FormField>
        <FormField label={FIELD_DECISIONS}>
          <Textarea
            value={form.decisions}
            onChange={(v) => patch("decisions", v)}
            rows={4}
            placeholder={"결정 1\n결정 2"}
          />
        </FormField>
        <FormField label={FIELD_ATTENDEES}>
          <Textarea
            value={form.attendees}
            onChange={(v) => patch("attendees", v)}
            rows={3}
            placeholder={"참석자 1\n참석자 2"}
          />
        </FormField>
        <FormField label={FIELD_ABSENT}>
          <Textarea
            value={form.absent}
            onChange={(v) => patch("absent", v)}
            rows={3}
            placeholder={"결석자 (선택)"}
          />
        </FormField>
      </div>

      {/* 본문 */}
      <FormField label={FIELD_CONTENT}>
        <Textarea
          value={form.content}
          onChange={(v) => patch("content", v)}
          rows={6}
          placeholder={"## 안건\n- ...\n\n## 논의\n- ...\n\n## 결정\n- ..."}
        />
      </FormField>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-[13px]">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <Link
          href="/meetings"
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
          {submitting ? SUBMITTING_LABEL : SUBMIT_LABEL}
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
  tone: { bg: string; text: string; border: string; accent: string };
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
        <div
          className={`text-[13px] font-semibold ${active ? tone.text : "text-slate-900"}`}
        >
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