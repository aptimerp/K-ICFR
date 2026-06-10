"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  PanelLeft,
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  FileCheck2,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  CheckSquare,
  Send,
  Inbox,
  TrendingUp,
  Wrench,
  AlertTriangle,
  CalendarRange,
  Lock,
} from "lucide-react";
import { EVAL_TERMS, useEvalTerm } from "@/components/evalTerms";

/* ─────────────────────────────────────────────────────────────
   v6 내비게이션 구조  (IA v6 확정, 2026-05-21)
   사이드바 1단(그룹) + 2단(서브페이지 또는 단일 메뉴)
───────────────────────────────────────────────────────────── */
const NAV = [
  /* 1️⃣ 운영관리 */
  {
    id: "operations",
    label: "운영관리",
    icon: Wrench,
    badge: null,
    disabled: false,
    items: [
      { href: "/operations/period", label: "평가관리" },
      { href: "/operations/rcm",    label: "RCM관리" },
    ],
  },
  /* 2️⃣ 설계평가관리 — 준비중 */
  {
    id: "design",
    label: "설계평가관리",
    icon: ShieldCheck,
    badge: "준비중",
    disabled: true,
    items: [
      { href: "/design/prep",     label: "사전준비" },
      { href: "/design/self",     label: "자체평가" },
      { href: "/design/eval",     label: "설계평가" },
      { href: "/design/progress", label: "진행관리" },
    ],
  },
  /* 3️⃣ 운영평가관리 */
  {
    id: "op-eval",
    label: "운영평가관리",
    icon: ClipboardList,
    badge: null,
    disabled: false,
    items: [
      { href: "/op-eval/sampling", label: "샘플링작업", badge: "P5" },
      { href: "/op-eval/evidence", label: "증빙제출",   badge: "⭐" },
      { href: "/op-eval/eval",     label: "운영평가" },
      { href: "/op-eval/progress", label: "진행관리" },
    ],
  },
  /* 4️⃣ 결재관리 */
  {
    id: "approval",
    label: "결재관리",
    icon: FileCheck2,
    badge: null,
    disabled: false,
    items: [
      { href: "/approval/sent",  label: "상신함" },
      { href: "/approval/inbox", label: "결재함" },
    ],
  },
  /* 5️⃣ 결과조회 */
  {
    id: "results",
    label: "결과조회",
    icon: BarChart3,
    badge: null,
    disabled: false,
    items: [
      { href: "/results/status", label: "평가 현황" },
    ],
  },
  /* 6️⃣ 시스템관리 */
  {
    id: "settings",
    label: "시스템관리",
    icon: Settings,
    badge: null,
    disabled: false,
    items: [
      { href: "/settings/users",         label: "사용자·권한" },
      { href: "/settings/log",           label: "로그" },
      { href: "/settings/evidence-log",  label: "증빙 로그" },
      { href: "/settings/env",           label: "환경설정" },
    ],
  },
];

/* 개발용 페르소나 목록 */
const PERSONAS = [
  { id: "P5", label: "P5 내부회계팀",      color: "bg-red-100 text-red-700" },
  { id: "P1", label: "P1 통제수행자",       color: "bg-blue-100 text-blue-700" },
  { id: "P2", label: "P2 통제책임자",       color: "bg-orange-100 text-orange-700" },
  { id: "P3", label: "P3 내부회계평가자",   color: "bg-purple-100 text-purple-700" },
  { id: "P4", label: "P4 감사·감사위",      color: "bg-yellow-100 text-yellow-700" },
];

/* pathname → 그룹 ID 매핑 */
function getActiveGroup(pathname) {
  if (pathname === "/") return null;
  for (const group of NAV) {
    if (group.items.some((item) => pathname.startsWith(item.href))) {
      return group.id;
    }
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────
   AppLayout 컴포넌트
───────────────────────────────────────────────────────────── */
export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();

  /* 사이드바 접힘 상태 */
  const [collapsed,    setCollapsed]    = useState(false);
  /* 펼쳐진 그룹 (accordion) */
  const [openGroup,    setOpenGroup]    = useState(() => getActiveGroup(pathname));
  /* 사용자 드롭다운 */
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  /* 개발용 페르소나 */
  const [persona,      setPersona]      = useState("P5");
  /* 전역 통제기간(평가기간) — 모든 페이지 공통 (A안) */
  const { termId, isClosed, setTermId } = useEvalTerm();

  /* localStorage 복원 */
  useEffect(() => {
    const sc = localStorage.getItem("sidebar-collapsed");
    if (sc === "true") setCollapsed(true);
    const sp = localStorage.getItem("dev-persona");
    if (sp) setPersona(sp);
  }, []);

  /* pathname 변경 시 활성 그룹 자동 펼침 */
  useEffect(() => {
    const activeId = getActiveGroup(pathname);
    if (activeId) setOpenGroup(activeId);
  }, [pathname]);

  /* 키보드 단축키: Ctrl/Cmd + B */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleSidebar = useCallback(() => {
    setCollapsed((v) => {
      localStorage.setItem("sidebar-collapsed", String(!v));
      return !v;
    });
  }, []);

  const toggleGroup = (groupId, disabled) => {
    if (disabled) return;
    setOpenGroup((prev) => (prev === groupId ? null : groupId));
  };

  const changePersona = (id) => {
    setPersona(id);
    localStorage.setItem("dev-persona", id);
    setUserMenuOpen(false);
    router.push("/");
  };

  /* 현재 페이지 제목 */
  const activeGroup = NAV.find((g) => g.id === getActiveGroup(pathname));
  const activeItem  = NAV.flatMap((g) => g.items).find((i) => pathname.startsWith(i.href));
  const pageTitle   = activeItem?.label ?? (pathname === "/" ? "홈" : "Smart-ICM");

  /* 현재 페르소나 정보 */
  const currentPersona = PERSONAS.find((p) => p.id === persona) ?? PERSONAS[0];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ══════════════════════════════════════════
          사이드바
      ══════════════════════════════════════════ */}
      <aside
        className={`bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-out overflow-hidden shrink-0 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* 사이드바 상단: 토글 버튼 */}
        <div className="h-16 px-3 flex items-center justify-end border-b border-gray-100 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            aria-label="사이드바 토글"
            title="사이드바 접기/펴기 (Ctrl+B)"
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
        <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">

          {/* 🏠 홈 — 단독 항목 */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap ${
              collapsed ? "justify-center" : ""
            } ${
              pathname === "/"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50 font-medium"
            }`}
            title={collapsed ? "홈" : undefined}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {!collapsed && <span>홈</span>}
          </Link>

          {/* 구분선 */}
          {!collapsed && <div className="my-1 border-t border-gray-100" />}
          {collapsed  && <div className="my-1" />}

          {/* 6개 그룹 */}
          {NAV.map((group) => {
            const isOpen   = openGroup === group.id;
            const isActive = getActiveGroup(pathname) === group.id;
            const Icon     = group.icon;

            return (
              <div key={group.id}>
                {/* 1단 — 그룹 헤더 */}
                <button
                  onClick={() => toggleGroup(group.id, group.disabled)}
                  disabled={group.disabled}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap ${
                    collapsed ? "justify-center" : "justify-between"
                  } ${
                    group.disabled
                      ? "text-gray-300 cursor-not-allowed opacity-60"
                      : isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 font-medium"
                  }`}
                  title={collapsed ? group.label : undefined}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    {!collapsed && <span>{group.label}</span>}
                  </span>

                  {/* 배지 + 화살표 (펼침 상태) */}
                  {!collapsed && (
                    <span className="flex items-center gap-1.5">
                      {group.badge && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide bg-gray-100 text-gray-400 border border-gray-200">
                          {group.badge}
                        </span>
                      )}
                      {!group.disabled && (
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                          strokeWidth={2}
                        />
                      )}
                    </span>
                  )}
                </button>

                {/* 2단 — 서브페이지 목록 (accordion) */}
                {!collapsed && !group.disabled && isOpen && (
                  <div className="ml-3 mt-0.5 mb-1 pl-3 border-l border-gray-100 space-y-0.5">
                    {group.items.map((item) => {
                      const itemActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                            itemActive
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-gray-600 hover:bg-gray-50 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              item.badge === "⭐"
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* 접힘 상태에서 활성 그룹 구분선 */}
                {collapsed && <div className="my-0.5" />}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ══════════════════════════════════════════
          메인 영역
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── 헤더 ── */}
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

          {/* 우: 통제기간 전역 셀렉터 + ERP 상태 + 알림 + 사용자 */}
          <div className="flex items-center gap-2">

            {/* 통제기간 전역 셀렉터 — 모든 페이지 공통 (A안) */}
            <div className="hidden md:flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <select
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
                className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 max-w-[15rem] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                title="통제기간 선택 (전체 화면 공통 적용)"
              >
                {EVAL_TERMS.map((t) => (
                  <option key={t.id} value={t.id}>{t.closed ? `[마감] ${t.label}` : t.label}</option>
                ))}
              </select>
              {isClosed && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-600" title="마감된 통제기간은 조회만 가능합니다">
                  <Lock className="w-3 h-3" /> 조회전용
                </span>
              )}
            </div>

            {/* ERP 연동 상태 */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold tracking-[0.1em] text-emerald-700">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              ERP 연동 정상
            </span>

            {/* 알림 */}
            <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors relative">
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            <div className="w-px h-5 bg-gray-200 mx-0.5" />

            {/* 사용자 드롭다운 (개발용 페르소나 토글 포함) */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${currentPersona.color}`}>
                  {currentPersona.id}
                </span>
                <span className="text-xs font-semibold text-gray-900">장한나</span>
                <ChevronDown className="w-3 h-3 text-gray-400" strokeWidth={2} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-100 rounded-2xl py-1.5 z-50"
                    style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}
                  >
                    {/* 사용자 정보 */}
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <div className="text-sm font-semibold text-gray-900">장한나</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">내부회계 PL · K-ICFR</div>
                    </div>

                    {/* 개발용 페르소나 전환 */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5">
                        개발용 페르소나
                      </div>
                      <div className="space-y-0.5">
                        {PERSONAS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => changePersona(p.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                              persona === p.id
                                ? "bg-blue-50"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.color}`}>
                              {p.id}
                            </span>
                            <span className="text-xs text-gray-700">{p.label.replace(`${p.id} `, "")}</span>
                            {persona === p.id && (
                              <span className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 일반 메뉴 */}
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
