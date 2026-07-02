"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  FileText,
  Folder,
  Search,
} from "lucide-react";
import { getFormByKey } from "@/lib/features/approval-form";
import { cn } from "@/lib/utils";
import type { ApprovalFormKey } from "@/lib/types/approval";

type FormCategory = {
  id: string;
  label: string;
  items: FormTemplate[];
};

type FormTemplate = {
  id: string;
  label: string;
  description: string;
  category: string;
  retention: string;
  department: string;
  formKey?: ApprovalFormKey;
};

const FORM_CATEGORIES: FormCategory[] = [
  {
    id: "attendance",
    label: "근태",
    items: [
      template("leave", "휴가신청", "연차/반차/병가/경조 휴가 신청", "근태", "5년", "운영관리", "leave"),
      template("absence", "결근사유서", "결근 사유 및 증빙 보고", "근태", "5년", "운영관리"),
      template("leave-of-absence", "휴직원", "휴직 신청 및 기간 승인", "근태", "5년", "운영관리"),
    ],
  },
  {
    id: "hr",
    label: "인사",
    items: [
      template("education", "교육수강신청", "외부 교육/세미나/연수 신청", "인사", "5년", "운영관리", "education"),
      template("education-result", "교육결과보고", "교육 수강 결과 및 비용 정산 보고", "인사", "5년", "운영관리", "report"),
      template("hiring-proposal", "채용품의", "채용 필요성 및 조건 품의", "인사", "5년", "운영관리", "memo"),
      template("hiring-request", "채용요청", "채용 요청 및 승인 절차", "인사", "5년", "운영관리", "memo"),
    ],
  },
  {
    id: "general",
    label: "일반",
    items: [
      template("cooperation", "업무협조", "부서/담당자 간 업무 협조 요청", "일반", "3년", "공통", "memo"),
      template("business-draft", "업무기안", "일반 업무 기안 및 승인", "일반", "3년", "공통", "memo"),
      template("duty-assignment", "업무 분장표", "담당 업무 배분 및 분장표", "일반", "5년", "운영관리", "duty_assignment"),
    ],
  },
  {
    id: "support",
    label: "지원",
    items: [
      template("career-cert-personal", "경력 증명서(개인1)", "개인 경력 증명서 발급 요청", "지원", "3년", "행정"),
      template("certificate-company", "증명신청서(회사)", "회사 제출용 증명서 신청", "지원", "3년", "행정"),
      template("certificate-personal", "증명신청서(개인)", "개인 제출용 증명서 신청", "지원", "3년", "행정"),
      template("transport-service", "운송서비스 이용신청", "운송서비스 이용 요청", "지원", "3년", "행정"),
      template("congratulations-condolences", "경조화신청", "경조화 지원 신청", "지원", "3년", "행정"),
      template("book-purchase", "도서구입신청", "업무용 도서 구매 신청", "지원", "3년", "행정", "purchase"),
      template("business-card", "명함신청", "명함 제작 및 발급 신청", "지원", "3년", "행정"),
      template("vehicle-dispatch", "차량배차신청", "업무 차량 배차 신청", "지원", "3년", "행정"),
      template("employee-card", "사원증발급신청", "사원증 신규/재발급 신청", "지원", "3년", "행정"),
      template("office-supplies", "사무용품신청", "사무용품 구매 및 지급 신청", "지원", "3년", "행정", "purchase"),
    ],
  },
  {
    id: "trip",
    label: "출장",
    items: [
      template("overseas-trip", "해외출장신청", "해외 출장 계획 및 비용 승인", "출장", "5년", "운영관리", "memo"),
      template("domestic-trip", "국내출장신청", "국내 출장 계획 및 비용 승인", "출장", "5년", "운영관리", "memo"),
      template("visa", "비자발급신청", "출장 비자 발급 신청", "출장", "5년", "운영관리"),
    ],
  },
  {
    id: "accounting",
    label: "회계",
    items: [
      template("extra-budget", "추가예산신청", "사업/운영 추가 예산 신청", "회계", "5년", "회계"),
      template("vendor-registration", "신규거래처등록신청", "신규 거래처 등록 및 검토", "회계", "5년", "회계"),
      template("personal-expense", "개인경비 사용내역서", "개인경비 사용 내역 정산", "회계", "5년", "회계", "expense"),
    ],
  },
];

const INITIAL_OPEN = new Set(FORM_CATEGORIES.map((category) => category.id));

export function FormCardSelector() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(INITIAL_OPEN);
  const [selectedId, setSelectedId] = useState("duty-assignment");

  const flatTemplates = useMemo(
    () => FORM_CATEGORIES.flatMap((category) => category.items),
    [],
  );
  const selected = flatTemplates.find((item) => item.id === selectedId) ?? flatTemplates[0];
  const selectedForm = selected.formKey ? getFormByKey(selected.formKey) : undefined;
  const canCreate = !!selected.formKey && !!selectedForm;
  const normalizedQuery = query.trim().toLowerCase();

  const visibleCategories = useMemo(() => {
    if (!normalizedQuery) return FORM_CATEGORIES;

    return FORM_CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        [category.label, item.label, item.description, item.department]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    })).filter((category) => category.items.length > 0);
  }, [normalizedQuery]);

  function toggleCategory(categoryId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  function isOpen(categoryId: string) {
    return normalizedQuery ? true : expanded.has(categoryId);
  }

  function startApproval() {
    if (!canCreate || !selected.formKey) return;
    router.push(`/approval/new/${selected.formKey}`);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
        <FileCheck2 className="w-5 h-5 text-brand-600" />
        <h1 className="text-lg font-bold text-slate-900 m-0">새 결재 작성</h1>
        <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          양식 선택
        </span>
      </div>

      {/* 안내 */}
      <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100">
        <p className="text-xs text-slate-500 m-0">
          카테고리에서 양식을 선택하거나 검색하세요. 양식에 맞는 결재선이 자동 제안됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-[560px]">
        <aside className="border-r border-slate-200 bg-slate-50/50 p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="양식제목"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="space-y-1">
            {visibleCategories.map((category) => {
              const open = isOpen(category.id);
              return (
                <div key={category.id}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] font-bold text-slate-700 transition hover:bg-white"
                  >
                    {open ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    <Folder className="h-4 w-4 text-amber-500" />
                    <span className="flex-1">{category.label}</span>
                    <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500">
                      {category.items.length}
                    </span>
                  </button>

                  {open && (
                    <div className="ml-7 space-y-0.5 pb-1">
                      {category.items.map((item) => {
                        const active = item.id === selected.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            onDoubleClick={() => {
                              if (item.formKey) router.push(`/approval/new/${item.formKey}`);
                            }}
                            className={cn(
                              "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] transition",
                              active
                                ? "bg-brand-50 font-bold text-brand-700 ring-1 ring-brand-200"
                                : "text-slate-600 hover:bg-white hover:text-slate-900",
                            )}
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {item.formKey && (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {visibleCategories.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-8 text-center text-xs text-slate-400">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </aside>

        <section className="p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 text-xs font-bold text-brand-600">
                {selected.category}
              </p>
              <h2 className="m-0 text-2xl font-black text-slate-900">
                {selected.label}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {selected.description}
              </p>
            </div>
            <button
              type="button"
              onClick={startApproval}
              disabled={!canCreate}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-bold transition",
                canCreate
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "cursor-not-allowed bg-slate-100 text-slate-400",
              )}
            >
              이 양식으로 작성
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">
              상세정보
            </div>
            <dl className="grid grid-cols-1 divide-y divide-slate-100 text-sm md:grid-cols-[160px_1fr] md:divide-y-0">
              <DetailTerm>제목</DetailTerm>
              <DetailValue>{selected.label}</DetailValue>
              <DetailTerm>전자문서함</DetailTerm>
              <DetailValue>{selected.category}</DetailValue>
              <DetailTerm>보존연한</DetailTerm>
              <DetailValue>{selected.retention}</DetailValue>
              <DetailTerm>기안부서</DetailTerm>
              <DetailValue>{selected.department}</DetailValue>
              <DetailTerm>부서문서함</DetailTerm>
              <DetailValue>미지정</DetailValue>
              <DetailTerm>입력항목</DetailTerm>
              <DetailValue>
                {selectedForm ? `${selectedForm.fields.length}개` : "입력폼 준비 중"}
              </DetailValue>
            </dl>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="m-0 mb-2 text-sm font-bold text-slate-900">작성 상태</h3>
            <p className="m-0 text-xs leading-relaxed text-slate-500">
              {canCreate
                ? "현재 작성 화면이 연결된 양식입니다. 선택 후 작성 버튼을 누르면 결재 작성 단계로 이동합니다."
                : "목록에는 추가했지만 아직 전용 입력폼은 연결되지 않았습니다. 다음 단계에서 양식 필드와 결재선을 붙이면 됩니다."}
            </p>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              전체 {flatTemplates.length}개 양식 · 작성 가능 {flatTemplates.filter((item) => item.formKey).length}개
            </p>
            <button
              onClick={() => router.push("/approval")}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 transition"
            >
              <ArrowLeft className="w-3 h-3" />
              결재 홈으로
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function template(
  id: string,
  label: string,
  description: string,
  category: string,
  retention: string,
  department: string,
  formKey?: ApprovalFormKey,
): FormTemplate {
  return { id, label, description, category, retention, department, formKey };
}

function DetailTerm({ children }: { children: ReactNode }) {
  return (
    <dt className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 md:border-r">
      {children}
    </dt>
  );
}

function DetailValue({ children }: { children: ReactNode }) {
  return (
    <dd className="m-0 border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
      {children}
    </dd>
  );
}
