"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import SubPageTabs from "@/components/SubPageTabs";
import EvalTermToggle from "@/components/EvalTermToggle";
import {
  Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  FileText, FilePlus2, ChevronRight, Send, Save, RotateCcw,
  Bot, Eye, ThumbsUp, ThumbsDown, Paperclip, Loader2, Info,
} from "lucide-react";
import FileUploader from "@/components/FileUploader";

/* ────────────────────────────────
   탭 정의
──────────────────────────────── */
const TABS = [
  { id: "collect",  label: "증빙수집" },
  { id: "ai-check", label: "증빙AI 검증" },
  { id: "submit",   label: "증빙제출 수행", badge: "⭐" },
  { id: "approve",  label: "증빙제출 승인" },
];

/* ────────────────────────────────
   더미 데이터
──────────────────────────────── */
const DUMMY_CONTROLS = [
  {
    id: 1, code: "FR-C-1-3-1", name: "전표 승인 통제", dept: "재무회계팀",
    population: 42, autoCollected: 42, manualUploaded: 0,
    status: "AUTO_COLLECTED", deadline: "2025-06-15", rejected: false,
    samples: [
      { txId: "JV2025001", date: "2025-05-01", desc: "매출채권 전표", amount: "1,250,000", aiStatus: "ok" },
      { txId: "JV2025002", date: "2025-05-03", desc: "비용 승인 전표", amount: "380,000", aiStatus: "warn" },
      { txId: "JV2025008", date: "2025-05-10", desc: "급여 전표", amount: "28,400,000", aiStatus: "ok" },
    ],
  },
  {
    id: 2, code: "FR-C-2-1-1", name: "매출 검증 통제", dept: "영업팀",
    population: 28, autoCollected: 28, manualUploaded: 2,
    status: "MANUAL_UPLOADED", deadline: "2025-06-15", rejected: false,
    samples: [
      { txId: "SL2025011", date: "2025-05-05", desc: "매출 계약서 검토", amount: "5,600,000", aiStatus: "ok" },
      { txId: "SL2025015", date: "2025-05-12", desc: "거래처 확인", amount: "2,100,000", aiStatus: "error" },
    ],
  },
  {
    id: 3, code: "PU-C-1-1-1", name: "구매 승인 통제", dept: "구매팀",
    population: 35, autoCollected: 30, manualUploaded: 0,
    status: "SAMPLE_SELECTED", deadline: "2025-06-10", rejected: true,
    samples: [
      { txId: "PO2025003", date: "2025-05-02", desc: "구매발주 승인", amount: "8,750,000", aiStatus: "ok" },
    ],
  },
  {
    id: 4, code: "HR-C-1-2-1", name: "인사 변경 통제", dept: "인사팀",
    population: 12, autoCollected: 12, manualUploaded: 0,
    status: "AI_VALIDATED", deadline: "2025-06-20", rejected: false,
    samples: [
      { txId: "HR2025004", date: "2025-05-07", desc: "직급 변경 승인", amount: "-", aiStatus: "ok" },
    ],
  },
  {
    id: 5, code: "FA-C-3-1-1", name: "자산 실사 통제", dept: "재무회계팀",
    population: 8, autoCollected: 8, manualUploaded: 1,
    status: "EVIDENCE_CONFIRMED", deadline: "2025-06-30", rejected: false,
    samples: [
      { txId: "FA2025001", date: "2025-05-20", desc: "고정자산 실사", amount: "450,000,000", aiStatus: "ok" },
    ],
  },
];

const DUMMY_DEPT_MEMBERS = [
  { name: "김민준", dept: "재무회계팀", submitted: 3, total: 3, aiWarn: 1, status: "상신" },
  { name: "이수현", dept: "재무회계팀", submitted: 2, total: 4, aiWarn: 0, status: "작성" },
  { name: "박지영", dept: "영업팀",     submitted: 2, total: 2, aiWarn: 0, status: "상신" },
  { name: "최동훈", dept: "구매팀",     submitted: 0, total: 3, aiWarn: 0, status: "반려" },
];

/* ────────────────────────────────
   Status 배지
──────────────────────────────── */
const STATUS_LABEL = {
  SAMPLE_SELECTED:    { label: "샘플 선정",     color: "bg-gray-100 text-gray-600 border-gray-200" },
  AUTO_COLLECTED:     { label: "자동 수집",     color: "bg-sky-50 text-sky-700 border-sky-200" },
  MANUAL_UPLOADED:    { label: "수동 업로드",   color: "bg-blue-50 text-blue-700 border-blue-200" },
  AI_VALIDATED:       { label: "AI 검증 완료", color: "bg-violet-50 text-violet-700 border-violet-200" },
  EVIDENCE_CONFIRMED: { label: "부서 승인",     color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EVALUATED:          { label: "평가 완료",     color: "bg-green-50 text-green-700 border-green-200" },
};

function StatusBadge({ status }) {
  const s = STATUS_LABEL[status] ?? STATUS_LABEL["SAMPLE_SELECTED"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${s.color}`}>
      {s.label}
    </span>
  );
}

function AiBadge({ status }) {
  if (status === "ok")    return <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold"><CheckCircle2 className="w-2.5 h-2.5" />정상</span>;
  if (status === "warn")  return <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold"><AlertTriangle className="w-2.5 h-2.5" />경고</span>;
  if (status === "error") return <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold"><XCircle className="w-2.5 h-2.5" />오류</span>;
  return null;
}

/* ────────────────────────────────
   탭1: 증빙수집
──────────────────────────────── */
function CollectTab({ evalTerm }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            총 <strong className="text-gray-900">{DUMMY_CONTROLS.length}</strong>개 통제 ·
            자동수집 <strong className="text-sky-700">4</strong>건 ·
            수동필요 <strong className="text-amber-700">1</strong>건
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4" />
          ERP 동기화
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">통제코드</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">통제활동</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">부서</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">모집단</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">자동수집</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">수동업로드</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DUMMY_CONTROLS.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold">{c.code}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.dept}</td>
                <td className="px-4 py-3 text-right text-gray-700">{c.population}</td>
                <td className="px-4 py-3 text-right text-sky-700 font-medium">{c.autoCollected}</td>
                <td className="px-4 py-3 text-right text-blue-700 font-medium">{c.manualUploaded || "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────
   탭2: 증빙AI 검증
──────────────────────────────── */
function AiCheckTab() {
  return (
    <div className="space-y-5">
      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "검증 완료", count: 3, color: "bg-emerald-50 border-emerald-100", textColor: "text-emerald-700", icon: CheckCircle2 },
          { label: "경고",      count: 1, color: "bg-amber-50 border-amber-100",     textColor: "text-amber-700",   icon: AlertTriangle },
          { label: "오류",      count: 1, color: "bg-red-50 border-red-100",         textColor: "text-red-700",     icon: XCircle },
        ].map((card) => (
          <div key={card.label} className={`p-4 rounded-2xl border ${card.color} flex items-center gap-4`}>
            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${card.textColor}`}>{card.count}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AI 검증 목록 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Bot className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-semibold text-gray-900">AI 증빙 검증 결과</span>
          <span className="text-xs text-gray-400 ml-1">첨부·날짜·금액·승인라인 자동 검증</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">통제코드</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">TRANSACTION_ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">일자</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">AI 결과</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">상세 메시지</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DUMMY_CONTROLS.flatMap((c) =>
              c.samples.map((s) => (
                <tr key={`${c.id}-${s.txId}`} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700">{c.code}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.txId}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.date}</td>
                  <td className="px-4 py-3"><AiBadge status={s.aiStatus} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {s.aiStatus === "ok"    && "모든 항목 정상"}
                    {s.aiStatus === "warn"  && "⚠️ 승인라인 불일치 가능성"}
                    {s.aiStatus === "error" && "❌ 거래처코드 매핑 오류"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────
   탭3: 증빙제출 수행 ⭐ (핵심)
──────────────────────────────── */
function SubmitTab({ evalTerm }) {
  const [selected,       setSelected]       = useState(DUMMY_CONTROLS[0]);
  const [comment,        setComment]        = useState("");
  const [uploadedFiles,  setUploadedFiles]  = useState([]);  // FileUploader 상태

  const isEolTerm = evalTerm === "기말";

  return (
    <div className="flex gap-5 h-[calc(100vh-280px)] min-h-[500px]">

      {/* ── 좌측: 담당 통제 목록 ── */}
      <div className="w-80 shrink-0 flex flex-col gap-2 overflow-y-auto">
        {/* 반려 건 빨강 배너 */}
        {DUMMY_CONTROLS.some(c => c.rejected) && (
          <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-red-700">반려 건 재제출 필요</div>
              <div className="text-[11px] text-red-500">즉시 처리하세요</div>
            </div>
          </div>
        )}

        {DUMMY_CONTROLS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all ${
              selected?.id === c.id
                ? "border-blue-300 bg-blue-50 shadow-sm"
                : c.rejected
                  ? "border-red-200 bg-red-50 hover:border-red-300"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className={`font-mono text-[11px] font-bold ${c.rejected ? "text-red-600" : "text-blue-700"}`}>
                {c.code}
              </span>
              {c.rejected
                ? <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">반려</span>
                : <StatusBadge status={c.status} />
              }
            </div>
            <div className="text-sm font-medium text-gray-900 truncate">{c.name}</div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-gray-400">{c.dept}</span>
              <span className={`text-[11px] font-semibold ${
                new Date(c.deadline) < new Date("2025-06-12") ? "text-red-500" : "text-gray-400"
              }`}>
                마감 {c.deadline}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── 우측: 선택한 통제 상세 ── */}
      {selected ? (
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-blue-700">{selected.code}</span>
                <StatusBadge status={selected.status} />
                {selected.rejected && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">반려됨</span>
                )}
              </div>
              <div className="text-base font-bold text-gray-900">{selected.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{selected.dept} · 모집단 {selected.population}건</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
                <Save className="w-3.5 h-3.5" /> 저장
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
                <Send className="w-3.5 h-3.5" /> 상신
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 기말 안내 배너 */}
            {isEolTerm && (
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <strong>기말 평가 모드</strong> — 12월 31일 기준 최신 증빙을 우선 제출하세요.
                  12월 미발생 시 11월 → 이전 순으로 제출합니다.
                </div>
              </div>
            )}

            {/* TRANSACTION_ID 샘플 목록 */}
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">샘플 목록 (TRANSACTION_ID)</div>
              <div className="space-y-2">
                {selected.samples.map((s) => (
                  <div key={s.txId} className={`flex items-center gap-3 p-3 rounded-xl border ${
                    s.aiStatus === "error" ? "border-red-200 bg-red-50/50" :
                    s.aiStatus === "warn"  ? "border-amber-200 bg-amber-50/50" :
                    "border-gray-100 bg-gray-50/50"
                  }`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-700">{s.txId}</span>
                        <AiBadge status={s.aiStatus} />
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{s.desc} · {s.date}</div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 shrink-0">{s.amount}원</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 파일 업로드 영역 — FileUploader 표준 컴포넌트 */}
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                증빙 파일 업로드
                <span className="ml-2 text-gray-300 font-normal normal-case">
                  PDF · PNG · JPG · JPEG · XLSX · XLS · DOCX · DOC · 최대 50MB
                </span>
              </div>
              <FileUploader
                onFilesSelected={setUploadedFiles}
                /* onUpload: Supabase Storage 연동 후 활성화
                onUpload={async (file) => {
                  const path = `evidence/${selected.code}/${file.name}`;
                  const { data, error } = await supabase.storage
                    .from("evidence").upload(path, file.raw, { upsert: true });
                  if (error) throw error;
                  const { data: { publicUrl } } = supabase.storage
                    .from("evidence").getPublicUrl(path);
                  return { url: publicUrl };
                }}
                */
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                파일명이 자동 변환됩니다: <span className="font-mono">증빙순번_모집단내용.확장자</span>
              </p>
            </div>

            {/* AI 검증 인라인 패널 */}
            {selected.samples.some(s => s.aiStatus !== "ok") && (
              <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-800">AI 검증 경고</span>
                </div>
                {selected.samples.filter(s => s.aiStatus !== "ok").map(s => (
                  <div key={s.txId} className="flex items-start gap-2 text-xs text-amber-700 mt-1">
                    <span className="font-mono font-bold">{s.txId}:</span>
                    <span>
                      {s.aiStatus === "warn"  && "승인라인 불일치 가능성이 있습니다. 확인 후 제출하세요."}
                      {s.aiStatus === "error" && "거래처코드 매핑 오류. 증빙을 다시 확인하세요."}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 제출 의견 */}
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">증빙 제출 의견</div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="증빙에 대한 의견을 입력하세요 (선택)"
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-300"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <div className="text-sm">왼쪽에서 통제를 선택하세요</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────
   탭4: 증빙제출 승인
──────────────────────────────── */
function ApproveTab() {
  const [selected, setSelected] = useState([]);

  const toggleAll = (checked) => {
    setSelected(checked ? DUMMY_DEPT_MEMBERS.map((_, i) => i) : []);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          부서원 <strong className="text-gray-900">{DUMMY_DEPT_MEMBERS.length}</strong>명 ·
          상신 대기 <strong className="text-blue-700">2</strong>건
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-40" disabled={selected.length === 0}>
            <ThumbsDown className="w-4 h-4" /> 반려
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40" disabled={selected.length === 0}>
            <ThumbsUp className="w-4 h-4" /> 일괄 승인 ({selected.length})
          </button>
        </div>
      </div>

      {/* 결재선 자동 적용 안내 */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-xs text-blue-700">결재선은 <strong>결재선 관리</strong>에서 설정한 라인이 자동 적용됩니다. ITGC 통제는 SAC 자가평가 → P5 확인 별도 진행.</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  onChange={(e) => toggleAll(e.target.checked)}
                  checked={selected.length === DUMMY_DEPT_MEMBERS.length}
                  className="rounded"
                />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">이름</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">부서</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">제출/전체</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">AI 경고</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DUMMY_DEPT_MEMBERS.map((m, i) => (
              <tr key={i} className={`transition-colors ${selected.includes(i) ? "bg-blue-50/50" : "hover:bg-gray-50/50"}`}>
                <td className="px-4 py-3 text-center">
                  {m.status === "상신" && (
                    <input
                      type="checkbox"
                      checked={selected.includes(i)}
                      onChange={(e) => setSelected(prev =>
                        e.target.checked ? [...prev, i] : prev.filter(x => x !== i)
                      )}
                      className="rounded"
                    />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{m.dept}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-semibold ${m.submitted === m.total ? "text-emerald-700" : "text-amber-700"}`}>
                    {m.submitted}
                  </span>
                  <span className="text-gray-400">/{m.total}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {m.aiWarn > 0
                    ? <span className="text-amber-600 font-semibold">{m.aiWarn}</span>
                    : <span className="text-gray-300">-</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${
                    m.status === "완료" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    m.status === "상신" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    m.status === "반려" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-gray-100 text-gray-500 border-gray-200"
                  }`}>
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────
   메인 페이지
──────────────────────────────── */
function EvidencePageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "submit";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [evalTerm,  setEvalTerm]  = useState("중간1");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setActiveTab(t);
  }, [searchParams]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">증빙제출</h1>
            <p className="text-sm text-gray-500 mt-1">증빙 수집·AI 검증·제출·승인 전 과정을 관리합니다</p>
          </div>
          <EvalTermToggle value={evalTerm} onChange={setEvalTerm} />
        </div>

        <SubPageTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "collect"  && <CollectTab evalTerm={evalTerm} />}
        {activeTab === "ai-check" && <AiCheckTab />}
        {activeTab === "submit"   && <SubmitTab evalTerm={evalTerm} />}
        {activeTab === "approve"  && <ApproveTab />}
      </div>
    </AppLayout>
  );
}

export default function EvidencePage() {
  return (
    <Suspense>
      <EvidencePageContent />
    </Suspense>
  );
}
