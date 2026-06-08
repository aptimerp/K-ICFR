"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import ApprovalDrawer from "@/components/ApprovalDrawer";
import { ThumbsUp, ThumbsDown, FileText, AlertTriangle, MessageSquare, CheckCircle2, Download, Users } from "lucide-react";

const TERM = "[마감] 2024년 내부회계관리제도 1차 운영평가";

const INITIAL_INBOX = [
  { id: 1, biz: "운영평가-업무수준", ctrl: "FA-C-1-6-1", ctrlName: "임대차계약 리스트의 완전성 검토 및 승인", dept: "언양회계파트", evalDept: "내부감사파트", result: "정상", from: "장한나", received: "2024-10-14 10:30", aiWarn: 0, note: "임대차계약 리스트 완전성 대사표 첨부. 누락 없음 확인.", status: "대기", approvedAt: null,
    line: [{ seq: 1, name: "이차장", pos: "팀장", dept: "내부감사파트", status: "대기", opinion: "", at: "" }] },
  { id: 2, biz: "예외보고서", ctrl: "FA-C-1-2-3", ctrlName: "고정자산 취득 전표 검토 및 승인", dept: "구매공정파트", evalDept: "언양회계파트", result: "해당없음", from: "손호민", received: "2024-10-08 16:49", aiWarn: 1, note: "해당 기간 고정자산 취득 거래 없음. 해당없음 처리 요청.", status: "대기", approvedAt: null,
    line: [{ seq: 1, name: "이차장", pos: "팀장", dept: "내부감사파트", status: "대기", opinion: "", at: "" }] },
  { id: 3, biz: "예외보고서", ctrl: "FA-C-1-2-4", ctrlName: "건설중인자산계정의 본계정 대체 승인", dept: "음성회계파트", evalDept: "음성1 회계", result: "해당없음", from: "천승범", received: "2024-10-11 10:13", aiWarn: 0, note: "당기 본계정 대체 거래 미발생.", status: "대기", approvedAt: null,
    line: [{ seq: 1, name: "이차장", pos: "팀장", dept: "내부감사파트", status: "대기", opinion: "", at: "" }] },
  { id: 4, biz: "운영평가-업무수준", ctrl: "FR-C-1-3-1", ctrlName: "전표승인절차", dept: "창녕회계파트", evalDept: "창녕회계파트", result: "정상", from: "송희수", received: "2024-10-17 10:21", aiWarn: 0, note: "전표승인 샘플 5건 모두 승인라인 정상.", status: "대기", approvedAt: null,
    line: [{ seq: 1, name: "이차장", pos: "팀장", dept: "내부감사파트", status: "대기", opinion: "", at: "" }] },
];

const RESULT_COLOR = { 정상: "text-emerald-700", 예외: "text-red-600 font-bold", 해당없음: "text-gray-400" };
const STATUS_BADGE = { 대기: "bg-gray-50 text-gray-500 border-gray-200", 승인: "bg-emerald-50 text-emerald-700 border-emerald-200", 반려: "bg-red-50 text-red-700 border-red-200" };
const LINE_COLOR = { 승인: "text-emerald-600", 반려: "text-red-600", 대기: "text-gray-400" };

export default function InboxPage() {
  const [rows, setRows] = useState(INITIAL_INBOX);
  const [selected, setSelected] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [opinion, setOpinion] = useState("");

  const summary = {
    total: rows.length,
    정상: rows.filter((r) => r.result === "정상").length,
    예외: rows.filter((r) => r.result === "예외").length,
    해당없음: rows.filter((r) => r.result === "해당없음").length,
  };
  const pending = rows.filter((r) => r.status === "대기");
  const toggleAll = (c) => setSelected(c ? pending.map((r) => r.id) : []);
  const isAllChecked = pending.length > 0 && selected.length === pending.length;
  const openDrawer = (item) => { setDrawer(item); setOpinion(""); };

  const now = () => new Date().toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
  const approveOne = (id) => {
    const at = now();
    setRows((p) => p.map((r) => r.id === id ? { ...r, status: "승인", approvedAt: at, line: r.line.map((l) => ({ ...l, status: "승인", opinion: opinion || l.opinion, at })) } : r));
    setSelected((p) => p.filter((x) => x !== id)); setDrawer(null);
  };
  const rejectOne = (id) => {
    if (!opinion.trim()) return;
    const at = now();
    setRows((p) => p.map((r) => r.id === id ? { ...r, status: "반려", approvedAt: null, line: r.line.map((l) => ({ ...l, status: "반려", opinion, at })) } : r));
    setSelected((p) => p.filter((x) => x !== id)); setDrawer(null);
  };

  return (
    <AppLayout>
      <div className="max-w-full">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">결재함 (결재대상함)</h1>
          <p className="text-sm text-gray-500 mt-1">부서원이 상신한 결재 건을 검토·승인·반려합니다. 통제번호를 클릭하면 제출 증빙·결재현황을 확인할 수 있습니다</p>
        </div>

        {/* 필터/컨텍스트 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <label className="flex items-center gap-2"><span className="text-gray-500 w-20 shrink-0">통제기간</span><select className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700"><option>{TERM}</option></select></label>
            <label className="flex items-center gap-2"><span className="text-gray-500 w-20 shrink-0">상신자</span><input placeholder="상신자 검색" className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5" /></label>
            <label className="flex items-center gap-2"><span className="text-gray-500 w-20 shrink-0">통제번호</span><input placeholder="통제번호 검색" className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5" /></label>
          </div>
        </div>

        {/* 요약 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-sm">
          <span className="font-bold text-gray-900">전체 {summary.total}건</span><span className="text-gray-300">|</span>
          <span className="text-emerald-700">정상 <b>{summary.정상}</b></span>
          <span className="text-red-600">예외 <b>{summary.예외}</b></span>
          <span className="text-gray-400">해당없음 <b>{summary.해당없음}</b></span>
          <span className="text-red-500 text-xs ml-auto">※ 해당 통제기간이 마감처리되었습니다</span>
        </div>

        {/* 액션바 */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <button disabled={selected.length === 0} className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-40"><ThumbsDown className="w-4 h-4" /> 반려</button>
            <button disabled={selected.length === 0} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40"><ThumbsUp className="w-4 h-4" /> 일괄 승인 ({selected.length})</button>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"><Download className="w-4 h-4" /> 엑셀저장</button>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <th className="px-3 py-3 w-10"><input type="checkbox" checked={isAllChecked} onChange={(e) => toggleAll(e.target.checked)} className="rounded" /></th>
                <th className="text-left px-3 py-3 font-semibold">업무구분</th>
                <th className="text-left px-3 py-3 font-semibold">결재상태</th>
                <th className="text-left px-3 py-3 font-semibold">통제번호 / 통제활동명</th>
                <th className="text-left px-3 py-3 font-semibold">관련부서</th>
                <th className="text-left px-3 py-3 font-semibold">평가자부서</th>
                <th className="text-center px-3 py-3 font-semibold">평가결과</th>
                <th className="text-left px-3 py-3 font-semibold">상신자</th>
                <th className="text-center px-3 py-3 font-semibold">상신의견</th>
                <th className="text-left px-3 py-3 font-semibold">상신일시</th>
                <th className="text-center px-3 py-3 font-semibold">AI경고</th>
                <th className="text-center px-3 py-3 font-semibold">결재현황</th>
                <th className="text-left px-3 py-3 font-semibold">결재일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((item) => (
                <tr key={item.id} className={`transition-colors ${selected.includes(item.id) ? "bg-blue-50/50" : "hover:bg-gray-50/50"}`}>
                  <td className="px-3 py-3 text-center"><input type="checkbox" disabled={item.status !== "대기"} checked={selected.includes(item.id)} onChange={(e) => setSelected((p) => e.target.checked ? [...p, item.id] : p.filter((x) => x !== item.id))} className="rounded disabled:opacity-30" /></td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{item.biz}</td>
                  <td className="px-3 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full border text-[11px] font-semibold ${STATUS_BADGE[item.status]}`}>{item.status}</span></td>
                  <td className="px-3 py-3">
                    <button onClick={() => openDrawer(item)} className="text-left hover:underline">
                      <span className="font-mono text-xs text-blue-700">{item.ctrl} ↗</span>
                      <span className="text-gray-700"> / {item.ctrlName}</span>
                    </button>
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{item.dept}</td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{item.evalDept}</td>
                  <td className={`px-3 py-3 text-center text-xs ${RESULT_COLOR[item.result]}`}>{item.result}</td>
                  <td className="px-3 py-3 text-gray-600">{item.from}</td>
                  <td className="px-3 py-3 text-center"><button onClick={() => openDrawer(item)} className="text-xs text-blue-600 hover:underline">보기</button></td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{item.received}</td>
                  <td className="px-3 py-3 text-center">{item.aiWarn > 0 ? <span className="text-amber-600 font-bold text-xs">{item.aiWarn}건</span> : <span className="text-gray-300 text-xs">-</span>}</td>
                  <td className="px-3 py-3 text-center"><button onClick={() => openDrawer(item)} className="text-xs text-blue-600 hover:underline">보기</button></td>
                  <td className="px-3 py-3 text-gray-400 text-xs">{item.approvedAt || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 우측 패널 */}
      <ApprovalDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer ? `${drawer.ctrl} / ${drawer.ctrlName}` : ""}
        subtitle={drawer ? `${drawer.dept} · 상신자 ${drawer.from}` : ""}
        footer={drawer && drawer.status === "대기" ? (
          <div className="space-y-2">
            {!opinion.trim() && <p className="text-[11px] text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 반려하려면 의견을 반드시 입력해야 합니다</p>}
            <div className="flex gap-2">
              <button onClick={() => rejectOne(drawer.id)} disabled={!opinion.trim()} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"><ThumbsDown className="w-4 h-4" /> 반려</button>
              <button onClick={() => approveOne(drawer.id)} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"><ThumbsUp className="w-4 h-4" /> 승인</button>
            </div>
          </div>
        ) : drawer ? (
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-500"><CheckCircle2 className="w-4 h-4" /> {drawer.status} 처리됨{drawer.approvedAt ? ` · ${drawer.approvedAt}` : ""}</div>
        ) : null}
      >
        {drawer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <InfoRow label="업무구분" value={drawer.biz} />
              <InfoRow label="평가결과" value={drawer.result} valueClass={RESULT_COLOR[drawer.result]} />
              <InfoRow label="관련부서" value={drawer.dept} />
              <InfoRow label="평가자부서" value={drawer.evalDept} />
              <InfoRow label="상신자" value={drawer.from} />
              <InfoRow label="상신일시" value={drawer.received} />
            </div>

            {drawer.aiWarn > 0 && <div className="flex items-center gap-1.5 p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700"><AlertTriangle className="w-3.5 h-3.5" /> AI 검증 경고 {drawer.aiWarn}건 — 증빙 확인 필요</div>}

            <Section icon={MessageSquare} title="상신자 제출 의견">
              <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">{drawer.note}</div>
            </Section>

            <Section icon={FileText} title="제출 증빙 미리보기">
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-600"><FileText className="w-3.5 h-3.5 text-blue-500" /> 증빙01_{drawer.ctrl}.pdf</div>
                <div className="h-36 flex items-center justify-center bg-gray-50/50 text-xs text-gray-400">증빙 미리보기 영역 (PDF·이미지)</div>
              </div>
            </Section>

            <Section icon={Users} title="결재현황">
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 text-gray-500"><th className="px-2 py-1.5 text-left">순번</th><th className="px-2 py-1.5 text-left">결재자</th><th className="px-2 py-1.5 text-left">직위</th><th className="px-2 py-1.5 text-center">상태</th><th className="px-2 py-1.5 text-left">일시</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {drawer.line.map((l) => (
                      <tr key={l.seq}><td className="px-2 py-1.5">{l.seq}</td><td className="px-2 py-1.5 text-gray-700">{l.name}</td><td className="px-2 py-1.5 text-gray-500">{l.pos}</td><td className={`px-2 py-1.5 text-center font-semibold ${LINE_COLOR[l.status]}`}>{l.status}</td><td className="px-2 py-1.5 text-gray-400">{l.at || "-"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {drawer.status === "대기" && (
              <Section icon={MessageSquare} title={<>결재 의견 <span className="text-red-500 normal-case">(반려 시 필수)</span></>}>
                <textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} rows={3} placeholder="승인·반려 의견을 입력하세요" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
              </Section>
            )}
          </div>
        )}
      </ApprovalDrawer>
    </AppLayout>
  );
}

function InfoRow({ label, value, valueClass = "text-gray-700" }) {
  return <div className="flex gap-2"><span className="text-gray-400 w-16 shrink-0">{label}</span><span className={valueClass}>{value}</span></div>;
}
function Section({ icon: Icon, title, children }) {
  return <div><div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider"><Icon className="w-3.5 h-3.5" /> {title}</div>{children}</div>;
}
