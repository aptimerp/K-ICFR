"use client";
import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import ApprovalDrawer from "@/components/ApprovalDrawer";
import EvidenceViewer from "@/components/EvidenceViewer";
import { X, RotateCcw, FileText, MessageSquare, Download, Users, Send, Search, Lock, ShieldCheck, ListChecks, FlaskConical, Layers, ZoomIn, Info, Save, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useEvalTerm } from "@/components/evalTerms";

/* 통제 풀 — 실제 RCM 통제코드/활동명 */
const CTRL_POOL = [
  { ctrl: "FA-C-1-2-4", name: "건설중인자산계정의 본계정 대체 승인", dept: "음성회계파트",
    desc: "건설중인자산(CIP)의 완성 시점에 본계정(유형자산)으로 대체하는 회계처리가 적시·정확하게 승인되는지 검토하는 통제", evidence: "본계정 대체 전표, 자산 취득 품의서, 준공계(완성 증빙)", test: "① 대체 전표 표본 추출 ② 품의서·준공계와 금액·일자 일치 확인 ③ 전결권자 승인 여부 검증" },
  { ctrl: "FA-C-1-4-2", name: "회계팀의 고정자산 처분손익 검토 및 승인", dept: "음성회계파트",
    desc: "고정자산 처분 시 처분손익이 정확히 산정·계상되고 적정 권한자의 승인을 거치는지 검토하는 통제", evidence: "처분 전표, 처분 품의서, 자산대장, 매각 계약서", test: "① 처분 전표 표본 추출 ② 장부가·처분가 대사 ③ 손익 계산 재계산 ④ 승인라인 확인" },
  { ctrl: "FA-C-1-6-1", name: "임대차계약 리스트의 완전성 검토 및 승인", dept: "언양회계파트",
    desc: "리스회계(K-IFRS 1116) 적용 대상 임대차계약이 누락 없이 리스트에 포함되었는지 완전성을 검토하는 통제", evidence: "임대차계약 리스트, 신규 계약서, 계약 대장", test: "① 계약 리스트와 원장 대사 ② 신규 계약 표본의 리스트 등재 여부 확인 ③ 승인 여부 검증" },
  { ctrl: "FA-C-1-6-2", name: "리스부채 산정시 활용되는 기초 계약정보의 정확성 검토", dept: "언양회계파트",
    desc: "리스부채 산정의 기초가 되는 계약정보(리스료·기간·옵션)의 정확성을 검토하는 통제", evidence: "리스 산정 명세, 계약서, 리스부채 산정 워크시트", test: "① 산정 명세와 계약서 조건 대사 ② 리스료·기간 입력값 정확성 확인" },
  { ctrl: "FA-C-1-6-3", name: "할인율의 적정성 검토 및 승인", dept: "언양회계파트",
    desc: "리스부채 현재가치 산정에 사용되는 증분차입이자율(할인율)의 적정성을 검토·승인하는 통제", evidence: "할인율 산정 근거, 차입 조건표, 승인 문서", test: "① 적용 할인율과 산정 근거 대사 ② 시장금리·차입조건 반영 적정성 검토" },
  { ctrl: "FA-C-1-7-1", name: "임대자산 취득(대체) 검토 및 승인", dept: "창녕회계파트",
    desc: "임대자산의 신규 취득 및 계정 대체가 적정 권한자의 승인 하에 정확히 처리되는지 검토하는 통제", evidence: "취득 품의서, 취득 전표, 자산 등록 내역", test: "① 취득 표본 추출 ② 품의서·전표 일치 확인 ③ 자산대장 등록 검증" },
  { ctrl: "FA-C-1-7-6", name: "임대자산 감가상각비 검토 및 승인", dept: "창녕회계파트",
    desc: "임대자산 감가상각비가 내용연수·상각방법에 따라 정확히 계상되는지 검토·승인하는 통제", evidence: "감가상각 명세, 자산대장, 상각 전표", test: "① 상각비 재계산 ② 내용연수·상각방법 적정성 확인 ③ 전표 계상 검증" },
  { ctrl: "FR-C-1-4-1", name: "결산 절차 체크리스트 검토", dept: "서울회계파트",
    desc: "월/분기/연 결산 시 표준 결산 체크리스트의 모든 항목이 수행·검토되었는지 확인하는 통제", evidence: "결산 체크리스트, 결산 작업 증빙, 검토자 서명", test: "① 체크리스트 항목별 수행 증빙 확인 ② 미수행 항목 사유 검토 ③ 검토자 승인 확인" },
  { ctrl: "FR-C-1-4-2", name: "ERP 전표 마감 이후 입력 전표에 대한 검토 및 승인", dept: "서울회계파트",
    desc: "ERP 회계 마감 이후 입력된 전표가 적정 사유·권한 하에 처리되었는지 검토하는 통제", evidence: "마감 후 전표 리스트, 입력 사유서, 승인 내역", test: "① 마감 후 전표 전수/표본 추출 ② 입력 사유 적정성 확인 ③ 전결권자 승인 검증" },
  { ctrl: "FR-C-1-4-4", name: "미결잔액에 대한 관리", dept: "서울회계파트",
    desc: "가지급금·미결산 계정 등 미결잔액이 적시에 정리·검토되는지 관리하는 통제", evidence: "미결잔액 명세, 연령분석표, 정리 증빙", test: "① 미결잔액 연령분석 ② 장기 미결 항목 사유 검토 ③ 정리 조치 확인" },
  { ctrl: "FR-C-1-4-10", name: "선급비용 결산전표입력사항의 검토 및 승인", dept: "서울회계파트",
    desc: "선급비용의 기간 배분 및 결산 전표 입력이 정확한지 검토·승인하는 통제", evidence: "선급비용 명세, 배분 워크시트, 결산 전표", test: "① 선급비용 배분액 재계산 ② 계약기간 대비 배분 적정성 확인 ③ 전표 검증" },
  { ctrl: "PI-C-1-2-4", name: "자재 입고 전표 생성 시 전결권자 및 회계팀의 검토", dept: "관리파트",
    desc: "자재 입고 전표 생성 시 전결권자 승인과 회계팀 검토가 적절히 이뤄지는지 확인하는 통제", evidence: "입고 전표, 입고 검수서, 발주서(PO), 승인 내역", test: "① 입고 전표 표본 추출 ② 발주·검수·입고 3-way 대사 ③ 전결권자·회계팀 검토 확인" },
];
/* 업무구분 — 현재 평가기간(운영평가) 해당분만. ※ 향후 설계평가 메뉴 구현 시 '설계평가' 추가 */
const BIZ = ["증빙제출", "운영평가"];
const RESULTS = ["정상", "정상", "정상", "예외", "해당없음"];
/* 결재상태: 상신대기(저장됨·DRAFT) → 진행 → (완료 / 반려) */
const APPRS = ["완료", "완료", "진행", "반려", "상신대기"];

/* 56건 더미 생성 */
const ALL_ROWS = Array.from({ length: 56 }, (_, i) => {
  const c = CTRL_POOL[i % CTRL_POOL.length];
  const appr = APPRS[i % APPRS.length];
  const result = RESULTS[i % RESULTS.length];
  const biz = BIZ[i % BIZ.length];
  const dd = String((i % 28) + 1).padStart(2, "0");
  const step = appr === "완료" ? "1" : appr === "진행" ? "2/3" : appr === "반려" ? "1/2" : "-";
  const submitted = appr !== "상신대기"; // 상신대기는 저장만 됨, 상신 전 (상신일시 없음)
  // 2단계 게이트 — 상신대기/반려 건의 상신 준비 상태 (필수=차단 / 권장=사유 우회)
  //  더미 분포: 상신대기 중 일부는 필수미충족(차단), 일부는 권장미충족(우회), 나머지는 충족(깨끗)
  const gateKind = i % 3; // 0=깨끗 / 1=권장미충족 / 2=필수미충족
  const gate = {
    required: [
      { label: "증빙 1건 이상 첨부", ok: gateKind !== 2 },
      { label: "제출의견 작성", ok: true },
    ],
    recommended: [
      { label: "AI 검증 경고 해소", ok: gateKind === 0 },
      { label: "권장 증빙 추가", ok: gateKind === 0 },
    ],
  };
  const prefix = c.ctrl.startsWith("FR") ? "JV" : c.ctrl.startsWith("FA") ? "FA" : "PO";
  const sampleSeq = (i % 5) + 1;
  const fileCount = (i % 4) + 1; // 1~4건
  const evidenceFiles = Array.from({ length: fileCount }, (_, k) => ({
    name: `증빙0${k + 1}_${c.ctrl}.pdf`,
    size: `${120 + k * 47 + (i % 9) * 13}KB`,
  }));
  return {
    id: i + 1, biz, apprStatus: appr, step,
    ctrl: c.ctrl, ctrlName: c.name, dept: c.dept, evalDept: "내부감사파트",
    // 통제활동 상세 (RCM 마스터)
    ctrlDesc: c.desc, evidenceReq: c.evidence, testProc: c.test,
    evidenceFiles, // 제출 증빙 파일 (1~4건)
    // 샘플링 정보 (모집단 → 샘플)
    sample: {
      seq: sampleSeq,
      transactionId: `${prefix}-2024-${String(100237 + i * 53).slice(0, 6)}`,
      popDesc: `${c.name.split(" ")[0]} 관련 ${prefix === "JV" ? "전표" : prefix === "FA" ? "자산" : "구매"} 거래`,
      transactionDate: `2024-${String((i % 9) + 1).padStart(2, "0")}-${dd}`,
      method: ["랜덤", "판단적", "전수"][i % 3],
      totalPop: 30 + (i % 40),
      addInfo1: `거래금액 ${((i * 37 + 11) % 900 + 100).toLocaleString()},000,000원`,
      addInfo2: `적요: ${c.name} 처리분`,
    },
    result, submitter: "장한나", submitAt: submitted ? `2024-10-${dd} 1${i % 6}:${String(i % 60).padStart(2, "0")}` : "",
    reject: appr === "반려" ? "품의서 누락" : "",
    status: appr,
    gate,
    note: `${c.name} 관련 ${biz} 자료 첨부. 승인라인 확인 결과 ${result === "예외" ? "일부 미비 발견" : "이상 없음"}.`,
    line: appr === "상신대기" ? [] : [{ seq: 1, name: "이정훈", pos: "파트장", dept: c.dept, status: appr === "반려" ? "반려" : appr === "완료" ? "승인" : "대기", opinion: appr === "반려" ? "품의서 누락 — 보완 요망" : appr === "완료" ? "확인" : "", at: appr === "완료" ? `2024-10-${dd} 15:00` : "" }],
  };
});

// 게이트 헬퍼 — 필수 미충족(차단) / 권장 미충족(우회 가능) / 깨끗(즉시 상신)
const reqGap = (r) => !!r.gate && r.gate.required.some((x) => !x.ok);   // 필수 미충족 → 상신 차단
const recGap = (r) => !!r.gate && r.gate.recommended.some((x) => !x.ok); // 권장 미충족 → 사유 우회
const isClean = (r) => !!r.gate && !reqGap(r) && !recGap(r);             // 일괄상신 대상
const isWaiting = (r) => r.status === "상신대기";

const RESULT_COLOR = { 정상: "text-emerald-700", 예외: "text-red-600 font-bold", 해당없음: "text-gray-400" };
const APPR_COLOR = {
  상신대기: "bg-gray-100 text-gray-500 border-gray-200",
  완료:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  진행:   "bg-blue-50 text-blue-700 border-blue-200",
  반려:   "bg-red-50 text-red-700 border-red-200",
};
const LINE_COLOR = { 승인: "text-emerald-600", 반려: "text-red-600", 대기: "text-gray-400" };

export default function SentPage() {
  const { isClosed } = useEvalTerm(); // 전역 통제기간 구독 (헤더 셀렉터 연동)
  const [filters, setFilters] = useState({ biz: "", ctrl: "", appr: "", result: "" });
  const [applied, setApplied] = useState({ biz: "", ctrl: "", appr: "", result: "" });
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [drawer, setDrawer] = useState(null);
  // 증빙 미리보기 — 공통 EvidenceViewer 연동
  const [preview, setPreview] = useState(null);   // 파일 배열
  const [pvIdx, setPvIdx] = useState(0);           // 최초 선택 인덱스
  const openPreview = (files, idx = 0) => { setPreview(files); setPvIdx(idx); };
  const closePreview = () => setPreview(null);
  const [editMode, setEditMode] = useState(false);    // 패널 편집 모드
  const [bulkConfirm, setBulkConfirm] = useState(false); // 일괄상신 확인 모달
  const [override, setOverride] = useState(null);      // 권장 미충족 우회 사유 모달 {row}
  const [overrideReason, setOverrideReason] = useState("");

  // 필터 적용 + 정렬 (업무구분 → 통제번호 자연정렬)
  const filtered = useMemo(() => ALL_ROWS.filter((r) =>
    (!applied.biz || r.biz === applied.biz) &&
    (!applied.ctrl || r.ctrl.toLowerCase().includes(applied.ctrl.toLowerCase()) || r.ctrlName.includes(applied.ctrl)) &&
    (!applied.appr || r.apprStatus === applied.appr) &&
    (!applied.result || r.result === applied.result)
  ).sort((a, b) => {
    const bizDiff = BIZ.indexOf(a.biz) - BIZ.indexOf(b.biz);  // 증빙제출 → 운영평가
    if (bizDiff !== 0) return bizDiff;
    return a.ctrl.localeCompare(b.ctrl, undefined, { numeric: true }); // 통제번호 자연정렬
  }), [applied]);

  const summary = {
    total: filtered.length,
    정상: filtered.filter((r) => r.result === "정상").length,
    예외: filtered.filter((r) => r.result === "예외").length,
    해당없음: filtered.filter((r) => r.result === "해당없음").length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  // 일괄상신 = 상신대기 + 깨끗(필수·권장 모두 충족) 건만. 일괄취소 = 진행 건
  const cancelable = pageRows.filter((r) => r.status === "진행");
  const bulkReady = pageRows.filter((r) => isWaiting(r) && isClean(r)); // 일괄상신 대상
  const waitingBlocked = pageRows.filter((r) => isWaiting(r) && !isClean(r)).length; // 제외(보완필요)
  const toggleAll = (c) => setSelected(c ? pageRows.filter((r) => r.status === "진행" || (isWaiting(r) && isClean(r))).map((r) => r.id) : []);
  const selectableCount = pageRows.filter((r) => r.status === "진행" || (isWaiting(r) && isClean(r))).length;
  const isAllChecked = selectableCount > 0 && selected.length === selectableCount;

  const doSearch = () => { setApplied({ ...filters }); setPage(1); setSelected([]); };
  const reset = () => { setFilters({ biz: "", ctrl: "", appr: "", result: "" }); setApplied({ biz: "", ctrl: "", appr: "", result: "" }); setPage(1); };

  return (
    <AppLayout>
      <div className="max-w-full">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">상신함 (결재상신함)</h1>
          <p className="text-sm text-gray-500 mt-1">내가 상신한 결재 건의 진행 상태를 확인하고 취소·재상신합니다</p>
        </div>

        {/* 마감 안내 — 헤더 전역 통제기간이 마감 상태일 때 */}
        {isClosed && (
          <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <Lock className="w-4 h-4 shrink-0" /> 마감된 통제기간은 조회만 가능합니다. 상신·취소·재상신 등 변경 작업은 비활성화됩니다.
          </div>
        )}

        {/* 필터 바 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <label className="flex items-center gap-2"><span className="text-gray-500 w-16 shrink-0">업무구분</span>
              <select value={filters.biz} onChange={(e) => setFilters((f) => ({ ...f, biz: e.target.value }))} className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700">
                <option value="">전체</option><option>증빙제출</option><option>운영평가</option>
              </select>
            </label>
            <label className="flex items-center gap-2"><span className="text-gray-500 w-16 shrink-0">통제번호</span>
              <input value={filters.ctrl} onChange={(e) => setFilters((f) => ({ ...f, ctrl: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="통제번호·활동명" className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5" />
            </label>
            <label className="flex items-center gap-2"><span className="text-gray-500 w-16 shrink-0">결재상태</span>
              <select value={filters.appr} onChange={(e) => setFilters((f) => ({ ...f, appr: e.target.value }))} className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700">
                <option value="">전체</option><option>상신대기</option><option>진행</option><option>반려</option><option>완료</option>
              </select>
            </label>
            <label className="flex items-center gap-2"><span className="text-gray-500 w-16 shrink-0">평가결과</span>
              <select value={filters.result} onChange={(e) => setFilters((f) => ({ ...f, result: e.target.value }))} className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700">
                <option value="">전체</option><option>정상</option><option>예외</option><option>해당없음</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={reset} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">초기화</button>
            <button onClick={doSearch} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"><Search className="w-4 h-4" /> 조회</button>
          </div>
        </div>

        {/* 요약 바 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-sm">
          <span className="font-bold text-gray-900">전체 {summary.total}건</span><span className="text-gray-300">|</span>
          <span className="text-emerald-700">정상 <b>{summary.정상}</b></span>
          <span className="text-red-600">예외 <b>{summary.예외}</b></span>
          <span className="text-gray-400">해당없음 <b>{summary.해당없음}</b></span>
        </div>

        {/* 액션 바 — 좌: 일괄처리 / 우: 건수 + 표시개수 + 엑셀저장 */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <div className="flex gap-2 items-center">
            <button disabled={isClosed || selected.filter((id) => cancelable.some((r) => r.id === id)).length === 0} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"><X className="w-4 h-4" /> 일괄 취소</button>
            <button onClick={() => setBulkConfirm(true)} disabled={isClosed || selected.filter((id) => bulkReady.some((r) => r.id === id)).length === 0} className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 disabled:opacity-40"><Send className="w-4 h-4" /> 일괄 상신</button>
            <span className="text-xs text-gray-400">{selected.length}건 선택{waitingBlocked > 0 && <span className="text-amber-600"> · 보완필요 {waitingBlocked}건 제외</span>}</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-gray-500">{filtered.length}건 중 <b className="text-gray-700">{filtered.length === 0 ? 0 : (curPage - 1) * pageSize + 1}–{Math.min(curPage * pageSize, filtered.length)}</b>건 표시</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-700">
              {[50, 100, 150, 200].map((n) => <option key={n} value={n}>{n}건 조회</option>)}
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"><Download className="w-4 h-4" /> 엑셀저장</button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <th className="px-3 py-3 w-10"><input type="checkbox" checked={isAllChecked} onChange={(e) => toggleAll(e.target.checked)} className="rounded" /></th>
                <th className="text-left px-3 py-3 font-semibold">업무구분</th>
                <th className="text-left px-3 py-3 font-semibold">결재상태</th>
                <th className="text-left px-3 py-3 font-semibold">통제번호 / 통제활동명</th>
                <th className="text-left px-3 py-3 font-semibold">관련부서</th>
                <th className="text-left px-3 py-3 font-semibold">평가자부서</th>
                <th className="text-center px-3 py-3 font-semibold">평가결과</th>
                <th className="text-left px-3 py-3 font-semibold">상신자</th>
                <th className="text-left px-3 py-3 font-semibold">상신일시</th>
                <th className="text-center px-3 py-3 font-semibold">반려이력</th>
                <th className="text-center px-3 py-3 font-semibold">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageRows.map((item) => (
                <tr key={item.id} className={`transition-colors cursor-pointer ${selected.includes(item.id) ? "bg-blue-50/50" : "hover:bg-gray-50/50"}`} onClick={() => setDrawer(item)}>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" disabled={isClosed || !(item.status === "진행" || (isWaiting(item) && isClean(item)))} checked={selected.includes(item.id)}
                      onChange={(e) => setSelected((p) => e.target.checked ? [...p, item.id] : p.filter((x) => x !== item.id))} className="rounded disabled:opacity-30" />
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{item.biz}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full border text-[11px] font-semibold ${APPR_COLOR[item.apprStatus]}`}>{item.apprStatus}</span>
                    {isWaiting(item) && reqGap(item) && <div className="mt-1"><span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600"><AlertTriangle className="w-3 h-3" /> 필수 미충족</span></div>}
                    {isWaiting(item) && !reqGap(item) && recGap(item) && <div className="mt-1"><span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600"><AlertTriangle className="w-3 h-3" /> 보완필요</span></div>}
                  </td>
                  <td className="px-3 py-3"><span className="font-mono text-xs text-blue-700">{item.ctrl}</span><span className="text-gray-700"> / {item.ctrlName}</span></td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{item.dept}</td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{item.evalDept}</td>
                  <td className={`px-3 py-3 text-center text-xs ${RESULT_COLOR[item.result]}`}>{item.result}</td>
                  <td className="px-3 py-3 text-gray-600">{item.submitter}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{item.submitAt}</td>
                  <td className="px-3 py-3 text-center text-xs">{item.reject ? <span className="text-red-500">{item.reject}</span> : <span className="text-gray-300">-</span>}</td>
                  <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {isClosed ? <span className="text-xs text-gray-300">조회전용</span> : <>
                      {item.status === "진행" && <button className="inline-flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50"><X className="w-3 h-3" /> 취소</button>}
                      {item.status === "반려" && <button onClick={() => setDrawer(item)} className="inline-flex items-center gap-1 px-2 py-1 border border-blue-200 bg-blue-50 rounded-lg text-xs text-blue-700 font-semibold hover:bg-blue-100"><RotateCcw className="w-3 h-3" /> 재상신</button>}
                      {item.status === "상신대기" && <button onClick={() => setDrawer(item)} className="inline-flex items-center gap-1 px-2 py-1 border border-blue-200 bg-blue-50 rounded-lg text-xs text-blue-700 font-semibold hover:bg-blue-100"><Send className="w-3 h-3" /> 상신</button>}
                      {item.status === "완료" && <span className="text-xs text-gray-300">-</span>}
                    </>}
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && <tr><td colSpan={11} className="px-3 py-10 text-center text-sm text-gray-400">조회 결과가 없습니다</td></tr>}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 — 중앙 정렬 */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(curPage - 1)} disabled={curPage <= 1} className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30">이전</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium ${n === curPage ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>{n}</button>
            ))}
            <button onClick={() => setPage(curPage + 1)} disabled={curPage >= totalPages} className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30">다음</button>
          </div>
        </div>
      </div>

      {/* 우측 패널 */}
      <ApprovalDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer ? `${drawer.ctrl} / ${drawer.ctrlName}` : ""}
        subtitle={drawer ? `${drawer.biz} · ${drawer.dept}` : ""}
        footer={isClosed ? (
          <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-400"><Lock className="w-4 h-4" /> 마감된 통제기간 — 조회만 가능</div>
        ) : drawer && (drawer.status === "상신대기" || drawer.status === "반려") ? (
          <div className="space-y-2">
            {reqGap(drawer) && <p className="text-[11px] text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 필수 항목을 모두 충족해야 상신할 수 있습니다</p>}
            {!reqGap(drawer) && recGap(drawer) && <p className="text-[11px] text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 권장 항목 미충족 — 상신 시 사유 입력이 필요합니다</p>}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50"><Save className="w-4 h-4" /> 저장</button>
              <button
                onClick={() => { if (reqGap(drawer)) return; if (recGap(drawer)) { setOverride(drawer); setOverrideReason(""); } else { /* 상신 처리(더미) */ setDrawer(null); } }}
                disabled={reqGap(drawer)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" /> {drawer.status === "반려" ? "저장 후 재상신" : "저장 후 상신"}
              </button>
            </div>
          </div>
        ) : drawer?.status === "진행" ? (
          <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50"><X className="w-4 h-4" /> 상신 취소</button>
        ) : null}
      >
        {drawer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <InfoRow label="업무구분" value={drawer.biz} />
              <InfoRow label="결재상태" value={drawer.apprStatus} />
              <InfoRow label="평가결과" value={drawer.result} valueClass={RESULT_COLOR[drawer.result]} />
              <InfoRow label="평가자부서" value={drawer.evalDept} />
              <InfoRow label="상신자" value={drawer.submitter} />
              <InfoRow label="상신일시" value={drawer.submitAt} />
            </div>

            {/* 상신 준비 상태 — 2단계 게이트 (상신대기/반려 건만) */}
            {(drawer.status === "상신대기" || drawer.status === "반려") && drawer.gate && (
              <div className="border border-gray-100 rounded-xl p-3 space-y-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">상신 준비 상태</div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 mb-1">필수 (미충족 시 상신 차단)</div>
                  {drawer.gate.required.map((x, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs py-0.5">
                      {x.ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                      <span className={x.ok ? "text-gray-600" : "text-red-600 font-medium"}>{x.label}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 mb-1">권장 (미충족 시 사유 입력 후 우회)</div>
                  {drawer.gate.recommended.map((x, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs py-0.5">
                      {x.ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                      <span className={x.ok ? "text-gray-600" : "text-amber-600 font-medium"}>{x.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* 통제활동 내용 */}
            <Section icon={ShieldCheck} title="통제활동 내용">
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm text-gray-700 leading-relaxed">{drawer.ctrlDesc}</div>
            </Section>

            {/* 평가 증빙 (요구 증빙) */}
            <Section icon={ListChecks} title="평가 증빙">
              <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">{drawer.evidenceReq}</div>
            </Section>

            {/* 테스트 절차 */}
            <Section icon={FlaskConical} title="테스트 절차">
              <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">{drawer.testProc}</div>
            </Section>

            {/* 샘플링 정보 — 기본 2개 + 호버 시 상세 */}
            <Section icon={Layers} title="샘플링 정보">
              <div className="group relative p-3 border border-gray-100 rounded-xl text-xs space-y-1.5 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-default">
                <InfoRow label="모집단No." value={drawer.sample.transactionId} valueClass="font-mono text-blue-700" />
                <InfoRow label="모집단 내용" value={drawer.sample.popDesc} />
                <div className="flex items-center gap-1 text-[11px] text-gray-400 pt-0.5">
                  <Info className="w-3 h-3" /> 마우스를 올리면 상세 정보가 표시됩니다
                </div>
                {/* 호버 상세 패널 */}
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute left-0 right-0 top-full mt-1 z-10 p-3 bg-white border border-gray-200 rounded-xl shadow-lg space-y-1.5">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">샘플링 상세</div>
                  <InfoRow label="샘플순번" value={`#${drawer.sample.seq}`} />
                  <InfoRow label="거래일자" value={drawer.sample.transactionDate} />
                  <InfoRow label="참고1" value={drawer.sample.addInfo1} />
                  <InfoRow label="참고2" value={drawer.sample.addInfo2} />
                </div>
              </div>
            </Section>

            <Section icon={MessageSquare} title="상신의견"><div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">{drawer.note}</div></Section>

            {/* 첨부 증빙 — 다건 목록 + 개별/일괄 다운로드 + 전체 미리보기 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" /> 첨부 증빙 <span className="text-gray-400 normal-case">({drawer.evidenceFiles.length}건)</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openPreview(drawer.evidenceFiles, 0)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors" title="전체 미리보기">
                    <ZoomIn className="w-3.5 h-3.5" /> 미리보기
                  </button>
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors" title="일괄 저장">
                    <Download className="w-3.5 h-3.5" /> 일괄저장
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                {drawer.evidenceFiles.map((f, k) => (
                  <div key={k} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-xl text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">{f.size}</span>
                    <button onClick={() => openPreview(drawer.evidenceFiles, k)} className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="미리보기"><ZoomIn className="w-3.5 h-3.5" /></button>
                    <button className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="다운로드"><Download className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
            <Section icon={Users} title="결재현황">
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 text-gray-500"><th className="px-2 py-1.5 text-left">순번</th><th className="px-2 py-1.5 text-left">결재자</th><th className="px-2 py-1.5 text-left">직위</th><th className="px-2 py-1.5 text-center">상태</th><th className="px-2 py-1.5 text-left">일시</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {drawer.line.map((l) => (<tr key={l.seq}><td className="px-2 py-1.5">{l.seq}</td><td className="px-2 py-1.5 text-gray-700">{l.name}</td><td className="px-2 py-1.5 text-gray-500">{l.pos}</td><td className={`px-2 py-1.5 text-center font-semibold ${LINE_COLOR[l.status]}`}>{l.status}</td><td className="px-2 py-1.5 text-gray-400">{l.at || "-"}</td></tr>))}
                  </tbody>
                </table>
              </div>
              {drawer.line.some((l) => l.opinion) && <div className="mt-2 space-y-1">{drawer.line.filter((l) => l.opinion).map((l) => (<div key={l.seq} className="text-xs text-gray-500"><b className="text-gray-700">{l.name}</b>: {l.opinion}</div>))}</div>}
            </Section>
            {drawer.status === "반려" && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">반려 사유: {drawer.reject} — 보완 후 재상신해주세요.</div>}
          </div>
        )}
      </ApprovalDrawer>

      {/* 증빙 미리보기 — 공통 EvidenceViewer (표준 패턴) */}
      <EvidenceViewer open={!!preview} onClose={closePreview} files={preview || []} startIndex={pvIdx} />

      {/* 일괄상신 확인 모달 */}
      {bulkConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gray-900/40" onClick={() => setBulkConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">일괄 상신 확인</h3>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <p className="text-gray-700">선택한 건 중 <b className="text-blue-700">{selected.filter((id) => bulkReady.some((r) => r.id === id)).length}건</b>을 일괄 상신합니다.</p>
              {waitingBlocked > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> 보완필요(필수·권장 미충족) {waitingBlocked}건은 자동 제외됩니다. 개별 상신에서 처리하세요.
                </p>
              )}
              <div className="border border-gray-100 rounded-xl p-2 text-xs text-gray-500">
                <div className="font-semibold text-gray-600 mb-1">적용 결재선</div>
                <div>1단계 파트장 → 2단계 상무 (결재선 관리 기준 자동 적용)</div>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <button onClick={() => setBulkConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">취소</button>
              <button onClick={() => { setBulkConfirm(false); setSelected([]); }} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"><Send className="w-4 h-4" /> 상신</button>
            </div>
          </div>
        </div>
      )}

      {/* 권장 미충족 우회 사유 모달 */}
      {override && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gray-900/40" onClick={() => setOverride(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">권장 항목 미충족 — 상신 사유</h3>
              <p className="text-xs text-gray-500 mt-1">권장 항목을 충족하지 않고 상신합니다. 사유는 결재자·감사에 함께 표시됩니다.</p>
            </div>
            <div className="px-5 py-4 space-y-2">
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                미충족 권장 항목: {override.gate.recommended.filter((x) => !x.ok).map((x) => x.label).join(", ")}
              </div>
              <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} rows={3} placeholder="상신 사유를 입력하세요 (필수)" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
            </div>
            <div className="flex gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <button onClick={() => setOverride(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">취소</button>
              <button onClick={() => { setOverride(null); setDrawer(null); }} disabled={!overrideReason.trim()} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"><Send className="w-4 h-4" /> 사유 등록 후 상신</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function InfoRow({ label, value, valueClass = "text-gray-700" }) {
  return <div className="flex gap-2"><span className="text-gray-400 shrink-0 min-w-[4rem]">{label}</span><span className={`${valueClass} break-all`}>{value}</span></div>;
}
function Section({ icon: Icon, title, children }) {
  return <div><div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider"><Icon className="w-3.5 h-3.5" /> {title}</div>{children}</div>;
}
