"use client";
import AppLayout from "@/components/AppLayout";
import { Save } from "lucide-react";

const SETTINGS = [
  { key: "EVAL_YEAR",       label: "평가 연도",           value: "2025",          type: "text" },
  { key: "COMPANY_NAME",    label: "회사명",              value: "금강공업㈜",     type: "text" },
  { key: "ENTITY_CODE",     label: "법인 코드",           value: "10000",          type: "text" },
  { key: "AI_CHECK_ENABLED", label: "AI 증빙 검증 활성화", value: "true",          type: "toggle" },
  { key: "NOTIF_EMAIL",     label: "알림 이메일",         value: "icfr@example.com", type: "text" },
  { key: "MAX_FILE_SIZE_MB", label: "최대 첨부 파일 크기 (MB)", value: "50",       type: "number" },
];

export default function EnvPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">환경설정</h1>
          <p className="text-sm text-gray-500 mt-1">시스템 파라미터·알림·코드를 설정합니다</p>
        </div>
        <div className="space-y-4">
          {SETTINGS.map((s) => (
            <div key={s.key} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                <div className="font-mono text-[11px] text-gray-400 mt-0.5">{s.key}</div>
              </div>
              {s.type === "toggle" ? (
                <div className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer ${s.value === "true" ? "bg-blue-600" : "bg-gray-200"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${s.value === "true" ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              ) : (
                <input
                  type={s.type}
                  defaultValue={s.value}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm text-gray-700 w-48 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              )}
            </div>
          ))}
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
            <Save className="w-4 h-4" /> 설정 저장
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
