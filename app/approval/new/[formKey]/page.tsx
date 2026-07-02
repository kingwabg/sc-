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
} from "lucide-react";
import { getFormByKey, type FormField } from "@/lib/features/approval-form";
import { approvalService, type ApprovalFormKey } from "@/lib/features/approval";
import { cn } from "@/lib/utils";

// ─── Props ─────────────────────────────────────────────────
interface Props {
  params: Promise<{ formKey: string }>;
}

const STEPS = ["양식 선택", "신청서 작성", "결재창"] as const;
type Step = (typeof STEPS)[number];
type RightPanelTab = "approval" | "document" | "table";
type TableDensity = "compact" | "regular" | "relaxed";
type TableLabelTone = "gray" | "white" | "blue";
type TableBorderTone = "black" | "soft";
type TableTextAlign = "left" | "center" | "right";
type TableFontSize = "small" | "regular" | "large";
type TableInputHeight = "compact" | "regular" | "large";

interface DocumentTableSettings {
  labelWidth: number;
  density: TableDensity;
  labelTone: TableLabelTone;
  borderTone: TableBorderTone;
  labelAlign: TableTextAlign;
  fontSize: TableFontSize;
  inputHeight: TableInputHeight;
  showRequiredMarker: boolean;
  showInputGuide: boolean;
}

interface ApprovalPerson {
  id: string;
  name: string;
  role: string;
  team: string;
}

const DEFAULT_TABLE_SETTINGS: DocumentTableSettings = {
  labelWidth: 110,
  density: "regular",
  labelTone: "gray",
  borderTone: "black",
  labelAlign: "center",
  fontSize: "regular",
  inputHeight: "regular",
  showRequiredMarker: true,
  showInputGuide: true,
};

const APPROVAL_CANDIDATES: ApprovalPerson[] = [
  { id: "a01", name: "왕준하", role: "센터장", team: "사회복지사" },
  { id: "a02", name: "황인주", role: "사회복지사", team: "사회복지사 2" },
  { id: "a03", name: "박수연", role: "지원교사", team: "센터장 1" },
  { id: "a04", name: "김선영", role: "행정", team: "운영관리" },
];

const APPROVAL_REQUEST_FORM_KEYS = new Set<ApprovalFormKey>([
  "education",
  "leave",
  "expense",
  "purchase",
  "report",
  "memo",
]);

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
  const [approvers, setApprovers] = useState<ApprovalPerson[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentStepIndex = STEPS.indexOf(step);
  const hasDraftContent =
    Object.values(values).some((value) => value.trim().length > 0) ||
    overview.trim().length > 0 ||
    files.length > 0 ||
    approvers.length > 0;

  function handleFieldChange(key: string, value: string) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "start_date" || key === "end_date") {
        const businessDays = getBusinessDays(next.start_date ?? "", next.end_date ?? "");
        next.leave_days = businessDays > 0 ? String(businessDays) : "";
      }
      return next;
    });
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

  function handleSubmitApproval() {
    const title = values._title?.trim() || `${form.label} 데모 결재`;
    const line = (approvers.length > 0 ? approvers : [APPROVAL_CANDIDATES[0]]).map((approver) => ({
      name: approver.name,
      position: approver.role,
    }));
    const requestFormKey = APPROVAL_REQUEST_FORM_KEYS.has(formKey as ApprovalFormKey)
      ? (formKey as ApprovalFormKey)
      : "memo";
    const snippet = [
      form.description,
      values.leave_type ? `휴가종류: ${values.leave_type}` : "",
      values.start_date && values.end_date ? `기간: ${values.start_date} ~ ${values.end_date}` : "",
      values.leave_days ? `사용일수: ${values.leave_days}일` : "",
      values.reason ? `사유: ${values.reason}` : "",
    ].filter(Boolean).join(" · ");

    const req = approvalService.createRequest({
      documentId: `approval-form-${Date.now()}`,
      documentUrl: `/approval/new/${formKey}`,
      documentKind: "other",
      title,
      form: requestFormKey,
      line,
      snippet,
      urgent: false,
      hasFile: files.length > 0,
      requesterName: "김지민",
    });

    router.push(`/approval/doc/${req.id}`);
  }

  function handleSaveDraft() {
    setDraftSaved(true);
  }

  function handleStepClick(nextStep: Step) {
    if (nextStep === step) return;
    if (nextStep === "양식 선택") {
      if (hasDraftContent && !draftSaved) {
        setShowDraftPrompt(true);
        return;
      }
      router.push("/approval/new");
      return;
    }
    setStep(nextStep);
  }

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
          onClick={() => handleStepClick("양식 선택")}
          className="text-xs text-slate-500 hover:text-slate-900 transition"
        >
          ← 양식 선택
        </button>
      </div>

      {/* ── 단계 인디케이터 ── */}
      <StepIndicator steps={STEPS} current={step} onStepClick={handleStepClick} />

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
            approvers={approvers}
            onApproversChange={setApprovers}
          />
        )}
        {step === "결재창" && (
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
              handleStepClick("양식 선택");
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
            onClick={handleSaveDraft}
            className="h-9 px-4 inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
          >
            <Save className="w-4 h-4" />
            {draftSaved ? "저장됨" : "임시저장"}
          </button>
          {currentStepIndex < STEPS.length - 1 ? (
            <button
              onClick={() => setStep("결재창")}
              disabled={!canGoNext}
              className="h-9 px-4 inline-flex items-center gap-1.5 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === "신청서 작성" ? "결재창" : "신청서 작성"}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitApproval}
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

      {showDraftPrompt && (
        <DraftPromptModal
          onSave={() => {
            handleSaveDraft();
            setShowDraftPrompt(false);
            router.push("/approval/new");
          }}
          onCancel={() => {
            setShowDraftPrompt(false);
            router.push("/approval/new");
          }}
          onClose={() => setShowDraftPrompt(false)}
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
  approvers,
  onFieldChange,
  onOverviewChange,
  onFileChange,
  onRemoveFile,
  onApproversChange,
}: {
  form: NonNullable<ReturnType<typeof getFormByKey>>;
  values: Record<string, string>;
  overview: string;
  files: File[];
  approvers: ApprovalPerson[];
  onFieldChange: (key: string, value: string) => void;
  onOverviewChange: (v: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (i: number) => void;
  onApproversChange: (approvers: ApprovalPerson[]) => void;
}) {
  return (
    <DocumentFormTemplate
      form={form}
      values={values}
      overview={overview}
      files={files}
      approvers={approvers}
      onFieldChange={onFieldChange}
      onOverviewChange={onOverviewChange}
      onFileChange={onFileChange}
      onRemoveFile={onRemoveFile}
      onApproversChange={onApproversChange}
    />
  );
}

// ─── Document Template: document-like form ──────────────────
function DocumentFormTemplate({
  form,
  values,
  overview,
  files,
  approvers,
  onFieldChange,
  onOverviewChange,
  onFileChange,
  onRemoveFile,
  onApproversChange,
}: {
  form: NonNullable<ReturnType<typeof getFormByKey>>;
  values: Record<string, string>;
  overview: string;
  files: File[];
  approvers: ApprovalPerson[];
  onFieldChange: (key: string, value: string) => void;
  onOverviewChange: (v: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (i: number) => void;
  onApproversChange: (approvers: ApprovalPerson[]) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>("approval");
  const [tableSettings, setTableSettings] = useState<DocumentTableSettings>(DEFAULT_TABLE_SETTINGS);
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
  const borderColor = tableSettings.borderTone === "black" ? "#000000" : "#64748b";

  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 gap-8 px-6 py-8 xl:grid-cols-[minmax(720px,920px)_220px]">
        <section className="max-w-[920px]">
          <div className="mb-5 grid min-h-[228px] grid-cols-[280px_minmax(0,1fr)_auto] items-start gap-8">
            <table className={cn("mt-[108px] w-[280px] border-collapse text-black", getDocFontClass(tableSettings.fontSize))}>
              <tbody>
                <DocRow label="기안자" value="왕준하" settings={tableSettings} />
                <DocRow label="소속" value="사회복지사" settings={tableSettings} />
                <DocRow label="기안일" value={today} settings={tableSettings} />
                <DocRow label="문서번호" value="" settings={tableSettings} />
              </tbody>
            </table>

            <div className="flex min-h-[92px] items-start justify-center pt-[108px]">
              <h2 className="m-0 text-center text-[28px] font-black tracking-tight text-black">
                {form.label}
              </h2>
            </div>

            <div className="justify-self-end">
              <ApprovalStamp
                approvers={approvers}
                borderColor={borderColor}
                labelBg={getDocLabelBg(tableSettings.labelTone)}
              />
            </div>
          </div>

          <table className={cn("w-full border-collapse text-black", getDocFontClass(tableSettings.fontSize))}>
            <tbody>
              <tr>
                <DocLabel required settings={tableSettings}>제목</DocLabel>
                <td style={{ borderColor }} className={cn("border", getDocCellPadding(tableSettings.density))}>
                  <input
                    value={values._title ?? ""}
                    onChange={(event) => onFieldChange("_title", event.target.value)}
                    placeholder={form.titlePlaceholder}
                    className={getDocInputClass(tableSettings)}
                  />
                </td>
              </tr>

              {isLeaveForm && leaveFields.leaveType && (
                <DocumentFieldRow field={leaveFields.leaveType} value={values.leave_type ?? ""} onChange={(value) => onFieldChange("leave_type", value)} settings={tableSettings} />
              )}
              {isLeaveForm && (leaveFields.startDate || leaveFields.endDate) && (
                <LeavePeriodRow values={values} onFieldChange={onFieldChange} settings={tableSettings} />
              )}
              {isLeaveForm && leaveFields.reason && (
                <DocumentFieldRow field={leaveFields.reason} value={values.reason ?? ""} onChange={(value) => onFieldChange("reason", value)} settings={tableSettings} tall />
              )}

              {regularFields.map((field) => (
                <DocumentFieldRow
                  key={field.key}
                  field={field}
                  value={values[field.key] ?? ""}
                  onChange={(value) => onFieldChange(field.key, value)}
                  settings={tableSettings}
                  tall={field.type === "textarea"}
                />
              ))}

              {form.hasEditor && (
                <tr>
                  <DocLabel required settings={tableSettings}>상세 내용</DocLabel>
                  <td style={{ borderColor }} className={cn("border", getDocCellPadding(tableSettings.density))}>
                    <textarea
                      value={overview}
                      onChange={(event) => onOverviewChange(event.target.value)}
                      placeholder="결재 사유와 상세 내용을 입력하세요"
                      className={cn(
                        "min-h-[120px] w-full resize-none px-2 py-2 outline-none focus:border-black",
                        getDocFontClass(tableSettings.fontSize),
                        tableSettings.showInputGuide ? "border border-slate-300" : "border border-transparent bg-transparent"
                      )}
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

        <DocumentRightPanel
          activeTab={rightPanelTab}
          approvers={approvers}
          form={form}
          settings={tableSettings}
          today={today}
          onApproversChange={onApproversChange}
          onTabChange={setRightPanelTab}
          onSettingsChange={(nextSettings) =>
            setTableSettings((current) => ({ ...current, ...nextSettings }))
          }
        />
      </div>
    </div>
  );
}

function DocumentRightPanel({
  activeTab,
  approvers,
  form,
  settings,
  today,
  onApproversChange,
  onTabChange,
  onSettingsChange,
}: {
  activeTab: RightPanelTab;
  approvers: ApprovalPerson[];
  form: NonNullable<ReturnType<typeof getFormByKey>>;
  settings: DocumentTableSettings;
  today: string;
  onApproversChange: (approvers: ApprovalPerson[]) => void;
  onTabChange: (tab: RightPanelTab) => void;
  onSettingsChange: (settings: Partial<DocumentTableSettings>) => void;
}) {
  const tabs: Array<{ key: RightPanelTab; label: string }> = [
    { key: "approval", label: "결재선" },
    { key: "document", label: "문서정보" },
    { key: "table", label: "표 커스텀" },
  ];

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 overflow-hidden rounded-lg border border-slate-200 bg-white text-[11px] text-slate-700 shadow-sm">
        <div className="flex items-center border-b border-slate-200 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "h-10 flex-1 border-b-2 px-1 text-center font-semibold transition",
                activeTab === tab.key
                  ? "border-slate-900 text-slate-950"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "approval" && (
          <ApprovalLinePanel approvers={approvers} onApproversChange={onApproversChange} />
        )}
        {activeTab === "document" && <DocumentInfoPanel form={form} today={today} />}
        {activeTab === "table" && (
          <TableCustomPanel settings={settings} onSettingsChange={onSettingsChange} />
        )}
      </div>
    </aside>
  );
}

function ApprovalLinePanel({
  approvers,
  onApproversChange,
}: {
  approvers: ApprovalPerson[];
  onApproversChange: (approvers: ApprovalPerson[]) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="space-y-3 p-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            신청
          </div>
          <div className="flex gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-600">
              왕
            </div>
            <div>
              <div className="font-bold text-slate-900">왕준하 팀장</div>
              <div className="mt-1 text-slate-500">사회복지사</div>
              <div className="text-slate-500">기안</div>
            </div>
          </div>
        </div>

        {approvers.length > 0 && (
          <div className="space-y-2">
            {approvers.map((approver, index) => (
              <div key={approver.id} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  승인 {index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 font-bold text-slate-600">
                    {approver.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900">{approver.name} {approver.role}</div>
                    <div className="mt-1 truncate text-slate-500">{approver.team}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onApproversChange(approvers.filter((item) => item.id !== approver.id))}
                    className="text-slate-300 hover:text-red-500"
                    aria-label={`${approver.name} 결재자 제거`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="h-8 w-full rounded-md border border-brand-500 text-[11px] font-semibold text-brand-700 hover:bg-brand-50"
        >
          + 결재자 추가
        </button>
      </div>

      {showModal && (
        <ApprovalLineModal
          approvers={approvers}
          onClose={() => setShowModal(false)}
          onConfirm={(nextApprovers) => {
            onApproversChange(nextApprovers);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

function ApprovalLineModal({
  approvers,
  onClose,
  onConfirm,
}: {
  approvers: ApprovalPerson[];
  onClose: () => void;
  onConfirm: (approvers: ApprovalPerson[]) => void;
}) {
  const [tab, setTab] = useState<"approval" | "reference" | "reader">("approval");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ApprovalPerson[]>(approvers);
  const filteredCandidates = APPROVAL_CANDIDATES.filter((person) =>
    `${person.name} ${person.role} ${person.team}`.toLowerCase().includes(query.toLowerCase())
  );

  function togglePerson(person: ApprovalPerson) {
    setSelected((current) =>
      current.some((item) => item.id === person.id)
        ? current.filter((item) => item.id !== person.id)
        : [...current, person]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-[780px] overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-5">
          <h3 className="text-sm font-bold text-slate-900">결재 정보</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex gap-5 border-b border-slate-200 text-[12px]">
            {[
              ["approval", "결재선"],
              ["reference", "참조자"],
              ["reader", "열람자"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value as "approval" | "reference" | "reader")}
                className={cn(
                  "border-b-2 pb-2 font-semibold",
                  tab === value ? "border-slate-950 text-slate-950" : "border-transparent text-slate-400"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[270px_1fr] gap-3 p-5">
          <section className="border border-slate-200">
            <div className="grid grid-cols-2 border-b border-slate-200 text-center text-[11px] font-semibold">
              <button type="button" className="border-b-2 border-slate-900 py-2 text-slate-900">조직도</button>
              <button type="button" className="py-2 text-slate-400">나의 결재선</button>
            </div>
            <div className="p-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름, 직위, 부서 검색"
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-[12px] outline-none focus:border-brand-400"
              />
            </div>
            <div className="max-h-[230px] space-y-1 overflow-y-auto px-3 pb-3 text-[12px]">
              <div className="py-1 font-bold text-slate-800">⌄ 서창지역아동센터 4</div>
              <div className="pl-4 text-slate-500">› 센터장 1</div>
              <div className="pl-4 font-semibold text-slate-700">⌄ 사회복지사 2</div>
              {filteredCandidates.map((person) => {
                const isSelected = selected.some((item) => item.id === person.id);

                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => togglePerson(person)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition",
                      isSelected ? "bg-brand-50 text-brand-700" : "hover:bg-slate-50"
                    )}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-200 font-bold">
                      {person.name.slice(0, 1)}
                    </span>
                    <span>
                      <span className="block font-bold">{person.name} {person.role}</span>
                      <span className="text-[11px] text-slate-400">{person.team}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="border border-slate-200">
            <div className="grid grid-cols-[70px_1fr_1fr_90px_34px] border-b border-slate-200 bg-slate-50 py-2 text-center text-[11px] font-semibold text-slate-600">
              <span>타입</span>
              <span>이름</span>
              <span>부서</span>
              <span>상태</span>
              <span>삭제</span>
            </div>
            <div className="border-b border-slate-200 bg-white px-3 py-1.5 text-center text-[11px] font-bold text-slate-700">
              신청
            </div>
            <div className="grid grid-cols-[70px_1fr_1fr_90px_34px] items-center border-b border-slate-100 px-3 py-2 text-[12px]">
              <span className="text-slate-500">기안</span>
              <span className="font-semibold text-slate-900">왕준하</span>
              <span className="text-slate-500">사회복지사</span>
              <span className="text-center text-slate-400">고정</span>
              <span />
            </div>
            <div className="border-b border-slate-200 bg-white px-3 py-1.5 text-center text-[11px] font-bold text-slate-700">
              승인
            </div>
            <div className="min-h-[150px]">
              {selected.length === 0 ? (
                <div className="px-4 py-10 text-center text-[12px] text-slate-400">
                  왼쪽 조직도에서 결재자를 선택하세요.
                </div>
              ) : (
                selected.map((person) => (
                  <div
                    key={person.id}
                    className="grid grid-cols-[70px_1fr_1fr_90px_34px] items-center border-b border-slate-100 px-3 py-2 text-[12px]"
                  >
                    <span className="text-slate-500">승인</span>
                    <span className="font-semibold text-slate-900">{person.name}</span>
                    <span className="text-slate-500">{person.team}</span>
                    <span className="text-center text-brand-600">대기</span>
                    <button
                      type="button"
                      onClick={() => togglePerson(person)}
                      className="text-slate-300 hover:text-red-500"
                      aria-label={`${person.name} 제거`}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
          <div className="text-[11px] text-slate-500">
            합의방식: <span className="font-semibold text-brand-700">순차합의</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onConfirm(selected)}
              className="h-9 rounded-md bg-brand-600 px-4 text-[12px] font-bold text-white hover:bg-brand-700"
            >
              확인
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-slate-200 bg-white px-4 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentInfoPanel({
  form,
  today,
}: {
  form: NonNullable<ReturnType<typeof getFormByKey>>;
  today: string;
}) {
  return (
    <div className="space-y-3 p-3">
      <InfoRow label="문서양식" value={form.label} />
      <InfoRow label="기안일" value={today} />
      <InfoRow label="문서번호" value="자동 채번" />
      <div>
        <div className="mb-1 text-slate-500">공개여부</div>
        <div className="flex gap-3">
          <label className="inline-flex items-center gap-1">
            <input type="radio" name="documentVisibility" className="h-3 w-3" />
            공개
          </label>
          <label className="inline-flex items-center gap-1">
            <input type="radio" name="documentVisibility" defaultChecked className="h-3 w-3" />
            비공개
          </label>
        </div>
      </div>
      <div>
        <div className="mb-1 text-slate-500">보존연한</div>
        <select className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-[11px] outline-none focus:border-brand-400">
          <option>5년</option>
          <option>3년</option>
          <option>10년</option>
          <option>영구</option>
        </select>
      </div>
      <div>
        <div className="mb-1 text-slate-500">문서함</div>
        <select className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-[11px] outline-none focus:border-brand-400">
          <option>미지정</option>
          <option>개인 문서함</option>
          <option>부서 문서함</option>
        </select>
      </div>
      <label className="flex items-start gap-2 rounded-md bg-slate-50 p-2 text-slate-500">
        <input type="checkbox" className="mt-0.5 h-3 w-3" />
        <span>긴급문서로 표시</span>
      </label>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-slate-500">{label}</div>
      <div className="font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function TableCustomPanel({
  settings,
  onSettingsChange,
}: {
  settings: DocumentTableSettings;
  onSettingsChange: (settings: Partial<DocumentTableSettings>) => void;
}) {
  return (
    <div className="max-h-[calc(100vh-150px)] space-y-4 overflow-y-auto p-3">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold text-slate-700">라벨 폭</span>
          <span className="text-slate-400">{settings.labelWidth}px</span>
        </div>
        <input
          type="range"
          min={90}
          max={150}
          step={10}
          value={settings.labelWidth}
          onChange={(event) => onSettingsChange({ labelWidth: Number(event.target.value) })}
          className="w-full accent-brand-600"
        />
      </div>

      <div>
        <div className="mb-2 font-semibold text-slate-700">행 높이</div>
        <div className="grid grid-cols-3 gap-1 rounded-md bg-slate-100 p-1">
          {[
            ["compact", "좁게"],
            ["regular", "보통"],
            ["relaxed", "넓게"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onSettingsChange({ density: value as TableDensity })}
              className={cn(
                "h-7 rounded text-[11px] font-semibold transition",
                settings.density === value ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 font-semibold text-slate-700">입력칸 높이</div>
        <div className="grid grid-cols-3 gap-1 rounded-md bg-slate-100 p-1">
          {[
            ["compact", "낮게"],
            ["regular", "보통"],
            ["large", "높게"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onSettingsChange({ inputHeight: value as TableInputHeight })}
              className={cn(
                "h-7 rounded text-[11px] font-semibold transition",
                settings.inputHeight === value ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 font-semibold text-slate-700">글자 크기</div>
        <div className="grid grid-cols-3 gap-1 rounded-md bg-slate-100 p-1">
          {[
            ["small", "작게"],
            ["regular", "보통"],
            ["large", "크게"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onSettingsChange({ fontSize: value as TableFontSize })}
              className={cn(
                "h-7 rounded text-[11px] font-semibold transition",
                settings.fontSize === value ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 font-semibold text-slate-700">라벨 정렬</div>
        <div className="grid grid-cols-3 gap-1 rounded-md bg-slate-100 p-1">
          {[
            ["left", "왼쪽"],
            ["center", "중앙"],
            ["right", "오른쪽"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onSettingsChange({ labelAlign: value as TableTextAlign })}
              className={cn(
                "h-7 rounded text-[11px] font-semibold transition",
                settings.labelAlign === value ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 font-semibold text-slate-700">라벨 배경</div>
        <div className="grid grid-cols-3 gap-1 rounded-md bg-slate-100 p-1">
          {[
            ["gray", "회색"],
            ["white", "흰색"],
            ["blue", "파랑"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onSettingsChange({ labelTone: value as TableLabelTone })}
              className={cn(
                "h-7 rounded text-[11px] font-semibold transition",
                settings.labelTone === value ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 font-semibold text-slate-700">테두리</div>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-slate-100 p-1">
          {[
            ["black", "선명"],
            ["soft", "부드럽게"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onSettingsChange({ borderTone: value as TableBorderTone })}
              className={cn(
                "h-7 rounded text-[11px] font-semibold transition",
                settings.borderTone === value ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
        <span className="font-semibold text-slate-700">입력선 표시</span>
        <input
          type="checkbox"
          checked={settings.showInputGuide}
          onChange={(event) => onSettingsChange({ showInputGuide: event.target.checked })}
          className="h-4 w-4 accent-brand-600"
        />
      </label>

      <label className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
        <span className="font-semibold text-slate-700">필수표시</span>
        <input
          type="checkbox"
          checked={settings.showRequiredMarker}
          onChange={(event) => onSettingsChange({ showRequiredMarker: event.target.checked })}
          className="h-4 w-4 accent-brand-600"
        />
      </label>
    </div>
  );
}

function ApprovalStamp({
  approvers,
  borderColor,
  labelBg,
}: {
  approvers: ApprovalPerson[];
  borderColor: string;
  labelBg: string;
}) {
  const stampPeople = approvers.length > 0 ? approvers : [{ id: "default", name: "왕준하", role: "팀장", team: "사회복지사" }];

  return (
    <table className="border-collapse text-center text-[11px] text-black">
      <tbody>
        <tr>
          <th
            rowSpan={2}
            style={{ borderColor, backgroundColor: labelBg }}
            className="w-7 border p-1 font-bold [writing-mode:vertical-rl]"
          >
            신청
          </th>
          {stampPeople.map((person) => (
            <th
              key={person.id}
              style={{ borderColor }}
              className="h-7 w-[64px] border bg-slate-50 font-medium"
            >
              {person.role}
            </th>
          ))}
        </tr>
        <tr>
          {stampPeople.map((person) => (
            <td key={person.id} style={{ borderColor }} className="h-16 border text-[10px]">
              {person.name}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function LeavePeriodRow({
  values,
  onFieldChange,
  settings,
}: {
  values: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  settings: DocumentTableSettings;
}) {
  const borderColor = settings.borderTone === "black" ? "#000000" : "#64748b";
  const startDate = values.start_date ?? "";
  const endDate = values.end_date ?? "";

  return (
    <tr>
      <DocLabel required settings={settings}>휴가 기간</DocLabel>
      <td style={{ borderColor }} className={cn("border", getDocCellPadding(settings.density))}>
        <div className="grid grid-cols-[150px_12px_150px_auto_64px_20px] items-center gap-1.5">
          <input
            type="date"
            value={startDate}
            onChange={(event) => onFieldChange("start_date", event.target.value)}
            className={getDocInputClass(settings)}
          />
          <span className="text-center">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => onFieldChange("end_date", event.target.value)}
            className={getDocInputClass(settings)}
          />
          <span className="pl-2 font-bold">사용일수:</span>
          <input
            value={values.leave_days ?? ""}
            readOnly
            className={cn(getDocInputClass(settings), "bg-slate-50 text-center font-semibold")}
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
  settings,
  tall,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  settings: DocumentTableSettings;
  tall?: boolean;
}) {
  const borderColor = settings.borderTone === "black" ? "#000000" : "#64748b";

  return (
    <tr>
      <DocLabel required={field.required} settings={settings}>{field.label}</DocLabel>
      <td style={{ borderColor }} className={cn("border", getDocCellPadding(settings.density))}>
        <DocumentFieldInput field={field} value={value} onChange={onChange} settings={settings} tall={tall} />
      </td>
    </tr>
  );
}

function DocumentFieldInput({
  field,
  value,
  onChange,
  settings,
  tall,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  settings: DocumentTableSettings;
  tall?: boolean;
}) {
  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(getDocInputClass(settings), "w-[180px] bg-white")}
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
        className={cn(
          "block min-h-[96px] w-full resize-none px-2 py-2 leading-5 outline-none focus:border-black",
          getDocFontClass(settings.fontSize),
          settings.showInputGuide ? "border border-slate-300" : "border border-transparent bg-transparent"
        )}
      />
    );
  }

  return (
    <input
      type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      className={getDocInputClass(settings)}
    />
  );
}

const DOC_INPUT_CLASS =
  "block w-full border border-slate-300 px-2 outline-none focus:border-black";

function getDocInputClass(settings: DocumentTableSettings) {
  return cn(
    DOC_INPUT_CLASS,
    getDocInputHeightClass(settings.inputHeight),
    getDocFontClass(settings.fontSize),
    !settings.showInputGuide && "border-transparent bg-transparent focus:border-black"
  );
}

function getBusinessDays(startDateValue: string, endDateValue: string) {
  if (!startDateValue || !endDateValue) return 0;
  const startDate = new Date(`${startDateValue}T00:00:00`);
  const endDate = new Date(`${endDateValue}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
  if (startDate > endDate) return 0;

  let days = 0;
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) days += 1;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
}

function getDocCellPadding(density: TableDensity) {
  if (density === "compact") return "p-1";
  if (density === "relaxed") return "p-2.5";
  return "p-1.5";
}

function getDocInputHeightClass(inputHeight: TableInputHeight) {
  if (inputHeight === "compact") return "h-6 leading-6";
  if (inputHeight === "large") return "h-8 leading-8";
  return "h-7 leading-7";
}

function getDocFontClass(fontSize: TableFontSize) {
  if (fontSize === "small") return "text-[11px]";
  if (fontSize === "large") return "text-[13px]";
  return "text-[12px]";
}

function getDocAlignClass(align: TableTextAlign) {
  if (align === "left") return "text-left";
  if (align === "right") return "text-right";
  return "text-center";
}

function getDocLabelBg(tone: TableLabelTone) {
  if (tone === "white") return "#ffffff";
  if (tone === "blue") return "#eff6ff";
  return "#f1f5f9";
}

function DocRow({
  label,
  value,
  settings,
}: {
  label: string;
  value: string;
  settings: DocumentTableSettings;
}) {
  const borderColor = settings.borderTone === "black" ? "#000000" : "#64748b";

  return (
    <tr>
      <th
        style={{ width: settings.labelWidth, borderColor, backgroundColor: getDocLabelBg(settings.labelTone) }}
        className={cn("border px-2 font-bold", getDocCellPadding(settings.density), getDocAlignClass(settings.labelAlign))}
      >
        {label}
      </th>
      <td style={{ borderColor }} className={cn("border px-2", getDocCellPadding(settings.density))}>{value}</td>
    </tr>
  );
}

function DocLabel({
  children,
  required,
  settings,
}: {
  children: React.ReactNode;
  required?: boolean;
  settings: DocumentTableSettings;
}) {
  const borderColor = settings.borderTone === "black" ? "#000000" : "#64748b";

  return (
    <th
      style={{ width: settings.labelWidth, borderColor, backgroundColor: getDocLabelBg(settings.labelTone) }}
      className={cn("border px-2 font-bold", getDocCellPadding(settings.density), getDocAlignClass(settings.labelAlign))}
    >
      {required && settings.showRequiredMarker && <span className="mr-1 text-red-600">*</span>}
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
function StepIndicator({
  steps,
  current,
  onStepClick,
}: {
  steps: readonly Step[];
  current: Step;
  onStepClick: (step: Step) => void;
}) {
  const currentIndex = steps.indexOf(current);

  return (
    <div className="border-b border-slate-200 bg-white px-6">
      <div className="flex h-12 items-center gap-8">
        {steps.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={s} className="flex h-full items-center gap-3">
              <button
                type="button"
                onClick={() => onStepClick(s)}
                className="group flex h-full items-center gap-3"
              >
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold transition",
                    done && "bg-slate-900 text-white group-hover:bg-slate-700",
                    active && "bg-brand-600 text-white",
                    !done && !active && "bg-slate-100 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600",
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={cn(
                    "relative flex h-full items-center text-[12px] font-bold transition",
                    active ? "text-slate-900" : done ? "text-slate-600" : "text-slate-400",
                    !active && "group-hover:text-slate-900",
                    active &&
                      "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand-600",
                  )}
                >
                  {s}
                </span>
              </button>
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

function DraftPromptModal({
  onSave,
  onCancel,
  onClose,
}: {
  onSave: () => void;
  onCancel: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="m-0 text-[15px] font-bold text-slate-900">작성 중인 내용이 있습니다</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <p className="m-0 text-[13px] leading-6 text-slate-600">
            작성된 내용이 있습니다. 양식 선택으로 이동하기 전에 임시저장하시겠습니까?
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            취소하고 이동
          </button>
          <button
            type="button"
            onClick={onSave}
            className="h-9 rounded-lg bg-brand-600 px-4 text-[12px] font-bold text-white hover:bg-brand-700"
          >
            임시저장 후 이동
          </button>
        </div>
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
