"use client";
/**
 * FileUploader — 증빙 파일 업로드 공통 컴포넌트
 *
 * 지원 타입 : PDF · PNG · JPG · JPEG · XLSX · XLS · DOCX · DOC
 * 기본 크기 제한 : 50 MB / 파일
 *
 * Props
 *  - onFilesSelected  : (files: UploadFile[]) => void  파일 선택 콜백 (필수)
 *  - onUpload         : async (file: UploadFile) => { url: string }  실제 업로드 함수 (선택)
 *                       미지정 시 파일 선택만 동작 (UI 인터페이스)
 *  - multiple         : 복수 선택 여부 (기본 true)
 *  - accept           : 허용 확장자 배열 (기본 ALLOWED_EXTS)
 *  - maxSizeMB        : 파일당 크기 제한 MB (기본 50)
 *  - disabled         : 비활성화 (기본 false)
 *  - compact          : 좁은 레이아웃 (기본 false)
 *
 * UploadFile 형태
 *  { id, name, size, type, raw: File, status, progress, url?, error? }
 *
 * 사용 예:
 *   <FileUploader
 *     onFilesSelected={(files) => setEvidenceFiles(files)}
 *     onUpload={async (f) => { const url = await supabase.storage.from('evidence').upload(...); return { url }; }}
 *   />
 */

import { useCallback, useRef, useState } from "react";
import {
  FilePlus2, Paperclip, X, CheckCircle2, AlertCircle,
  Loader2, FileText, FileSpreadsheet, FileType, Image as ImageIcon,
} from "lucide-react";

/* ─── 허용 파일 타입 ─────────────────── */
export const ALLOWED_EXTS = ["pdf", "png", "jpg", "jpeg", "xlsx", "xls", "docx", "doc"];

const MIME_MAP = {
  pdf:  "application/pdf",
  png:  "image/png",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls:  "application/vnd.ms-excel",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc:  "application/msword",
};

const FILE_ICONS = {
  pdf:    <FileText className="w-4 h-4 text-red-500" />,
  png:    <ImageIcon className="w-4 h-4 text-violet-500" />,
  jpg:    <ImageIcon className="w-4 h-4 text-violet-500" />,
  jpeg:   <ImageIcon className="w-4 h-4 text-violet-500" />,
  xlsx:   <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
  xls:    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
  docx:   <FileType className="w-4 h-4 text-blue-500" />,
  doc:    <FileType className="w-4 h-4 text-blue-500" />,
};

/* ─── 유틸 ──────────────────────────── */
function formatSize(bytes) {
  if (bytes < 1024)       return bytes + "B";
  if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + "KB";
  return (bytes / 1048576).toFixed(1) + "MB";
}

function getExt(name = "") {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

/* ─── 파일 검증 ─────────────────────── */
function validateFile(file, allow, maxMB) {
  const ext = getExt(file.name);
  if (!allow.includes(ext)) {
    return `지원하지 않는 파일 형식입니다 (.${ext}). 허용: ${allow.join(", ")}`;
  }
  if (file.size > maxMB * 1024 * 1024) {
    return `파일 크기가 ${maxMB}MB를 초과합니다 (${formatSize(file.size)})`;
  }
  return null; // 유효
}

/* ─── 진행률 바 ─────────────────────── */
function ProgressBar({ progress }) {
  return (
    <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* ─── 파일 항목 ─────────────────────── */
function FileItem({ file, onRemove }) {
  const ext  = getExt(file.name);
  const icon = FILE_ICONS[ext] ?? <FileText className="w-4 h-4 text-gray-400" />;

  return (
    <div
      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border transition-colors ${
        file.status === "error"
          ? "border-red-200 bg-red-50"
          : file.status === "done"
          ? "border-emerald-200 bg-emerald-50"
          : "border-blue-100 bg-blue-50"
      }`}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-800 truncate">{file.name}</span>
          <span className="text-[10px] text-gray-400 shrink-0">{formatSize(file.raw?.size ?? 0)}</span>
        </div>

        {/* 상태별 표시 */}
        {file.status === "uploading" && (
          <>
            <div className="flex items-center gap-1 mt-0.5">
              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
              <span className="text-[10px] text-blue-600">{file.progress ?? 0}% 업로드 중…</span>
            </div>
            <ProgressBar progress={file.progress ?? 0} />
          </>
        )}
        {file.status === "done" && (
          <div className="flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] text-emerald-700 font-medium">업로드 완료</span>
          </div>
        )}
        {file.status === "error" && (
          <div className="flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-[10px] text-red-600">{file.error}</span>
          </div>
        )}
        {file.status === "pending" && (
          <span className="text-[10px] text-gray-400 mt-0.5 block">대기 중</span>
        )}
      </div>
      {/* 제거 버튼 (업로드 중 제외) */}
      {file.status !== "uploading" && (
        <button
          onClick={() => onRemove(file.id)}
          className="p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 shrink-0 transition-colors"
          title="제거"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/* ─── 메인 컴포넌트 ─────────────────── */
export default function FileUploader({
  onFilesSelected,
  onUpload,
  multiple   = true,
  accept     = ALLOWED_EXTS,
  maxSizeMB  = 50,
  disabled   = false,
  compact    = false,
}) {
  const [files,    setFiles]    = useState([]); // UploadFile[]
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  /* 파일 추가 처리 */
  const processFiles = useCallback(async (rawList) => {
    const incoming = [];

    for (const raw of rawList) {
      const validationError = validateFile(raw, accept, maxSizeMB);
      incoming.push({
        id:       makeId(),
        name:     raw.name,
        raw,
        status:   validationError ? "error" : "pending",
        error:    validationError ?? null,
        progress: 0,
        url:      null,
      });
    }

    const valid = incoming.filter((f) => f.status !== "error");
    const errored = incoming.filter((f) => f.status === "error");

    // 상태 업데이트 (에러 파일 포함해 먼저 표시)
    setFiles((prev) => {
      const next = multiple ? [...prev, ...incoming] : incoming;
      onFilesSelected?.(next);
      return next;
    });

    // onUpload가 없으면 "pending" 상태로만 유지
    if (!onUpload || valid.length === 0) return;

    // 업로드 실행
    for (const f of valid) {
      // 상태 → uploading
      setFiles((prev) => {
        const next = prev.map((p) =>
          p.id === f.id ? { ...p, status: "uploading", progress: 0 } : p
        );
        onFilesSelected?.(next);
        return next;
      });

      try {
        // 진행률 시뮬레이션 (실제 onUpload가 진행률 콜백을 제공하지 않을 때 UX 유지)
        const fakeProgress = setInterval(() => {
          setFiles((prev) =>
            prev.map((p) =>
              p.id === f.id && p.status === "uploading"
                ? { ...p, progress: Math.min((p.progress ?? 0) + 15, 90) }
                : p
            )
          );
        }, 200);

        const result = await onUpload(f); // { url: string } 반환 기대

        clearInterval(fakeProgress);

        setFiles((prev) => {
          const next = prev.map((p) =>
            p.id === f.id
              ? { ...p, status: "done", progress: 100, url: result?.url ?? null }
              : p
          );
          onFilesSelected?.(next);
          return next;
        });
      } catch (err) {
        setFiles((prev) => {
          const next = prev.map((p) =>
            p.id === f.id
              ? { ...p, status: "error", error: err?.message ?? "업로드 실패" }
              : p
          );
          onFilesSelected?.(next);
          return next;
        });
      }
    }
  }, [accept, maxSizeMB, multiple, onFilesSelected, onUpload]);

  /* 드롭 */
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    processFiles(Array.from(e.dataTransfer.files));
  }, [disabled, processFiles]);

  /* 파일 input 변경 */
  const handleInput = useCallback((e) => {
    if (disabled) return;
    processFiles(Array.from(e.target.files ?? []));
    e.target.value = ""; // 동일 파일 재선택 허용
  }, [disabled, processFiles]);

  /* 파일 제거 */
  const removeFile = useCallback((id) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      onFilesSelected?.(next);
      return next;
    });
  }, [onFilesSelected]);

  /* 허용 MIME 타입 문자열 (input accept 속성) */
  const acceptAttr = accept
    .map((ext) => MIME_MAP[ext] ?? `.${ext}`)
    .filter(Boolean)
    .join(",");

  const acceptLabel = accept.map((e) => e.toUpperCase()).join(" · ");

  return (
    <div className="w-full space-y-2">
      {/* 드롭존 */}
      <div
        role="button"
        tabIndex={0}
        aria-label="파일 업로드 영역"
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragEnter={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
        onDrop={handleDrop}
        className={[
          "border-2 border-dashed rounded-xl transition-all cursor-pointer select-none",
          compact ? "p-4" : "p-6",
          disabled
            ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
            : dragging
            ? "border-blue-400 bg-blue-50 scale-[1.01]"
            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30",
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
          <FilePlus2
            className={`${compact ? "w-7 h-7" : "w-9 h-9"} ${
              dragging ? "text-blue-500" : "text-gray-300"
            } transition-colors`}
          />
          {!compact && (
            <>
              <div className="text-sm font-medium text-gray-600">
                파일을 드래그하거나 <span className="text-blue-600 font-semibold">클릭하여 선택</span>
              </div>
              <div className="text-xs text-gray-400">
                {acceptLabel} · 최대 {maxSizeMB}MB
              </div>
            </>
          )}
          {compact && (
            <div className="text-xs text-gray-500">클릭 또는 드래그</div>
          )}
        </div>
      </div>

      {/* 숨긴 파일 input */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        multiple={multiple}
        onChange={handleInput}
        className="hidden"
      />

      {/* 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              선택된 파일 ({files.length})
            </span>
            {files.length > 1 && (
              <button
                onClick={() => { setFiles([]); onFilesSelected?.([]); }}
                className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
              >
                전체 삭제
              </button>
            )}
          </div>
          {files.map((f) => (
            <FileItem key={f.id} file={f} onRemove={removeFile} />
          ))}
        </div>
      )}

      {/* 빈 상태 요약 */}
      {files.length === 0 && (
        <div className="flex items-center gap-1.5 px-1">
          <Paperclip className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-xs text-gray-400">첨부된 파일이 없습니다.</span>
        </div>
      )}
    </div>
  );
}
