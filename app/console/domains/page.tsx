"use client";

/**
 * app/console/domains/page.tsx — 도메인 관리
 */

import { useState } from "react";
import { Globe, Plus, RefreshCw, Shield, AlertCircle, CheckCircle2, X } from "lucide-react";

interface DomainRow {
  id: string;
  siteName: string;
  siteCode: string;
  defaultDomain: string;
  customDomain: string | null;
  sslStatus: "active" | "pending" | "expired" | "none";
  dnsStatus: "verified" | "unverified" | "pending";
  verifiedAt: string | null;
}

const MOCK_DOMAINS: DomainRow[] = [
  { id: "d1", siteName: "서창지역아동센터", siteCode: "17000004442", defaultDomain: "sc17000004442.ourdomain.com", customDomain: "seochange.center", sslStatus: "active", dnsStatus: "verified", verifiedAt: "2026-06-01" },
  { id: "d2", siteName: "금호지역아동센터", siteCode: "17000004443", defaultDomain: "sc17000004443.ourdomain.com", customDomain: null, sslStatus: "active", dnsStatus: "verified", verifiedAt: "2026-05-20" },
  { id: "d3", siteName: "반송지역아동센터", siteCode: "17000004444", defaultDomain: "sc17000004444.ourdomain.com", customDomain: "bansong.center", sslStatus: "pending", dnsStatus: "pending", verifiedAt: null },
  { id: "d4", siteName: "광안지역아동센터", siteCode: "17000004445", defaultDomain: "sc17000004445.ourdomain.com", customDomain: null, sslStatus: "expired", dnsStatus: "unverified", verifiedAt: "2026-03-01" },
  { id: "d5", siteName: "남부지역아동센터", siteCode: "17000004446", defaultDomain: "sc17000004446.ourdomain.com", customDomain: "namburocr.center", sslStatus: "active", dnsStatus: "verified", verifiedAt: "2026-06-10" },
];

const SSL_COLORS: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  expired: "bg-red-50 text-red-700",
  none: "bg-slate-100 text-slate-500",
};

const SSL_LABELS: Record<string, string> = {
  active: "활성",
  pending: "검증 중",
  expired: "만료",
  none: "없음",
};

const DNS_COLORS: Record<string, string> = {
  verified: "bg-green-50 text-green-700",
  unverified: "bg-red-50 text-red-700",
  pending: "bg-yellow-50 text-yellow-700",
};

const DNS_LABELS: Record<string, string> = {
  verified: "검증 완료",
  unverified: "미검증",
  pending: "검증 중",
};

export default function DomainsPage() {
  const [domains] = useState<DomainRow[]>(MOCK_DOMAINS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleDnsVerify = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => setVerifyingId(null), 1200);
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">도메인 관리</h1>
          <p className="text-xs text-slate-500 mt-1">전체 {domains.length}개 사이트 도메인 현황</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          커스텀 도메인 추가
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <th className="text-left px-4 py-2.5 font-medium">사이트</th>
              <th className="text-left px-4 py-2.5 font-medium">기본 도메인</th>
              <th className="text-left px-4 py-2.5 font-medium">커스텀 도메인</th>
              <th className="text-left px-4 py-2.5 font-medium">SSL</th>
              <th className="text-left px-4 py-2.5 font-medium">DNS</th>
              <th className="text-left px-4 py-2.5 font-medium">검증 일시</th>
              <th className="text-left px-4 py-2.5 font-medium">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {domains.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{d.siteName}</p>
                  <p className="text-slate-400 mt-0.5">{d.siteCode}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-slate-600 font-mono text-[11px]">{d.defaultDomain}</span>
                </td>
                <td className="px-4 py-3">
                  {d.customDomain ? (
                    <span className="text-indigo-600 font-mono text-[11px] font-medium">{d.customDomain}</span>
                  ) : (
                    <span className="text-slate-400 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={"inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium " + SSL_COLORS[d.sslStatus]}>
                    {SSL_LABELS[d.sslStatus]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={"inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium " + DNS_COLORS[d.dnsStatus]}>
                    {d.dnsStatus === "verified" && <CheckCircle2 className="w-3 h-3" />}
                    {d.dnsStatus === "unverified" && <AlertCircle className="w-3 h-3" />}
                    {d.dnsStatus === "pending" && <RefreshCw className="w-3 h-3" />}
                    {DNS_LABELS[d.dnsStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {d.verifiedAt ?? <span className="text-slate-300 italic">—</span>}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDnsVerify(d.id)}
                    disabled={verifyingId === d.id}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] border border-slate-200 rounded hover:bg-slate-100 transition disabled:opacity-50"
                  >
                    {verifyingId === d.id
                      ? <RefreshCw className="w-3 h-3 animate-spin" />
                      : <Shield className="w-3 h-3" />}
                    DNS 검증
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">커스텀 도메인 추가</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              커스텀 도메인 추가 기능은 도메인 공급자(DNS) 연동 후 활성화됩니다.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[11px] text-slate-600">
                <span className="font-medium">필수 DNS 레코드:</span>
                <br />
                CNAME: <span className="font-mono text-indigo-600">www</span> → <span className="font-mono">your-domain.ourdomain.com</span>
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
