"use client";
import AppLayout from "@/components/AppLayout";
import { Download, Plus, RefreshCw } from "lucide-react";

const DUMMY_USERS = [
  { id: 1, name: "장한나", emp: "EMP001", dept: "내부회계팀", role: "P5 내부회계팀",      active: true,  lastLogin: "2025-05-22" },
  { id: 2, name: "김민준", emp: "EMP020", dept: "재무회계팀",  role: "P1 통제수행자",    active: true,  lastLogin: "2025-05-21" },
  { id: 3, name: "이차장", emp: "EMP015", dept: "재무회계팀",  role: "P2 통제책임자",    active: true,  lastLogin: "2025-05-20" },
  { id: 4, name: "박지영", emp: "EMP035", dept: "영업팀",      role: "P3 내부회계평가자", active: true,  lastLogin: "2025-05-22" },
  { id: 5, name: "외부감사A", emp: "EXT001", dept: "외부감사", role: "P4 감사인",         active: false, lastLogin: "2025-04-30" },
];
const ROLE_COLOR = {
  "P5 내부회계팀":     "bg-red-50 text-red-700 border-red-200",
  "P1 통제수행자":     "bg-blue-50 text-blue-700 border-blue-200",
  "P2 통제책임자":     "bg-orange-50 text-orange-700 border-orange-200",
  "P3 내부회계평가자": "bg-purple-50 text-purple-700 border-purple-200",
  "P4 감사인":        "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export default function UsersPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">사용자</h1>
            <p className="text-sm text-gray-500 mt-1">ERP 사원 마스터 기반 계정을 관리합니다</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" /> ERP 동기화
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${ROLE_COLOR[u.role] ?? ""}`}>{u.role}</span>
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
    </AppLayout>
  );
}
