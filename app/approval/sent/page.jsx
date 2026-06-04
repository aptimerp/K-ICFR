"use client";
import AppLayout from "@/components/AppLayout";
import { X } from "lucide-react";

const DUMMY_SENT = [
  { id: 1, title: "전표 승인 통제 증빙제출",   ctrl: "FR-C-1-3-1", submitted: "2025-05-20", status: "결재중", step: "2/3" },
  { id: 2, title: "매출 검증 통제 증빙제출",   ctrl: "FR-C-2-1-1", submitted: "2025-05-18", status: "완료",   step: "3/3" },
  { id: 3, title: "구매 승인 통제 증빙제출",   ctrl: "PU-C-1-1-1", submitted: "2025-05-15", status: "반려",   step: "1/2" },
];
const STATUS_COLOR = {
  결재중: "bg-blue-50 text-blue-700 border-blue-200",
  완료:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  반려:   "bg-red-50 text-red-700 border-red-200",
};

export default function SentPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">상신함</h1>
          <p className="text-sm text-gray-500 mt-1">내가 상신한 결재 건의 진행 상태를 확인합니다</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">제목</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">통제코드</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">상신일</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">결재 단계</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">상태</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DUMMY_SENT.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-700">{item.ctrl}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.submitted}</td>
                  <td className="px-4 py-3 text-gray-600">{item.step}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${STATUS_COLOR[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {item.status === "결재중" && (
                      <button className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50">
                        <X className="w-3 h-3" /> 취소
                      </button>
                    )}
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
