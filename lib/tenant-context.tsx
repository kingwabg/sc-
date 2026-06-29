"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Tenant, TenantId } from "./tenants";
import { getTenant } from "./tenants";

const STORAGE_KEY = "office-portal:tenant";

type TenantContextValue = {
  tenant: Tenant | null;
  setTenant: (id: TenantId) => void;
  clearTenant: () => void;
  ready: boolean;
};

const defaultValue: TenantContextValue = {
  tenant: null,
  setTenant: () => {},
  clearTenant: () => {},
  ready: false,
};

const TenantContext = createContext<TenantContextValue>(defaultValue);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem(STORAGE_KEY);
    setTenantState(getTenant(id));
    setReady(true);
  }, []);

  const setTenant = useCallback((id: TenantId) => {
    localStorage.setItem(STORAGE_KEY, id);
    setTenantState(getTenant(id));
  }, []);

  const clearTenant = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTenantState(null);
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, clearTenant, ready }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}