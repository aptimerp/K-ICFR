"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import SubPageTabs from "@/components/SubPageTabs";
import EvalTermToggle from "@/components/EvalTermToggle";
import { Download, FileBarChart2, Package } from "lucide-react";

const TABS = [
  { id: "eval-status",    label: "평가현황" },
  { id: "progress",       label: "진행현황" },
  { id: "ctrl-history",   label: "통제이력" },
  { id: "statistics",     label: "평가통계" },
  { id: "evidence-zip",   label: "평가증빙제출 (ZIP)" },
  { id: "result-report",  label: "결과보고" },
];

const CTRL_RESULTS = [
  { code: "FR-C-1-3-1", name: "전표 승인 통제",  normal: 40, exception: 2, na: 0 },
  { code: "FR-C-2-1-1", name: "매출 검증 통제",  normal: 25, exception: 3, na: 0 },
  { code: "PU-C-1-1-1", name: "구매 승인 통제",  normal: 30, exception: 5, na: 0 },
  { code: "HR-C-1-2-1", name: "인사 변경 통제",  normal: 12, exception: 0, na: 0 },
  { code: "FA-C-3-1-1", name: "자산 실사 통제",  normal: 8,  exception: 0, na: 0 },
];

function EvalStatusTab() {
  return (
    <div className="space-y-5">
      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "🟢 정상",    count: 115, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
          { label: "🟡 예외",    count: 10,  color: "text-yellow-700",  bg: "bg-yellow-50 border-yellow-100" },
          { label: "⚪ 해당없음", count: 0,   color: "text-gray-500",    bg: "bg-gray-50 border-gray-100" },
        ].map((c) => (
          <div key={c.label} className={`p-4 rounded-2xl border ${c.bg}`}>
            <div className={`text-3xl font-bold ${c.color}`}>{c.count}</div>
            <div className="text-sm font-semibold text-gray-600 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">통제코드</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">통제활동</th>
              <th className="text-center px-4 py-3 font-semibold text-emerald-600">🟢 정상</th>
              <th className="text-center px-4 py-3 font-semibold text-yellow-600">🟡 예외</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-400">⚪ 해당없음</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">진행률</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {CTRL_RESULTS.map((r) => {
              const total = r.normal + r.exception + r.na;
              const pct   = total > 0 ? Math.round(((r.normal + r.na) / total) * 100) : 0;
              return (
                <tr key={r.code} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold">{r.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-center text-emerald-700 font-semibold">{r.normal}</td>
                  <td className="px-4 py-3 text-center text-yellow-700 font-semibold">{r.exception || "-"}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{r.na || "-"}</td>
                  <td className="px-4 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GenericTab({ label }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
      <FileBarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <div className="text-sm">{label} — 구현 예정</div>
    </div>
  );
}

function EvidenceZipTab() {
  return (
    <div className="space-y-5">
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-blue-900">평가증빙제출 패키지 (ZIP)</div>
          <div className="text-xs text-blue-700 mt-1">프로세스 / 통제 / 샘플 트리 구조로 패키지를 생성합니다</div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100">
            <Package className="w-4 h-4" /> 일반 버전 생성
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
            <Download className="w-4 h-4" /> 감사인 버전 다운로드
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
        ZIP 파일 트리 구조 — 구현 예정
      </div>
    </div>
  );
}

function ResultReportTab() {
  return (
    <div className="space-y-4">
      {[
        { label: "중간 운영실태평가 보고서", date: "2025-06-30 (예정)", ready: false },
        { label: "결과 운영실태평가 보고서", date: "2025-09-30 (예정)", ready: false },
        { label: "최종 운영실태평가 보고서", date: "2025-12-31 (예정)", ready: false },
      ].map((r) => (
        <div key={r.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">{r.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{r.date}</div>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 disabled:opacity-40" disabled={!r.ready}>
            <Download className="w-3.5 h-3.5" /> PDF 다운로드
          </button>
        </div>
      ))}
    </div>
  );
}

function StatusPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "eval-status");
  const [evalTerm, setEvalTerm] = useState("중간1");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">평가 현황</h1>
            <p className="text-sm text-gray-500 mt-1">평가결과·진행현황·통제이력·통계·보고서를 종합 조회합니다</p>
          </div>
          <EvalTermToggle value={evalTerm} onChange={setEvalTerm} />
        </div>
        <SubPageTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "eval-status"   && <EvalStatusTab />}
        {activeTab === "progress"      && <GenericTab label="진행현황" />}
        {activeTab === "ctrl-history"  && <GenericTab label="통제이력 (감사 추적)" />}
        {activeTab === "statistics"    && <GenericTab label="평가통계" />}
        {activeTab === "evidence-zip"  && <EvidenceZipTab />}
        {activeTab === "result-report" && <ResultReportTab />}
      </div>
    </AppLayout>
  );
}

export default function ResultsStatusPage() {
  return <Suspense><StatusPageContent /></Suspense>;
}
