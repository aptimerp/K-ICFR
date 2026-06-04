"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import SubPageTabs from "@/components/SubPageTabs";
import { Calendar, Users, GitBranch, Plus, Download, Upload, CheckCircle2, Clock, Lock } from "lucide-react";

const TABS = [
  { id: "period",  label: "평가기간 관리" },
  { id: "orgauth", label: "조직/권한 관리" },
  { id: "approval-line", label: "결재선 관리" },
];

/* 더미 데이터 */
const DUMMY_PERIODS = [
  { id: 1, year: 2025, term: "중간 1차", start: "2025-01-01", end: "2025-06-30", status: "완료", samples: 142 },
  { id: 2, year: 2025, term: "중간 2차", start: "2025-01-01", end: "2025-09-30", status: "진행중", samples: 89 },
  { id: 3, year: 2025, term: "기말",     start: "2025-10-01", end: "2025-12-31", status: "예정", samples: 0 },
];
const DUMMY_DEPTS = [
  { code: "FIN", name: "재무회계팀",  head: "이차장",  members: 8,  lastSync: "2025-05-20" },
  { code: "PUR", name: "구매팀",      head: "박팀장",  members: 12, lastSync: "2025-05-20" },
  { code: "SAL", name: "영업팀",      head: "김팀장",  members: 15, lastSync: "2025-05-20" },
  { code: "MFG", name: "생산팀",      head: "최팀장",  members: 20, lastSync: "2025-05-20" },
];

function PeriodTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">평가기간 목록</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          평가기간 등록
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">평가연도</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">차수</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">기간</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">샘플 수</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">상태</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DUMMY_PERIODS.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{p.year}</td>
                <td className="px-4 py-3 text-gray-700">{p.term}</td>
                <td className="px-4 py-3 text-gray-500">{p.start} ~ {p.end}</td>
                <td className="px-4 py-3 text-gray-700">{p.samples > 0 ? `${p.samples}건` : "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3">
                  {p.status === "진행중" && (
                    <button className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                      <Lock className="w-3 h-3" />
                      마감
                    </button>
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

function OrgAuthTab() {
  return (
    <div className="space-y-6">
      {/* ERP 동기화 안내 배너 */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-blue-900">ERP 부서·사원 마스터</div>
            <div className="text-xs text-blue-600 mt-0.5">마지막 동기화: 2025-05-20 09:15</div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          ERP 동기화
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">부서 목록</h3>
          <span className="text-xs text-gray-500">{DUMMY_DEPTS.length}개 부서</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">부서코드</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">부서명</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">부서장</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">인원 수</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ERP 동기화</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DUMMY_DEPTS.map((d) => (
              <tr key={d.code} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.code}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                <td className="px-4 py-3 text-gray-700">{d.head}</td>
                <td className="px-4 py-3 text-gray-700">{d.members}명</td>
                <td className="px-4 py-3 text-xs text-gray-500">{d.lastSync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApprovalLineTab() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-amber-900">평가 시작 전 필수 설정</div>
          <div className="text-xs text-amber-700 mt-0.5">결재선 관리는 평가 시작 전 반드시 완료해야 합니다. 엑셀 템플릿을 내려받아 작성 후 업로드하세요.</div>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          템플릿 다운로드
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Upload className="w-4 h-4" />
          엑셀 업로드
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <GitBranch className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <div className="text-sm text-gray-500">등록된 결재선이 없습니다</div>
        <div className="text-xs text-gray-400 mt-1">엑셀 템플릿을 업로드하여 결재선을 등록하세요</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    완료:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    진행중: "bg-blue-50 text-blue-700 border-blue-200",
    예정:   "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${map[status] ?? map["예정"]}`}>
      {status}
    </span>
  );
}

function PeriodPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "period";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setActiveTab(t);
  }, [searchParams]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">평가관리</h1>
          <p className="text-sm text-gray-500 mt-1">평가기간 등록 및 조직·권한·결재선을 관리합니다</p>
        </div>

        <SubPageTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "period"        && <PeriodTab />}
        {activeTab === "orgauth"       && <OrgAuthTab />}
        {activeTab === "approval-line" && <ApprovalLineTab />}
      </div>
    </AppLayout>
  );
}

export default function PeriodPage() {
  return (
    <Suspense>
      <PeriodPageContent />
    </Suspense>
  );
}
