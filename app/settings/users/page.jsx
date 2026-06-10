"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import SubPageTabs from "@/components/SubPageTabs";
import { Download, Plus, RefreshCw } from "lucide-react";

const TABS = [
  { id: "users",       label: "사용자 관리" },
  { id: "permissions", label: "권한 설정" },
];

/* ─── 더미 데이터 ─── */
const DUMMY_USERS = [
  { id: 1, name: "장한나",   emp: "EMP001", dept: "내부회계팀", role: "P5 내부회계팀",      active: true,  lastLogin: "2025-05-22" },
  { id: 2, name: "김민준",   emp: "EMP020", dept: "재무회계팀", role: "P1 통제수행자",      active: true,  lastLogin: "2025-05-21" },
  { id: 3, name: "이차장",   emp: "EMP015", dept: "재무회계팀", role: "P2 통제책임자",      active: true,  lastLogin: "2025-05-20" },
  { id: 4, name: "박지영",   emp: "EMP035", dept: "영업팀",     role: "P3 내부회계평가자",  active: true,  lastLogin: "2025-05-22" },
  { id: 5, name: "외부감사A", emp: "EXT001", dept: "외부감사",  role: "P4 감사인",          active: false, lastLogin: "2025-04-30" },
];
const ROLE_COLOR = {
  "P5 내부회계팀":     "bg-red-50 text-red-700 border-red-200",
  "P1 통제수행자":     "bg-blue-50 text-blue-700 border-blue-200",
  "P2 통제책임자":     "bg-orange-50 text-orange-700 border-orange-200",
  "P3 내부회계평가자": "bg-purple-50 text-purple-700 border-purple-200",
  "P4 감사인":         "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const MENUS = ["홈", "운영관리", "설계평가관리", "운영평가관리", "결재관리", "결과조회", "시스템관리"];
const ROLES = ["P1 통제수행자", "P2 통제책임자", "P3 내부회계평가자", "P4 감사인", "P5 내부회계팀"];
const MATRIX = {
  "홈":           ["✅", "✅", "✅", "✅ (제한)", "✅"],
  "운영관리":     ["🚫", "🚫", "👁",  "👁 RCM만", "✅✅"],
  "설계평가관리": ["✅ 본인", "✅ 승인", "✅ TF", "🚫", "✅"],
  "운영평가관리": ["✅ 증빙", "✅ 승인", "✅ 평가", "🚫", "✅✅"],
  "결재관리":     ["✅", "✅✅", "✅", "🚫", "✅"],
  "결과조회":     ["👁 본인", "👁 부서", "✅", "✅✅", "✅✅"],
  "시스템관리":   ["🚫", "🚫", "🚫", "🚫", "✅✅ Admin"],
};

/* ─── 탭 컴포넌트 ─── */
function UsersTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">사용자 목록</h2>
          <p className="text-sm text-gray-500 mt-0.5">ERP 사원 마스터 기반 계정을 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> ERP 동기화
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> 계정 추가
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">이름</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">사번</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">부서</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">역할</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">마지막 로그인</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DUMMY_USERS.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.emp}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{u.dept}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${ROLE_COLOR[u.role] ?? ""}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.lastLogin}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${u.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                    {u.active ? "활성" : "비활성"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PermissionsTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">역할별 권한 매트릭스</h2>
        <p className="text-sm text-gray-500 mt-0.5">페르소나(P1~P5)별 메뉴 접근 권한을 확인합니다</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-40">메뉴</th>
              {ROLES.map((r) => (
                <th key={r} className="text-center px-4 py-3 font-semibold text-gray-600 min-w-28">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MENUS.map((menu) => (
              <tr key={menu} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{menu}</td>
                {ROLES.map((r) => (
                  <td key={r} className="px-4 py-3 text-center text-xs text-gray-600">
                    {MATRIX[menu]?.[ROLES.indexOf(r)] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">✅ 사용가능 · ✅✅ 메인 영역 · 👁 읽기전용 · 🚫 미노출</p>
    </div>
  );
}

/* ─── 페이지 ─── */
function UsersAuthPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "users";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setActiveTab(t);
  }, [searchParams]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">사용자·권한</h1>
          <p className="text-sm text-gray-500 mt-1">계정 관리 및 역할별 권한을 설정합니다</p>
        </div>
        <SubPageTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "users"       && <UsersTab />}
        {activeTab === "permissions" && <PermissionsTab />}
      </div>
    </AppLayout>
  );
}

export default function UsersAuthPage() {
  return (
    <Suspense>
      <UsersAuthPageContent />
    </Suspense>
  );
}
