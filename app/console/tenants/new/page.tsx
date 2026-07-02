"use client";

/**
 * app/console/tenants/new/page.tsx — 신규 센터 생성
 *
 * page.tsx: 최소한의 state + submit 로직만.
 * UI: _components/NewTenantForm.tsx
 */

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import NewTenantForm, { type NewTenantFormValues } from "./_components/NewTenantForm";

const todayStr = () => new Date().toISOString().slice(0, 10);
const oneYearLaterStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

export default function NewTenantPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial = useMemo<NewTenantFormValues>(() => {
    const siteName = "";
    return {
      siteName,
      tenantCode: "",
      defaultDomain: "",
      customDomain: "",
      plan: "pro",
      memberLimit: 50,
      storageGB: 10,
      startDate: todayStr(),
      expireDate: oneYearLaterStr(),
      enabledApps: ["dashboard", "staff", "children", "attendance", "approval"],
      ownerEmail: "",
      notes: "",
    };
  }, []);

  const onSubmit = async (values: NewTenantFormValues) => {
    if (!values.siteName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/console/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: values.siteName.trim(),
          tenantCode: values.tenantCode.trim() || undefined,
          defaultDomain: values.defaultDomain.trim() || undefined,
          customDomain: values.customDomain.trim() || undefined,
          plan: values.plan,
          memberLimit: Number(values.memberLimit) || 0,
          storageLimitGB: Number(values.storageGB) || 0,
          startDate: values.startDate,
          expireDate: values.expireDate,
          enabledApps: values.enabledApps,
          ownerEmail: values.ownerEmail.trim() || undefined,
          notes: values.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "생성에 실패했습니다");
        setSubmitting(false);
        return;
      }
      router.push("/console/tenants");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류");
      setSubmitting(false);
    }
  };

  return (
    <NewTenantForm
      initial={initial}
      submitting={submitting}
      error={error}
      onSubmit={onSubmit}
    />
  );
}
