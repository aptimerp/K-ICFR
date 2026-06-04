"use client";
import { useState, Suspense } from "react";
import AppLayout from "@/components/AppLayout";
import SubPageTabs from "@/components/SubPageTabs";
import EvalTermToggle from "@/components/EvalTermToggle";

const TABS = [
  { id: "evidence-status",  label: "증빙제출 현황" },
  { id: "eval-status",      label: "운영평가 현황" },
  { id: "exception-status", label: "예외보고 현황" },
];

const DEPTS = ["재무회계팀", "영업팀", "구매팀", "생산팀", "인사팀"];

function ProgressTable({ type }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">부서</th>
            <th className="text-center px-4 py-3 font-semibold text-gray-600">전체</th>
            <th className="text-center px-4 py-3 font-semibold text-gray-600">작성</th>
            <th className="text-center px-4 py-3 font-semibold text-gray-600">상신</th>
            <th className="text-center px-4 py-3 font-semibold text-gray-600">결재중</th>
            <th className="text-center px-4 py-3 font-semibold text-gray-600">완료</th>
            <th className="text-center px-4 py-3 font-semibold text-gray-600">진행률</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {DEPTS.map((dept) => {
            const total    = Math.floor(Math.random() * 10) + 5;
            const done     = Math.floor(total * Math.random());
            const progress = Math.round((done / total) * 100);
            return (
              <tr key={dept} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{dept}</td>
                <td className="px-4 py-3 text-center text-gray-700">{total}</td>
                <td className="px-4 py-3 text-center text-gray-400">{Math.floor(Math.random() * 3)}</td>
                <td className="px-4 py-3 text-center text-blue-600">{Math.floor(Math.random() * 3)}</td>
                <td className="px-4 py-3 text-center text-amber-600">{Math.floor(Math.random() * 2)}</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{done}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${progress >= 80 ? "bg-emerald-500" : progress >= 50 ? "bg-blue-500" : "bg-amber-400"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 w-8 text-right">{progress}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProgressPageContent() {
  const [activeTab, setActiveTab] = useState("evidence-status");
  const [evalTerm, setEvalTerm] = useState("중간1");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">진행관리 (운영평가)</h1>
            <p className="text-sm text-gray-500 mt-1">증빙제출·운영평가·예외보고 진행 현황을 조회합니다</p>
          </div>
          <EvalTermToggle value={evalTerm} onChange={setEvalTerm} />
        </div>
        <SubPageTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <ProgressTable type={activeTab} />
      </div>
    </AppLayout>
  );
}

export default function OpEvalProgressPage() {
  return <Suspense><ProgressPageContent /></Suspense>;
}
