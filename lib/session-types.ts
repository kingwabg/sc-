// Session-only types (kept minimal — login uses these via SessionProvider)

export type User = {
  id: string;
  email: string;
  name: string;
  avatarColor?: string;
  jobTitle?: string;
  team?: string;
};

export type Widget = {
  id: string;
  type: string;
  enabled: boolean;
  [key: string]: unknown;
};

// Minimal mock — replace with API when Supabase connects
export const MOCK_USER: User = {
  id: "u_1",
  email: "demo@office.com",
  name: "김민수",
  avatarColor: "#4f46e5",
  jobTitle: "과장",
  team: "프로덕트팀",
};

export const DEFAULT_WIDGETS: Widget[] = [];