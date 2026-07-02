"use client";

/**
 * app/console/tenants/[id]/page.tsx — 센터 상세 (서비스 정보)
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantById, MOCK_TENANTS } from "@/lib/features/tenant";
import { formatStorage, daysUntilExpire, storagePercent } from "@/lib/features/tenant/utils";
import { ChevronLeft, Building2, Globe, Calendar, Users, HardDrive, Mail, Server } from "lucide-react";

export default function TenantDetailPage({ params }: { params: { id: string } }) {
  const tenant = getTenantById(params.id);
  if (!tenant) notFound();

  const days = daysUntilExpire(tenant.expireDate);
  const storage = storagePercent(tenant.usedStorage, tenant.storageLimit);
  const daysColor = days === null ? "" : days < 0 ? "text-rose-600" : days <= 30 ? "text-amber-600" : "text-slate-700";

  return (
    <div className="space-y-5">
      <Link href="/console/tenants" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
        <ChevronLeft className="w-3 h-3" />
        센터 목록
      </Link>

      {/* 헤더 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-400" />
              <h1 className="text-xl font-bold text-slate-900">{tenant.siteName}</h1>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${tenant.plan === "enterprise" ? "bg-amber-100 text-amber-700" : tenant.plan === "pro" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                {tenant.plan.toUpperCase()}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tenant.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {tenant.status === "active" ? "활성" : tenant.status === "suspended" ? "정지" : "삭제"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">{tenant.tenantCode}</p>
            {tenant.notes && <p className="text-xs text-slate-600 mt-2">{tenant.notes}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs border border-slate-300 hover:bg-slate-50 rounded-lg transition">
              설정 변경
            </button>
            <button className="px-3 py-1.5 text-xs border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg transition">
              {tenant.status === "active" ? "정지" : "활성화"}
            </button>
          </div>
        </div>
      </div>

      {/* 4-column 그리드: 사이트 정보 / 도메인 / 사용기간 / 회원·용량 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 사이트 정보 */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-slate-400" />
            사이트 정보
          </h2>
          <dl className="space-y-2 text-xs">
            <Row label="사이트명" value={tenant.siteName} />
            <Row label="사이트 아이디" value={<code className="font-mono text-slate-700">{tenant.tenantCode}</code>} />
            <Row label="최고관리자" value={
              tenant.ownerEmail ? (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {tenant.ownerEmail}
                </span>
              ) : "—"
            } />
            <Row label="테마" value={tenant.theme ?? "기본"} />
            <Row label="활성 앱" value={
              <div className="flex flex-wrap gap-1">
                {tenant.enabledApps.map((app) => (
                  <span key={app} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">{app}</span>
                ))}
              </div>
            } />
          </dl>
        </section>

        {/* 도메인 */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-slate-400" />
            도메인
          </h2>
          <dl className="space-y-2 text-xs">
            <Row label="기본 도메인" value={<code className="font-mono text-slate-700">{tenant.defaultDomain}</code>} />
            <Row label="커스텀 도메인" value={
              tenant.customDomain ? (
                <code className="font-mono text-amber-700">{tenant.customDomain}</code>
              ) : <span className="text-slate-400">미설정</span>
            } />
            <Row label="SSL 인증서" value={<span className="text-green-600">자동 (Let's Encrypt)</span>} />
            <Row label="DNS 상태" value={<span className="text-green-600">정상</span>} />
          </dl>
        </section>

        {/* 사용기간 */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            사용기간 / 요금제
          </h2>
          <dl className="space-y-2 text-xs">
            <Row label="시작일" value={tenant.startDate} />
            <Row label="만료일" value={
              tenant.expireDate ? (
                <span>
                  {tenant.expireDate}
                  {days !== null && (
                    <span className={`ml-1 font-semibold ${daysColor}`}>
                      ({days < 0 ? `${Math.abs(days)}일 만료` : `D-${days}`})
                    </span>
                  )}
                </span>
              ) : "무제한"
            } />
            <Row label="요금제" value={
              <span className="flex items-center gap-1">
                {tenant.plan.toUpperCase()}
                <button className="ml-2 text-[10px] text-emerald-600 hover:underline">변경</button>
              </span>
            } />
            <Row label="결제 상태" value={<span className="text-green-600">정상</span>} />
          </dl>
        </section>

        {/* 회원 · 용량 */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            회원 / 용량 제한
          </h2>
          <dl className="space-y-2 text-xs">
            <Row label="회원 한도" value={
              <div>
                <div className="flex justify-between mb-1">
                  <span>사용 {Math.floor(tenant.memberLimit * 0.6)}명</span>
                  <span className="text-slate-500">/ {tenant.memberLimit}명</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: "60%" }} />
                </div>
              </div>
            } />
            <Row label="저장 용량" value={
              <div>
                <div className="flex justify-between mb-1">
                  <span>{formatStorage(tenant.usedStorage)}</span>
                  <span className="text-slate-500">/ {formatStorage(tenant.storageLimit)}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${storage > 80 ? "bg-rose-500" : storage > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${storage}%` }}
                  />
                </div>
              </div>
            } />
            <Row label="활성 앱 수" value={`${tenant.enabledApps.length}개`} />
          </dl>
        </section>
      </div>

      {/* 감사 로그 placeholder */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-slate-400" />
          최근 감사 로그
        </h2>
        <ul className="space-y-1.5 text-xs text-slate-600">
          <li className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span>2026-07-02 21:34 · owner 김관리 — 회원 관리 페이지 접속</span>
            <span className="text-slate-400 text-[10px]">VIEW</span>
          </li>
          <li className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span>2026-07-02 14:22 · 시스템 — 일간 백업 완료</span>
            <span className="text-green-600 text-[10px]">SUCCESS</span>
          </li>
          <li className="flex items-center justify-between py-1.5">
            <span>2026-07-01 09:15 · owner 김관리 — 결재 문서 발송</span>
            <span className="text-emerald-600 text-[10px]">CREATE</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="text-slate-500 min-w-[100px]">{label}</dt>
      <dd className="text-right flex-1 text-slate-800">{value}</dd>
    </div>
  );
}