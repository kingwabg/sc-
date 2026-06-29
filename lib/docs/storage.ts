import type { Doc, DocStorage, DocSummary } from "./types";

const KEY = "office-portal:docs:v1";

/** HTML → plain text 변환 (목록 snippet / 글자수용) */
function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    // SSR 안전
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): Doc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(docs: Doc[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(docs));
}

export class LocalDocStorage implements DocStorage {
  async list(): Promise<DocSummary[]> {
    const docs = readAll();
    return docs
      .map((d) => {
        const text = stripHtml(d.content);
        return {
          id: d.id,
          title: d.title,
          snippet: text.slice(0, 140),
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          wordCount: text.length,
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<Doc | null> {
    const docs = readAll();
    return docs.find((d) => d.id === id) ?? null;
  }

  async create(): Promise<Doc> {
    const now = Date.now();
    const doc: Doc = {
      id: newId(),
      title: "제목 없는 문서",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    writeAll([doc, ...readAll()]);
    return doc;
  }

  async save(input: Pick<Doc, "id" | "title" | "content">): Promise<Doc> {
    const all = readAll();
    const idx = all.findIndex((d) => d.id === input.id);
    const now = Date.now();
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        title: input.title,
        content: input.content,
        updatedAt: now,
      };
    } else {
      all.unshift({
        id: input.id,
        title: input.title,
        content: input.content,
        createdAt: now,
        updatedAt: now,
      });
    }
    writeAll(all);
    return all.find((d) => d.id === input.id)!;
  }

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter((d) => d.id !== id));
  }
}

export const docStorage: DocStorage = new LocalDocStorage();
