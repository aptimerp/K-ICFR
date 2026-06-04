"use client";

/**
 * EvalTermToggle — 평가 차수 토글 컴포넌트
 * 운영평가관리·결과조회 그룹 내 페이지에서 사용
 *
 * @param {'중간1'|'중간2'|'기말'} value
 * @param {Function} onChange - (value: string) => void
 * @param {'sm'|'md'} size
 */
const TERMS = [
  { id: "중간1", label: "중간 1차", desc: "1~6월" },
  { id: "중간2", label: "중간 2차", desc: "1~9월" },
  { id: "기말",  label: "기말",     desc: "12월" },
];

export default function EvalTermToggle({ value = "중간1", onChange, size = "md" }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 font-medium hidden sm:block">평가 차수</span>
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
        {TERMS.map((term) => {
          const isActive = value === term.id;
          return (
            <button
              key={term.id}
              onClick={() => onChange?.(term.id)}
              title={term.desc}
              className={`
                flex items-center gap-1 rounded-lg transition-colors font-bold
                ${size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"}
                ${isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {term.label}
              {isActive && (
                <span className={`
                  opacity-70
                  ${size === "sm" ? "text-[9px]" : "text-[10px]"}
                `}>
                  ({term.desc})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
