"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Tenant } from "./tenants";
import { MOCK_TENANT } from "./tenants";

/* ===== Types ===== */

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  avatarColor?: string;
  jobTitle?: string;
  team?: string;
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
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  switchTenant: (tenant: Tenant) => void;
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
  widgets: [],
  setWidgets: () => {},
  toggleWidget: () => {},
};

/* ===== Dev fallback — Supabase 미설정 시 사용 ===== */

export const MOCK_USER: SessionUser = {
  id: "u_mock",
  email: "demo@office.com",
  name: "김민수",
  avatarColor: "#4f46e5",
  jobTitle: "과장",
  team: "프로덕트팀",
};

/* ===== Context ===== */

const SessionContext = createContext<SessionContextValue>(defaultSessionValue);

const STORAGE_KEY = "officex.session.v1";
const SESSION_COOKIE = "officex-session";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

function setSessionCookie(value = "1") {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=${value}; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
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
        setUser(parsed.user ?? null);
        setTenant(parsed.tenant ?? null);
        if (parsed.widgets) setWidgetsState(parsed.widgets);
        if (parsed.user) setSessionCookie();
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

  const signIn = (email: string, name?: string) => {
    const u: SessionUser = {
      ...MOCK_USER,
      id: "u_mock",
      email,
      name: name ?? email.split("@")[0],
    };
    setUser(u);
    setSessionCookie();
  };

  const signOut = () => {
    setUser(null);
    setTenant(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("office-portal:tenant");
    }
    clearSessionCookie();
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
