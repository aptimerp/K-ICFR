"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * SubPageTabs — 페이지 내 3단 탭 공통 컴포넌트
 *
 * @param {Object[]} tabs        - [{ id: string, label: string, badge?: string }]
 * @param {string}   activeTab   - 현재 활성 탭 id
 * @param {Function} onChange    - (tabId: string) => void
 */
export default function SubPageTabs({ tabs = [], activeTab, onChange }) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const handleClick = useCallback(
    (tabId) => {
      /* URL search param 동기화 */
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      onChange?.(tabId);
    },
    [router, pathname, searchParams, onChange]
  );

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex gap-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors
                ${isActive
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`
                  inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold
                  ${isActive
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
