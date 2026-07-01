/**
 * app/meetings/[id]/_components/MeetingDetail.tsx
 *
 * 회의록 상세 + 수정 토글
 * - 보기 모드: 회의 내용/안건/참석자/결정사항/결재선 표시
 * - 수정 모드: 폼 (제목/일시/장소/안건/참석자/결석자/결정사항/본문)
 * - GOVERNANCE면 결재선 표시
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Textarea, Button } from "rsuite";
import {
  Pencil,
  Save,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import {
  MEETING_TYPE_LABEL,
  MEETING_TYPE_TONE,
  APPROVAL_STATUS_LABEL,
  DETAIL_EDIT_LABEL,
  FIELD_TITLE,
  FIELD_HELD_AT,
  FIELD_LOCATION,
  FIELD_AGENDA,
  FIELD_CONTENT,
  FIELD_ATTENDEES,
  FIELD_ABSENT,
  FIELD_DECISIONS,
  SUBMIT_LABEL,
  CANCEL_LABEL,
  LABEL_AGENDA,
  LABEL_ATTENDEES,
  LABEL_ABSENT,
  LABEL_DECISIONS,
  LABEL_CONTENT,
  LABEL_APPROVAL,
  LABEL_NO_APPROVAL,
  APPROVAL_LINE_TITLE,
} from "@/lib/features/meeting/labels";
import {
  formatDateTimeKo,
  joinOrDash,
  GOVERNANCE_APPROVAL_LINE,
} from "@/lib/features/meeting/utils";
import { useToast } from "@/components/ui/Toast";
import type { Meeting } from "@/lib/features/meeting/types";

interface Props {
  initial: Meeting;
}

interface EditForm {
  title: string;
  heldAt: string;
  location: string;
  agenda: string;
  content: string;
  attendees: string;
  absent: string;
  decisions: string;
}

function linesToText(arr: string[]): string {
  return (arr ?? []).join("\n");
}

function parseLines(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function toLocalDatetimeInput(d: Date): string {
  // YYYY-MM-DDTHH:mm — datetime-local 형식
  const kst = new Date(d.getTime() + 9 * 3600 * 1000);
  return kst.toISOString().slice(0, 16);
}

export function MeetingDetail({ initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({
    title: initial.title,
    heldAt: toLocalDatetimeInput(new Date(initial.heldAt)),
    location: initial.location ?? "",
    agenda: linesToText(initial.agenda),
    content: initial.content ?? "",
    attendees: linesToText(initial.attendees),
    absent: linesToText(initial.absent),
    decisions: linesToText(initial.decisions),
  });

  function patch<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("회의 제목을 입력해 주세요");
      return;
    }
    const heldAtDate = new Date(form.heldAt);
    if (isNaN(heldAtDate.getTime())) {
      setError("회의 일시가 올바른 날짜 형식이 아닙니다");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/meetings/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          heldAt: heldAtDate.toISOString(),
          location: form.location.trim() || null,
          agenda: parseLines(form.agenda),
          content: form.content.trim() || null,
          attendees: parseLines(form.attendees),
          absent: parseLines(form.absent),
          decisions: parseLines(form.decisions),
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `수정 실패 (${res.status})`);
      }
      toast.success("회의록 수정 완료");
      router.refresh();
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "수정 중 오류 발생");
      toast.error("회의록 수정에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  const tone = MEETING_TYPE_TONE[initial.type];

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-3">
          <Field label={FIELD_TITLE} required>
            <Input
              value={form.title}
              onChange={(v) => patch("title", v)}
              placeholder="2026년 7월 회의"
            />
          </Field>
          <Field label={FIELD_HELD_AT} required>
            <Input
              type="datetime-local"
              value={form.heldAt}
              onChange={(v) => patch("heldAt", v)}
            />
          </Field>
          <Field label={FIELD_LOCATION}>
            <Input
              value={form.location}
              onChange={(v) => patch("location", v)}
              placeholder="본관 1층 회의실"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label={FIELD_AGENDA}>
            <Textarea
              value={form.agenda}
              onChange={(v) => patch("agenda", v)}
              rows={4}
            />
          </Field>
          <Field label={FIELD_DECISIONS}>
            <Textarea
              value={form.decisions}
              onChange={(v) => patch("decisions", v)}
              rows={4}
            />
          </Field>
          <Field label={FIELD_ATTENDEES}>
            <Textarea
              value={form.attendees}
              onChange={(v) => patch("attendees", v)}
              rows={3}
            />
          </Field>
          <Field label={FIELD_ABSENT}>
            <Textarea
              value={form.absent}
              onChange={(v) => patch("absent", v)}
              rows={3}
            />
          </Field>
        </div>

        <Field label={FIELD_CONTENT}>
          <Textarea
            value={form.content}
            onChange={(v) => patch("content", v)}
            rows={6}
          />
        </Field>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-[13px]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            onClick={() => setEditing(false)}
            startIcon={<X className="w-3.5 h-3.5" />}
            disabled={submitting}
          >
            {CANCEL_LABEL}
          </Button>
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

  // 보기 모드
  return (
    <div className="space-y-4">
      {/* 메타 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-medium border ${tone.bg} ${tone.text} ${tone.border}`}
        >
          {MEETING_TYPE_LABEL[initial.type]}
        </span>
        <span className="text-[12px] text-slate-500 tabular-nums">
          {formatDateTimeKo(initial.heldAt)}
        </span>
        {initial.location && (
          <span className="text-[12px] text-slate-500">· {initial.location}</span>
        )}
        <div className="ml-auto">
          <Button
            size="sm"
            appearance="default"
            onClick={() => setEditing(true)}
            startIcon={<Pencil className="w-3.5 h-3.5" />}
          >
            {DETAIL_EDIT_LABEL}
          </Button>
        </div>
      </div>

      {/* 안건 / 결정사항 / 참석자 / 결석자 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DetailBlock label={LABEL_AGENDA} items={initial.agenda} />
        <DetailBlock label={LABEL_DECISIONS} items={initial.decisions} />
        <DetailBlock label={LABEL_ATTENDEES} items={initial.attendees} />
        <DetailBlock label={LABEL_ABSENT} items={initial.absent} />
      </div>

      {/* 본문 */}
      <div>
        <div className="text-[12px] text-slate-400 m-0 mb-1.5">{LABEL_CONTENT}</div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-3 text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">
          {initial.content || "—"}
        </div>
      </div>

      {/* 결재 (GOVERNANCE만) */}
      {initial.type === "GOVERNANCE" && (
        <div>
          <div className="text-[12px] text-slate-400 m-0 mb-1.5">
            {LABEL_APPROVAL}
          </div>
          {initial.approvalId ? (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-3 space-y-2">
              <div className="flex items-center gap-2 text-[12.5px] text-indigo-700 font-medium">
                <ShieldCheck className="w-4 h-4" />
                {APPROVAL_STATUS_LABEL.SPAWNED}
                <Link
                  href={`/approval/doc/${initial.approvalId}`}
                  className="ml-auto inline-flex items-center gap-1 text-indigo-600 hover:underline text-[12px]"
                >
                  결재함 보기
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="text-[11px] text-indigo-600">
                {APPROVAL_LINE_TITLE}
              </div>
              <ol className="space-y-1">
                {GOVERNANCE_APPROVAL_LINE.map((s) => (
                  <li
                    key={s.step}
                    className="flex items-center gap-2 text-[12.5px] text-slate-700"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                      {s.step}
                    </span>
                    <span className="font-medium">{s.position}</span>
                    <span>{s.name}</span>
                    <span className="text-[10.5px] text-slate-400">
                      ({s.status === "current" ? "결재 대기" : "결재 후"})
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div
              className={`inline-flex items-center px-3 py-2 rounded-lg text-[12px] border ${APPROVAL_STATUS_LABEL.PENDING_TONE.bg} ${APPROVAL_STATUS_LABEL.PENDING_TONE.text} ${APPROVAL_STATUS_LABEL.PENDING_TONE.border}`}
            >
              {APPROVAL_STATUS_LABEL.PENDING}
            </div>
          )}
        </div>
      )}

      {initial.type !== "GOVERNANCE" && (
        <div className="text-[11px] text-slate-400">{LABEL_NO_APPROVAL}</div>
      )}

      {/* 마지막 갱신 */}
      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        마지막 수정: {formatDateTimeKo(initial.updatedAt)}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────

function DetailBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-[12px] text-slate-400 m-0 mb-1.5">{label}</div>
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-700">
        {joinOrDash(items)}
      </div>
    </div>
  );
}

function Field({
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