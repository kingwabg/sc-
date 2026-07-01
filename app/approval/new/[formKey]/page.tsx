"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalSidebar } from "@/app/approval/_components/ApprovalSidebar";
import { RichEditor } from "@/components/editor/RichEditor";
import {
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  Eye,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  Paperclip,
  PaperclipIcon,
  X,
  Plus,
  UserPlus,
} from "lucide-react";
import { getFormByKey, type FormField } from "@/lib/features/approval-form";
import { getDefaultApprovalLine, type ApprovalLineStepData } from "@/lib/features/approval-line";
import { cn } from "@/lib/utils";
import type { ApprovalView } from "@/lib/types/approval";
import { POSITION_LABELS } from "@/lib/features/staff";

// ─── Props ─────────────────────────────────────────────────
interface Props {
  params: Promise<{ formKey: string }>;
}

const STEPS = ["양식 작성", "결재선", "미리보기"] as const;
type Step = (typeof STEPS)[number];

// ─── Page ─────────────────────────────────────────────────
export default function ApprovalFormWizardPage({ params }: Props) {
  const { formKey } = use(params);
  const router = useRouter();

  const form = getFormByKey(formKey as Parameters<typeof getFormByKey>[0]);
  if (!form) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-slate-400">
          알 수 없는 양식입니다.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <ApprovalSidebar currentFolder="new" />
        <main>
          <WizardShell formKey={formKey as Parameters<typeof getFormByKey>[0]} form={form} />
        </main>
      </div>
    </AppShell>
  );
}

// ─── Wizard Shell ──────────────────────────────────────────
function WizardShell({
  formKey,
  form,
}: {
  formKey: Parameters<typeof getFormByKey>[0];
  form: NonNullable<ReturnType<typeof getFormByKey>>;
}) {
  const [step, setStep] = useState<Step>("양식 작성");
  const [values, setValues] = useState<Record<string, string>>({});
  const [overview, setOverview] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentStepIndex = STEPS.indexOf(step);

  function handleFieldChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    e.target.value = "";
  }
  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, ix) => ix !== i));
  }

  const canGoNext =
    step === "양식 작성"
      ? form.fields.filter((f) => f.required).every((f) => values[f.key]?.trim())
      : true;

  if (submitted) {
    return <SubmitSuccess />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      {/* ── 헤더 ── */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{form.emoji}</span>
          <h1 className="text-lg font-bold text-slate-900 m-0">{form.label}</h1>
        </div>
        <button
          type="button"
          onClick={() => (typeof window !== "undefined" ? (window.location.href = "/approval/new") : null)}
          className="text-xs text-slate-500 hover:text-slate-900 transition"
        >
          ← 양식 선택
        </button>
      </div>

      {/* ── 단계 인디케이터 ── */}
      <StepIndicator steps={STEPS} current={step} />

      {/* ── 본문 ── */}
      <div className="min-h-[480px]">
        {step === "양식 작성" && (
          <Step1Fields
            form={form}
            values={values}
            overview={overview}
            files={files}
            onFieldChange={handleFieldChange}
            onOverviewChange={setOverview}
            onFileChange={handleFileChange}
            onRemoveFile={removeFile}
          />
        )}
        {step === "결재선" && (
          <Step2ApprovalLine formKey={formKey} />
        )}
        {step === "미리보기" && (
          <Step3Preview
            form={form}
            values={values}
            overview={overview}
            files={files}
            onShow={() => setShowPreview(true)}
          />
        )}
      </div>

      {/* ── 하단 액션 ── */}
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/40">
        <button
          onClick={() => {
            const idx = STEPS.indexOf(step);
            if (idx > 0) setStep(STEPS[idx - 1]);
          }}
          disabled={currentStepIndex === 0}
          className={cn(
            "h-9 px-4 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold transition",
            currentStepIndex === 0
              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          이전
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="h-9 px-4 inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </button>
          <button
            className="h-9 px-4 inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
          >
            <Save className="w-4 h-4" />
            임시저장
          </button>
          {currentStepIndex < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(STEPS[currentStepIndex + 1])}
              disabled={!canGoNext}
              className="h-9 px-4 inline-flex items-center gap-1.5 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="h-10 px-5 inline-flex items-center gap-1.5 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
              결재 상신
            </button>
          )}
        </div>
      </div>

      {/* ── 미리보기 모달 ── */}
      {showPreview && (
        <PreviewModal
          form={form}
          values={values}
          overview={overview}
          files={files}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

// ─── Step 1: Fields ────────────────────────────────────────
function Step1Fields({
  form,
  values,
  overview,
  files,
  onFieldChange,
  onOverviewChange,
  onFileChange,
  onRemoveFile,
}: {
  form: NonNullable<ReturnType<typeof getFormByKey>>;
  values: Record<string, string>;
  overview: string;
  files: File[];
  onFieldChange: (key: string, value: string) => void;
  onOverviewChange: (v: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (i: number) => void;
}) {
  // Split fields into full and half width
  const rows: (FormField | FormField[])[] = [];
  let i = 0;
  while (i < form.fields.length) {
    const f = form.fields[i];
    if (f.half && i + 1 < form.fields.length) {
      const next = form.fields[i + 1];
      if (next.half) {
        rows.push([f, next]);
        i += 2;
        continue;
      }
    }
    rows.push(f);
    i++;
  }

  return (
    <div className="divide-y divide-slate-100">
      {/* 양식명 헤더 */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold text-slate-900">{form.label}</h2>
      </div>

      {/* 양식 필드 테이블 */}
      <table className="w-full text-sm border-collapse">
        <tbody>
          {rows.map((row, ri) => {
            if (Array.isArray(row)) {
              const [left, right] = row as [import("@/lib/features/approval-form").FormField, import("@/lib/features/approval-form").FormField];
              return (
                <tr key={ri}>
                  <FieldCell field={left} value={values[left.key] ?? ""} onChange={(v) => onFieldChange(left.key, v)} />
                  <FieldCell field={right} value={values[right.key] ?? ""} onChange={(v) => onFieldChange(right.key, v)} />
                </tr>
              );
            }
            const single = row as import("@/lib/features/approval-form").FormField;
            return (
              <tr key={ri}>
                <FieldCell field={single} value={values[single.key] ?? ""} onChange={(v) => onFieldChange(single.key, v)} />
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 본문 에디터 */}
      {form.hasEditor && (
        <div className="px-5 py-4 bg-slate-50/30">
          <div className="text-[11px] font-semibold text-slate-600 mb-2">상세 내용</div>
          <RichEditor
            value={overview}
            onChange={onOverviewChange}
            placeholder="결재 사유와 상세 내용을 입력하세요..."
            minHeight={200}
          />
        </div>
      )}

      {/* 파일첨부 */}
      {form.hasAttachment && (
        <div className="px-5 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-600">파일첨부</span>
              <span className="text-[10px] text-slate-400">({files.length})</span>
            </div>
            <label className="h-7 px-2.5 inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-700 cursor-pointer transition">
              <PaperclipIcon className="w-3 h-3" />
              파일 추가
              <input type="file" multiple onChange={onFileChange} className="hidden" />
            </label>
          </div>
          {files.length > 0 ? (
            <ul className="space-y-1">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded text-[11px]">
                  <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="flex-1 truncate font-semibold text-slate-700">{f.name}</span>
                  <span className="text-slate-400">{(f.size / 1024).toFixed(1)}KB</span>
                  <button onClick={() => onRemoveFile(i)} className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-[11px] text-slate-400 border border-dashed border-slate-200 rounded px-3 py-2 text-center">
              첨부된 파일이 없습니다
            </div>
          )}
        </div>
      )}

      {/* 제목 */}
      <div className="px-5 py-4">
        <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
          제목 <span className="text-red-500">*</span>
        </div>
        <input
          value={values._title ?? ""}
          onChange={(e) => onFieldChange("_title", e.target.value)}
          placeholder={form.titlePlaceholder}
          className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
        />
      </div>
    </div>
  );
}

// ─── Field Cell ────────────────────────────────────────────
function FieldCell({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <th className="w-[130px] px-4 py-2.5 text-[11px] font-semibold text-slate-600 bg-slate-50/60 border-b border-r border-slate-100 text-left align-middle">
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
      </th>
      <td className="px-3 py-1.5 border-b border-slate-100">
        {field.type === "select" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-9 px-2.5 text-[13px] bg-transparent outline-none rounded-md border border-slate-200 hover:bg-slate-50 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition"
          >
            <option value="">선택하세요</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-2.5 py-1.5 text-[13px] bg-transparent outline-none rounded-md border border-slate-200 hover:bg-slate-50 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition resize-none"
          />
        ) : field.type === "number" ? (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full h-9 px-2.5 text-[13px] bg-transparent outline-none rounded-md border border-slate-200 hover:bg-slate-50 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition"
          />
        ) : (
          <input
            type={field.type === "date" ? "date" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full h-9 px-2.5 text-[13px] bg-transparent outline-none rounded-md border border-slate-200 hover:bg-slate-50 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition"
          />
        )}
      </td>
    </>
  );
}

// ─── Step 2: Approval Line ──────────────────────────────────
function Step2ApprovalLine({ formKey }: { formKey: string }) {
  const line = getDefaultApprovalLine("t_acme", formKey as Parameters<typeof getDefaultApprovalLine>[1]);

  return (
    <div className="p-6 space-y-6">
      {/* 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed">
          <b>자동 제안된 결재선</b>입니다. 필요 시 단계를 추가/삭제/순서 변경할 수 있습니다.
        </div>
      </div>

      {/* 결재선 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-800">결재선</span>
          <span className="text-[11px] text-slate-400">({line.steps.length}단계)</span>
        </div>

        <ol className="space-y-2">
          {line.steps.map((s) => (
            <li key={s.step} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
              {/* 순서 */}
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 grid place-items-center text-xs font-bold shrink-0">
                {s.step}
              </div>
              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                <div className="text-xs text-slate-500">{POSITION_LABELS[s.position as keyof typeof POSITION_LABELS] ?? s.position}</div>
              </div>
              {/* 유형 */}
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                s.type === "결재" ? "bg-brand-50 text-brand-700" :
                s.type === "협조" ? "bg-violet-50 text-violet-700" :
                s.type === "참조" ? "bg-slate-100 text-slate-600" :
                "bg-emerald-50 text-emerald-700"
              )}>
                {s.type}
              </span>
              {/* 상태 */}
              <span className="text-[10px] text-slate-400">대기</span>
              {/* 삭제 */}
              <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ol>

        {/* 결재선 추가 */}
        <button className="mt-3 w-full h-9 border-2 border-dashed border-slate-300 rounded-xl text-xs text-slate-500 hover:border-brand-400 hover:text-brand-600 transition flex items-center justify-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          결재선 추가
        </button>

        {/* 참석자/참조자 추가 */}
        <button className="mt-2 w-full h-9 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-50 transition flex items-center justify-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5" />
          참조자/협조자 추가
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Preview ────────────────────────────────────────
function Step3Preview({
  form,
  values,
  overview,
  files,
  onShow,
}: {
  form: NonNullable<ReturnType<typeof getFormByKey>>;
  values: Record<string, string>;
  overview: string;
  files: File[];
  onShow: () => void;
}) {
  return (
    <div className="p-6 space-y-4">
      <div className="text-center py-4 border-b border-slate-200">
        <div className="text-2xl font-bold text-slate-900">{form.label}</div>
        <div className="text-lg font-bold text-slate-800 mt-2">{values._title || "(제목 없음)"}</div>
      </div>

      {/* 필드 요약 */}
      <table className="w-full text-sm">
        <tbody>
          {form.fields
            .filter((f) => values[f.key])
            .map((f) => (
              <tr key={f.key} className="border-b border-slate-100">
                <th className="w-[130px] px-4 py-2 text-[11px] font-semibold text-slate-600 bg-slate-50/60 text-left">
                  {f.label}
                </th>
                <td className="px-4 py-2 text-[13px] text-slate-900">{values[f.key]}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* 본문 */}
      {overview && (
        <div className="border-t border-slate-200 pt-4">
          <div className="text-[11px] font-semibold text-slate-500 mb-2">상세 내용</div>
          <div className="prose prose-sm max-w-none text-slate-700 px-1" dangerouslySetInnerHTML={{ __html: overview }} />
        </div>
      )}

      {/* 파일 */}
      {files.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <div className="text-[11px] font-semibold text-slate-500 mb-2">첨부파일 ({files.length})</div>
          {files.map((f, i) => (
            <div key={i} className="text-xs text-slate-600">· {f.name} ({(f.size / 1024).toFixed(1)}KB)</div>
          ))}
        </div>
      )}

      {/* 안내 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          상신 후에는 수정이 제한됩니다. 내용을 확인하신 후 <b>결재 상신</b> 버튼을 눌러주세요.
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal ─────────────────────────────────────────
function PreviewModal({
  form,
  values,
  overview,
  files,
  onClose,
}: {
  form: NonNullable<ReturnType<typeof getFormByKey>>;
  values: Record<string, string>;
  overview: string;
  files: File[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 m-0">미리보기</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="text-lg font-bold text-slate-900">{form.label}</div>
            <div className="text-xl font-bold text-slate-900 mt-3">{values._title || "(제목 없음)"}</div>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {form.fields.filter((f) => values[f.key]).map((f) => (
                <tr key={f.key} className="border-b border-slate-100">
                  <th className="w-[130px] px-3 py-2 text-[11px] font-semibold text-slate-600 bg-slate-50/60 text-left">{f.label}</th>
                  <td className="px-3 py-2 text-[13px] text-slate-900">{values[f.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {overview && (
            <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: overview }} />
          )}
          {files.length > 0 && (
            <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
              <div className="font-semibold mb-1">첨부파일 ({files.length})</div>
              {files.map((f, i) => <div key={i}>· {f.name}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step Indicator ────────────────────────────────────────
function StepIndicator({ steps, current }: { steps: readonly string[]; current: string }) {
  const currentIndex = steps.indexOf(current);
  return (
    <div className="border-b border-slate-200 px-6 py-3 flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={cn(
              "w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold",
              i < currentIndex
                ? "bg-emerald-100 text-emerald-700"
                : i === currentIndex
                  ? "bg-brand-100 text-brand-700 ring-2 ring-brand-300"
                  : "bg-slate-100 text-slate-400"
            )}
          >
            {i < currentIndex ? "✓" : i + 1}
          </div>
          <span
            className={cn(
              "text-xs font-semibold",
              i === currentIndex ? "text-brand-700" : "text-slate-400"
            )}
          >
            {s}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "w-8 h-px mx-1",
                i < currentIndex ? "bg-emerald-300" : "bg-slate-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Submit Success ────────────────────────────────────────
function SubmitSuccess() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">결재가 상신되었습니다</h2>
        <p className="text-sm text-slate-500 mb-6">
          결재 요청이 정상적으로 등록되었습니다.<br />
          결재 진행 상황은 결재 대장 에서 확인하실 수 있습니다.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="/approval"
            className="h-10 px-5 inline-flex items-center gap-1.5 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition shadow-sm"
          >
            결재 대장 보기
          </a>
          <a
            href="/approval/new"
            className="h-10 px-5 inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
          >
            새 결재 작성
          </a>
        </div>
      </div>
    </div>
  );
}
