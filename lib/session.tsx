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
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
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