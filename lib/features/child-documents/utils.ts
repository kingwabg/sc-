import type { ChildDocument, ChildDocumentCategory } from "./types";
import {
  TEXT_CATEGORIES,
  CHILD_DOCUMENT_CATEGORIES,
} from "./types";
import {
  MOCK_CHILD_DOCUMENTS,
  MOCK_TEXT_DOCUMENTS,
} from "./data";

export function isTextCategory(cat: ChildDocumentCategory): boolean {
  return TEXT_CATEGORIES.includes(cat);
}

export function categoryTone(cat: ChildDocumentCategory) {
  return CHILD_DOCUMENT_CATEGORIES.find((c) => c.value === cat)?.tone ?? "bg-slate-100 text-slate-700";
}

export function categoryEmoji(cat: ChildDocumentCategory) {
  return CHILD_DOCUMENT_CATEGORIES.find((c) => c.value === cat)?.emoji ?? "📄";
}

export function fileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export function isExpiringSoon(doc: ChildDocument): { expiring: boolean; expired: boolean; daysLeft?: number } {
  if (!doc.expiresAt) return { expiring: false, expired: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(doc.expiresAt);
  const diffDays = Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { expiring: false, expired: true, daysLeft: diffDays };
  if (diffDays <= 30) return { expiring: true, expired: false, daysLeft: diffDays };
  return { expiring: false, expired: false, daysLeft: diffDays };
}

export function htmlToExcerpt(html: string, max = 80): string {
  const text = html
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function getDocumentsByChild(childId: string): ChildDocument[] {
  return MOCK_CHILD_DOCUMENTS.filter((d) => d.childId === childId);
}

export function getAllDocumentsByChild(childId: string): ChildDocument[] {
  return [...MOCK_CHILD_DOCUMENTS, ...MOCK_TEXT_DOCUMENTS].filter((d) => d.childId === childId);
}
