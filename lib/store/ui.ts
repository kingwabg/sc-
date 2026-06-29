/**
 * UI 상태 저장소 (사이드바 접힘, 즐겨찾기, 배지 카운트, 외부 메일 계정)
 */
import type { MailAccount, MailProvider } from "../types/mail";
import { readLS, writeLS } from "./_ls";

// ─── Sidebar Collapsed ───────────────────────────────────
const SIDEBAR_COLLAPSED_KEY = "officex:sidebar-collapsed";

export function getSidebarCollapsed(): boolean {
  return readLS<boolean>(SIDEBAR_COLLAPSED_KEY, false);
}

export function setSidebarCollapsed(collapsed: boolean): void {
  writeLS(SIDEBAR_COLLAPSED_KEY, collapsed);
}

// ─── Favorites ───────────────────────────────────────────
const FAVORITES_KEY = "officex:user-favorites";

export function getFavoriteHrefs(): string[] {
  return readLS<string[]>(FAVORITES_KEY, []);
}

export function addFavoriteHref(href: string): void {
  const cur = getFavoriteHrefs();
  if (!cur.includes(href)) writeLS(FAVORITES_KEY, [...cur, href]);
}

export function removeFavoriteHref(href: string): void {
  writeLS(FAVORITES_KEY, getFavoriteHrefs().filter((f) => f !== href));
}

export function reorderFavorites(order: string[]): void {
  writeLS(FAVORITES_KEY, order);
}

// ─── Badge Counts ────────────────────────────────────────
const MAIL_UNREAD_KEY = "officex:mail-unread-count";
const APPROVAL_PENDING_KEY = "officex:approval-pending-count";
const TODAY_SCHEDULE_KEY = "officex:today-schedule-count";

export function getMailUnreadCount(): number {
  return readLS<number>(MAIL_UNREAD_KEY, 0);
}
export function setMailUnreadCount(n: number): void {
  writeLS(MAIL_UNREAD_KEY, n);
}

export function getApprovalPendingCount(): number {
  return readLS<number>(APPROVAL_PENDING_KEY, 3);
}
export function setApprovalPendingCount(n: number): void {
  writeLS(APPROVAL_PENDING_KEY, n);
}

export function getTodayScheduleCount(): number {
  return readLS<number>(TODAY_SCHEDULE_KEY, 0);
}
export function setTodayScheduleCount(n: number): void {
  writeLS(TODAY_SCHEDULE_KEY, n);
}

// ─── External Mail Accounts ──────────────────────────────
const MAIL_ACCOUNTS_KEY = "officex:mail-accounts";

export function getMailAccounts(): MailAccount[] {
  return readLS<MailAccount[]>(MAIL_ACCOUNTS_KEY, []);
}

export function addMailAccount(account: MailAccount): MailAccount[] {
  const next = [...getMailAccounts(), account];
  writeLS(MAIL_ACCOUNTS_KEY, next);
  return next;
}

export function removeMailAccount(id: string): MailAccount[] {
  const next = getMailAccounts().filter((a) => a.id !== id);
  writeLS(MAIL_ACCOUNTS_KEY, next);
  return next;
}

export function updateMailAccount(id: string, patch: Partial<MailAccount>): MailAccount[] {
  const next = getMailAccounts().map((a) => (a.id === id ? { ...a, ...patch } : a));
  writeLS(MAIL_ACCOUNTS_KEY, next);
  return next;
}