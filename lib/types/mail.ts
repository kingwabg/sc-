/**
 * 메일 도메인 타입
 */

export type FolderKey =
  | "received"
  | "sent"
  | "drafts"
  | "scheduled"
  | "trash"
  | "important"
  | "unread"
  | "today"
  | "read"
  | "yesterday"
  | "week"
  | "month"
  | "mine"
  | "wrote";

export type MailRow = {
  id: string;
  read: boolean;
  hasFile: boolean;
  starred: boolean;
  from: string;
  subject: string;
  preview?: string;
  date: string;
  size: string;
};

export type FolderTitleMap = Record<FolderKey, string>;

export type MailProvider = "google" | "naver" | "daum" | "imap";

export type MailAccountStatus = "connected" | "error" | "syncing";

export type MailAccount = {
  id: string;
  provider: MailProvider;
  email: string;
  status: MailAccountStatus;
  lastSyncAt?: string;
  imapHost?: string;
  imapPort?: number;
};

export type ProviderMeta = {
  label: string;
  emoji: string;
  bg: string;
  text: string;
  ring: string;
  imapHost: string;
  imapPort: number;
};

export type ProviderMetaMap = Record<MailProvider, ProviderMeta>;

// ─── OAuth Mock 단계 ──────────────────────────────────────
export type OAuthStep = "idle" | "redirect" | "consent" | "fetching" | "done";