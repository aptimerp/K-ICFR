"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  AlertTriangle, CheckCircle2, Clock, ArrowRight,
  BarChart3, Bot, FileText, Download, Package,
  Layers, TrendingUp, Users, ShieldAlert,
  Eye, FileBarChart2,
} from "lucide-react";

/* ──────────────────────────────────
   페르소나 정의
────────────────────────────────── */
const PERSONAS = [
  { id: "P5", label: "P5 내부회계팀",      color: "bg-red-100 text-red-700" },
  { id: "P1", label: "P1 통제수행자",       color: "bg-blue-100 text-blue-700" },
  { id: "P2", label: "P2 통제책임자",       color: "bg-orange-100 text-orange-700" },
  { id: "P3", label: "P3 내부회계평가자",   color: "bg-purple-100 text-purple-700" },
  { id: "P4", label: "P4 감사·감사위",      color: "bg-yellow-100 text-yellow-700" },
];

/* ──────────────────────────────────
   P1 홈 — 통제수행자
────────────────────────────────── */
function P1Home() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">안녕하세요, 김민준 과장님</h2>
          <p className="text-sm text-gray-500 mt-0.5">오늘 처리할 작업이 있습니다</p>
        </div>
        <span className="text-sm text-gray-400">2025년 중간 1차 평가</span>
      </div>

      {/* 반려 긴급 배너 */}
      <Link href="/op-eval/evidence?tab=submit" className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl hover:bg-red-100 transition-colors group">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-bold text-red-700">🔴 반려 1건 — 즉시 재제출 필요</div>
          <div className="text-xs text-red-500 mt-0.5">PU-C-1-1-1 구매 승인 통제 · 반려 사유 확인</div>
        </div>
        <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* 주요 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/op-eval/evidence?tab=submit" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-400">마감 D-5</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">3건</div>
          <div className="text-sm font-semibold text-gray-700 mt-0.5">운영평가 증빙 제출</div>
          <div className="text-xs text-gray-400 mt-1">SAMPLE_SELECTED → MANUAL_UPLOADED</div>
          <div className="flex items-center gap-1 mt-3 text-blue-600 text-xs font-semibold group-hover:translate-x-1 transition-transform">
            증빙 제출하기 <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link href="/design/self?tab=self-perform" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group opacity-70">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-semibold">준비중</span>
          </div>
          <div className="text-2xl font-bold text-gray-400">1건</div>
          <div className="text-sm font-semibold text-gray-500 mt-0.5">설계평가 자체평가</div>
          <div className="text-xs text-gray-300 mt-1">구현 예정</div>
        </Link>
      </div>

      {/* 작은 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/approval/todo" className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <div className="text-xs text-gray-500">내 할일</div>
            <div className="text-base font-bold text-gray-900">4건 <span className="text-xs font-normal text-gray-400">처리 대기</span></div>
          </div>
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-xs text-gray-500">내 진행 상태</div>
            <div className="text-base font-bold text-gray-900">5/8 <span className="text-xs font-normal text-gray-400">완료</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────
   P2 홈 — 통제책임자
────────────────────────────────── */
function P2Home() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">이차장님 (재무회계팀장)</h2>
        <p className="text-sm text-gray-500 mt-0.5">부서원 처리 현황을 확인하세요</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/approval/inbox" className="bg-white rounded-2xl border border-blue-100 p-5 hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">5건</div>
          <div className="text-sm font-semibold text-gray-700 mt-0.5">증빙제출 승인 대기</div>
          <div className="text-xs text-amber-600 mt-1">⚠️ AI 경고 1건 포함</div>
          <div className="flex items-center gap-1 mt-3 text-blue-600 text-xs font-semibold">
            일괄 처리 <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 opacity-70">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-400">2건</div>
          <div className="text-sm font-semibold text-gray-500 mt-0.5">자체평가 승인 대기</div>
          <div className="text-xs text-gray-300 mt-1">준비중</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">부서 진행률</div>
        {["김민준", "이수현", "박성호"].map((name, i) => {
          const pct = [80, 40, 100][i];
          return (
            <div key={name} className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-600 w-16">{name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full ${pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-600 w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────
   P3 홈 — 내부회계평가자 (2분할)
────────────────────────────────── */
function P3Home() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">장한나 PL, 두 가지 모드로 작업이 분리되어 있습니다</h2>
        <p className="text-sm text-gray-500 mt-0.5">담당자 수행(P1 역할) + 평가자 수행(P3 본업)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 담당자 수행 영역 */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">📥 담당자 수행 (P1 해당)</div>
          <Link href="/op-eval/evidence?tab=submit" className="block bg-white rounded-xl p-4 hover:shadow-sm transition-shadow mb-2 group">
            <div className="text-xl font-bold text-gray-900">2건</div>
            <div className="text-sm text-gray-600 mt-0.5">내 증빙 제출</div>
            <div className="text-xs text-red-500 mt-1">1건 반려 · 마감 D-5</div>
          </Link>
          <div className="bg-white rounded-xl p-3 opacity-60 text-center">
            <div className="text-xs text-gray-500">자체평가 — 준비중</div>
          </div>
        </div>

        {/* 평가자 수행 영역 */}
        <div className="bg-purple-50 rounded-2xl border border-purple-100 p-5">
          <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">🔍 평가자 수행 (P3 해당)</div>
          <Link href="/op-eval/eval?tab=eval-perform" className="block bg-white rounded-xl p-4 hover:shadow-sm transition-shadow mb-2 group">
            <div className="text-xl font-bold text-gray-900">15건</div>
            <div className="text-sm text-gray-600 mt-0.5">TF 운영평가 대기</div>
            <div className="text-xs text-gray-400 mt-1">🟢12 · 🟡2 · ⚪1 진단대기</div>
          </Link>
          <Link href="/op-eval/eval?tab=exception-report" className="block bg-white rounded-xl p-3 hover:shadow-sm transition-shadow text-center">
            <div className="text-xs text-purple-700 font-semibold">예외보고 처리 2건</div>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">TF 전체 진행률</span>
        <div className="flex items-center gap-2 w-48">
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full bg-blue-500" style={{ width: "72%" }} />
          </div>
          <span className="text-sm font-bold text-blue-700">72%</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────
   P4 홈 — 감사인
────────────────────────────────── */
function P4Home() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-2xl">
        <Eye className="w-5 h-5 text-yellow-600 shrink-0" />
        <span className="text-sm font-bold text-yellow-800">🔍 감사인 모드 (Read-Only) — 모든 편집 기능 비활성화</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "전사 평가 완료율", value: "72%",  color: "text-blue-700" },
          { label: "미비점 총 건수",   value: "10건", color: "text-yellow-700" },
          { label: "정상 통제 비율",   value: "92%",  color: "text-emerald-700" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link href="/operations/rcm?tab=rcm-manage" className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow text-center group">
          <FileText className="w-7 h-7 text-gray-400 mx-auto mb-2" />
          <div className="text-sm font-semibold text-gray-700">RCM 조회</div>
        </Link>
        <Link href="/results/status?tab=eval-status" className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow text-center group">
          <BarChart3 className="w-7 h-7 text-gray-400 mx-auto mb-2" />
          <div className="text-sm font-semibold text-gray-700">평가현황 조회</div>
        </Link>
        <Link href="/results/status?tab=evidence-zip" className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow text-center group">
          <Package className="w-7 h-7 text-gray-400 mx-auto mb-2" />
          <div className="text-sm font-semibold text-gray-700">증빙 ZIP 다운로드</div>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40" disabled>
          <Download className="w-4 h-4" /> 결과보고 PDF (준비중)
        </button>
        <Link href="/results/status?tab=evidence-zip" className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700">
          <Package className="w-4 h-4" /> 평가증빙 ZIP (감사인 버전)
        </Link>
      </div>
    </div>
  );
}

/* ──────────────────────────────────
   P5 홈 — 내부회계팀 (관제탑)
────────────────────────────────── */
function P5Home() {
  const [evalTerm, setEvalTerm] = useState("중간1");

  const KPIs = [
    { label: "샘플링 완료", value: "100%", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
    { label: "증빙제출 완료", value: "87%",  color: "text-blue-700",    bg: "bg-blue-50 border-blue-100" },
    { label: "AI 검증 완료",  value: "95%",  color: "text-violet-700",  bg: "bg-violet-50 border-violet-100" },
    { label: "부서 승인 완료", value: "73%",  color: "text-orange-700",  bg: "bg-orange-50 border-orange-100" },
    { label: "운영평가 완료", value: "60%",  color: "text-blue-700",    bg: "bg-blue-50 border-blue-100" },
    { label: "미비점 건수",   value: "10건", color: "text-yellow-700",  bg: "bg-yellow-50 border-yellow-100" },
  ];

  const QUICK_ACTIONS = [
    { label: "RCM 지정",     href: "/operations/rcm?tab=rcm-assign",   badge: "⭐" },
    { label: "모집단 수신",  href: "/op-eval/sampling?tab=population"           },
    { label: "샘플링 작업",  href: "/op-eval/sampling?tab=sampling"             },
    { label: "AI 검증 현황", href: "/op-eval/evidence?tab=ai-check"            },
    { label: "운영평가 수행",href: "/op-eval/eval?tab=eval-perform"            },
    { label: "예외보고 관리",href: "/op-eval/eval?tab=exception-manage"        },
    { label: "결과보고 작성",href: "/results/status?tab=result-report"         },
    { label: "증빙 ZIP 생성",href: "/results/status?tab=evidence-zip"          },
    { label: "사용자 관리",  href: "/settings/users"                            },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">내부회계팀 관제탑</h2>
          <p className="text-sm text-gray-500 mt-0.5">전체 K-ICFR 평가 운영 현황</p>
        </div>
        {/* 차수 토글 */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {["중간1", "중간2", "기말"].map((t) => (
            <button key={t} onClick={() => setEvalTerm(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${evalTerm === t ? "bg-blue-600 text-white shadow-sm" : "text-gray-500"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 6종 */}
      <div className="grid grid-cols-3 gap-3">
        {KPIs.map((kpi) => (
          <div key={kpi.label} className={`rounded-2xl border p-4 ${kpi.bg}`}>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* 통제 유형별 진행 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">통제 유형별 진행률</div>
        {[
          { label: "PLC (업무수준통제)", pct: 72, color: "bg-blue-500" },
          { label: "ITGC (정보일반통제)", pct: 88, color: "bg-violet-500" },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-3 mb-2">
            <span className="text-sm text-gray-600 w-40">{t.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className={`h-2 rounded-full ${t.color}`} style={{ width: `${t.pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-8 text-right">{t.pct}%</span>
          </div>
        ))}
      </div>

      {/* 빠른 액션 */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">빠른 액션</div>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.label} href={a.href}
              className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all flex items-center justify-between gap-1">
              <span>{a.label}</span>
              {a.badge && <span className="text-amber-500 text-[11px]">{a.badge}</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────
   메인 홈 페이지
────────────────────────────────── */
export default function HomePage() {
  const [persona, setPersona] = useState("P5");

  /* localStorage에서 개발용 페르소나 복원 */
  useEffect(() => {
    const stored = localStorage.getItem("dev-persona");
    if (stored) setPersona(stored);

    /* AppLayout의 페르소나 변경 이벤트 수신 */
    const onStorage = () => {
      const p = localStorage.getItem("dev-persona");
      if (p) setPersona(p);
    };
    window.addEventListener("storage", onStorage);
    /* polling fallback (같은 탭) */
    const interval = setInterval(onStorage, 500);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {persona === "P1" && <P1Home />}
        {persona === "P2" && <P2Home />}
        {persona === "P3" && <P3Home />}
        {persona === "P4" && <P4Home />}
        {persona === "P5" && <P5Home />}
      </div>
    </AppLayout>
  );
}
