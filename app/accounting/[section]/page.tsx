"use client";

import { notFound, useParams } from "next/navigation";
import {
  Banknote,
  Calculator,
  ClipboardCheck,
  FileCheck2,
  IdCard,
  Landmark,
  Network,
  ReceiptText,
  Settings,
  UserRoundCog,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

const SECTION_META = {
  income: {
    title: "수입 관리",
    description: "후원금, 이용료, 보조금 등 입금 항목을 분류하고 관리합니다.",
    icon: Banknote,
    tone: "emerald",
    items: ["입금 내역 조회", "수입 항목 분류", "후원금 매칭", "미분류 수입 확인"],
  },
  expense: {
    title: "지출 관리",
    description: "운영비, 급여, 물품 구매 지출과 증빙을 함께 확인합니다.",
    icon: WalletCards,
    tone: "rose",
    items: ["지출 내역 조회", "증빙 첨부", "결재 문서 연결", "미승인 지출 확인"],
  },
  deposits: {
    title: "통장 입금",
    description: "계좌 거래 내역을 수입 관리 항목과 연결합니다.",
    icon: Landmark,
    tone: "blue",
    items: ["거래 내역 불러오기", "입금자 매칭", "미확인 입금 처리", "계좌별 현황"],
  },
  receipts: {
    title: "증빙 자료",
    description: "영수증, 세금계산서, 첨부 파일을 누락 없이 관리합니다.",
    icon: ReceiptText,
    tone: "amber",
    items: ["증빙함", "누락 증빙", "첨부 파일", "다운로드"],
  },
  reports: {
    title: "결산 리포트",
    description: "월별/연도별 수입과 지출을 정산 자료로 정리합니다.",
    icon: Calculator,
    tone: "violet",
    items: ["월별 결산", "연도별 결산", "수입·지출 리포트", "자료 출력"],
  },
  checklist: {
    title: "회계 점검",
    description: "마감 전 누락 증빙과 미분류 거래를 점검합니다.",
    icon: ClipboardCheck,
    tone: "slate",
    items: ["마감 체크리스트", "미분류 거래", "누락 증빙", "오류 확인"],
  },
  approval: {
    title: "결재 연동",
    description: "회계 처리와 연결된 결재 문서를 관리합니다.",
    icon: FileCheck2,
    tone: "blue",
    items: ["결재 대기", "결재 완료", "반려 문서", "회계 연결"],
  },
  settings: {
    title: "계정 설정",
    description: "회계 계정, 분류 기준, 결산 설정을 관리합니다.",
    icon: Settings,
    tone: "slate",
    items: ["계정 과목", "분류 규칙", "회계연도", "권한 설정"],
  },
  "hr-workplace": {
    title: "사업장관리",
    description: "기관 사업장 정보와 인사 기준 설정을 관리합니다.",
    icon: IdCard,
    tone: "blue",
    items: ["사업장 기본정보", "운영 기준", "담당자 설정", "변경 이력"],
  },
  "hr-account-status": {
    title: "계정상태관리",
    description: "임직원 계정 상태와 접근 가능 여부를 관리합니다.",
    icon: UserRoundCog,
    tone: "slate",
    items: ["활성 계정", "휴면 계정", "퇴사자 계정", "권한 점검"],
  },
  "hr-appointment": {
    title: "인사발령",
    description: "직위, 부서, 담당 업무 변경 발령을 관리합니다.",
    icon: UserRoundCog,
    tone: "violet",
    items: ["발령 작성", "승인 대기", "발령 이력", "인사 기록 반영"],
  },
  "org-design": {
    title: "조직설계",
    description: "기관 조직 구조와 부서 체계를 설계합니다.",
    icon: Network,
    tone: "blue",
    items: ["조직도", "부서 추가", "상하위 구조", "적용 예약"],
  },
  "org-position": {
    title: "직위체계",
    description: "직위, 직책, 역할 체계를 설정합니다.",
    icon: Network,
    tone: "slate",
    items: ["직위 목록", "직책 설정", "권한 연결", "변경 이력"],
  },
  "org-bulk-register": {
    title: "조직일괄등록",
    description: "조직 정보를 파일 또는 일괄 입력으로 등록합니다.",
    icon: Network,
    tone: "emerald",
    items: ["양식 다운로드", "파일 업로드", "검증 결과", "등록 이력"],
  },
  "org-delete": {
    title: "조직삭제관리",
    description: "사용하지 않는 조직과 연결 데이터를 정리합니다.",
    icon: Network,
    tone: "rose",
    items: ["삭제 요청", "연결 데이터", "승인 대기", "삭제 이력"],
  },
  "certificate-issue-status": {
    title: "증명발급현황",
    description: "재직, 경력 등 증명서 발급 현황을 확인합니다.",
    icon: FileCheck2,
    tone: "amber",
    items: ["발급 요청", "처리 중", "발급 완료", "반려 내역"],
  },
} as const;

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function AccountingSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params?.section as keyof typeof SECTION_META;
  const meta = SECTION_META[section];

  if (!meta) {
    notFound();
  }

  const Icon = meta.icon;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-start gap-4">
            <span className={cn("grid h-12 w-12 place-items-center rounded-xl ring-1", toneClass[meta.tone])}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[12px] font-extrabold text-slate-400">회계포털</div>
              <h1 className="m-0 mt-1 text-2xl font-black tracking-tight text-slate-950">{meta.title}</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{meta.description}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {meta.items.map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-black text-slate-900">{item}</div>
              <p className="mt-2 text-[12px] font-medium leading-5 text-slate-500">세부 기능을 연결할 준비 영역입니다.</p>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
