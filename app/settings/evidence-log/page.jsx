"use client";
import AppLayout from "@/components/AppLayout";
import { Eye } from "lucide-react";

const DUMMY_EVID_LOGS = [
  { time: "2025-05-22 10:05:11", user: "외부감사A", role: "P4 감사인", file: "감사패키지_중간1차.zip", size: "24.5 MB", ip: "192.168.1.100" },
  { time: "2025-05-21 16:30:44", user: "감사위원B", role: "P4 감사위", file: "운영실태평가보고서_v1.pdf", size: "2.1 MB", ip: "192.168.1.101" },
  { time: "2025-05-20 09:15:22", user: "내부회계관리자", role: "P4 관리자", file: "통제이력_FR-C-1-3-1.xlsx", size: "0.8 MB", ip: "10.0.1.50" },
];

export default function EvidenceLogPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">증빙 로그</h1>
          <p className="text-sm text-gray-500 mt-1">P4(감사인·감사위·관리자)의 파일 다운로드 이력을 추적합니다 (감사 추적용)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">시각</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">사용자</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">역할</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">다운로드 파일</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">파일 크기</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DUMMY_EVID_LOGS.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.time}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{log.user}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold bg-yellow-50 text-yellow-700 border-yellow-200">{log.role}</span>
                  </td>
                  <td className="px-4 py-3 text-blue-700 font-medium text-xs">{log.file}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{log.size}</td>
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
