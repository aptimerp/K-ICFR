"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import SubPageTabs from "@/components/SubPageTabs";
import EvalTermToggle from "@/components/EvalTermToggle";
import { Bot, CheckCircle2, AlertTriangle, MinusCircle, Flag } from "lucide-react";

const TABS = [
  { id: "eval-perform",    label: "운영평가 수행" },
  { id: "exception-report", label: "예외보고 수행" },
  { id: "exception-manage", label: "예외보고 관리" },
  { id: "deficiency",      label: "미비점 검토" },
];

const DUMMY_EVAL_ITEMS = [
  { id: 1, code: "FR-C-1-3-1", name: "전표 승인 통제", samples: 3, evaluated: 2, result: "NORMAL",    aiDraft: "정상" },
  { id: 2, code: "FR-C-2-1-1", name: "매출 검증 통제", samples: 2, evaluated: 1, result: "EXCEPTION", aiDraft: "예외 가능성" },
  { id: 3, code: "PU-C-1-1-1", name: "구매 승인 통제", samples: 1, evaluated: 0, result: null,        aiDraft: "정상" },
];

const EXCEPTION_GRADES = [
  { id: "improve",  label: "🔵 개선권고",       color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "minor",    label: "🟡 단순한 미비점", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { id: "significant", label: "🟠 유의한 미비점", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "material", label: "🔴 중요한 취약점", color: "bg-red-50 text-red-700 border-red-200" },
];

function ResultBadge({ result }) {
  if (!result) return <span className="text-gray-300 text-xs">미평가</span>;
  const map = {
    NORMAL:     { label: "🟢 정상",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    EXCEPTION:  { label: "🟡 예외",    color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    NA:         { label: "⚪ 해당없음", color: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const s = map[result];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${s.color}`}>{s.label}</span>;
}

function EvalPerformTab() {
  const [selected, setSelected] = useState(DUMMY_EVAL_ITEMS[0]);
  const [verdict,  setVerdicts] = useState({});

  return (
    <div className="flex gap-5 h-[calc(100vh-280px)] min-h-[460px]">
      {/* 좌측 목록 */}
      <div className="w-72 shrink-0 flex flex-col gap-2 overflow-y-auto">
        {DUMMY_EVAL_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all ${
              selected?.id === item.id
                ? "border-blue-300 bg-blue-50 shadow-sm"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px] font-bold text-blue-700">{item.code}</span>
              <ResultBadge result={verdict[item.id] ?? item.result} />
            </div>
            <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
            <div className="text-[11px] text-gray-400 mt-1">샘플 {item.evaluated}/{item.samples} 평가 완료</div>
          </button>
        ))}
      </div>

      {/* 우측 평가 패널 */}
      {selected && (
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="font-mono text-xs font-bold text-blue-700 mb-1">{selected.code}</div>
            <div className="text-base font-bold text-gray-900">{selected.name}</div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* AI Draft */}
            <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-bold text-violet-800">AI 평가 초안</span>
                <span className="text-[10px] text-violet-400">(참고용 — 최종 판단은 사람이 합니다)</span>
              </div>
              <div className="text-sm text-violet-800 font-medium">
                {selected.aiDraft === "정상"
                  ? "🟢 정상으로 판단됩니다. 증빙 첨부·날짜·금액·승인라인 모두 정상."
                  : "🟡 예외 가능성이 있습니다. 승인라인 불일치 항목을 확인하세요."}
              </div>
            </div>

            {/* 결과 판정 */}
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">최종 운영평가 결과 판정</div>
              <div className="flex gap-3">
                {[
                  { id: "NORMAL",    label: "🟢 정상",    icon: CheckCircle2, color: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                  { id: "EXCEPTION", label: "🟡 예외",    icon: AlertTriangle, color: "border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
                  { id: "NA",        label: "⚪ 해당없음", icon: MinusCircle,  color: "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100" },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVerdicts(prev => ({ ...prev, [selected.id]: v.id }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      (verdict[selected.id] ?? selected.result) === v.id
                        ? v.color + " ring-2 ring-offset-1 ring-current"
                        : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 의견 textarea */}
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                평가 의견 {(verdict[selected.id] ?? selected.result) === "EXCEPTION" && <span className="text-red-500">*필수</span>}
              </div>
              <textarea
                rows={4}
                placeholder={
                  (verdict[selected.id] ?? selected.result) === "EXCEPTION"
                    ? "예외로 판정한 상세 사유를 반드시 기재하세요"
                    : "평가 의견을 입력하세요 (선택)"
                }
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-300"
              />
            </div>

            <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
              평가 확정
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExceptionReportTab() {
  const [grade, setGrade] = useState(null);
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Flag className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-bold text-yellow-900">예외보고 수행</span>
        </div>
        <div className="text-xs text-yellow-700">🟡 예외로 판정된 통제에 대해 예외보고서를 작성합니다.</div>
      </div>
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">예외 등급 분류 *필수</div>
        <div className="grid grid-cols-2 gap-3">
          {EXCEPTION_GRADES.map((g) => (
            <button
              key={g.id}
              onClick={() => setGrade(g.id)}
              className={`p-3.5 rounded-xl border-2 text-left font-semibold text-sm transition-all ${
                grade === g.id ? `${g.color} ring-2 ring-offset-1 ring-current` : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">예외 상세 의견 *필수</div>
        <textarea rows={5} placeholder="예외 발생 원인, 영향 범위, 개선 방향을 기재하세요" className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-300" />
      </div>
      <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">
        예외보고서 제출
      </button>
    </div>
  );
}

function ExceptionManageTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {EXCEPTION_GRADES.map((g) => (
          <div key={g.id} className={`p-4 rounded-2xl border ${g.color}`}>
            <div className="text-2xl font-bold">{Math.floor(Math.random() * 5)}</div>
            <div className="text-xs mt-0.5 font-semibold">{g.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
        예외보고 집계 테이블 — 구현 예정
      </div>
    </div>
  );
}

function DeficiencyTab() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
      미비점 이력 관리 테이블 — 구현 예정
    </div>
  );
}

function EvalPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "eval-perform");
  const [evalTerm, setEvalTerm] = useState("중간1");

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">운영평가</h1>
            <p className="text-sm text-gray-500 mt-1">운영평가 수행·예외보고·미비점 검토를 통합 관리합니다</p>
          </div>
          <EvalTermToggle value={evalTerm} onChange={setEvalTerm} />
        </div>
        <SubPageTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "eval-perform"     && <EvalPerformTab />}
        {activeTab === "exception-report" && <ExceptionReportTab />}
        {activeTab === "exception-manage" && <ExceptionManageTab />}
        {activeTab === "deficiency"       && <DeficiencyTab />}
      </div>
    </AppLayout>
  );
}

export default function EvalPage() {
  return <Suspense><EvalPageContent /></Suspense>;
}
