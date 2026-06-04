"use client";
import AppLayout from "@/components/AppLayout";
import { CheckSquare, AlertTriangle, RotateCcw, ArrowRight } from "lucide-react";

const DUMMY_TODOS = [
  { id: 1, type: "증빙제출 상신",  ctrl: "FR-C-1-3-1", title: "전표 승인 통제 증빙제출",   dept: "재무회계팀", deadline: "2025-06-15", urgent: false },
  { id: 2, type: "결재 승인",      ctrl: "FR-C-2-1-1", title: "매출 검증 통제 부서 승인",   dept: "영업팀",     deadline: "2025-06-10", urgent: true  },
  { id: 3, type: "반려 재제출",    ctrl: "PU-C-1-1-1", title: "구매 승인 통제 증빙 재제출", dept: "구매팀",     deadline: "2025-06-08", urgent: true  },
  { id: 4, type: "운영평가 수행",  ctrl: "HR-C-1-2-1", title: "인사 변경 통제 TF 평가",    dept: "인사팀",     deadline: "2025-06-20", urgent: false },
];

const TYPE_COLOR = {
  "증빙제출 상신": "bg-blue-50 text-blue-700 border-blue-200",
  "결재 승인":     "bg-emerald-50 text-emerald-700 border-emerald-200",
  "반려 재제출":   "bg-red-50 text-red-700 border-red-200",
  "운영평가 수행": "bg-violet-50 text-violet-700 border-violet-200",
};

export default function TodoPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">내 할일</h1>
          <p className="text-sm text-gray-500 mt-1">처리 대기 중인 결재·상신·재제출 작업 목록입니다</p>
        </div>
        {/* 긴급 배너 */}
        {DUMMY_TODOS.some(t => t.urgent) && (
          <div className="mb-5 flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <div className="text-sm font-bold text-red-700">긴급 처리 필요 {DUMMY_TODOS.filter(t => t.urgent).length}건</div>
              <div className="text-xs text-red-500">마감이 임박한 항목이 있습니다</div>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {DUMMY_TODOS.map((item) => (
            <div key={item.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer ${item.urgent ? "border-red-200" : "border-gray-100"}`}>
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                {item.type === "반려 재제출" ? <RotateCcw className="w-4 h-4 text-red-500" /> : <CheckSquare className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold ${TYPE_COLOR[item.type] ?? ""}`}>{item.type}</span>
                  {item.urgent && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">긴급</span>}
                </div>
                <div className="text-sm font-semibold text-gray-900 truncate">{item.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.ctrl} · {item.dept} · 마감 {item.deadline}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
