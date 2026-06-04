"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  PanelLeft,
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  FileSearch,
  FolderOpen,
  AlertTriangle,
  BarChart3,
  FileBarChart2,
  Presentation,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  Users,
  BookOpen,
  RefreshCw,
  User,
  Target,
  Network,
  Inbox,
  Send,
  UserCheck,
  Paperclip,
  Calendar,
  History,
  AlertOctagon,
  Database,
  CheckSquare,
  FileSignature,
} from "lucide-react";

/* ── 네비게이션 구조 (MicolCM 메뉴구조도 + RCM 9프로세스 기반) ── */
const NAV = [
  {
    section: "기준정보",
    items: [
      { href: "/scoping",         icon: Target,         label: "Scoping" },
      { href: "/rcm",             icon: BookOpen,       label: "RCM 관리" },
      { href: "/elc",             icon: Presentation,   label: "ELC 관리" },
      { href: "/attachments",     icon: Paperclip,      label: "첨부 관리" },
    ],
  },
  {
    section: "설계평가",
    items: [
      { href: "/design",          icon: ShieldCheck,    label: "설계평가 수행" },
    ],
  },
  {
    section: "운영평가",
    items: [
      { href: "/population",      icon: Database,       label: "모집단 관리" },
      { href: "/operations",      icon: ClipboardList,  label: "운영평가 수행" },
    ],
  },
  {
    section: "증빙 관리",
    badge: "MAIN",
    items: [
      { href: "/evidence/request", icon: Inbox,         label: "증빙 요청 관리" },
      { href: "/operations/evidence", icon: FileSearch, label: "증빙 제출" },
      { href: "/evidence/assign",  icon: UserCheck,     label: "제출담당자 지정" },
    ],
  },
  {
    section: "결재",
    items: [
      { href: "/approval/sent",   icon: Send,           label: "결재 상신함" },
      { href: "/approval/inbox",  icon: Inbox,          label: "결재 대상함" },
    ],
  },
  {
    section: "결과 보고",
    items: [
      { href: "/reports/exception", icon: AlertOctagon, label: "예외 보고" },
      { href: "/reports",           icon: BarChart3,    label: "운영실태평가 보고" },
      { href: "/reports/progress",  icon: History,      label: "진행 현황" },
    ],
  },
  {
    section: "시스템",
    items: [
      { href: "/period",          icon: Calendar,       label: "통제기간 관리" },
      { href: "/settings",        icon: Settings,       label: "권한 관리" },
    ],
  },
];

/* ── 페이지 제목 맵 ── */
const PAGE_TITLE = {
  "/":                        "대시보드",
  "/scoping":                 "Scoping — 계정·위험평가",
  "/rcm":                     "RCM 관리",
  "/elc":                     "ELC 관리",
  "/attachments":             "첨부 관리",
  "/design":                  "설계평가 수행",
  "/population":              "모집단 관리",
  "/operations":              "운영평가 수행",
  "/evidence/request":        "증빙 요청 관리",
  "/operations/evidence":     "증빙 제출",
  "/evidence/assign":         "제출담당자 지정",
  "/approval/sent":           "결재 상신함",
  "/approval/inbox":          "결재 대상함",
  "/reports/exception":       "예외 보고",
  "/reports":                 "운영실태평가 보고",
  "/reports/progress":        "진행 현황",
  "/period":                  "통제기간 관리",
  "/settings":                "권한 관리",
};

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  /* 사이드바 상태 localStorage 영속 */
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setCollapsed((v) => {
      localStorage.setItem("sidebar-collapsed", String(!v));
      return !v;
    });
  };

  const pageTitle = PAGE_TITLE[pathname] ?? "Smart-ICM";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ══════════ 사이드바 (스타일가이드 10장 기준) ══════════ */}
      <aside
        className={`bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-out overflow-hidden shrink-0 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* 토글 버튼 영역 — 헤더와 동일한 h-16 */}
        <div className="h-16 px-3 flex items-center justify-end border-b border-gray-100 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            aria-label="사이드바 토글"
            title="사이드바 접기/펴기"
          >
            <PanelLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* 평가연도 배지 */}
        {!collapsed && (
          <div className="px-4 pt-3 pb-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold tracking-[0.15em] uppercase text-blue-600">
              2025 평가연도
            </span>
          </div>
        )}

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
          {/* 대시보드 단독 */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap mb-1 ${
              collapsed ? "justify-center" : ""
            } ${
              pathname === "/"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50 font-medium"
            }`}
            title={collapsed ? "대시보드" : undefined}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {!collapsed && <span>대시보드</span>}
          </Link>

          {/* 섹션별 그룹 */}
          {NAV.map((group) => (
            <div key={group.section} className="pt-1">
              {/* 섹션 레이블 */}
              {!collapsed && (
                <div className="px-3 py-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    {group.section}
                  </span>
                  {group.badge && (
                    <span className="inline-flex items-center px-1.5 py-0 rounded bg-cyan-50 border border-cyan-200 text-[9px] font-bold tracking-[0.1em] text-cyan-700">
                      {group.badge}
                    </span>
                  )}
                </div>
              )}
              {collapsed && <div className="my-1 border-t border-gray-100" />}

              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap ${
                      collapsed ? "justify-center" : ""
                    } ${
                      active
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 font-medium"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ══════════ 메인 영역 ══════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── 헤더 (스타일가이드: h-16, white/80, backdrop-blur-md) ── */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 flex items-center justify-between shrink-0 z-20 relative">
          {/* 좌: 로고 + 구분선 + 페이지 제목 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Image
                src="/images/Kumkang-Kind-logo.png"
                alt="Kumkang Kind"
                width={28}
                height={28}
                className="object-contain"
              />
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-gray-900 hidden sm:block">
                Smart-ICM
              </span>
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <span className="text-sm font-semibold text-gray-900">{pageTitle}</span>
          </div>

          {/* 우: ERP 상태 + 알림 + 사용자 */}
          <div className="flex items-center gap-2">
            {/* ERP 연동 상태 */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold tracking-[0.1em] text-emerald-700">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              ERP 연동 정상
            </span>

            {/* 알림 버튼 */}
            <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors relative">
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            <div className="w-px h-5 bg-gray-200 mx-0.5" />

            {/* 사용자 메뉴 */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-900">장한나</span>
                <ChevronDown className="w-3 h-3 text-gray-400" strokeWidth={2} />
              </button>

              {userMenuOpen && (
                <>
                  {/* 외부 클릭 닫기 오버레이 */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl py-1.5 z-50"
                    style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}
                  >
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <div className="text-sm font-semibold text-gray-900">장한나</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">내부회계 PL · K-ICFR</div>
                    </div>
                    <div className="py-1">
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left">
                        <User className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                        <span className="text-sm text-gray-700">프로필</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left">
                        <Settings className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                        <span className="text-sm text-gray-700">설정</span>
                      </button>
                    </div>
                    <div className="my-1 border-t border-gray-100" />
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 transition-colors text-left group">
                      <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-600" strokeWidth={1.5} />
                      <span className="text-sm text-gray-700 group-hover:text-red-600">로그아웃</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── 페이지 콘텐츠 ── */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
