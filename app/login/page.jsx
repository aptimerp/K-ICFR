"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, ChevronRight } from "lucide-react";

/* ── 로그인 화면 — UI Only (인증 로직 없음, SAC 합의 후 적용 예정) ── */
export default function LoginPage() {
  const router = useRouter();
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // UI 시뮬레이션 — 실제 인증 로직은 SAC 합의 후 적용
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 900);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(180deg,#ffffff 0%,#f1f5f9 100%)" }}
    >
      {/* ── 로고 + 서비스명 ── */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <Image
          src="/images/Kumkang-Kind-logo.png"
          alt="Kumkang Kind"
          width={72}
          height={72}
          className="object-contain"
        />
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-gray-900">
          KUMKANG KIND
        </span>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-2">
          내부회계관리시스템
        </h1>
        <p className="text-[15px] text-gray-500">Smart-ICM에 로그인하세요</p>
      </div>

      {/* ── 로그인 카드 — max-w-sm ── */}
      <div
        className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl px-8 py-8 space-y-5"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
      >
        <form onSubmit={handleLogin} className="space-y-4">
          {/* 사번 / 이메일 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              사번 / 이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="사번 또는 이메일 주소"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                autoComplete="username"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <button
                type="button"
                className="text-[12px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-[15px] placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPw
                  ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  : <Eye className="w-4 h-4" strokeWidth={1.5} />
                }
              </button>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.98] mt-2"
            style={{ boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                로그인 중…
              </>
            ) : (
              <>
                로그인
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        {/* 안내문 */}
        <p className="text-center text-[12px] text-gray-400 leading-relaxed pt-1">
          계정 문의: SAC 시스템팀 (내선 1234)
        </p>
      </div>

      {/* 버전 정보 */}
      <p className="mt-8 text-[11px] text-gray-400">
        Smart-ICM v1.0 · 금강공업㈜ © 2025
      </p>
    </div>
  );
}
