"use client";

import AppLayout from "./AppLayout";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

/* ── 미구현 페이지 공통 안내 컴포넌트 ── */
export default function Placeholder({ title, description, planNote, icon: Icon = Construction }) {
  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl p-8 text-center"
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Icon className="w-7 h-7 text-blue-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight mb-2">{title}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
          {planNote && (
            <div className="mt-5 inline-flex items-center px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold tracking-[0.1em] text-amber-700">
              {planNote}
            </div>
          )}
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-all"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              대시보드로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
