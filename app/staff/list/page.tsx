/**
 * app/staff/list/page.tsx
 *
 * P17 — tenant scope 적용:
 * getServerTenant() 로 현재 tenant 확인 후 MOCK_STAFF_PROFILES 필터링.
 *
 * app/staff/page.tsx (client component) 와 별도 경로로 동작.
 * URL: /staff/list
 */
import { AppShell } from "@/components/layout/AppShell";
import { MOCK_STAFF_PROFILES } from "@/lib/features/staff/data";
import { getServerTenant } from "@/lib/auth/getServerTenant";
import { POSITION_LABELS } from "@/lib/features/staff";
import Link from "next/link";

export default async function StaffListPage() {
  const { tenantId } = await getServerTenant();

  // Tenant scope — staff profiles를 tenantId로 필터링
  const profiles = MOCK_STAFF_PROFILES.filter((p) => p.tenantId === tenantId);

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">종사자 목록</h1>
            <p className="text-sm text-slate-500">{profiles.length}명</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
          {profiles.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-400 text-sm">
              해당 Tenant에 등록된 종사자가 없습니다.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400">성명</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-400">직위</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400">부서</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-400">입사일</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-400">상태</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-400">상세</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => {
                  const positionLabel = POSITION_LABELS[profile.basic.position] ?? profile.basic.position;
                  return (
                    <tr
                      key={profile.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                            {profile.basic.nameKr[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{profile.basic.nameKr}</p>
                            <p className="text-xs text-slate-400">{profile.basic.nameCn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex h-6 items-center justify-center rounded-full border px-2.5 text-[11px] font-semibold border-indigo-200 bg-indigo-50 text-indigo-700">
                          {positionLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{profile.basic.department}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 text-center">{profile.joinDate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-700">
                          {profile.basic.workStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/staff/${profile.id}`}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          보기
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
