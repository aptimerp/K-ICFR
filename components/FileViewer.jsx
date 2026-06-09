"use client";
/**
 * FileViewer — 파일 타입별 통합 미리보기 컴포넌트
 *
 * 지원 타입: PDF · 이미지(PNG/JPG/JPEG/GIF/WEBP) · Excel(xlsx/xls) · Word(docx/doc)
 *
 * ✅ SSR 불가 — next/dynamic + ssr:false 로 임포트해야 함
 * ✅ 각 뷰어는 독립 컴포넌트로 코드 스플릿 → 필요한 타입만 번들에 포함
 * ✅ 파일 URL 또는 File 객체 모두 지원
 * ✅ 모든 타입에 로딩·에러 폴백 UI 포함
 *
 * 사용 예:
 *   <FileViewer url="/files/report.xlsx" fileName="report.xlsx" />
 *   <FileViewer url={signedUrl} fileName="전표.pdf" orientation="landscape" />
 */

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FileText, FileSpreadsheet, FileType, Image as ImageIcon, AlertCircle } from "lucide-react";

/* ─────────────────────────────────────────────────
   유틸: 파일명 → 타입 분류
───────────────────────────────────────────────── */
export function getFileType(fileName = "") {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext))                    return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (["xlsx", "xls"].includes(ext))            return "excel";
  if (["docx", "doc"].includes(ext))            return "word";
  return "unknown";
}

/* ─────────────────────────────────────────────────
   에러 / 미지원 폴백 UI
───────────────────────────────────────────────── */
function UnsupportedView({ fileName, message }) {
  const type = getFileType(fileName);
  const icons = {
    pdf:     <FileText className="w-10 h-10 text-red-400" strokeWidth={1.2} />,
    excel:   <FileSpreadsheet className="w-10 h-10 text-emerald-400" strokeWidth={1.2} />,
    word:    <FileType className="w-10 h-10 text-blue-400" strokeWidth={1.2} />,
    image:   <ImageIcon className="w-10 h-10 text-violet-400" strokeWidth={1.2} />,
    unknown: <AlertCircle className="w-10 h-10 text-gray-400" strokeWidth={1.2} />,
  };
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-3 p-6 bg-gray-50 rounded-xl text-center">
      {icons[type] ?? icons.unknown}
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-0.5 truncate max-w-xs">{fileName}</div>
        <div className="text-xs text-gray-400">
          {message ?? "이 파일 형식은 미리보기가 지원되지 않습니다."}
        </div>
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex items-center justify-center h-full min-h-[160px] bg-gray-50 rounded-xl">
      <span className="text-sm text-gray-400 animate-pulse">불러오는 중…</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   이미지 뷰어
───────────────────────────────────────────────── */
export function ImageViewer({ url, fileName, className = "" }) {
  const [error, setError] = useState(false);
  if (error) return <UnsupportedView fileName={fileName} message="이미지를 불러올 수 없습니다." />;
  return (
    <div className={`w-full bg-white flex items-center justify-center overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={fileName}
        onError={() => setError(true)}
        className="max-w-full max-h-full object-contain"
        style={{ display: "block" }}
      />
    </div>
  );
}

/* 이미지 썸네일 */
export function ImageThumbnail({ url, fileName }) {
  const [error, setError] = useState(false);
  if (error) return (
    <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center rounded">
      <ImageIcon className="w-6 h-6 text-gray-300" />
    </div>
  );
  return (
    <div className="w-full overflow-hidden bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={fileName}
        onError={() => setError(true)}
        className="w-full h-auto object-contain"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Excel 뷰어 (SheetJS)
   - xlsx 패키지 → ArrayBuffer 파싱 → HTML 테이블
   - 시트 탭 전환 지원
───────────────────────────────────────────────── */
export function ExcelViewer({ url, fileName }) {
  const [sheets, setSheets]     = useState(null); // { [sheetName]: htmlString }
  const [names, setNames]       = useState([]);
  const [activeSheet, setActive] = useState(0);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // xlsx를 동적 임포트 (코드 스플릿 + SSR 방지)
        const XLSX = (await import("xlsx")).default ?? (await import("xlsx"));
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf  = await res.arrayBuffer();
        const wb   = XLSX.read(buf, { type: "buffer" });

        if (cancelled) return;

        const result = {};
        wb.SheetNames.forEach((name) => {
          result[name] = XLSX.utils.sheet_to_html(wb.Sheets[name], {
            header: "",
            footer: "",
          });
        });
        setSheets(result);
        setNames(wb.SheetNames);
        setActive(0);
      } catch (e) {
        if (!cancelled) setError(e.message ?? "엑셀 파일을 불러올 수 없습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [url]);

  if (loading) return <LoadingView />;
  if (error)   return <UnsupportedView fileName={fileName} message={error} />;
  if (!sheets) return <UnsupportedView fileName={fileName} />;

  const currentHtml = sheets[names[activeSheet]] ?? "";

  return (
    <div className="flex flex-col w-full h-full min-h-[300px] bg-white">
      {/* 시트 탭 */}
      {names.length > 1 && (
        <div className="flex gap-1 px-3 pt-2 pb-0 border-b border-gray-100 bg-gray-50 shrink-0 overflow-x-auto">
          {names.map((name, i) => (
            <button
              key={name}
              onClick={() => setActive(i)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border border-b-0 whitespace-nowrap transition-colors ${
                i === activeSheet
                  ? "bg-white text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-white"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      {/* 테이블 */}
      <div className="flex-1 overflow-auto p-3">
        <div
          className="excel-preview text-xs"
          dangerouslySetInnerHTML={{ __html: currentHtml }}
        />
      </div>
      {/* 엑셀 테이블 기본 스타일 */}
      <style>{`
        .excel-preview table { border-collapse: collapse; min-width: 100%; }
        .excel-preview td, .excel-preview th {
          border: 1px solid #e5e7eb;
          padding: 4px 8px;
          white-space: nowrap;
          font-size: 11px;
          color: #374151;
        }
        .excel-preview th { background: #f9fafb; font-weight: 600; }
        .excel-preview tr:hover td { background: #f0f9ff; }
      `}</style>
    </div>
  );
}

/* Excel 썸네일 — 스프레드시트 아이콘 */
export function ExcelThumbnail({ fileName }) {
  return (
    <div className="w-full aspect-[3/4] bg-emerald-50 flex flex-col items-center justify-center gap-1 rounded border border-emerald-100">
      <FileSpreadsheet className="w-8 h-8 text-emerald-500" strokeWidth={1.2} />
      <span className="text-[9px] font-bold text-emerald-600 bg-white border border-emerald-200 px-1.5 py-0.5 rounded">
        {(fileName?.split(".").pop() ?? "xlsx").toUpperCase()}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Word 뷰어 (docx-preview)
   - docx-preview → ArrayBuffer → DOM 렌더링
───────────────────────────────────────────────── */
export function WordViewer({ url, fileName }) {
  const containerRef = useRef(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url || !containerRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { renderAsync } = await import("docx-preview");
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf  = await res.arrayBuffer();

        if (cancelled || !containerRef.current) return;

        await renderAsync(buf, containerRef.current, undefined, {
          className: "docx-preview-wrap",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          useBase64URL: true,
        });
      } catch (e) {
        if (!cancelled) setError(e.message ?? "Word 파일을 불러올 수 없습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [url]);

  return (
    <div className="relative w-full h-full min-h-[300px] bg-white">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <span className="text-sm text-gray-400 animate-pulse">Word 문서 렌더링 중…</span>
        </div>
      )}
      {error && <UnsupportedView fileName={fileName} message={error} />}
      <div
        ref={containerRef}
        className="w-full h-full overflow-auto docx-host"
        style={{ display: error ? "none" : "block" }}
      />
      <style>{`
        .docx-preview-wrap { padding: 1rem; }
        .docx-host section.docx { background: white; box-shadow: 0 1px 4px rgba(0,0,0,.08); margin: 0 auto 1rem; }
      `}</style>
    </div>
  );
}

/* Word 썸네일 */
export function WordThumbnail({ fileName }) {
  return (
    <div className="w-full aspect-[3/4] bg-blue-50 flex flex-col items-center justify-center gap-1 rounded border border-blue-100">
      <FileType className="w-8 h-8 text-blue-500" strokeWidth={1.2} />
      <span className="text-[9px] font-bold text-blue-600 bg-white border border-blue-200 px-1.5 py-0.5 rounded">
        {(fileName?.split(".").pop() ?? "docx").toUpperCase()}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   FileViewer — 타입 자동 감지 통합 뷰어
   ✅ EvidenceViewer.renderPage / renderThumbnail 에서 직접 사용
───────────────────────────────────────────────── */

// PDF 뷰어는 별도 dynamic import (pdfjs SSR 방지)
const PdfPageViewer = dynamic(
  () => import("@/components/PdfViewer").then((m) => ({ default: m.PdfPageViewer })),
  { ssr: false, loading: () => <LoadingView /> }
);
const PdfThumbnail = dynamic(
  () => import("@/components/PdfViewer").then((m) => ({ default: m.PdfThumbnail })),
  { ssr: false, loading: () => null }
);

/**
 * FileViewer
 * @param {string}  url         파일 URL (Supabase signed URL 또는 /public 경로)
 * @param {string}  fileName    파일명 (확장자로 타입 자동 판별)
 * @param {number}  pageNumber  PDF 전용 — 표시 페이지 (기본 1)
 * @param {string}  orientation PDF 전용 — "portrait" | "landscape" | "wide"
 * @param {boolean} thumbnail   썸네일 모드 여부 (기본 false)
 */
export default function FileViewer({
  url,
  fileName = "",
  pageNumber = 1,
  orientation = "portrait",
  thumbnail = false,
}) {
  const type = getFileType(fileName);

  if (!url) return <UnsupportedView fileName={fileName} message="파일 URL이 없습니다." />;

  /* 썸네일 모드 */
  if (thumbnail) {
    switch (type) {
      case "pdf":   return <PdfThumbnail url={url} />;
      case "image": return <ImageThumbnail url={url} fileName={fileName} />;
      case "excel": return <ExcelThumbnail fileName={fileName} />;
      case "word":  return <WordThumbnail fileName={fileName} />;
      default:      return (
        <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center rounded border border-gray-100">
          <AlertCircle className="w-6 h-6 text-gray-300" />
        </div>
      );
    }
  }

  /* 전체 뷰어 모드 */
  switch (type) {
    case "pdf":
      return <PdfPageViewer url={url} pageNumber={pageNumber} orientation={orientation} />;
    case "image":
      return <ImageViewer url={url} fileName={fileName} className="w-full h-full" />;
    case "excel":
      return <ExcelViewer url={url} fileName={fileName} />;
    case "word":
      return <WordViewer url={url} fileName={fileName} />;
    default:
      return <UnsupportedView fileName={fileName} />;
  }
}
