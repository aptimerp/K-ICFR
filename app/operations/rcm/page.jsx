"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import SubPageTabs from "@/components/SubPageTabs";
import { BookOpen, Download, Upload, Lock, CheckCircle2, AlertTriangle, Building2 } from "lucide-react";

const TABS = [
  { id: "rcm-assign", label: "RCM 지정", badge: "⭐" },
  { id: "rcm-manage", label: "RCM 관리" },
  { id: "rcm-dept",   label: "RCM-부서 Map" },
];

const CTRL_TYPE_TABS = ["PLC", "ITGC", "ELC"];

const DUMMY_RCM_VERSIONS = [
  { version: "v3", date: "2025-05-15", locked: true,  controls: 402, note: "기말 운영평가용 (현재 락)" },
  { version: "v2", date: "2025-01-10", locked: true,  controls: 398, note: "중간 2차 운영평가용" },
  { version: "v1", date: "2024-12-05", locked: true,  controls: 390, note: "중간 1차 운영평가용" },
];

const DUMMY_RCM_PLC = [
  { code: "FR-C-1-3-1", process: "재무보고", risk: "재무제표 오류", control: "전표 승인 통제", period: "일별", owner: "FIN" },
  { code: "FR-C-2-1-1", process: "매출",     risk: "수익 인식 오류", control: "매출 검증", period: "월별", owner: "SAL" },
  { code: "PU-C-1-1-1", process: "구매",     risk: "비인가 구매", control: "구매 승인", period: "건별", owner: "PUR" },
];

function RcmAssignTab() {
  return (
    <div className="space-y-6">
      {/* 안내 카드 */}
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-blue-900">RCM 지정이란?</div>
            <div className="text-xs text-blue-700 mt-1 leading-relaxed">
              운영평가 시작 전, 현재 RCM 버전을 <strong>"이 버전으로 평가했다"</strong>고 확정 기록합니다.<br />
              설계평가 진행 여부와 무관하게 단독 실행 가능하며, 감사 추적의 핵심 근거가 됩니다.
            </div>
          </div>
        </div>
      </div>

      {/* 현재 락 상태 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">RCM 버전 이력</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4" />
            RCM 지정 실행
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">버전</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">지정일</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">통제 수</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">비고</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DUMMY_RCM_VERSIONS.map((v) => (
              <tr key={v.version} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-sm font-bold text-gray-900">{v.version}</td>
                <td className="px-4 py-3 text-gray-500">{v.date}</td>
                <td className="px-4 py-3 text-gray-700">{v.controls}건</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{v.note}</td>
                <td className="px-4 py-3">
                  {v.locked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                      <Lock className="w-2.5 h-2.5" />
                      확정
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RcmManageTab() {
  const [ctrlType, setCtrlType] = useState("PLC");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        {/* 통제 유형 탭 */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {CTRL_TYPE_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setCtrlType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                ctrlType === t ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> 다운로드
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
            <Upload className="w-3.5 h-3.5" /> 업로드
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">통제코드</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">프로세스</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">위험</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">통제활동</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">주기</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">부서</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ctrlType === "PLC" && DUMMY_RCM_PLC.map((r) => (
              <tr key={r.code} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold">{r.code}</td>
                <td className="px-4 py-3 text-gray-700">{r.process}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{r.risk}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{r.control}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.period}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.owner}</td>
              </tr>
            ))}
            {ctrlType !== "PLC" && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                  {ctrlType} 통제 데이터를 엑셀로 업로드하세요
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RcmDeptTab() {
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> 템플릿 다운로드
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
          <Upload className="w-3.5 h-3.5" /> 엑셀 업로드
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <div className="text-sm text-gray-500">RCM-부서 매핑 데이터가 없습니다</div>
        <div className="text-xs text-gray-400 mt-1">엑셀 템플릿을 업로드하여 통제-부서 매핑을 등록하세요</div>
      </div>
    </div>
  );
}

function RcmPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "rcm-assign";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setActiveTab(t);
  }, [searchParams]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">RCM관리</h1>
          <p className="text-sm text-gray-500 mt-1">RCM 지정·관리 및 부서 매핑을 설정합니다</p>
        </div>

        <SubPageTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "rcm-assign" && <RcmAssignTab />}
        {activeTab === "rcm-manage" && <RcmManageTab />}
        {activeTab === "rcm-dept"   && <RcmDeptTab />}
      </div>
    </AppLayout>
  );
}

export default function RcmPage() {
  return (
    <Suspense>
      <RcmPageContent />
    </Suspense>
  );
}
