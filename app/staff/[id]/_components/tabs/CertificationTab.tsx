"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────

export type StaffCertification = {
  id: string;
  staffId: string;
  certType: string;
  certNo: string;
  issueDate: string;
  issuer: string;
  expiryDate: string | null;
  recognition: boolean;
};

// ─── Mock data ─────────────────────────────────────────────

const MOCK_CERTS: StaffCertification[] = [
  {
    id: "cert1",
    staffId: "s01",
    certType: "사회복지사 1급",
    certNo: "제 2020-001234호",
    issueDate: "2020-06-15",
    issuer: "보건복지부",
    expiryDate: null,
    recognition: true,
  },
  {
    id: "cert2",
    staffId: "s01",
    certType: "보육교사 1급",
    certNo: "제 2019-005678호",
    issueDate: "2019-12-01",
    issuer: "보건복지부",
    expiryDate: null,
    recognition: true,
  },
];

// ─── Props ─────────────────────────────────────────────────

type CertificationTabProps = {
  staffId: string;
  certifications?: StaffCertification[];
  onChange?: (certs: StaffCertification[]) => void;
};

// ─── Component ─────────────────────────────────────────────

export function CertificationTab({ staffId, certifications: propCerts, onChange }: CertificationTabProps) {
  const [rows, setRows] = useState<StaffCertification[]>(
    propCerts ?? MOCK_CERTS.filter((c) => c.staffId === staffId),
  );

  function update(id: string, field: keyof StaffCertification, value: string | boolean) {
    const next = rows.map((r) => (r.id === id ? { ...r, [field]: value } : r));
    setRows(next);
    onChange?.(next);
  }

  function addRow() {
    const today = new Date().toISOString().slice(0, 10);
    const newRow: StaffCertification = {
      id: `cert_${Date.now()}`,
      staffId,
      certType: "",
      certNo: "",
      issueDate: today,
      issuer: "",
      expiryDate: null,
      recognition: true,
    };
    setRows([...rows, newRow]);
  }

  function removeRow(id: string) {
    setRows(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">
          자격면허{" "}
          <span className="font-semibold text-foreground">{rows.length}개</span> 등록됨
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          * 자격증은 시군구 보고 시 필수 항목입니다
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["자격증명", "자격증번호", "발급일", "발급기관", "유효기간", "인정여부", ""].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const expired = row.expiryDate ? new Date(row.expiryDate) < new Date() : false;
              return (
                <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-3 py-2">
                    <input
                      value={row.certType}
                      onChange={(e) => update(row.id, "certType", e.target.value)}
                      placeholder="사회복지사 1급"
                      className="w-36 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={row.certNo}
                      onChange={(e) => update(row.id, "certNo", e.target.value)}
                      placeholder="제 xxx호"
                      className="w-32 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={row.issueDate}
                      onChange={(e) => update(row.id, "issueDate", e.target.value)}
                      className="w-28 text-xs border border-border rounded px-1.5 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={row.issuer}
                      onChange={(e) => update(row.id, "issuer", e.target.value)}
                      placeholder="발급기관"
                      className="w-28 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-3 py-2">
                    {expired ? (
                      <span className="text-xs text-danger font-medium">만료</span>
                    ) : (
                      <input
                        type="date"
                        value={row.expiryDate ?? ""}
                        onChange={(e) => update(row.id, "expiryDate", e.target.value || "")}
                        className="w-28 text-xs border border-border rounded px-1.5 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => update(row.id, "recognition", !row.recognition)}
                      className="flex items-center gap-1 cursor-pointer"
                      title={row.recognition ? "인정" : "불인정"}
                    >
                      {row.recognition ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs">{row.recognition ? "인정" : "불인정"}</span>
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-danger"
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground text-sm">
                  자격면허가 없습니다. 추가 버튼으로 등록하세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        자격면허 추가
      </Button>
    </div>
  );
}
