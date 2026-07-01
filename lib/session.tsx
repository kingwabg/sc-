"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Tenant } from "./tenants";

/* ===== Types ===== */

export type UserRole = "owner" | "admin" | "member";

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  avatarColor?: string;
  jobTitle?: string;
  team?: string;
  /** Supabase Auth 연동 후 DB에서 가져옴. 없으면 "member"로 간주. */
  role?: UserRole;
};

type Widget = {
  id: string;
  type: string;
  enabled: boolean;
  [key: string]: unknown;
};

type SessionContextValue = {
  isAuthenticated: boolean;
  user: SessionUser | null;
  tenant: Tenant | null;
  signIn: (email: string, name?: string, role?: UserRole) => void;
  signOut: () => void;
  switchTenant: (tenant: Tenant) => void;
  setMockRole: (role: UserRole) => void;
  widgets: Widget[];
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
  toggleWidget: (id: string) => void;
};

const defaultSessionValue: SessionContextValue = {
  isAuthenticated: false,
  user: null,
  tenant: null,
  signIn: () => {},
  signOut: () => {},
  switchTenant: () => {},
  setMockRole: () => {},
  widgets: [],
  setWidgets: () => {},
  toggleWidget: () => {},
};

/* ===== Dev mock users — owner / admin / member ===== */

export const MOCK_USERS: Record<UserRole, SessionUser> = {
  owner: {
    id: "u_1",
    email: "center@example.com",
    name: "왕준하",
    avatarColor: "#7c3aed",
    jobTitle: "센터장",
    team: "경영관리",
    role: "owner",
  },
  admin: {
    id: "u_2",
    email: "park@example.com",
    name: "박은수",
    avatarColor: "#ea580c",
    jobTitle: "생활복지사",
    team: "돌봄운영",
    role: "admin",
  },
  member: {
    id: "u_4",
    email: "lee@example.com",
    name: "이정훈",
    avatarColor: "#d97706",
    jobTitle: "조리사",
    team: "지원",
    role: "member",
  },
};

/* ===== Dev fallback — Supabase 미설정 시 사용 (member 기본) ===== */

export const MOCK_USER: SessionUser = {
  ...MOCK_USERS.member,
};

/* ===== Context ===== */

const SessionContext = createContext<SessionContextValue>(defaultSessionValue);

const STORAGE_KEY = "officex.session.v1";
const SESSION_COOKIE = "officex-session";
const ROLE_COOKIE = "officex-role";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

function setSessionCookie(value = "1") {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=${value}; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function setRoleCookie(role: UserRole) {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function getRoleFromCookie(): UserRole {
  if (typeof document === "undefined") return "member";
  const match = document.cookie.match(new RegExp(`${ROLE_COOKIE}=([^;]+)`));
  if (!match) return "member";
  const role = match[1] as UserRole;
  return role === "owner" || role === "admin" || role === "member" ? role : "member";
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/* ===== Provider Props ===== */

type SessionProviderProps = {
  children: ReactNode;
  /** Server Component 에서传来的 실제 Supabase 유저. 없으면 localStorage/mock 사용. */
  initialUser?: SessionUser | null;
};

/* ===== Provider ===== */

export function SessionProvider({ children, initialUser }: SessionProviderProps) {
  // initialUser 가 있으면 우선 사용 (서버 사이드 렌더링된 진짜 세션)
  // 없으면 localStorage에서 복원 (client-side hydration)
  const [user, setUser] = useState<SessionUser | null>(() => {
    if (initialUser) return initialUser;
    // SSR 시에는 아직 localStorage를 읽을 수 없으므로 null 반환
    if (typeof window === "undefined") return null;
    return null; // hydrateEffect에서 읽음
  });
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [widgets, setWidgetsState] = useState<Widget[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // 클라이언트에서 localStorage 복원 (initialUser 없을 때만)
  useEffect(() => {
    // 이미 initialUser(서버 세션)로 세팅된 경우 localStorage는 무시
    if (initialUser) {
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const role = getRoleFromCookie();
        setUser(parsed.user ? { ...parsed.user, role } : null);
        setTenant(parsed.tenant ?? null);
        if (parsed.widgets) setWidgetsState(parsed.widgets);
        if (parsed.user) { setSessionCookie(); setRoleCookie(role); }
      } else {
        localStorage.removeItem("office-portal:tenant");
        clearSessionCookie();
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [initialUser]);

  // 변경 시 저장
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, tenant, widgets })
    );
  }, [hydrated, user, tenant, widgets]);

  const signIn = (email: string, name?: string, role: UserRole = "member") => {
    const mockUser = MOCK_USERS[role];
    const u: SessionUser = {
      ...mockUser,
      id: mockUser.id,
      email,
      name: name ?? mockUser.name,
    };
    setUser(u);
    setSessionCookie();
    setRoleCookie(role);
  };

  const setMockRole = (role: UserRole) => {
    setUser(MOCK_USERS[role]);
    setRoleCookie(role);
  };

  const signOut = () => {
    setUser(null);
    setTenant(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("office-portal:tenant");
    }
    clearSessionCookie(); // clears both session and role cookies
  };

  const switchTenant = (t: Tenant) => setTenant(t);

  const setWidgets: React.Dispatch<React.SetStateAction<Widget[]>> = (w) =>
    setWidgetsState(w);

  const toggleWidget = (id: string) =>
    setWidgetsState((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );

  return (
    <SessionContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        tenant,
        signIn,
        signOut,
        switchTenant,
        setMockRole,
        widgets,
        setWidgets,
        toggleWidget,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
