"use client";
import { useState, useRef, useEffect } from "react";
import { FileText, Download, X, ZoomIn, ZoomOut, Maximize2, Minimize2, Columns2, Square } from "lucide-react";

/**
 * EvidenceViewer — 증빙 개별 단위 확인용 공통 미리보기 모달 (표준 패턴, 2026-06-08 확정)
 *
 * 증빙 개별 확인 화면(상신함·결재함·운영평가·결과조회 등)은 모두 이 컴포넌트를 사용한다.
 * A4 규격 증빙의 가독성과 다건 비교를 모두 만족하기 위한 표준:
 *
 *  - 두 가지 뷰 모드:
 *     · 크게 보기(single, 기본) — 좌측 썸네일 + 우측 대형 뷰어(A4 fit-width)
 *     · 나란히 비교(compare)   — 카드 가로 배치, flex-1로 뷰어 폭에 균등 확대 (min 18rem, 넘치면 가로 스크롤)
 *  - 줌(50~200%, 크게 보기 전용) · 전체화면 토글 · 모달 리사이즈(resize:both)
 *  - 백드롭 가드: mousedown이 백드롭에서 시작한 경우에만 닫힘 (리사이즈 드래그가 백드롭에서 끝나도 안 닫힘)
 *  - 개별/일괄 다운로드 훅(onDownload, onDownloadAll) — 미지정 시 버튼만 노출(no-op)
 *
 * Props
 *  - open        : 표시 여부
 *  - onClose     : 닫기 콜백
 *  - files       : [{ name, size, pages? }] 증빙 파일 배열
 *  - startIndex  : 최초 선택 인덱스 (기본 0)
 *  - title       : 헤더 제목 (기본 "첨부 증빙 미리보기")
 *  - onDownload    : (file) => void  개별 다운로드
 *  - onDownloadAll : () => void       일괄 저장
 *  - renderPage      : (file, pageNo) => ReactNode  실제 증빙 렌더러 (미지정 시 더미 A4 플레이스홀더)
 *  - renderThumbnail : (file) => ReactNode           썸네일 렌더러 (미지정 시 아이콘 플레이스홀더)
 *
 * ── B안 Supabase/PDF.js 연동 가이드 (Phase 8-C) ──────────────────────────
 *  renderPage를 구현하면 가로형·세로형 증빙이 자동 처리됩니다.
 *   · renderPage  : PDF.js page.getViewport()가 실제 가로/세로를 결정 → aspect ratio 강제 없음
 *   · renderThumbnail : 썸네일도 동일하게 비율 자유형 컨테이너에 렌더링됨
 *   · files 배열 형식: { name, size, pages: n, signedUrl: '...' }
 *  두 prop 미지정 시 현재와 동일한 A4 세로 플레이스홀더 동작 유지.
 * ─────────────────────────────────────────────────────────────────────────
 */
export default function EvidenceViewer({
  open, onClose, files = [], startIndex = 0,
  title = "첨부 증빙 미리보기", onDownload, onDownloadAll,
  renderPage, renderThumbnail,
}) {
  const [idx, setIdx] = useState(startIndex);
  const [mode, setMode] = useState("single");   // single | compare
  const [zoom, setZoom] = useState(100);          // 50~200
  const [full, setFull] = useState(false);
  const downOnBackdrop = useRef(false);

  // 열릴 때마다 초기화
  useEffect(() => {
    if (open) { setIdx(startIndex); setMode("single"); setZoom(100); setFull(false); }
  }, [open, startIndex]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || files.length === 0) return null;

  const cur = files[Math.min(idx, files.length - 1)];
  const pagesOf = (f) => Array.from({ length: f.pages || 3 }, (_, i) => i + 1);

  // 실제 증빙 렌더(미지정 시 더미 A4 플레이스홀더)
  const Page = ({ file, pg, big }) =>
    renderPage ? renderPage(file, pg) : (
      <div className={`bg-white ${big ? "shadow-md border" : "border"} border-gray-200 aspect-[210/297] flex flex-col items-center justify-center text-gray-300 gap-${big ? 2 : 1} w-full`}>
        <FileText className={big ? "w-12 h-12" : "w-8 h-8"} strokeWidth={1} />
        <span className={`${big ? "text-sm" : "text-[11px]"} text-gray-400`}>{file.name}{big ? "" : ` · ${pg}p`}</span>
        {big && <span className="text-xs text-gray-300">{pg} / {file.pages || 3} 페이지 · A4</span>}
      </div>
    );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gray-900/40"
      onMouseDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (e.target === e.currentTarget && downOnBackdrop.current) onClose?.(); }}
    >
      <div
        className={`bg-white shadow-2xl flex flex-col overflow-hidden ${full ? "fixed inset-0 rounded-none" : "rounded-2xl"}`}
        style={full ? {} : { width: "min(92vw, 60rem)", height: "85vh", minWidth: "32rem", minHeight: "26rem", maxWidth: "96vw", maxHeight: "94vh", resize: "both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-900 shrink-0">{title} <span className="text-gray-400 font-normal">({files.length}건)</span></span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 뷰 모드 토글 */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setMode("single")} className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors ${mode === "single" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`} title="크게 보기"><Square className="w-3.5 h-3.5" /> 크게</button>
              <button onClick={() => setMode("compare")} className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors ${mode === "compare" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`} title="나란히 비교"><Columns2 className="w-3.5 h-3.5" /> 비교</button>
            </div>
            {/* 줌 */}
            {mode === "single" && (
              <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg">
                <button onClick={() => setZoom((z) => Math.max(50, z - 25))} className="p-1.5 rounded-l-lg text-gray-500 hover:bg-gray-50" title="축소"><ZoomOut className="w-3.5 h-3.5" /></button>
                <button onClick={() => setZoom(100)} className="px-1.5 text-[11px] font-semibold text-gray-600 hover:text-blue-600 w-11" title="100%">{zoom}%</button>
                <button onClick={() => setZoom((z) => Math.min(200, z + 25))} className="p-1.5 rounded-r-lg text-gray-500 hover:bg-gray-50" title="확대"><ZoomIn className="w-3.5 h-3.5" /></button>
              </div>
            )}
            {/* 전체화면 */}
            <button onClick={() => setFull((v) => !v)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-50" title={full ? "접기" : "전체화면"}>
              {full ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={() => onDownloadAll?.()} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50" title="일괄 저장"><Download className="w-4 h-4" /> 일괄저장</button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50" title="닫기"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* 본문 */}
        {mode === "single" ? (
          <div className="flex-1 flex min-h-0">
            {/* 썸네일 */}
            <div className="w-40 shrink-0 border-r border-gray-100 overflow-y-auto p-2 space-y-2 bg-gray-50/50">
              {files.map((f, k) => (
                <button key={k} onClick={() => setIdx(k)} className={`w-full rounded-lg border p-1.5 text-left transition-colors ${k === idx ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  {/* renderThumbnail 제공 시 비율 자유형 컨테이너 → 가로형 증빙 자동 처리 */}
                  {renderThumbnail ? (
                    <div className="w-full overflow-hidden rounded border border-gray-200 bg-white mb-1">
                      {renderThumbnail(f)}
                    </div>
                  ) : (
                    <div className="aspect-[210/297] bg-white border border-gray-200 rounded flex items-center justify-center text-gray-300 mb-1">
                      <FileText className="w-5 h-5" strokeWidth={1} />
                    </div>
                  )}
                  <div className="text-[10px] text-gray-600 truncate font-medium">{f.name}</div>
                  {f.size && <div className="text-[10px] text-gray-400">{f.size}</div>}
                </button>
              ))}
            </div>
            {/* 대형 뷰어 — A4 fit-width + 줌 */}
            <div className="flex-1 overflow-auto bg-gray-100 p-6 min-w-0">
              <div className="flex flex-col items-center gap-4">
                {pagesOf(cur).map((pg) => (
                  <div key={pg} style={{ width: `${zoom}%`, maxWidth: zoom <= 100 ? "100%" : "none" }}>
                    <Page file={cur} pg={pg} big />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 나란히 비교 — flex-1 균등 확대 */
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 bg-gray-50">
            <div className="flex gap-3 h-full">
              {files.map((f, k) => (
                <div key={k} className="flex-1 min-w-[18rem] bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/80 shrink-0">
                    <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-xs font-medium text-gray-700 truncate flex-1">{f.name}</span>
                    {f.size && <span className="text-[11px] text-gray-400">{f.size}</span>}
                    <button onClick={() => onDownload?.(f)} className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="다운로드"><Download className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-white p-3 min-h-0">
                    <div className="flex flex-col items-center gap-3">
                      {pagesOf(f).map((pg) => (<Page key={pg} file={f} pg={pg} />))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
