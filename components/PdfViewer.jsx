"use client";
/**
 * PdfViewer — canvas 기반 PDF 뷰어 (react-pdf v7 + pdfjs-dist v3)
 *
 * ✅ CJS 빌드 사용 → webpack 5 완전 호환
 * ✅ next/dynamic + ssr:false 로 임포트해야 함 (SSR에서 DOMMatrix 미정의 방지)
 * ✅ workerSrc: /pdf.worker.min.js (public/ 복사본, CJS)
 */

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// worker 경로 — public/pdf.worker.min.js (pdfjs-dist v3 CJS 빌드)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

/**
 * PdfPageViewer — 메인 뷰어 패널용 (전체 페이지 canvas 렌더링)
 * @param {string}  url         PDF URL
 * @param {number}  pageNumber  표시할 페이지 번호 (1-based)
 * @param {string}  orientation "portrait" | "landscape" | "wide"
 */
export function PdfPageViewer({ url, pageNumber = 1, orientation = "portrait" }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);

  // 컨테이너 폭 측정 (반응형 렌더링)
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // 가로세로 비율별 컨테이너 높이 (padding-bottom 트릭)
  const AR = { portrait: [210, 297], landscape: [297, 210], wide: [420, 297] };
  const [arW, arH] = AR[orientation] ?? AR.portrait;
  const padPct = `${((arH / arW) * 100).toFixed(2)}%`;

  function onLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setError(null);
  }

  function onLoadError(err) {
    console.error("[PdfPageViewer] 로드 에러:", err);
    setError("PDF를 불러올 수 없습니다.");
  }

  return (
    <div
      ref={containerRef}
      className="w-full relative border border-gray-200 shadow-sm overflow-hidden bg-white"
      style={{ paddingBottom: padPct }}
    >
      <div className="absolute inset-0 flex items-start justify-center overflow-auto bg-gray-100 p-2">
        {error ? (
          /* 에러 상태 */
          <div className="flex flex-col items-center justify-center h-full gap-2 text-red-500">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={
              <div className="flex items-center justify-center h-full">
                <span className="text-sm text-gray-400 animate-pulse">PDF 로드 중…</span>
              </div>
            }
          >
            {/* 컨테이너 폭이 측정된 뒤에만 렌더링 */}
            {containerWidth > 0 && (
              <Page
                pageNumber={pageNumber}
                width={containerWidth - 16} /* 좌우 패딩 8px×2 제외 */
                renderAnnotationLayer={true}
                renderTextLayer={false}  /* 텍스트 선택 불필요 → 성능 절약 */
              />
            )}
          </Document>
        )}
      </div>
    </div>
  );
}

/**
 * PdfThumbnail — 썸네일 패널용 (1페이지 소형 canvas 렌더링)
 * @param {string} url  PDF URL
 */
export function PdfThumbnail({ url }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-white overflow-hidden">
      <Document
        file={url}
        loading={
          <div className="w-full aspect-[3/4] bg-gray-100 animate-pulse rounded" />
        }
        error={
          /* 썸네일 로드 실패 시 아이콘으로 대체 */
          <div className="w-full flex flex-col items-center justify-center gap-1 py-2">
            <svg className="w-7 h-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="15" y2="17" />
            </svg>
            <span className="text-[9px] font-semibold border rounded px-1 bg-red-50 text-red-500 border-red-200">
              PDF
            </span>
          </div>
        }
      >
        {containerWidth > 0 && (
          <Page
            pageNumber={1}
            width={containerWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        )}
      </Document>
    </div>
  );
}
