"use client";
import { useState, Suspense } from "react";
import AppLayout from "@/components/AppLayout";
import SubPageTabs from "@/components/SubPageTabs";
import { Construction } from "lucide-react";

const TABS = [
  { id: "self-status",   label: "자체평가 현황" },
  { id: "design-status", label: "설계평가 현황" },
];

function ComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Construction className="w-7 h-7 text-gray-400" />
      </div>
      <div className="text-base font-semibold text-gray-600">{label} — 구현 예정</div>
      <div className="text-sm text-gray-400 mt-1">설계평가관리는 증빙제출 완료 후 구축됩니다</div>
    </div>
  );
}

function ProgressPageContent() {
  const [activeTab, setActiveTab] = useState("self-status");
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">진행관리 (설계평가)</h1>
          <p className="text-sm text-gray-500 mt-1">자체평가·설계평가 진행 현황을 조회합니다</p>
        </div>
        <SubPageTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <ComingSoon label={TABS.find(t => t.id === activeTab)?.label ?? ""} />
      </div>
    </AppLayout>
  );
}

export default function DesignProgressPage() {
  return <Suspense><ProgressPageContent /></Suspense>;
}
