"use client";

import type { StaffProfile } from "@/lib/features/staff/types";
import { formatJumin, formatPhone, maskName, calcYearsOfService } from "@/lib/features/staff/utils";
import { Camera, Upload, Trash2 } from "lucide-react";

interface Props {
  profile: StaffProfile;
  onPhotoUpload?: (file: File) => void;
  onPhotoDelete?: () => void;
}

const FieldRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <tr>
    <th className="w-36 shrink-0 text-right pr-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 align-top">
      {label}
    </th>
    <td className="px-3 py-1.5 text-sm text-slate-800">{value ?? <span className="text-slate-300">—</span>}</td>
  </tr>
);

export function BasicTab({ profile, onPhotoUpload, onPhotoDelete }: Props) {
  const { basic } = profile;
  const yos = calcYearsOfService(basic.joinDate);

  return (
    <div className="flex gap-6">
      {/* 좌측: 사진 */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="w-32 h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
          {profile.photo?.url ? (
            <img src={profile.photo.url} alt="staff" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-slate-300" />
          )}
        </div>
        <label className="flex items-center gap-1 text-xs text-indigo-600 cursor-pointer hover:text-indigo-700">
          <Upload className="w-3 h-3" />
          <span>사진 업로드</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPhotoUpload?.(file);
            }}
          />
        </label>
        {profile.photo?.url && (
          <button
            onClick={onPhotoDelete}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
            삭제
          </button>
        )}
      </div>

      {/* 우측: 테이블 */}
      <div className="min-w-0 flex-1">
        <table className="w-full border-collapse text-xs">
          <tbody>
            {/* ── 상단: 기본 인적 ── */}
            <tr>
              <td colSpan={2} className="px-2 py-1 font-semibold text-slate-700 bg-indigo-50 text-xs">
                인적사항
              </td>
            </tr>
            <FieldRow label="직렬번호" value={basic.serialNo} />
            <FieldRow label="직원명(한글)" value={basic.nameKr} />
            <FieldRow label="직원명(한자)" value={basic.nameCn} />
            <FieldRow label="직원명(영문)" value={basic.nameEn} />
            <FieldRow label="주민번호" value={formatJumin(basic.juminNo)} />
            <FieldRow label="부서" value={basic.department} />
            <FieldRow label="입사일" value={basic.joinDate} />
            <FieldRow label="시간구직위" value={basic.hourlyPosition} />
            <FieldRow label="시설입사일" value={basic.facilityJoinDate} />
            <FieldRow label="직위" value={basic.position} />
            <FieldRow
              label="근무상태"
              value={
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                    basic.workStatus === "재직"
                      ? "bg-green-100 text-green-700"
                      : basic.workStatus === "휴직"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {basic.workStatus}
                </span>
              }
            />
            <FieldRow
              label="호봉"
              value={`${basic.salaryStep}호봉 (${yos.years}년 ${yos.months}개월)`}
            />

            {/* ── 하단: 상세 정보 ── */}
            <tr>
              <td colSpan={2} className="px-2 py-1 font-semibold text-slate-700 bg-indigo-50 text-xs">
                상세 정보
              </td>
            </tr>
            <FieldRow label="채용구분" value={basic.recruitType} />
            <FieldRow label="고용구분" value={basic.employmentType} />
            <FieldRow label="근무형태" value={basic.workType} />
            <FieldRow label="임시구분" value={basic.tempType} />
            <FieldRow label="승호대상월" value={basic.salaryStepTargetMonth} />
            <FieldRow label="상근여부" value={basic.fullTime === "Y" ? "상근" : basic.fullTime === "N" ? "비상근" : undefined} />
            <FieldRow label="민간지원인력" value={basic.civilianSupportType} />
            <FieldRow label="성별" value={basic.gender === "M" ? "남" : basic.gender === "F" ? "여" : undefined} />
            <FieldRow label="사고구보고" value={basic.accidentReport} />
            <FieldRow label="담당업무" value={basic.duties} />
            <FieldRow label="퇴사정보" value={basic.resignationDate ? `${basic.resignationDate} / ${basic.resignationReason ?? ""}` : undefined} />
            <FieldRow label="전화" value={basic.phone} />
            <FieldRow label="휴대폰" value={basic.mobile ? formatPhone(basic.mobile) : undefined} />
            <FieldRow label="이메일" value={basic.email} />
            <FieldRow label="연차기준" value={basic.seniorityBasis} />
            <FieldRow label="현주소" value={basic.address} />
            <FieldRow
              label="개인정보동의"
              value={
                basic.privacyConsent ? (
                  <span className={basic.privacyConsent === "Y" ? "text-green-600" : "text-red-500"}>
                    {basic.privacyConsent}
                  </span>
                ) : undefined
              }
            />
            <FieldRow label="동의파일" value={basic.privacyConsentFile} />
            <FieldRow label="특이사항" value={basic.remarks} />
            <FieldRow label="근무계약조건" value={basic.workContract} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
