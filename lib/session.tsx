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
        // null/falsy 여도 state는 명시적으로 set 해야 UserMenu의 hydration race를 피한다.
        // (이전 signOut이 user:null, tenant:null 로 저장한 경우에도 portal이 stale tenant만 보고 잘못 렌더하던 문제 해결)
        setUser(parsed.user ?? null);
        setTenant(parsed.tenant ?? null);
        if (parsed.widgets) setWidgetsState(parsed.widgets);
        // 쿠키 sync: user가 명시적으로 set 된 경우에만 (signOut 후에도 쿠키는 이미 cleared 상태)
        if (parsed.user) setSessionCookie();
      } else {
        // localStorage에 키 자체가 없으면 두 키 모두 확실히 비움 + 쿠키도 정리
        localStorage.removeItem("office-portal:tenant");
        clearSessionCookie();
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
    // tenant는 signIn에서 자동 세팅하지 않는다.
    // → portal 진입 시 미선택이면 `/`(사업장 선택)로 자동 redirect 된다.
    // → 로그아웃 후 재로그인하면 tenant selector가 항상 먼저 뜨는 흐름.
    setSessionCookie();
  };

  const signOut = () => {
    setUser(null);
    setTenant(null); // 재로그인 시 사업장 선택 페이지(`/`)가 먼저 뜨도록 tenant도 비운다.
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);          // 세션 스토리지 (user+tenant+widgets) 삭제
      localStorage.removeItem("office-portal:tenant"); // tenant-context 의 별도 키도 직접 제거
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