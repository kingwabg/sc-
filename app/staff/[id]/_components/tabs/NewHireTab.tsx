"use client";

import type { StaffNewHireInfo } from "@/lib/features/staff/types";
import { FileCheck, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  newHire: StaffNewHireInfo;
}

const DocStatus = ({ value }: { value?: string | null }) => {
  if (!value || value === "미제출" || value === "미적용") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <AlertCircle className="w-3 h-3" />
        {value ?? "미제출"}
      </span>
    );
  }
  if (value === "Y") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <CheckCircle2 className="w-3 h-3" />
        제출완료
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
      <FileCheck className="w-3 h-3" />
      {value}
    </span>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-4 mb-2 first:mt-0">
    {children}
  </h3>
);

const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
    <span className="w-40 shrink-0 text-right text-xs text-slate-500">{label}</span>
    <span className="text-sm text-slate-800">{value ?? <span className="text-slate-300">—</span>}</span>
  </div>
);

export function NewHireTab({ newHire }: Props) {
  return (
    <div className="max-w-2xl">
      {/* 채용 정보 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-indigo-500" />
          채용 공고 및 서류
        </h2>
        <Row label="채용공고" value={newHire.recruitAnnouncement} />
        <Row label="입사서류" value={newHire.applicationDoc} />
        <Row label="졸업증명서" value={newHire.graduationCertificate} />
        <Row label="기타서류1" value={newHire.etcDoc1} />
        <Row label="기타서류2" value={newHire.etcDoc2} />
        <Row label="기타서류3" value={newHire.etcDoc3} />
      </div>

      {/* 행정 서류 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mt-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-indigo-500" />
          행정 서류
        </h2>
        <div className="grid grid-cols-2 gap-x-6">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs text-slate-500">주민등록등본</span>
            <DocStatus value={newHire.residentRegistration} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs text-slate-500">졸업증명서</span>
            <DocStatus value={newHire.graduationCertificate} />
          </div>
        </div>
      </div>

      {/* 법적 의무 서류 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mt-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          법적 의무 서류
        </h2>
        <div className="grid grid-cols-2 gap-x-6">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs text-slate-500">성범죄경력조회</span>
            <DocStatus value={newHire.criminalRecordCheck} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs text-slate-500">아동학대금지서약</span>
            <DocStatus value={newHire.childAbusePledge} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs text-slate-500">고용보험</span>
            <DocStatus value={newHire.employmentInsurance} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs text-slate-500">산재보험</span>
            <DocStatus value={newHire.industrialAccident} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs text-slate-500">국민연금</span>
            <DocStatus value={newHire.nationalPension} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs text-slate-500">건강보험</span>
            <DocStatus value={newHire.healthInsurance} />
          </div>
        </div>
      </div>
    </div>
  );
}
