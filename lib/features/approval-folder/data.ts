/**
 * 결재-folder Feature Module — data
 *
 * 12개 folder별 mock 데이터 + getListByFolder query
 * 총 30+건 (folder당 2~3건)
 */
import type { ApprovalListItem, FolderKey, DocStatus } from "./types";

// ─── Shared mock 결재선 ───────────────────────────────────
const line1 = [
  { step: 1, name: "박은수", status: "approved" as const },
  { step: 2, name: "김선영", status: "current"  as const },
  { step: 3, name: "김영미", status: "pending"  as const },
];
const line2 = [
  { step: 1, name: "김영미", status: "approved" as const },
  { step: 2, name: "이정호", status: "approved" as const },
  { step: 3, name: "박은수", status: "pending"  as const },
];
const line3 = [
  { step: 1, name: "이정호", status: "rejected" as const },
  { step: 2, name: "김선영", status: "pending"  as const },
];
const line4 = [
  { step: 1, name: "박은수", status: "approved" as const },
  { step: 2, name: "김영미", status: "approved" as const },
  { step: 3, name: "이정호", status: "approved" as const },
];

function make(
  id: string, date: string, form: string, formKey: string,
  urgent: boolean, title: string, hasFile: boolean | string,
  docNo: string, status: DocStatus,
  line: ApprovalListItem["line"]
): ApprovalListItem {
  return { id, date, form, formKey, urgent, title, hasFile: !!hasFile, docNo, status, line };
}

// ─── Folder별 Mock Data ──────────────────────────────────
// standby: 결재 대기
const STAND_BY: ApprovalListItem[] = [
  make("s1","2024-07-01","휴가신청서","leave",true,"7월 연차 휴가 신청 (3일)","","2024-휴가-00001","결재중",line1),
  make("s2","2024-07-02","지출결의서","expense",false,"고객사 미팅 식대 지출","","2024-지출-00002","결재중",line2),
  make("s3","2024-07-03","업무보고서","report",false,"6월 월간 업무 보고서","","2024-보고-00003","결재중",line1),
];

// inbox: 결재 수신
const INBOX: ApprovalListItem[] = [
  make("i1","2024-07-01","물품구매품의서","purchase",false,"사무용품 구매 품의 (필요 3종)","","2024-구매-00004","결재중",line2),
  make("i2","2024-07-02","교육수강신청","education",true,"사회保险褶 研修 (7/15)","","2024-교육-00005","결재중",line3),
];

// cc: 참조/열람 대기
const CC: ApprovalListItem[] = [
  make("c1","2024-07-01","업무보고서","report",false,"시설 점검 결과 보고 (월간)","","2024-보고-00006","결재중",line2),
  make("c2","2024-07-03","품의서","memo",false,"사무실 이전 품의","","2024-품의-00007","결재중",line4),
];

// expected: 결재 예정
const EXPECTED: ApprovalListItem[] = [
  make("e1","2024-07-05","휴가신청서","leave",false,"7월 20일 반차 신청","","2024-휴가-00008","결재중",line2),
  make("e2","2024-07-08","지출결의서","expense",false,"8월 사업 추진 경비 사전 품의","","2024-지출-00009","결재중",line1),
];

// default: 기본 문서함
const DEFAULT: ApprovalListItem[] = [
  make("d1","2024-06-28","업무보고서","report",false,"5월 업무 완료 보고","","2024-보고-00010","완료",line4),
  make("d2","2024-06-29","지출결의서","expense",false,"6월 통화료 정산","","2024-지출-00011","완료",line4),
];

// draft: 기안 문서함
const DRAFT: ApprovalListItem[] = [
  make("dr1","2024-07-03","물품구매품의서","purchase",false,"사무용품 보충 구매 (초안)","","","결재중",line1),
  make("dr2","2024-07-04","교육수강신청","education",false,"的下半月 研修 신청 (초안)","","","결재중",line2),
];

// temporary: 임시 저장함
const TEMPORARY: ApprovalListItem[] = [
  make("t1","2024-07-02","휴가신청서","leave",false,"7월 10일~12일 연차 (임시 저장)","","","결재중",[]),
];

// sign: 결재 문서함
const SIGN: ApprovalListItem[] = [
  make("sn1","2024-07-01","품의서","memo",false,"기관 운영비 심의 요청","","2024-품의-00012","완료",line4),
  make("sn2","2024-06-30","업무보고서","report",true,"평가 대비 자체점검 보고서","","2024-보고-00013","완료",line4),
  make("sn3","2024-06-29","지출결의서","expense",false,"사무실 임대료 (7월)","","2024-지출-00014","완료",line4),
];

// ccbox: 참조/열람 문서함
const CCBOX: ApprovalListItem[] = [
  make("cb1","2024-07-01","업무보고서","report",false,"평가 준비 현황 보고 (참조)","","2024-보고-00015","완료",line4),
  make("cb2","2024-07-02","교육수강신청","education",false,"7월 교육 계획的通知 (열람)","","2024-교육-00016","완료",line4),
];

// inboxbox: 수신 문서함
const INBOXBOX: ApprovalListItem[] = [
  make("ib1","2024-07-03","지출결의서","expense",false,"사업별 정산 보고서 (수신)","","2024-정산-00017","완료",line4),
  make("ib2","2024-07-04","업무보고서","report",false,"주간工作计划 (수신)","","2024-보고-00018","완료",line4),
];

// sendbox: 발송 문서함
const SENDBOX: ApprovalListItem[] = [
  make("sb1","2024-07-01","품의서","memo",false,"기관연합 설명 자료 발송","","2024-품의-00019","완료",line4),
  make("sb2","2024-07-02","교육수강신청","education",false,"7월 교육 수강 결과 발송","","2024-교육-00020","완료",line4),
  make("sb3","2024-07-03","업무보고서","report",false,"기관 성과 보고서 발송","","2024-보고-00021","완료",line4),
];

// appr: 공문 문서함
const APPR: ApprovalListItem[] = [
  make("ap1","2024-06-25","품의서","memo",false,"긴급 시설 교체 건의 공문","","2024-공문-00022","완료",line4),
  make("ap2","2024-06-28","업무보고서","report",true,"평가 인증 자료 (공문)","","2024-공문-00023","완료",line4),
];

// ─── Folder → Data Map ────────────────────────────────────
const FOLDER_DATA: Record<FolderKey, ApprovalListItem[]> = {
  standby:   STAND_BY,
  inbox:     INBOX,
  cc:        CC,
  expected:  EXPECTED,
  default:   DEFAULT,
  draft:     DRAFT,
  temporary: TEMPORARY,
  sign:      SIGN,
  ccbox:     CCBOX,
  inboxbox:  INBOXBOX,
  sendbox:   SENDBOX,
  appr:      APPR,
};

// ─── Query ─────────────────────────────────────────────────

/**
 * folder별 결재 목록 조회 (mock)
 * @param folder  folder key
 * @param _userId  (mock — 현재 로그인 사용자)
 * @param _tenantId (mock — tenant 격리)
 */
export function getListByFolder(
  folder: FolderKey,
  _userId?: string,
  _tenantId?: string
): ApprovalListItem[] {
  return FOLDER_DATA[folder] ?? [];
}
