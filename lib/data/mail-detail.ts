/**
 * 메일 도메인 데이터
 */
import type { MailRow, FolderTitleMap, ProviderMetaMap, FolderKey } from "../types/mail";

// ─── 메일 mock ────────────────────────────────────────────
export const MOCK_MAILS: Record<FolderKey, MailRow[]> = {
  received: [
    { id: "m1", read: false, hasFile: false, starred: true, from: "DaouOffice", subject: "[드라이브] 운영자께서 계정 되였습니다.", date: "26-02-24 08:05", size: "5.1KB" },
    { id: "m2", read: false, hasFile: false, starred: false, from: "DaouOffice", subject: "[드라이브] 운영자께서 계정 되였습니다.", date: "26-02-24 08:04", size: "5.1KB" },
    { id: "m3", read: false, hasFile: false, starred: false, from: "DaouOffice", subject: "[드라이브] 운영자께 지적되었습니다.", date: "26-02-24 08:03", size: "5.1KB" },
    { id: "m4", read: false, hasFile: false, starred: false, from: "DaouOffice", subject: "[드라이브] 운영자께 지적되었습니다.", date: "26-02-24 08:03", size: "5.1KB" },
    { id: "m5", read: false, hasFile: false, starred: false, from: "DaouOffice", subject: "[드라이브] 운영자께 지적되었습니다.", date: "26-02-24 08:02", size: "5.1KB" },
    { id: "m6", read: true, hasFile: false, starred: false, from: "왕준하", subject: "[근태관리] 운영자로 등록되었습니다", date: "23-12-25 00:04", size: "4.8KB" },
  ],
  sent: [],
  drafts: [],
  scheduled: [],
  trash: [],
  important: [],
  unread: [],
  today: [],
  read: [],
  yesterday: [],
  week: [],
  month: [],
  mine: [],
  wrote: [],
};

// ─── 폴더별 제목 ─────────────────────────────────────────
export const FOLDER_TITLE: FolderTitleMap = {
  received: "받은메일함",
  sent: "보낼메일함",
  drafts: "임시보관함",
  scheduled: "예약메일함",
  trash: "휴지통",
  important: "중요 메일",
  unread: "안읽은 메일",
  today: "오늘온 메일",
  read: "읽은 메일",
  yesterday: "어제온 메일",
  week: "이번주 메일",
  month: "이번달 메일",
  mine: "담당한 메일",
  wrote: "내가 쓴 메일",
};

// ─── 외부 메일 Provider 메타 ──────────────────────────────
export const PROVIDER_META: ProviderMetaMap = {
  google: {
    label: "구글 (Gmail)",
    emoji: "📧",
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-200",
    imapHost: "imap.gmail.com",
    imapPort: 993,
  },
  naver: {
    label: "네이버",
    emoji: "🟢",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    imapHost: "imap.naver.com",
    imapPort: 993,
  },
  daum: {
    label: "다음 (Kakao)",
    emoji: "🟡",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    imapHost: "imap.daum.net",
    imapPort: 993,
  },
  imap: {
    label: "기타 IMAP",
    emoji: "⚙️",
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
    imapHost: "",
    imapPort: 993,
  },
};