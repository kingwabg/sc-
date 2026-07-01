// lib/features/approval-folder/labels.ts (P11-3)

import type { FolderKey } from "./types";

export const FOLDER_LABEL: Record<FolderKey, string> = {
  default: "기본 문서함",
  standby: "결재 대기 문서",
  inbox: "결재 수신 문서",
  cc: "참조/열람 대기 문서",
  expected: "결재 예정 문서",
  draft: "기안 문서함",
  temporary: "임시 저장함",
  sign: "결재 문서함",
  ccbox: "참조/열람 문서함",
  inboxbox: "수신 문서함",
  sendbox: "발송 문서함",
  appr: "공문 문서함",
};

export const FOLDER_GROUP: Record<FolderKey, "결재하기" | "개인 문서함" | "부서 문서함" | "환경설정" | "문서관리"> = {
  default: "개인 문서함",
  standby: "결재하기",
  inbox: "결재하기",
  cc: "결재하기",
  expected: "결재하기",
  draft: "개인 문서함",
  temporary: "개인 문서함",
  sign: "개인 문서함",
  ccbox: "개인 문서함",
  inboxbox: "개인 문서함",
  sendbox: "개인 문서함",
  appr: "개인 문서함",
};

export const COLUMN_LABEL = {
  createdAt: "기안일",
  form: "결재양식",
  urgent: "긴급",
  title: "제목",
  hasFile: "첨부",
  docNo: "문서번호",
  status: "결재상태",
  line: "결재선",
  requesterName: "기안자",
};

export const STATUS_TONE: Record<string, "green" | "amber" | "red" | "slate"> = {
  결재중: "amber",
  완료: "green",
  반려: "red",
  회수: "slate",
};

export const FORM_LABEL: Record<string, string> = {
  education: "교육",
  leave: "휴가신청",
  expense: "지출결의",
  purchase: "구매품의",
  report: "보고",
  memo: "메모",
  duty_assignment: "업무 분장표",
  meeting: "회의록",
  donation: "후원금 영수증",
};