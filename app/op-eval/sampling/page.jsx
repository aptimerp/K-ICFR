"use client";
import { useState, Suspense } from "react";
import AppLayout from "@/components/AppLayout";
import SubPageTabs from "@/components/SubPageTabs";
import EvalTermToggle from "@/components/EvalTermToggle";
import { ShieldAlert } from "lucide-react";

const TABS = [
  { id: "population",   label: "모집단 관리" },
  { id: "sampling",     label: "샘플링 작업" },
  { id: "sampling-status", label: "샘플링 현황" },
  { id: "evidence-req", label: "증빙요청관리" },
  { id: "submitter",    label: "증빙제출자 지정" },
  { id: "evaluator",    label: "운영평가자 지정" },
];

function ComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-base font-semibold text-gray-500">{label}</div>
      <div className="text-sm text-gray-400 mt-1">구현 예정</div>
    </div>
  );
}

function SamplingPageContent() {
  const [activeTab, setActiveTab] = useState("population");
  const [evalTerm, setEvalTerm] = useState("중간1");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">샘플링작업</h1>
            <p className="text-sm text-gray-500 mt-1">모집단 수신·샘플링·평가준비를 수행합니다 (P5 전용)</p>
          </div>
          <EvalTermToggle value={evalTerm} onChange={setEvalTerm} />
        </div>

        {/* P5 전용 배너 */}
        <div className="mb-5 flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-xs font-semibold text-red-700">이 메뉴는 내부회계팀(P5 Super Admin) 전용입니다</span>
        </div>

        <SubPageTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <ComingSoon label={TABS.find(t => t.id === activeTab)?.label ?? ""} />
      </div>
    </AppLayout>
  );
}

export default function SamplingPage() {
  return <Suspense><SamplingPageContent /></Suspense>;
}
