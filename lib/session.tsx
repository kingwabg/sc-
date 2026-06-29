"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Tenant } from "./tenants";
import { MOCK_TENANT } from "./tenants";
import type { User, Widget } from "./session-types";
import { MOCK_USER, DEFAULT_WIDGETS } from "./session-types";

type SessionContextValue = {
  // 인증
  isAuthenticated: boolean;
  user: User | null;
  tenant: Tenant | null;
  // 로그인/로그아웃
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  // 회사 전환
  switchTenant: (tenant: Tenant) => void;
  // 대시보드 위젯
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
  widgets: DEFAULT_WIDGETS,
  setWidgets: () => {},
  toggleWidget: () => {},
};

const SessionContext = createContext<SessionContextValue>(defaultSessionValue);

const STORAGE_KEY = "officex.session.v1";

// 미들웨어(middleware.ts)와 동기화되는 세션 쿠키.
// Edge Runtime 미들웨어는 localStorage를 읽을 수 없으므로 같은 이름의 쿠키로 가드를 한다.
// 추후 Supabase 연동 시 이 쿠키를 실제 세션 토큰(JWT 등)으로 교체.
const SESSION_COOKIE = "officex-session";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

function setSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [widgets, setWidgetsState] = useState<Widget[]>(DEFAULT_WIDGETS);
  const [hydrated, setHydrated] = useState(false);

  // 클라이언트에서 localStorage 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.user) setUser(parsed.user);
        if (parsed.tenant) setTenant(parsed.tenant);
        if (parsed.widgets) setWidgetsState(parsed.widgets);
        // 이미 로그인된 상태로 페이지를 열면 미들웨어가 통과할 수 있도록 쿠키도 동기화.
        if (parsed.user) setSessionCookie();
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // 변경 시 저장
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, tenant, widgets })
    );
  }, [hydrated, user, tenant, widgets]);

  const signIn = (email: string, name?: string) => {
    const u: User = {
      ...MOCK_USER,
      email,
      name: name ?? email.split("@")[0],
    };
    setUser(u);
    if (!tenant) setTenant(MOCK_TENANT);
    // 미들웨어 인증 가드 통과용 쿠키 동기화.
    setSessionCookie();
  };

  const signOut = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    clearSessionCookie();
  };

  const switchTenant = (t: Tenant) => setTenant(t);

  const setWidgets: React.Dispatch<React.SetStateAction<Widget[]>> = (w) =>
    setWidgetsState(w);

  const toggleWidget = (id: string) =>
    setWidgetsState((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
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