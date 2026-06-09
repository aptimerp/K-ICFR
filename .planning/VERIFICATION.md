# 검증 보고서 — Phase 8-B + 상신함 고도화 (누적)
> 검증일: 2026-06-08 | 검증자: Claude (자동·preview 실측) | 빌드: ✅ 성공 (23페이지, 경고 0건, EXIT 0)
> 대상: M1/M2 결재 UX + 상신함 고도화(필터·정렬·전역통제기간·증빙뷰어·2단계 게이트) + 표준화·문서화

---

## 1. Phase 8-B (M1/M2) — PASS 유지 ✅
홈 내 할일 요약+딥링크 / 결재관리 todo 제거(상신함·결재함 2개) / 반려 의견 필수. (이전 PASS 기록과 동일)

## 2. 상신함 고도화 — 항목별 검증

| # | 항목 | 결과 | 증거 |
|---|------|:----:|------|
| A | 풍부한 컬럼(MicolCM형) | ✅ | 업무구분·결재상태·통제번호/활동명·관련부서·평가자부서·평가결과·상신자·상신일시·반려이력·액션 |
| B | 필터 4종(업무구분·통제번호·결재상태·평가결과) | ✅ | preview 실측 |
| C | 결재상태 5종(상신대기·진행·반려·완료) | ✅ | 필터 옵션 실측, 미상신 잔존 0 |
| D | 평가결과 색상(정상emerald·예외red·해당없음gray) | ✅ | 코드 |
| E | 일괄처리(취소·상신)+엑셀저장 | ✅ | 액션바 |
| F | 표시개수(50·100·150·200건)+건수표시+페이지네이션 | ✅ | preview 실측 |
| G | 정렬: 업무구분→통제번호 자연정렬 | ✅ | `localeCompare(...,{numeric:true})` |

## 3. 전역 통제기간(A안) — 검증

| # | 항목 | 결과 | 증거 |
|---|------|:----:|------|
| H | 헤더 전역 셀렉터(차수토글 제거) | ✅ | AppLayout `useEvalTerm` |
| I | 전역 동기화(localStorage+이벤트) | ✅ | `components/evalTerms.js` |
| J | 마감기간 조회전용 | ✅ | preview 실측: 배너·버튼비활성·행 조회전용 |

## 4. 증빙 뷰어 표준 컴포넌트 — 검증

| # | 항목 | 결과 | 증거 |
|---|------|:----:|------|
| K | EvidenceViewer 추출+상신함 재사용 | ✅ | `components/EvidenceViewer.jsx`, sent에서 1줄 사용 |
| L | 크게보기(썸네일+A4 fit-width)/비교(flex-1 균등) | ✅ | preview 실측 |
| M | 줌 50~200%·전체화면 토글 | ✅ | preview 실측(150%, fullscreen) |
| N | 모달 리사이즈+백드롭 가드(튕김 수정) | ✅ | mousedown 가드 |
| O | 비교 카드 뷰어폭 균등 확대 | ✅ | preview 실측(카드 420/뷰어448) |

## 5. 우측 패널(ApprovalDrawer) — 검증

| # | 항목 | 결과 | 증거 |
|---|------|:----:|------|
| P | clamp 폭(32~44rem) | ✅ | `clamp(32rem,36vw,44rem)` |
| Q | 섹션순서(통제활동·평가증빙·테스트절차·샘플링·상신의견·첨부증빙·결재현황) | ✅ | 코드 |
| R | 샘플링 호버 상세(추출방식·모집단수 제외) | ✅ | preview 실측 |
| S | 첨부증빙 다건 개별/일괄 다운로드+전체미리보기 | ✅ | 코드 |

## 6. 상신 게이트 (저장/상신 분리 + 2단계) — 핵심 검증 ⭐

| # | 항목 | 결과 | 증거(preview 실측) |
|---|------|:----:|------|
| T | 저장/상신 분리([저장]/[저장 후 상신]) | ✅ | footerButtons에 2버튼 확인 |
| U | 상신 준비 체크리스트(필수/권장 ✓✗) | ✅ | 패널 섹션 확인 |
| V | 🔴 필수 미충족 → 상신 차단 | ✅ | submitDisabled=true |
| W | 🟡 권장 미충족 → 우회 사유 모달 | ✅ | overrideModalOpened=true |
| X | 일괄상신 = 깨끗한 건만 + 제외 안내 | ✅ | "보완필요 N건 제외" + bulkReady 필터 |
| Y | 일괄상신 확인 모달(결재선 미리보기) | ✅ | 코드 |
| Z | DB 영향 없음(기존 status enum 매핑) | ✅ | DRAFT/SUBMITTED 재사용, 마이그레이션 불요 |

## 7. 표준화·문서화 — 검증

| 항목 | 결과 | 증거 |
|------|:----:|------|
| docs/UI_패턴.md (5개 패턴: 증빙뷰어·드로어·전역통제기간·목록·상신게이트) | ✅ | §5 게이트 포함 |
| CLAUDE.md 재사용 컴포넌트 참조 + 스타일가이드 경로 수정 | ✅ | |
| 자동 메모리 feedback_ui_patterns.md 최신 반영 | ✅ | |
| RISK_DECISION_LOG R8·R9 + 게이트 결정이력 | ✅ | |
| DB_스키마 스냅샷 컬럼(approver/submitter *_name·*_dept) | ✅ | |

## 8. 추가 체크 (CLAUDE.md)

| 항목 | 결과 |
|------|:----:|
| 한국어 도메인 용어(통제·전표·증빙·결재·상신·반려·모집단·샘플링) | ✅ |
| 통제코드 형식(FA-C-1-2-4 등 실제 RCM) | ✅ |
| TRANSACTION_ID = 모집단No. 매핑 | ✅ |
| 스타일가이드 토큰(blue-600·rounded-2xl·Pretendard) | ✅ |
| 작업 범위 E드라이브 한정 / DB 직접수정 없음 | ✅ |

---

## 종합 판정: ✅ PASS

- 빌드 23페이지, 경고 0건
- 상신함 고도화 A~Z 전 항목 충족, 2단계 게이트 핵심 흐름 preview 실측 통과
- 증빙뷰어·게이트 표준화 + 문서화 완료 → 결재함 등 재사용 준비됨

### 유의·다음 작업
- 1/3폭·리사이즈 드래그 등 일부는 preview 헤드리스(뷰포트 0) 한계 → 실제 브라우저 확인 권장(장한나 PL 확인 완료)
- **결재함(inbox)**: EvidenceViewer·게이트·전역통제기간 미적용 — 다음 작업 대상
- 실데이터 연동·실제 결재선 엔진·파일타입별 렌더(엑셀 SheetJS 등)는 Phase 8-C/9 (비목표)
- 우회 사유 audit_logs 기록은 Phase 8-C 구현


---

# 검증 리포트 — 파일 미리보기·업로드 안정성 구축 (Phase 8-C-2)
> 검증일: 2026-06-09 | 검증자: Claude (자동) | 빌드: ✅ 성공 (23페이지, 경고 0, 에러 0)

## 검증 범위
1. PDF 뷰어 교체: react-pdf v8(ESM) → react-pdf v7.7.3 + pdfjs-dist v3.11.174(CJS)
2. FileViewer.jsx 신규 구현 (PDF/이미지/Excel/Word 통합 미리보기)
3. FileUploader.jsx 신규 구현 (드래그앤드롭 + 타입·크기 검증 + 진행률)
4. approval/inbox, op-eval/evidence 연동 업데이트

## 종합 결과: 53개 항목 전부 ✅ 통과

### V1. 의존성
- react-pdf 7.7.3 / pdfjs-dist 3.11.174 (CJS, deduped) ✅
- xlsx 0.18.5 (CJS) / docx-preview 0.3.7 (ESM, transpilePackages 처리) ✅

### V2. 파일 존재
- components/FileViewer.jsx (14KB) ✅
- components/FileUploader.jsx (13KB) ✅
- public/pdf.worker.min.js (1,062KB, CJS) ✅

### V3. 코드 무결성
- FileViewer: getFileType / ImageViewer / ExcelViewer / WordViewer / PdfPageViewer / thumbnail 분기 모두 ✅
- FileUploader: ALLOWED_EXTS / validateFile / maxSizeMB / onDrop / onUpload / 진행률 바 ✅
- next.config: transpilePackages docx-preview / canvas alias ✅

### V4. 페이지 연동
- approval/inbox: PdfPageViewer 직접 import 제거 → FileViewer 단일 컴포넌트, signedUrl 대응 ✅
- op-eval/evidence: 수동 드래그앤드롭 → FileUploader 표준 컴포넌트, onUpload Supabase 인터페이스 ✅

### V5. 빌드 산출물
- workerSrc / xlsx(SheetJS) / docx-preview 청크 포함 확인 ✅

### V6. HTTP 서빙 (5개 파일 전부 HTTP 200, MIME 정확) ✅

### V7. 타입 검증 단위 테스트 (7/7 통과)
- PDF/PNG/XLSX/DOCX → OK / CSV/EXE/60MB PDF → 에러 정상 반환 ✅

### V8. 브라우저 렌더링
- dev(3000): PDF canvas 2개(썸네일+메인), PNG 이미지, FileUploader UI ✅
- production(3001): PDF canvas 640×452, worker 1062KB 로드, 실패 리소스 0건 ✅

## 잔여 작업 (Supabase 연동 후)
1. FileUploader onUpload 주석 해제 + Supabase Storage 버킷 생성
2. signedUrl → Supabase signed URL 연결
3. Excel/Word end-to-end 렌더링 실 파일 검증
