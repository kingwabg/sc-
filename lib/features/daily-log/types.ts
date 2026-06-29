/**
 * Daily Log (운영일지) — Domain Types
 */
export type DailyLogStatus = "draft" | "pending" | "approved";

export type DailyLog = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  authorName: string;
  authorRole: string;
  status: DailyLogStatus;
  /** Raw HTML content — rendered via dangerouslySetInnerHTML */
  content: string;
  createdAt: number;
  updatedAt: number;
};

export type DailyLogSummary = Pick<DailyLog, "id" | "date" | "title" | "authorName" | "authorRole" | "status" | "updatedAt">;
