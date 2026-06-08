"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * ApprovalDrawer — 결재 처리 공통 사이드 패널 (우측 슬라이드 Drawer)
 *
 * Phase 8-B (M1/M2): 상신함·결재함 탭 안에서 통제 클릭 시 우측에서 슬라이드.
 * 증빙 미리보기·의견 입력·액션 버튼을 children으로 자유 구성한다.
 *
 * Props
 *  - open      : 패널 표시 여부
 *  - onClose   : 닫기 콜백 (오버레이 클릭·ESC·X 버튼)
 *  - title     : 패널 헤더 제목
 *  - subtitle  : (선택) 헤더 보조 텍스트 (통제코드 등)
 *  - footer    : (선택) 하단 고정 액션 영역 (승인/반려/재상신 버튼)
 *  - children  : 본문 (증빙 미리보기·의견 입력 등)
 */
export default function ApprovalDrawer({ open, onClose, title, subtitle, footer, children }) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 패널 — clamp(32rem, 36vw, 44rem): 작아도 32rem 보장, 커도 44rem 상한. lg 미만은 전체폭 */}
      <aside
        style={{ width: "clamp(32rem, 36vw, 44rem)" }}
        className={`fixed top-0 right-0 h-full max-w-full bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{title}</h2>
            {subtitle && <p className="text-xs font-mono text-blue-700 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 (스크롤) */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* 하단 액션 (고정) */}
        {footer && (
          <div className="border-t border-gray-100 px-5 py-3.5 shrink-0 bg-gray-50/50">{footer}</div>
        )}
      </aside>
    </>
  );
}
