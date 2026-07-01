// lib/features/approval-folder/types.ts (P11-3 재작업, Mavis 직접 작성)

export type FolderKey =
  | "default" | "standby" | "inbox" | "cc" | "expected"
  | "draft" | "temporary" | "sign" | "ccbox" | "inboxbox" | "sendbox" | "appr";

export interface ApprovalListItem {
  id: string;
  docNo: string;
  form: string;
  urgent: boolean;
  title: string;
  hasFile: boolean;
  requesterName: string;
  status: "결재중" | "완료" | "반려" | "회수";
  line: string;
  createdAt: string; // YYYY-MM-DD
}

export const FOLDER_KEYS: FolderKey[] = [
  "default", "standby", "inbox", "cc", "expected",
  "draft", "temporary", "sign", "ccbox", "inboxbox", "sendbox", "appr",
];