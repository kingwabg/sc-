/**
 * 결재-folder Feature Module — labels
 *
 * 12개 folder 한국어 라벨 + 컬럼 라벨
 */
import type { FolderKey } from "./types";

// ─── 12개 Folder 라벨 ────────────────────────────────────
export const FOLDER_LABELS: Record<FolderKey, string> = {
  standby:  "결재 대기 문서",
  inbox:    "결재 수신 문서",
  cc:       "참조/열람 대기 문서",
  expected: "결재 예정 문서",
  default:  "기본 문서함",
  draft:    "기안 문서함",
  temporary:"임시 저장함",
  sign:     "결재 문서함",
  ccbox:    "참조/열람 문서함",
  inboxbox: "수신 문서함",
  sendbox:  "발송 문서함",
  appr:     "공문 문서함",
};

// ─── 컬럼 라벨 ────────────────────────────────────────────
export const COL_LABELS = {
  date:     "기안일",
  form:     "결재양식",
  urgent:   "긴급",
  title:    "제목",
  hasFile:  "첨부",
  docNo:    "문서번호",
  status:   "결재상태",
  line:     "결재선",
} as const;
