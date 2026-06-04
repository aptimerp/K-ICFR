"use client";
import AppLayout from "@/components/AppLayout";

const DUMMY_LOGS = [
  { time: "2025-05-22 09:12:33", user: "장한나", action: "RCM 지정 실행",    target: "v3 (402건)",   ip: "10.0.1.15" },
  { time: "2025-05-22 09:10:05", user: "김민준", action: "증빙 제출 상신",   target: "FR-C-1-3-1",   ip: "10.0.1.22" },
  { time: "2025-05-22 08:55:17", user: "이차장", action: "증빙제출 승인",    target: "FR-C-1-3-1",   ip: "10.0.1.18" },
  { time: "2025-05-21 17:30:44", user: "장한나", action: "샘플링 작업 수행", target: "중간 1차 전체", ip: "10.0.1.15" },
  { time: "2025-05-21 14:20:11", user: "박지영", action: "운영평가 확정",    target: "FR-C-2-1-1",   ip: "10.0.1.30" },
];

export default function LogPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">로그</h1>
          <p className="text-sm text-gray-500 mt-1">시스템 전체 접근·조회·변경 이력을 추적합니다</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">시각</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">사용자</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">액션</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">대상</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DUMMY_LOGS.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.time}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{log.user}</td>
                  <td className="px-4 py-3 text-gray-700">{log.action}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-700">{log.target}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
