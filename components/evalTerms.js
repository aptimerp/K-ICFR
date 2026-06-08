"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * 통제기간(평가기간) 전역 컨텍스트 — A안 (2026-06-08)
 *
 * 헤더의 전역 셀렉터에서 선택한 통제기간을 모든 페이지가 구독한다.
 * 페르소나 토글과 동일하게 localStorage + 커스텀 이벤트로 동기화.
 *  - closed=true 인 통제기간은 마감되어 조회만 가능 (R8 — RISK_DECISION_LOG)
 */

/* 통제기간 목록 — 실제 운영 시 Supabase eval_terms 에서 로드 (is_active=false → closed) */
export const EVAL_TERMS = [
  { id: "2024-1",      label: "2024년 내부회계관리제도 1차 운영평가",  closed: false },
  { id: "2023-final",  label: "2023년 내부회계관리제도 기말 운영평가", closed: true },
  { id: "2023-2",      label: "2023년 내부회계관리제도 2차 운영평가",  closed: true },
];

const STORAGE_KEY = "eval-term-id";
const EVENT_NAME  = "evaltermchange";

export function getStoredTermId() {
  if (typeof window === "undefined") return EVAL_TERMS[0].id;
  return localStorage.getItem(STORAGE_KEY) || EVAL_TERMS[0].id;
}

export function setStoredTermId(id) {
  localStorage.setItem(STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: id })); // 같은 탭 동기화
}

export function getTerm(id) {
  return EVAL_TERMS.find((t) => t.id === id) ?? EVAL_TERMS[0];
}

/**
 * useEvalTerm — 전역 통제기간 구독 훅
 * @returns { termId, term, isClosed, setTermId }
 */
export function useEvalTerm() {
  const [termId, setTermIdState] = useState(EVAL_TERMS[0].id);

  // 마운트 시 복원
  useEffect(() => { setTermIdState(getStoredTermId()); }, []);

  // 같은 탭(CustomEvent) + 다른 탭(storage) 동기화
  useEffect(() => {
    const onCustom = (e) => setTermIdState(e.detail);
    const onStorage = (e) => { if (e.key === STORAGE_KEY && e.newValue) setTermIdState(e.newValue); };
    window.addEventListener(EVENT_NAME, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setTermId = useCallback((id) => { setStoredTermId(id); setTermIdState(id); }, []);
  const term = getTerm(termId);
  return { termId, term, isClosed: !!term.closed, setTermId };
}
