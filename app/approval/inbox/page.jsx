"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const DUMMY_INBOX = [
  { id: 1, title: "전표 승인 통제 증빙제출",   ctrl: "FR-C-1-3-1", from: "김민준", dept: "재무회계팀", received: "2025-05-21", aiWarn: 1 },
  { id: 2, title: "매출 검증 통제 증빙제출",   ctrl: "FR-C-2-1-1", from: "박지영", dept: "영업팀",     received: "2025-05-21", aiWarn: 0 },
  { id: 3, title: "인사 변경 통제 증빙제출",   ctrl: "HR-C-1-2-1", from: "이수현", dept: "인사팀",     received: "2025-05-20", aiWarn: 0 },
];

export default function InboxPage() {
  const [selected, setSelected] = useState([]);
  const toggleAll = (checked) => setSelected(checked ? DUMMY_INBOX.map((_, i) => i) : []);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">결재함</h1>
          <p className="text-sm text-gray-500 mt-1">부서원이 상신한 결재 건을 일괄 승인·반려합니다</p>
        </div>
        <div className="flex justify-end gap-2 mb-4">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-40" disabled={selected.length === 0}>
            <ThumbsDown className="w-4 h-4" /> 반려
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40" disabled={selected.length === 0}>
            <ThumbsUp className="w-4 h-4" /> 일괄 승인 ({selected.length})
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3"><input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} className="rounded" /></th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">제목</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">상신자</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">접수일</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">AI 경고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DUMMY_INBOX.map((item, i) => (
                <tr key={item.id} className={`transition-colors ${selected.includes(i) ? "bg-blue-50/50" : "hover:bg-gray-50/50"}`}>
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" checked={selected.includes(i)} onChange={(e) => setSelected(prev => e.target.checked ? [...prev, i] : prev.filter(x => x !== i))} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="font-mono text-[11px] text-blue-700 mt-0.5">{item.ctrl}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.from} · <span className="text-xs text-gray-400">{item.dept}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.received}</td>
                  <td className="px-4 py-3 text-center">
                    {item.aiWarn > 0
                      ? <span className="text-amber-600 font-bold text-xs">{item.aiWarn}건</span>
                      : <span className="text-gray-300 text-xs">-</span>}
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
