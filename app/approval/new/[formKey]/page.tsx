"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApprovalSidebar } from "@/app/approval/_components/ApprovalSidebar";
import {
  ChevronRight,
  ChevronLeft,
  Eye,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  List,
} from "lucide-react";
import { getFormByKey, type FormField } from "@/lib/features/approval-form";
import { cn } from "@/lib/utils";

// ─── Props ─────────────────────────────────────────────────
interface Props {
  params: Promise<{ formKey: string }>;
}

const STEPS = ["양식 선택", "신청서 작성", "미리보기"] as const;
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
  const router = useRouter();
  const [step, setStep] = useState<Step>("신청서 작성");
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
    step === "신청서 작성"
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
        {step === "신청서 작성" && (
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
            if (step === "신청서 작성") {
              router.push("/approval/new");
              return;
            }
            setStep("신청서 작성");
          }}
          className={cn(
            "h-9 px-4 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold transition",
            "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
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
              onClick={() => setStep("미리보기")}
              disabled={!canGoNext}
              className="h-9 px-4 inline-flex items-center gap-1.5 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === "신청서 작성" ? "다음" : "신청서 작성"}
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
  return (
    <DocumentFormTemplate
      form={form}
      values={values}
      overview={overview}
      files={files}
      onFieldChange={onFieldChange}
      onOverviewChange={onOverviewChange}
      onFileChange={onFileChange}
      onRemoveFile={onRemoveFile}
    />
  );
}

// ─── Document Template: document-like form ──────────────────
function DocumentFormTemplate({
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
  const today = new Date().toISOString().slice(0, 10);
  const isLeaveForm = form.key === "leave";
  const leaveFields = {
    leaveType: form.fields.find((field) => field.key === "leave_type"),
    startDate: form.fields.find((field) => field.key === "start_date"),
    endDate: form.fields.find((field) => field.key === "end_date"),
    reason: form.fields.find((field) => field.key === "reason"),
  };
  const regularFields = isLeaveForm
    ? form.fields.filter((field) => !["leave_type", "start_date", "end_date", "reason"].includes(field.key))
    : form.fields;

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-2 text-[12px] text-slate-500">
        <div className="flex items-center gap-5">
          <button className="border-b-2 border-slate-900 pb-1 font-bold text-slate-900">
            문서 정보
          </button>
          <button className="pb-1 transition hover:text-slate-900">
            결재 정보
          </button>
          <button className="pb-1 transition hover:text-slate-900">
            첨부·연결
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">자동저장 꺼짐</span>
          <span className="h-3 w-px bg-slate-200" />
          <button className="inline-flex items-center gap-1 text-[11px] hover:text-slate-900">
            <List className="h-3.5 w-3.5" />
            목록
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 px-6 py-8 xl:grid-cols-[minmax(720px,920px)_220px]">
        <section className="max-w-[920px]">
          <h2 className="mb-8 text-center text-[28px] font-black tracking-tight text-black">
            {form.label}
          </h2>

          <div className="mb-5 flex items-end justify-between gap-8">
            <table className="w-[280px] border-collapse text-[12px] text-black">
              <tbody>
                <DocRow label="기안자" value="왕준하" />
                <DocRow label="소속" value="사회복지사" />
                <DocRow label="기안일" value={today} />
                <DocRow label="문서번호" value="" />
              </tbody>
            </table>

            <ApprovalStamp />
          </div>

          <table className="w-full border-collapse text-[12px] text-black">
            <tbody>
              <tr>
                <DocLabel required>제목</DocLabel>
                <td className="border border-black px-2 py-1">
                  <input
                    value={values._title ?? ""}
                    onChange={(event) => onFieldChange("_title", event.target.value)}
                    placeholder={form.titlePlaceholder}
                    className="h-7 w-full border border-slate-300 px-2 text-[12px] outline-none focus:border-black"
                  />
                </td>
              </tr>

              {isLeaveForm && leaveFields.leaveType && (
                <DocumentFieldRow field={leaveFields.leaveType} value={values.leave_type ?? ""} onChange={(value) => onFieldChange("leave_type", value)} />
              )}
              {isLeaveForm && (leaveFields.startDate || leaveFields.endDate) && (
                <LeavePeriodRow values={values} onFieldChange={onFieldChange} />
              )}
              {isLeaveForm && leaveFields.reason && (
                <DocumentFieldRow field={leaveFields.reason} value={values.reason ?? ""} onChange={(value) => onFieldChange("reason", value)} tall />
              )}

              {regularFields.map((field) => (
                <DocumentFieldRow
                  key={field.key}
                  field={field}
                  value={values[field.key] ?? ""}
                  onChange={(value) => onFieldChange(field.key, value)}
                  tall={field.type === "textarea"}
                />
              ))}

              {form.hasEditor && (
                <tr>
                  <DocLabel required>상세 내용</DocLabel>
                  <td className="border border-black p-1">
                    <textarea
                      value={overview}
                      onChange={(event) => onOverviewChange(event.target.value)}
                      placeholder="결재 사유와 상세 내용을 입력하세요"
                      className="min-h-[120px] w-full resize-none border border-slate-300 px-2 py-2 text-[12px] outline-none focus:border-black"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {isLeaveForm ? (
            <div className="mt-4 space-y-1 text-[11px] font-semibold leading-relaxed text-black">
              <p>[당일 반차 신청시] 시작일은 오전/오후 체크</p>
              <p>[예비군/민방위 신청시] 통지서 스캔하여 파일 첨부</p>
              <p>[경조휴가 신청시] 증빙서류 스캔하여 파일 첨부 (예: 청첩장 등본 등)</p>
            </div>
          ) : (
            <div className="mt-4 text-[11px] font-semibold leading-relaxed text-black">
              <p>[작성 안내] 필수 항목을 확인한 뒤 결재선을 지정해 상신하세요.</p>
            </div>
          )}

          <div className="mt-20 grid grid-cols-[90px_1fr] items-center gap-4 text-[12px]">
            <div className="font-bold text-black">파일첨부</div>
            <label className="flex min-h-12 cursor-pointer items-center justify-center rounded border border-dashed border-slate-300 text-[12px] text-slate-500 hover:border-slate-500">
              이곳에 파일을 드래그 하세요 또는 파일선택 ({files.length}MB)
              <input type="file" multiple onChange={onFileChange} className="hidden" />
            </label>
          </div>

          {files.length > 0 && (
            <ul className="mt-2 ml-[106px] space-y-1 text-[11px] text-slate-600">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center gap-2">
                  <span className="flex-1 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 grid grid-cols-[90px_1fr] items-center gap-4 text-[12px]">
            <div className="font-bold text-black">관련문서</div>
            <button className="h-8 w-fit rounded border border-slate-300 px-3 text-[12px] text-slate-700 hover:bg-slate-50">
              문서 검색
            </button>
          </div>
        </section>

        <aside className="hidden xl:block">
          <div className="rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-300 px-3 py-2">
              <button className="text-slate-400">‹</button>
              <div className="flex gap-4 font-bold">
                <span>결재선</span>
                <span className="text-slate-500">문서정보</span>
              </div>
              <button className="text-slate-400">›</button>
            </div>
            <div className="flex gap-2 p-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-slate-400">
                ●
              </div>
              <div>
                <div className="font-bold text-slate-900">왕준하 팀장</div>
                <div className="mt-1 text-slate-500">사회복지사</div>
                <div className="text-slate-500">기안</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ApprovalStamp() {
  return (
    <table className="w-[96px] border-collapse text-center text-[11px] text-black">
      <tbody>
        <tr>
          <th rowSpan={2} className="w-7 border border-black bg-slate-100 p-1 font-bold [writing-mode:vertical-rl]">
            신청
          </th>
          <th className="h-7 border border-black bg-slate-50 font-medium">팀장</th>
        </tr>
        <tr>
          <td className="h-16 border border-black text-[10px]">왕준하</td>
        </tr>
      </tbody>
    </table>
  );
}

function LeavePeriodRow({
  values,
  onFieldChange,
}: {
  values: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
}) {
  return (
    <tr>
      <DocLabel required>휴가 기간</DocLabel>
      <td className="border border-black px-2 py-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            type="date"
            value={values.start_date ?? ""}
            onChange={(event) => onFieldChange("start_date", event.target.value)}
            className="h-7 w-[150px] border border-slate-300 px-2 text-[12px] outline-none focus:border-black"
          />
          <span>~</span>
          <input
            type="date"
            value={values.end_date ?? ""}
            onChange={(event) => onFieldChange("end_date", event.target.value)}
            className="h-7 w-[150px] border border-slate-300 px-2 text-[12px] outline-none focus:border-black"
          />
          <span className="ml-2 font-bold">사용일수:</span>
          <input
            value={values.leave_days ?? ""}
            onChange={(event) => onFieldChange("leave_days", event.target.value)}
            className="h-7 w-[64px] border border-slate-300 px-2 text-[12px] outline-none focus:border-black"
          />
          <span>일</span>
        </div>
      </td>
    </tr>
  );
}

function DocumentFieldRow({
  field,
  value,
  onChange,
  tall,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  tall?: boolean;
}) {
  return (
    <tr>
      <DocLabel required={field.required}>{field.label}</DocLabel>
      <td className="border border-black p-1">
        <DocumentFieldInput field={field} value={value} onChange={onChange} tall={tall} />
      </td>
    </tr>
  );
}

function DocumentFieldInput({
  field,
  value,
  onChange,
  tall,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  tall?: boolean;
}) {
  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 w-[180px] border border-slate-300 bg-white px-2 text-[12px] outline-none focus:border-black"
      >
        <option value="">선택</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea" || tall) {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className="min-h-[96px] w-full resize-none border border-slate-300 px-2 py-2 text-[12px] outline-none focus:border-black"
      />
    );
  }

  return (
    <input
      type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      className="h-7 w-full border border-slate-300 px-2 text-[12px] outline-none focus:border-black"
    />
  );
}

function DocRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th className="w-20 border border-black bg-slate-100 px-2 py-1.5 text-center font-bold">
        {label}
      </th>
      <td className="border border-black px-2 py-1.5">{value}</td>
    </tr>
  );
}

function DocLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <th className="w-[110px] border border-black bg-slate-100 px-2 py-2 text-left font-bold">
      {required && <span className="mr-1 text-red-600">*</span>}
      {children}
    </th>
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
    <div className="border-b border-slate-200 bg-white px-6">
      <div className="flex h-12 items-center gap-8">
        {steps.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={s} className="flex h-full items-center gap-3">
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                  done && "bg-slate-900 text-white",
                  active && "bg-brand-600 text-white",
                  !done && !active && "bg-slate-100 text-slate-400",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "relative flex h-full items-center text-[12px] font-bold",
                  active ? "text-slate-900" : done ? "text-slate-600" : "text-slate-400",
                  active &&
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand-600",
                )}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <span className="h-px w-10 bg-slate-200" />
              )}
            </div>
          );
        })}
      </div>
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
