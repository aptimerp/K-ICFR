"use client";
import AppLayout from "@/components/AppLayout";

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

export default function PermissionsPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">권한</h1>
          <p className="text-sm text-gray-500 mt-1">역할별 메뉴 접근 권한 매트릭스입니다</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-40">메뉴</th>
                {ROLES.map(r => <th key={r} className="text-center px-4 py-3 font-semibold text-gray-600 min-w-28">{r}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MENUS.map(menu => (
                <tr key={menu} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{menu}</td>
                  {ROLES.map(r => (
                    <td key={r} className="px-4 py-3 text-center text-xs text-gray-600">{MATRIX[menu]?.[ROLES.indexOf(r)] ?? "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-400">✅ 사용가능 · ✅✅ 메인 영역 · 👁 읽기전용 · 🚫 미노출</p>
      </div>
    </AppLayout>
  );
}
