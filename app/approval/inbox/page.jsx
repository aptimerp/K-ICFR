"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import AppLayout from "@/components/AppLayout";
import ApprovalDrawer from "@/components/ApprovalDrawer";
import EvidenceViewer from "@/components/EvidenceViewer";
import {
  ThumbsUp, ThumbsDown, FileText, AlertTriangle, MessageSquare,
  Download, Users, Search, Lock, ShieldCheck, ListChecks,
  FlaskConical, Layers, ZoomIn, Info, CheckCircle2,
} from "lucide-react";
import { useEvalTerm } from "@/components/evalTerms";

// FileViewer — PDF·이미지·Excel·Word 통합 뷰어 (SSR 불가, 클라이언트 전용)
const FileViewer = dynamic(
  () => import("@/components/FileViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-16 text-sm text-gray-400">
        <span className="animate-pulse">불러오는 중…</span>
      </div>
    ),
  }
);

/* ─── T1. 더미 데이터 레이어 ─────────────────────────────────────── */

const CTRL_POOL = [
  { ctrl: "FA-C-1-2-4", name: "건설중인자산계정의 본계정 대체 승인", dept: "음성회계파트",
    desc: "건설중인자산(CIP)의 완성 시점에 본계정(유형자산)으로 대체하는 회계처리가 적시·정확하게 승인되는지 검토하는 통제",
    evidence: "본계정 대체 전표, 자산 취득 품의서, 준공계(완성 증빙)",
    test: "① 대체 전표 표본 추출 ② 품의서·준공계와 금액·일자 일치 확인 ③ 전결권자 승인 여부 검증" },
  { ctrl: "FA-C-1-4-2", name: "회계팀의 고정자산 처분손익 검토 및 승인", dept: "음성회계파트",
    desc: "고정자산 처분 시 처분손익이 정확히 산정·계상되고 적정 권한자의 승인을 거치는지 검토하는 통제",
    evidence: "처분 전표, 처분 품의서, 자산대장, 매각 계약서",
    test: "① 처분 전표 표본 추출 ② 장부가·처분가 대사 ③ 손익 계산 재계산 ④ 승인라인 확인" },
  { ctrl: "FA-C-1-6-1", name: "임대차계약 리스트의 완전성 검토 및 승인", dept: "언양회계파트",
    desc: "리스회계(K-IFRS 1116) 적용 대상 임대차계약이 누락 없이 리스트에 포함되었는지 완전성을 검토하는 통제",
    evidence: "임대차계약 리스트, 신규 계약서, 계약 대장",
    test: "① 계약 리스트와 원장 대사 ② 신규 계약 표본의 리스트 등재 여부 확인 ③ 승인 여부 검증" },
  { ctrl: "FA-C-1-6-2", name: "리스부채 산정시 활용되는 기초 계약정보의 정확성 검토", dept: "언양회계파트",
    desc: "리스부채 산정의 기초가 되는 계약정보(리스료·기간·옵션)의 정확성을 검토하는 통제",
    evidence: "리스 산정 명세, 계약서, 리스부채 산정 워크시트",
    test: "① 산정 명세와 계약서 조건 대사 ② 리스료·기간 입력값 정확성 확인" },
  { ctrl: "FA-C-1-6-3", name: "할인율의 적정성 검토 및 승인", dept: "언양회계파트",
    desc: "리스부채 현재가치 산정에 사용되는 증분차입이자율(할인율)의 적정성을 검토·승인하는 통제",
    evidence: "할인율 산정 근거, 차입 조건표, 승인 문서",
    test: "① 적용 할인율과 산정 근거 대사 ② 시장금리·차입조건 반영 적정성 검토" },
  { ctrl: "FA-C-1-7-1", name: "임대자산 취득(대체) 검토 및 승인", dept: "창녕회계파트",
    desc: "임대자산의 신규 취득 및 계정 대체가 적정 권한자의 승인 하에 정확히 처리되는지 검토하는 통제",
    evidence: "취득 품의서, 취득 전표, 자산 등록 내역",
    test: "① 취득 표본 추출 ② 품의서·전표 일치 확인 ③ 자산대장 등록 검증" },
  { ctrl: "FA-C-1-7-6", name: "임대자산 감가상각비 검토 및 승인", dept: "창녕회계파트",
    desc: "임대자산 감가상각비가 내용연수·상각방법에 따라 정확히 계상되는지 검토·승인하는 통제",
    evidence: "감가상각 명세, 자산대장, 상각 전표",
    test: "① 상각비 재계산 ② 내용연수·상각방법 적정성 확인 ③ 전표 계상 검증" },
  { ctrl: "FR-C-1-4-1", name: "결산 절차 체크리스트 검토", dept: "서울회계파트",
    desc: "월/분기/연 결산 시 표준 결산 체크리스트의 모든 항목이 수행·검토되었는지 확인하는 통제",
    evidence: "결산 체크리스트, 결산 작업 증빙, 검토자 서명",
    test: "① 체크리스트 항목별 수행 증빙 확인 ② 미수행 항목 사유 검토 ③ 검토자 승인 확인" },
  { ctrl: "FR-C-1-4-2", name: "ERP 전표 마감 이후 입력 전표에 대한 검토 및 승인", dept: "서울회계파트",
    desc: "ERP 회계 마감 이후 입력된 전표가 적정 사유·권한 하에 처리되었는지 검토하는 통제",
    evidence: "마감 후 전표 리스트, 입력 사유서, 승인 내역",
    test: "① 마감 후 전표 전수/표본 추출 ② 입력 사유 적정성 확인 ③ 전결권자 승인 검증" },
  { ctrl: "FR-C-1-4-4", name: "미결잔액에 대한 관리", dept: "서울회계파트",
    desc: "가지급금·미결산 계정 등 미결잔액이 적시에 정리·검토되는지 관리하는 통제",
    evidence: "미결잔액 명세, 연령분석표, 정리 증빙",
    test: "① 미결잔액 연령분석 ② 장기 미결 항목 사유 검토 ③ 정리 조치 확인" },
  { ctrl: "FR-C-1-4-10", name: "선급비용 결산전표입력사항의 검토 및 승인", dept: "서울회계파트",
    desc: "선급비용의 기간 배분 및 결산 전표 입력이 정확한지 검토·승인하는 통제",
    evidence: "선급비용 명세, 배분 워크시트, 결산 전표",
    test: "① 선급비용 배분액 재계산 ② 계약기간 대비 배분 적정성 확인 ③ 전표 검증" },
  { ctrl: "PI-C-1-2-4", name: "자재 입고 전표 생성 시 전결권자 및 회계팀의 검토", dept: "관리파트",
    desc: "자재 입고 전표 생성 시 전결권자 승인과 회계팀 검토가 적절히 이뤄지는지 확인하는 통제",
    evidence: "입고 전표, 입고 검수서, 발주서(PO), 승인 내역",
    test: "① 입고 전표 표본 추출 ② 발주·검수·입고 3-way 대사 ③ 전결권자·회계팀 검토 확인" },
];

const BIZ = ["증빙제출", "운영평가"];
const RESULTS = ["정상", "정상", "정상", "예외", "해당없음"];
// 대기 50% / 승인 33% / 반려 17%
const APPRS = ["대기", "대기", "대기", "승인", "승인", "반려"];
const SUBMITTERS = ["장한나", "손호민", "천승범", "송희수", "김민준"];

const INIT_ROWS = Array.from({ length: 40 }, (_, i) => {
  const c = CTRL_POOL[i % CTRL_POOL.length];
  const appr = APPRS[i % APPRS.length];
  const result = RESULTS[i % RESULTS.length];
  const biz = BIZ[i % BIZ.length];
  const dd = String((i % 28) + 1).padStart(2, "0");
  const prefix = c.ctrl.startsWith("FR") ? "JV" : c.ctrl.startsWith("FA") ? "FA" : "PO";
  const sampleSeq = (i % 5) + 1;
  const fileCount = (i % 4) + 1;
  // orientation: portrait(A4세로) · landscape(A4가로) · wide(A3가로)
  // i=0: SAC 견본 퇴직급여 전표+PNG / i=3: SAC 견본 감정평가 전표+계산서 (데모용)
  let evidenceFiles;
  if (i === 0) {
    evidenceFiles = [
      { name: "1_2-20260201-0005_전표.pdf",  size: "43KB",  pages: 1, orientation: "landscape", demoUrl: "/demo-evidence/demo_voucher_toejik.pdf",   demoType: "pdf"   },
      { name: "퇴직금추계액_김래현부장.PNG",      size: "75KB",  pages: 1, orientation: "portrait",  demoUrl: "/demo-evidence/demo_evidence_toejik.png",  demoType: "image" },
    ];
  } else if (i === 3) {
    evidenceFiles = [
      { name: "1_1-20260304-0020_전표.pdf",  size: "46KB",  pages: 1, orientation: "landscape", demoUrl: "/demo-evidence/demo_voucher_gamjeong.pdf",  demoType: "pdf" },
      { name: "감정평가_세금계산서.pdf",           size: "118KB", pages: 1, orientation: "portrait",  demoUrl: "/demo-evidence/demo_evidence_gamjeong.pdf", demoType: "pdf" },
    ];
  } else {
    evidenceFiles = Array.from({ length: fileCount }, (_, k) => {
      const orientation = k === 1 ? "landscape" : k === 2 ? "wide" : "portrait";
      return {
        name: `증빙0${k + 1}_${c.ctrl}.pdf`,
        size: `${120 + k * 47 + (i % 9) * 13}KB`,
        pages: orientation === "portrait" ? 3 : 2,
        orientation,
      };
    });
  }
  const lineStatus = appr === "승인" ? "승인" : appr === "반려" ? "반려" : "대기";
  const hasSecondStep = i % 3 === 0;
  return {
    id: i + 1, biz, apprStatus: appr,
    ctrl: c.ctrl, ctrlName: c.name, dept: c.dept, evalDept: "내부감사파트",
    ctrlDesc: c.desc, evidenceReq: c.evidence, testProc: c.test,
    evidenceFiles,
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
    result,
    from: SUBMITTERS[i % SUBMITTERS.length],
    received: `2024-10-${dd} 1${i % 6}:${String(i % 60).padStart(2, "0")}`,
    approvedAt: appr !== "대기" ? `2024-10-${dd} 15:${String(i % 60).padStart(2, "0")}` : null,
    aiWarn: i % 7 === 0 ? 1 : 0,
    note: `${c.name} 관련 ${biz} 자료 첨부. 검토 결과 ${result === "예외" ? "일부 미비 발견" : "이상 없음"}.`,
    line: [
      {
        seq: 1, name: "이차장", pos: "팀장", dept: "내부감사파트",
        status: lineStatus,
        opinion: appr === "반려" ? "품의서 누락 — 보완 요망" : appr === "승인" ? "확인" : "",
        at: appr !== "대기" ? `2024-10-${dd} 15:00` : "",
      },
      ...(hasSecondStep ? [{
        seq: 2, name: "박상무", pos: "상무", dept: "내부감사파트",
        status: appr === "승인" ? "승인" : "대기",
        opinion: appr === "승인" ? "최종 확인" : "",
        at: appr === "승인" ? `2024-10-${dd} 16:00` : "",
      }] : []),
    ],
  };
});

/* ─── 상수 ────────────────────────────────────────────────────────── */

const RESULT_COLOR = { 정상: "text-emerald-700", 예외: "text-red-600 font-bold", 해당없음: "text-gray-400" };
const APPR_BADGE = {
  대기: "bg-blue-50 text-blue-700 border-blue-200",
  승인: "bg-emerald-50 text-emerald-700 border-emerald-200",
  반려: "bg-red-50 text-red-700 border-red-200",
};
const LINE_COLOR = { 승인: "text-emerald-600", 반려: "text-red-600", 대기: "text-gray-400" };

/* ─── T2. 컴포넌트 ────────────────────────────────────────────────── */

export default function InboxPage() {
  // 전역 통제기간 구독 (헤더 셀렉터 연동)
  const { isClosed } = useEvalTerm();

  // 필터·페이지
  const [filters, setFilters] = useState({ biz: "", ctrl: "", appr: "", result: "" });
  const [applied, setApplied] = useState({ biz: "", ctrl: "", appr: "", result: "" });
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);

  // 선택·드로어·의견
  const [selected, setSelected] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [opinion, setOpinion] = useState("");

  // EvidenceViewer
  const [preview, setPreview] = useState(null);
  const [pvIdx, setPvIdx] = useState(0);
  const openPreview = (files, idx = 0) => { setPreview(files); setPvIdx(idx); };
  const closePreview = () => setPreview(null);

  // 행 데이터 (승인/반려 시 상태 업데이트)
  const [rows, setRows] = useState(INIT_ROWS);

  const openDrawer = (item) => { setDrawer(item); setOpinion(""); };

  /* ── 임시 증빙 렌더러 (Supabase/PDF.js 연동 전 테스트용) ─────────
   * Supabase Storage + PDF.js 연동 시 이 블록 전체를 교체하고
   * renderPage / renderThumbnail에 실제 PdfPageRenderer 컴포넌트를 전달한다.
   * orientation 필드: portrait(A4세로) · landscape(A4가로) · wide(A3가로)
   *
   * ⚠️ Tailwind JIT는 동적 조합 클래스를 추적하지 못하므로
   *    aspect-ratio는 인라인 style로 처리한다.
   * ─────────────────────────────────────────────────────────────── */
  const ORIENT = {
    portrait:  { ar: "210/297", label: "A4 세로", badge: null },
    landscape: { ar: "297/210", label: "A4 가로", badge: "bg-cyan-50 text-cyan-600 border-cyan-200" },
    wide:      { ar: "420/297", label: "A3 가로", badge: "bg-violet-50 text-violet-600 border-violet-200" },
  };

  /* ── FileViewer 기반 통합 렌더러 ────────────────────────────────────
   * PDF / 이미지 / Excel / Word 모두 FileViewer 한 컴포넌트로 처리.
   * demoUrl → Supabase signedUrl 전환 시 url 필드만 교체하면 됨.
   * ─────────────────────────────────────────────────────────────── */
  const renderPage = (file, pg) => {
    const m = ORIENT[file.orientation || "portrait"];

    /* ── 실제 파일 렌더러 (demoUrl 또는 signedUrl 있을 때) ────────────── */
    if (file.demoUrl || file.signedUrl) {
      return (
        <FileViewer
          url={file.signedUrl ?? file.demoUrl}
          fileName={file.name}
          pageNumber={pg}
          orientation={file.orientation || "portrait"}
        />
      );
    }

    /* ── 플레이스홀더 (Supabase 연동 전) ──────────────────────────────── */
    return (
      <div
        className="bg-white border border-gray-200 shadow-sm w-full flex flex-col items-center justify-center gap-2"
        style={{ aspectRatio: m.ar }}
      >
        <FileText className="w-12 h-12 text-gray-200" strokeWidth={1} />
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-400">{file.name}</p>
          <p className="text-xs text-gray-300">{pg} / {file.pages || 3} 페이지 · {m.label}</p>
          {m.badge && (
            <span className={`inline-flex text-[10px] font-semibold border rounded px-1.5 py-0.5 ${m.badge}`}>
              {m.label}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderThumbnail = (file) => {
    const m = ORIENT[file.orientation || "portrait"];

    /* ── FileViewer 썸네일 (실제 파일 있을 때) ──────────────────────── */
    if (file.demoUrl || file.signedUrl) {
      return (
        <FileViewer
          url={file.signedUrl ?? file.demoUrl}
          fileName={file.name}
          thumbnail
        />
      );
    }

    /* ── 플레이스홀더 (미연동) ──────────────────────────────────── */
    return (
      <div
        className="w-full bg-gray-50 flex flex-col items-center justify-center gap-1"
        style={{ aspectRatio: m.ar }}
      >
        <FileText className="w-5 h-5 text-gray-300" strokeWidth={1} />
        {m.badge && <span className={`text-[9px] font-semibold border rounded px-1 ${m.badge}`}>{m.label}</span>}
      </div>
    );
  };
  /* ── 임시 렌더러 끝 ────────────────────────────────────────────── */

  // 필터 + 자연정렬 (업무구분 → 통제번호 numeric)
  const filtered = useMemo(() =>
    rows.filter((r) =>
      (!applied.biz || r.biz === applied.biz) &&
      (!applied.ctrl || r.ctrl.toLowerCase().includes(applied.ctrl.toLowerCase()) || r.ctrlName.includes(applied.ctrl)) &&
      (!applied.appr || r.apprStatus === applied.appr) &&
      (!applied.result || r.result === applied.result)
    ).sort((a, b) => {
      const d = BIZ.indexOf(a.biz) - BIZ.indexOf(b.biz);
      return d !== 0 ? d : a.ctrl.localeCompare(b.ctrl, undefined, { numeric: true });
    }),
  [rows, applied]);

  const summary = {
    total: filtered.length,
    정상: filtered.filter((r) => r.result === "정상").length,
    예외: filtered.filter((r) => r.result === "예외").length,
    해당없음: filtered.filter((r) => r.result === "해당없음").length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);
  const pendingIds = pageRows.filter((r) => r.apprStatus === "대기").map((r) => r.id);
  const isAllChecked = pendingIds.length > 0 && pendingIds.every((id) => selected.includes(id));

  const doSearch = () => { setApplied({ ...filters }); setPage(1); setSelected([]); };
  const reset = () => { setFilters({ biz: "", ctrl: "", appr: "", result: "" }); setApplied({ biz: "", ctrl: "", appr: "", result: "" }); setPage(1); };
  const toggleAll = (c) => setSelected(c ? pendingIds : []);

  const ts = () => new Date().toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });

  const approveOne = (id, note) => {
    if (isClosed) return;
    const at = ts();
    setRows((p) => p.map((r) => r.id !== id ? r : {
      ...r, apprStatus: "승인", approvedAt: at,
      line: r.line.map((l) => l.seq === 1 ? { ...l, status: "승인", opinion: note || "확인", at } : l),
    }));
    setSelected((p) => p.filter((x) => x !== id));
    setDrawer(null);
  };

  const rejectOne = (id, note) => {
    if (isClosed || !note.trim()) return;
    const at = ts();
    setRows((p) => p.map((r) => r.id !== id ? r : {
      ...r, apprStatus: "반려", approvedAt: null,
      line: r.line.map((l) => l.seq === 1 ? { ...l, status: "반려", opinion: note, at } : l),
    }));
    setSelected((p) => p.filter((x) => x !== id));
    setDrawer(null);
  };

  const bulkApprove = () => {
    if (isClosed || selected.length === 0) return;
    const at = ts();
    setRows((p) => p.map((r) => !selected.includes(r.id) ? r : {
      ...r, apprStatus: "승인", approvedAt: at,
      line: r.line.map((l) => l.seq === 1 ? { ...l, status: "승인", opinion: "확인", at } : l),
    }));
    setSelected([]);
  };

  /* ─── T3. 목록 영역 JSX ─────────────────────────────────────────── */

  return (
    <AppLayout>
      <div className="max-w-full">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">결재함 (결재대상함)</h1>
          <p className="text-sm text-gray-500 mt-1">
            부서원이 상신한 결재 건을 검토·승인·반려합니다. 통제번호를 클릭하면 제출 증빙·결재현황을 확인할 수 있습니다
          </p>
        </div>

        {/* 마감 안내 배너 */}
        {isClosed && (
          <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <Lock className="w-4 h-4 shrink-0" />
            마감된 통제기간은 조회만 가능합니다. 승인·반려 등 변경 작업은 비활성화됩니다.
          </div>
        )}

        {/* 필터 바 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-gray-500 w-16 shrink-0">업무구분</span>
              <select value={filters.biz} onChange={(e) => setFilters((f) => ({ ...f, biz: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700">
                <option value="">전체</option><option>증빙제출</option><option>운영평가</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-gray-500 w-16 shrink-0">통제번호</span>
              <input value={filters.ctrl}
                onChange={(e) => setFilters((f) => ({ ...f, ctrl: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="통제번호·활동명"
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5" />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-gray-500 w-16 shrink-0">결재상태</span>
              <select value={filters.appr} onChange={(e) => setFilters((f) => ({ ...f, appr: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700">
                <option value="">전체</option><option>대기</option><option>승인</option><option>반려</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-gray-500 w-16 shrink-0">평가결과</span>
              <select value={filters.result} onChange={(e) => setFilters((f) => ({ ...f, result: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700">
                <option value="">전체</option><option>정상</option><option>예외</option><option>해당없음</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={reset} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              초기화
            </button>
            <button onClick={doSearch} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
              <Search className="w-4 h-4" /> 조회
            </button>
          </div>
        </div>

        {/* 요약 바 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-sm">
          <span className="font-bold text-gray-900">전체 {summary.total}건</span>
          <span className="text-gray-300">|</span>
          <span className="text-emerald-700">정상 <b>{summary.정상}</b></span>
          <span className="text-red-600">예외 <b>{summary.예외}</b></span>
          <span className="text-gray-400">해당없음 <b>{summary.해당없음}</b></span>
        </div>

        {/* 액션 바 */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <div className="flex gap-2 items-center">
            <button
              title="반려는 패널에서 개별 처리해주세요"
              disabled
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-400 rounded-xl text-sm font-semibold cursor-not-allowed opacity-40">
              <ThumbsDown className="w-4 h-4" /> 반려
            </button>
            <button
              onClick={bulkApprove}
              disabled={isClosed || selected.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">
              <ThumbsUp className="w-4 h-4" /> 일괄 승인 ({selected.length})
            </button>
            <span className="text-xs text-gray-400">{selected.length}건 선택</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-gray-500">
              {filtered.length}건 중{" "}
              <b className="text-gray-700">
                {filtered.length === 0 ? 0 : (curPage - 1) * pageSize + 1}–{Math.min(curPage * pageSize, filtered.length)}
              </b>건 표시
            </span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-700">
              {[50, 100, 150, 200].map((n) => <option key={n} value={n}>{n}건 조회</option>)}
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <Download className="w-4 h-4" /> 엑셀저장
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <th className="px-3 py-3 w-10">
                  <input type="checkbox" checked={isAllChecked} onChange={(e) => toggleAll(e.target.checked)} className="rounded" />
                </th>
                <th className="text-left px-3 py-3 font-semibold">업무구분</th>
                <th className="text-left px-3 py-3 font-semibold">결재상태</th>
                <th className="text-left px-3 py-3 font-semibold">통제번호 / 통제활동명</th>
                <th className="text-left px-3 py-3 font-semibold">관련부서</th>
                <th className="text-left px-3 py-3 font-semibold">평가자부서</th>
                <th className="text-center px-3 py-3 font-semibold">평가결과</th>
                <th className="text-left px-3 py-3 font-semibold">상신자</th>
                <th className="text-left px-3 py-3 font-semibold">상신일시</th>
                <th className="text-center px-3 py-3 font-semibold">AI경고</th>
                <th className="text-left px-3 py-3 font-semibold">결재일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageRows.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors cursor-pointer ${selected.includes(item.id) ? "bg-blue-50/50" : "hover:bg-gray-50/50"}`}
                  onClick={() => openDrawer(item)}>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      disabled={item.apprStatus !== "대기"}
                      checked={selected.includes(item.id)}
                      onChange={(e) => setSelected((p) => e.target.checked ? [...p, item.id] : p.filter((x) => x !== item.id))}
                      className="rounded disabled:opacity-30" />
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{item.biz}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full border text-[11px] font-semibold ${APPR_BADGE[item.apprStatus]}`}>
                      {item.apprStatus}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={(e) => { e.stopPropagation(); openDrawer(item); }} className="text-left hover:underline">
                      <span className="font-mono text-xs text-blue-700">{item.ctrl} ↗</span>
                      <span className="text-gray-700"> / {item.ctrlName}</span>
                    </button>
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{item.dept}</td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{item.evalDept}</td>
                  <td className={`px-3 py-3 text-center text-xs ${RESULT_COLOR[item.result]}`}>{item.result}</td>
                  <td className="px-3 py-3 text-gray-600">{item.from}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{item.received}</td>
                  <td className="px-3 py-3 text-center">
                    {item.aiWarn > 0
                      ? <span className="text-amber-600 font-bold text-xs">{item.aiWarn}건</span>
                      : <span className="text-gray-300 text-xs">-</span>}
                  </td>
                  <td className="px-3 py-3 text-gray-400 text-xs">{item.approvedAt || "-"}</td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={11} className="px-3 py-10 text-center text-sm text-gray-400">조회 결과가 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(curPage - 1)} disabled={curPage <= 1}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30">
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${n === curPage ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(curPage + 1)} disabled={curPage >= totalPages}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30">
              다음
            </button>
          </div>
        </div>
      </div>

      {/* ─── T4. ApprovalDrawer 패널 ────────────────────────────────── */}
      <ApprovalDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer ? `${drawer.ctrl} / ${drawer.ctrlName}` : ""}
        subtitle={drawer ? `${drawer.biz} · ${drawer.dept} · 상신자 ${drawer.from}` : ""}
        footer={
          isClosed ? (
            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-400">
              <Lock className="w-4 h-4" /> 마감된 통제기간 — 조회만 가능
            </div>
          ) : drawer && drawer.apprStatus === "대기" ? (
            <div className="space-y-2">
              {!opinion.trim() && (
                <p className="text-[11px] text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> 반려하려면 의견을 반드시 입력해야 합니다
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => rejectOne(drawer.id, opinion)}
                  disabled={!opinion.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ThumbsDown className="w-4 h-4" /> 반려
                </button>
                <button
                  onClick={() => approveOne(drawer.id, opinion)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">
                  <ThumbsUp className="w-4 h-4" /> 승인
                </button>
              </div>
            </div>
          ) : drawer ? (
            <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-500">
              <CheckCircle2 className="w-4 h-4" />
              {drawer.apprStatus} 처리됨{drawer.approvedAt ? ` · ${drawer.approvedAt}` : ""}
            </div>
          ) : null
        }
      >
        {drawer && (
          <div className="space-y-4">

            {/* ① 기본 정보 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <InfoRow label="업무구분" value={drawer.biz} />
              <InfoRow label="평가결과" value={drawer.result} valueClass={RESULT_COLOR[drawer.result]} />
              <InfoRow label="관련부서" value={drawer.dept} />
              <InfoRow label="평가자부서" value={drawer.evalDept} />
              <InfoRow label="상신자" value={drawer.from} />
              <InfoRow label="상신일시" value={drawer.received} />
            </div>

            {/* ② AI 경고 */}
            {drawer.aiWarn > 0 && (
              <div className="flex items-center gap-1.5 p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" /> AI 검증 경고 {drawer.aiWarn}건 — 증빙 내용을 꼼꼼히 확인해주세요
              </div>
            )}

            {/* ③ 통제활동 내용 */}
            <Section icon={ShieldCheck} title="통제활동 내용">
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm text-gray-700 leading-relaxed">
                {drawer.ctrlDesc}
              </div>
            </Section>

            {/* ④ 평가 증빙 요구사항 */}
            <Section icon={ListChecks} title="평가 증빙">
              <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">
                {drawer.evidenceReq}
              </div>
            </Section>

            {/* ⑤ 테스트 절차 */}
            <Section icon={FlaskConical} title="테스트 절차">
              <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">
                {drawer.testProc}
              </div>
            </Section>

            {/* ⑥ 샘플링 정보 (기본 2줄 + 호버 상세) */}
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

            {/* ⑦ 상신의견 */}
            <Section icon={MessageSquare} title="상신의견">
              <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">
                {drawer.note}
              </div>
            </Section>

            {/* ⑧ 첨부 증빙 (EvidenceViewer 패턴) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" /> 첨부 증빙{" "}
                  <span className="text-gray-400 normal-case">({drawer.evidenceFiles.length}건)</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openPreview(drawer.evidenceFiles, 0)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors">
                    <ZoomIn className="w-3.5 h-3.5" /> 미리보기
                  </button>
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors">
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
                    <button
                      onClick={() => openPreview(drawer.evidenceFiles, k)}
                      className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="미리보기">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="다운로드">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ⑨ 결재현황 */}
            <Section icon={Users} title="결재현황">
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="px-2 py-1.5 text-left">순번</th>
                      <th className="px-2 py-1.5 text-left">결재자</th>
                      <th className="px-2 py-1.5 text-left">직위</th>
                      <th className="px-2 py-1.5 text-center">상태</th>
                      <th className="px-2 py-1.5 text-left">일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {drawer.line.map((l) => (
                      <tr key={l.seq}>
                        <td className="px-2 py-1.5">{l.seq}</td>
                        <td className="px-2 py-1.5 text-gray-700">{l.name}</td>
                        <td className="px-2 py-1.5 text-gray-500">{l.pos}</td>
                        <td className={`px-2 py-1.5 text-center font-semibold ${LINE_COLOR[l.status]}`}>{l.status}</td>
                        <td className="px-2 py-1.5 text-gray-400">{l.at || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {drawer.line.some((l) => l.opinion) && (
                <div className="mt-2 space-y-1">
                  {drawer.line.filter((l) => l.opinion).map((l) => (
                    <div key={l.seq} className="text-xs text-gray-500">
                      <b className="text-gray-700">{l.name}</b>: {l.opinion}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ⑩ 결재의견 입력 (대기 건 + 마감 아닐 때) */}
            {drawer.apprStatus === "대기" && !isClosed && (
              <Section
                icon={MessageSquare}
                title={<>결재의견 <span className="text-red-500 normal-case font-normal">(반려 시 필수)</span></>}>
                <textarea
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  rows={3}
                  placeholder="승인·반려 의견을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
              </Section>
            )}

          </div>
        )}
      </ApprovalDrawer>

      {/* 증빙 미리보기 — EvidenceViewer 표준 컴포넌트 */}
      {/* renderPage·renderThumbnail: 임시 방향별 렌더러 (Supabase 연동 후 PDF.js로 교체) */}
      <EvidenceViewer
        open={!!preview}
        onClose={closePreview}
        files={preview || []}
        startIndex={pvIdx}
        renderPage={renderPage}
        renderThumbnail={renderThumbnail}
      />
    </AppLayout>
  );
}

/* ─── 공용 서브 컴포넌트 ─────────────────────────────────────────── */

function InfoRow({ label, value, valueClass = "text-gray-700" }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 shrink-0 min-w-[4rem]">{label}</span>
      <span className={`${valueClass} break-all`}>{value}</span>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" /> {title}
      </div>
      {children}
    </div>
  );
}
