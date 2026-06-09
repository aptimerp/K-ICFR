# 프로젝트 진행 상태

## 프로젝트
- **명칭**: 내부회계관리시스템 구축 (Smart-ICM)
- **PL**: 장한나
- **시작일**: 2026-05-15
- **현재 상태**: Phase 8-C-2 (PDF 뷰어 교체 + 파일 미리보기·업로드 안정성) ✅ 완료 (2026-06-09)

---

## Phase 8-C-2 — PDF 뷰어 교체 + 파일 미리보기·업로드 안정성 확보 ✅ (2026-06-09)
- **상태**: ✅ 완료 — npm run build 통과, production 서버 검증 완료 (53개 항목 전부 PASS)
- **근거**: VERIFICATION.md Phase 8-C-2 검증 결과
- **트리거**: "각종 평가 증빙(PDF, JPG, JPEG, PNG, 엑셀, WORD) 미리보기·업로드 기능을 시스템 운영 수준으로 안정화"
- **작업 내용**:
  1. **PDF 라이브러리 교체** — pdfjs-dist v4/v5 ESM 전용 webpack 충돌 문제 근본 해결  
     → `react-pdf v7.7.3` + `pdfjs-dist v3.11.174` (CJS 빌드) 조합으로 교체  
     → `public/pdf.worker.min.js` 1,062KB 복사 완료  
     → `next.config.mjs`: `canvas alias = false` + `transpilePackages: ["docx-preview"]`
  2. **PdfViewer.jsx 재작성** — react-pdf v7 API / ResizeObserver 컨테이너폭 동적 적용 / orientation별 여백 / PdfThumbnail 소형 모드
  3. **FileViewer.jsx 신규** — 파일명 확장자 자동 타입 감지 통합 뷰어  
     PDF / 이미지(PNG·JPG·JPEG·GIF·WEBP) / Excel(xlsx·xls) / Word(docx·doc) 지원  
     SheetJS 시트탭 전환 / docx-preview 브라우저 렌더링 / 모든 타입 로딩·에러 폴백  
     thumbnail prop으로 썸네일 모드 분기
  4. **FileUploader.jsx 신규** — 드래그앤드롭 + 타입/크기 검증(50MB) + 진행률 시뮬레이션  
     Supabase `onUpload` prop 인터페이스 (주석 포함, 계정 수령 후 연동 예정)
  5. **approval/inbox/page.jsx 수정** — FileViewer dynamic import(ssr:false) 통합 적용  
     `renderPage()` · `renderThumbnail()` FileViewer 단순화
  6. **op-eval/evidence/page.jsx 수정** — 수동 드래그앤드롭 JSX 교체 → FileUploader 컴포넌트 사용
  7. **데모 파일 생성** — `public/demo-evidence/demo_rcm_result.xlsx` (SheetJS) · `demo_eval_manual.docx` (JSZip 최소 구조)
- **DB 영향 없음** — UI 레이어 전용 변경
- **다음**: Supabase 계정 수령 후 FileUploader `onUpload` 실연동 + signedUrl 연결

---

## Phase 8-C-1 — 상신함 고도화 + 증빙뷰어 표준화 + 상신 게이트 ✅ (2026-06-08)
- **상태**: ✅ 완료 — 빌드 23페이지 경고 0건, preview 실측 PASS
- **근거**: REQUIREMENTS Phase 8-B / VERIFICATION.md (A~Z 전 항목)
- **작업 내용**:
  1. **상신함(결재상신함) 전면 고도화** — MicolCM형 풍부한 컬럼 + 필터4종(업무구분·통제번호·결재상태·평가결과) + 요약바 + 일괄처리 + 표시개수(50·100·150·200건) + 페이지네이션 + 업무구분→통제번호 자연정렬
  2. **전역 통제기간 셀렉터(A안)** — `components/evalTerms.js` 신규. 헤더 셀렉터 + `useEvalTerm()` 전역 구독(localStorage+이벤트). 차수토글 제거. 마감기간=조회전용
  3. **증빙뷰어 표준 컴포넌트** — `components/EvidenceViewer.jsx` 신규. 크게보기(썸네일+A4 fit-width)/나란히비교(flex-1 균등) + 줌50~200% + 전체화면 + 리사이즈 + 백드롭가드. 상신함이 이걸 재사용
  4. **우측 패널** — `components/ApprovalDrawer.jsx` clamp 폭(32~44rem). 섹션: 통제활동·평가증빙·테스트절차·샘플링(호버상세)·상신의견·첨부증빙(다건)·결재현황
  5. **상신 게이트** — 저장/상신 분리([저장]/[저장 후 상신]) + 상신대기(DRAFT) 단일상태 + 2단계 게이트(🔴필수=차단/🟡권장=사유우회) + 상신준비 체크리스트 + 일괄상신 게이트·확인모달
- **DB 영향 없음** — 기존 status enum(DRAFT/SUBMITTED…)으로 충족. R8(평가기간격리+스냅샷)·R9(전역컨텍스트 정합성)는 Phase 8-C 연동 시 반영
- **다음**: 결재함(inbox)에 동일 구조(EvidenceViewer·게이트·전역통제기간) 적용

---

## Phase 0 — 프로젝트 초기화 ✅
- 완료일: 2026-05-15
- 산출물: CLAUDE.md, 슬래시 명령어 5종, docs/, .planning/, .gitignore

## Phase 1 — 증빙 스마트팩 UI 버그 수정 ✅
- 완료일: 2026-05-18
- 산출물: .planning/REQUIREMENTS.md, app/page.jsx (증빙 자동수집 버그 수정)

## Phase 2 — 전체 프로젝트 정비 + Smart-ICM 웹 UI 구축 ✅
- **완료일**: 2026-05-19
- **소요**: 1세션 (컨텍스트 압축 이어받기)
- **작업 내용**:
  1. E드라이브 폴더 구조 확립 (00~05 폴더 분류)
  2. RCM 전체 402건 추출 → `01_PJT산출물/Smart-ICM_Evidence_Master_Improved.xlsx`
  3. 스타일가이드·로고·UI 원칙 CLAUDE.md 등록
  4. Smart-ICM 전체 웹 UI 구축 (Next.js App Router)
  5. preview.html 완전 교체 (인터랙티브 멀티스크린)

- **산출물**:
  - `app/globals.css` — Pretendard 폰트 + 기본 스타일
  - `app/layout.jsx` — 루트 레이아웃
  - `app/page.jsx` — 대시보드 (KPI, 진행현황, 빠른실행)
  - `app/login/page.jsx` — 로그인 (UI Only)
  - `app/rcm/page.jsx` — RCM 관리 (402건, 필터)
  - `app/design/page.jsx` — 설계평가
  - `app/operations/page.jsx` — 운영평가 일정
  - `app/operations/evidence/page.jsx` — 증빙 수집 (AI 대조·결재 워크플로우)
  - `app/reports/page.jsx` — 결과보고
  - `components/AppLayout.jsx` — 공통 사이드바 레이아웃
  - `components/tokens.js` — Kumkang Kind 디자인 토큰
  - `preview.html` — 인터랙티브 프리뷰 (React CDN, 즉시 확인 가능)
  - `01_PJT산출물/Smart-ICM_Evidence_Master_Improved.xlsx` — 710행 증빙 마스터
  - `01_PJT산출물/rcm_full_extracted.json` — 402건 RCM JSON

- **핵심 결정사항**:
  - 디자인 토큰: Primary #2563EB (blue-600) · Cyan #06B6D4 (cyan-500)
  - 사이드바: 다크 (#1E293B), 19개 메뉴
  - 증빙 수집: auto(파란)·manual(앰버) 구분 유지
  - 로그인: UI Only (SSO·인증 로직 없음)
  - Next.js App Router + inline styles (Tailwind 미설치)

## Phase 3 — 스타일가이드 기반 UI 리빌드 ✅
- **완료일**: 2026-05-20
- **소요**: 1세션 (Tailwind v4 도입 + 전체 페이지 재작성)
- **작업 내용**:
  1. Tailwind CSS v4 + @tailwindcss/postcss + lucide-react 설치
  2. `postcss.config.mjs` 신규 생성
  3. `globals.css` Tailwind v4 형식으로 재작성
  4. **사이드바 다크 → 화이트** 전환 (스타일가이드 10장 준수)
  5. 헤더 `bg-white/80 backdrop-blur-md` 글래스모피즘 적용
  6. Lucide 아이콘 SVG로 전체 교체 (이모지·텍스트 아이콘 제거)
  7. 모든 페이지 inline style → Tailwind class 마이그레이션
  8. preview.html 완전 재작성 (Tailwind CDN + Lucide UMD)

- **산출물**:
  - `postcss.config.mjs` (신규)
  - `app/globals.css` (Tailwind v4)
  - `app/layout.jsx` (slim)
  - `app/page.jsx` 대시보드 (KPI 4 + 프로세스 9 + 일정 3 + 미비점 3)
  - `app/login/page.jsx` 센터 레이아웃 (가이드 12.5)
  - `app/rcm/page.jsx` 검색 + 9프로세스 탭 + 페이지네이션
  - `app/design/page.jsx` 카드 리스트 + 점수 + 결과 배지
  - `app/operations/page.jsx` 상태 카드 + 진행률
  - `app/operations/evidence/page.jsx` 좌측 통제리스트 + AI대조 + 결재 모달
  - `app/reports/page.jsx` 프로세스별 진행률 테이블
  - `components/AppLayout.jsx` 화이트 사이드바 (240px↔64px 토글, localStorage)
  - `preview.html` 인터랙티브 멀티페이지

- **핵심 변경사항**:
  - 사이드바: `#1E293B` → `bg-white` (스타일가이드 표준 준수)
  - 활성 네비: `bg-blue-50 text-blue-700 font-semibold`
  - 카드: `rounded-2xl border border-gray-100` + `0 4px 12px rgba(0,0,0,0.04)`
  - 모든 inline style 제거 → Tailwind class
  - `npm run build` 검증 완료 (10/10 페이지 정적 생성, 경고 0건)

## Phase 4 — MicolCM 메뉴 기반 기능 재구성 ✅
- **완료일**: 2026-05-20 (Phase 3과 같은 날 진행)
- **소요**: 1세션
- **트리거**: 사용자 요청 — "기능적인 부분은 MicolCM 매뉴얼 참고 + RCM 실제 프로세스 명칭 + 증빙제출자 1명 기준"
- **작업 내용**:
  1. **MicolCM 메뉴구조도 분석** — 04_시스템자료의 권한정의서 xlsx 추출
  2. **실제 RCM 데이터 활용** — 402건 9프로세스 코드/명칭/증빙명 추출
  3. **사이드바 전면 개편** — 7개 섹션 × 19개 메뉴 (Scoping, RCM, ELC, 첨부, 설계평가, 모집단, 운영평가, 증빙관리★, 결재, 보고, 시스템)
  4. **9프로세스 라벨 교체**: 공시(DC)·고정자산(FA)·재무보고(FR)·생산재고(PI)·구매지급(PP)·인사급여(PR)·영업매출(SD)·자금(TR)·세무(TX)
  5. **통제코드 형식 교체**: `FA-001` → 실제 `FA-C-1-1-2` 형식
  6. **증빙 수집 → "증빙 제출 (마이페이지)"** 완전 재설계: 김민준(재무회계팀) 1명 기준 6건 요청 시나리오 — 5상태(대기/작성중/결재중/완료/반려), 진행률 헤더, AI 자동수집+수동업로드 통합, 결재 워크플로우 시각화, 반려 사유 표시 + 재제출 기능
  7. **11개 placeholder 페이지** 생성 (Scoping, ELC, 첨부, 모집단, 증빙요청, 제출자지정, 결재상신, 결재대상, 예외보고, 진행현황, 통제기간, 권한)

- **산출물 (신규/변경)**:
  - `components/AppLayout.jsx` — 메뉴 19개로 전면 교체
  - `components/Placeholder.jsx` — 미구현 페이지 공통 안내 (신규)
  - `app/operations/evidence/page.jsx` — **증빙 제출 마이페이지** (전면 재작성)
  - `app/page.jsx` · `app/rcm/page.jsx` · `app/design/page.jsx` · `app/operations/page.jsx` · `app/reports/page.jsx` — 실제 데이터 교체
  - `app/{scoping,elc,attachments,population,evidence/request,evidence/assign,approval/sent,approval/inbox,reports/exception,reports/progress,period,settings}/page.jsx` — 12개 신규 placeholder
  - `01_PJT산출물/rcm_samples_27.json` — 27건 대표 샘플
  - `preview.html` — 사이드바·데이터 동기화

- **핵심 발견**:
  - MicolCM 메뉴 = Scoping → RCM/Risk → 설계평가 → 운영평가(모집단·증빙·결재) → 결과보고 의 표준 K-ICFR 워크플로우
  - **증빙관리는 독립 모듈**: 증빙요청관리·증빙제출담당자지정·증빙제출·메일발송내역
  - PI(생산·재고) 123건이 가장 큰 프로세스, DC(공시)·TX(세무)가 가장 작음

- **검증**:
  - `npm run build` 성공 — **21개 페이지 정적 생성, 경고 0건**

## 진행 현황
- Phase 0 (초기화): ✅ 완료 (2026-05-15)
- Phase 1 (Requirements + UI 버그): ✅ 완료 (2026-05-18)
- Phase 2 (E드라이브 정비 + 초기 UI): ✅ 완료 (2026-05-19)
- Phase 3 (스타일가이드 기반 UI 리빌드): ✅ 완료 (2026-05-20)
- Phase 4 (MicolCM 메뉴 기반 기능 재구성): ✅ 완료 (2026-05-20)
- **Phase 4.5 (IA 마스터 설계 v5): ✅ 완료 (2026-05-20)**
- **Phase 5 (IA v6 사용자 검토·확정): ✅ 완료 (2026-05-21)**
- **Phase 6 (AppLayout v6 교체 + 페이지 내 3단 탭 구축): ✅ 완료 (2026-05-22)** ⭐
- **Phase 7-A (Supabase DB 스키마 설계): ✅ 완료 (2026-06-01)** ⭐
- **Phase 7-B (IA v7 메뉴 구조 확정): ✅ 완료 (2026-06-01)** ⭐
- Phase 7-C (Supabase 마이그레이션 실행): 🔜 대기 (홍세민 PM 계정 수령 후)
- **Phase 8-A (데이터 운영방식 문서 정의): ✅ 완료 (2026-06-02)** ⭐
- Phase 8-B (UI v7 코드 반영): 🔜 다음 단계
- Phase 8-C (Supabase CRUD 연동): 🔜 대기 (Supabase 계정 수령 후)
- Phase 9 (SAC API 연동): ⏳ 예정
- Phase 10 (검증 + 배포): ⏳ 예정

---

## Phase 4.5 — 정보 구조(IA) 마스터 설계 v5 ✅
- **완료일**: 2026-05-20
- **소요**: 1세션 (IA v1 → v5 단계적 정밀화)
- **트리거**: 사용자 피드백 "메뉴 구조 정립 후 시각화" + 외부 설계문서 반영

- **작업 내용**:
  1. IA v1~v5 단계적 정밀화 (5회 반복)
  2. 페르소나 5종 (P1~P5) + ITGC의 SAC 처리 정의
  3. ERP 모집단 업로드 양식 분석 → TB_ICM_SAMPLE_POPULATION_DT 실측 스키마 확보
  4. TRANSACTION_ID 연결키 일반화 / 평가 모드 3종 / 랜덤샘플링 분기 / 멀티엔터티

- **산출물**:
  - `.planning/IA_DESIGN.md` v5 (714라인, 10개 섹션, 12개 메뉴 + 헤더 컨텍스트)
  - `.planning/REQUIREMENTS.md` Phase 4 요구사항 추가

- **확정 사항 15개** (V5-1 ~ V5-15): 연결키·모집단·평가모드·통제유형·ITGC흐름·랜덤샘플링·P3홈·멀티엔터티 등

- **미해결 (다음 페이즈 이관)**:
  - IA v5 사용자 최종 검토 (사용자: "다음에 검토")
  - 시각화 페이지 구현 (인터랙티브 메뉴 트리)
  - AppLayout v5 교체 (12개 신규 + 회사 셀렉터 + 평가모드 토글)
  - DATA_MODEL.md (DB 스키마) 별도 문서 필요

## 다음 액션 (Phase 7-B 완료 시점)
→ 홍세민 PM께 Supabase 계정 수령 → 마이그레이션 실행 (Phase 7-C)
→ Phase 8: 운영관리·운영평가관리 탭별 데이터 운영방식 정의 → CRUD 연동 시작

---

## Phase 8-B — M1/M2 결재 UX 재설계 (홈·상신함·결재함) ✅ (2026-06-08)
- **상태**: ✅ 구현 완료 — 빌드 검증 통과 (23페이지, 경고 0건)
- **근거**: REQUIREMENTS.md Phase 8-B / PLAN.md T1~T7
- **작업 내용**:
  - T1: `components/ApprovalDrawer.jsx` 신규 — 우측 슬라이드 공통 사이드패널 (ESC·오버레이 닫기, footer 슬롯)
  - T2: `AppLayout.jsx` 결재관리 "내 할일" 메뉴 제거 (3→2: 상신함·결재함)
  - T3: `app/approval/todo/page.jsx` 삭제 (라우트 제거, 24→23페이지)
  - T4: `app/page.jsx` P1 홈 "내 할일" → 유형별 건수 요약 + 작업 탭 딥링크 (M1)
  - T5: 상신함 — 현재 결재자 컬럼 / 증빙제출 의견(Drawer) / 일괄 취소 / 재상신 버튼
  - T6: 결재함 — 통제번호 클릭→증빙 원본조회·미리보기 / 단건 의견 / 반려 의견 필수 차단 / 승인 일시 표시
  - T7: `npm run build` 성공 (경고 0건), todo 잔존 링크 0건 확인
- **DB 영향**: 없음 (approvals 기존 컬럼 활용, 🟢 LOW, Y5 해소)
- **다음**: /검증 → /마무리. 잔여 M3/M4/M5는 독립 항목

## Phase 8-설계논의2 — IA v8 메뉴 전면 재검토 + UX 설계 논의 🔜 (진행중, 2026-06-05)
- **상태**: 🔜 진행중 — v8 메뉴 트리 부분 확정, 디테일 검토 계속
- **산출물**:
  - `public/preview-v8-design.html` — v8 설계 인터랙티브 미리보기 (4탭, M3·M4 탭 추가 필요)
  - `.planning/RISK_DECISION_LOG.md` — 🆕 DB·설계 리스크 분류 문서 (2026-06-05 신규)
- **논의 완료 사항 (2026-06-04)**:
  - MicolCM 3대 불편 분석: ERP연동 한계·파일명 수작업·차수별 담당자 재지정
  - v7 → v8 변경 포인트 6개 도출 (M1~M6)
  - 결재 처리: 팝업 → 사이드 패널(Drawer) 방식 확정
  - ERP API 모니터링: 하이브리드 구조 확정 (각 탭 분산형 + 시스템관리 집중형)
  - 신규 추가 기능 5종 도출 (차수복사·파일명규칙·통제별평가기준·ERP설정·AI설정)
- **2026-06-05 세션 추가 논의**:
  - M1/M2(홈·결재관리): 방향 동의, 구성항목·디테일 수정 필요 → 다음 세션에서 구체화
  - M3/M4(평가설정·연동설정): 미리보기 미구현으로 미검토 → 다음 세션에서 preview 추가 후 확정
  - M6(RCM-부서 Map 소프트게이트): ✅ 확정
  - 🆕 신규 기능 요건: 통합 엑셀 다운로드 (모집단+평가의견+증빙 → 1개 xlsx, N시트)
  - 🆕 DB·설계 리스크 분류 완료 (R1~R7 고위험, Y1~Y5 중위험, G1~G10 저위험)
  - v2 엑셀 → v2.1로 버전업 필요 (다음 세션 시작 시 Claude 생성)
- **미확정**: M1/M2 디테일, M3/M4/M5, 통합 엑셀 시트 단위·ZIP 관계

## Phase 8-설계논의 — RCM-부서 Map 재설계 + Default Owner 패턴 ✅
- **완료일**: 2026-06-04
- **소요**: 1세션 (v2 엑셀 업로드 전 사전 검토)
- **트리거**: v2 엑셀 작성 완료 전 RCM-부서 Map 선행 조건 검토 요청

### 핵심 결정사항

**① RCM-부서 Map 소프트게이트 전환**
- 기존: RCM-부서 Map 완료 = 모집단 수신 하드 선행조건
- 신규: ERP 모집단 수신은 Map 없이도 즉시 가능 (소프트게이트)
- Map 미완료 시 ⚠️ 경고 배너 표시 (차단 아님)
- 실질 게이트: 증빙요청 발송 전 P1 지정 완료 (자연스러운 흐름)

**② Default Owner 패턴 확정 (DB 스키마 변경)**
- `rcm_dept_map` → **두 테이블로 분리**:
  - `rcm_default_owners` : 기본 담당자 (차수 없음, UNIQUE ctrl+dept)
    - 설계평가 > 사전준비 > 통제수행자 지정 탭에서만 변경 가능
  - `rcm_term_assignments` : 차수별 담당자 (eval_term_id 포함)
    - 차수 시작 시 default에서 자동 승계 (is_override=false)
    - 샘플링작업 > 증빙제출자 지정 탭에서만 변경 가능 (is_override=true)
    - 변경 시 기본 담당자(original_p1_id) 읽기 전용으로 항상 표시
    - 변경 취소 시 즉시 원복 가능

**③ GitHub 초기 커밋 완료**
- Remote: https://github.com/aptimerp/K-ICFR.git (master 브랜치)
- 커밋 a833423: 58개 파일 (소스코드·기획·문서)
- CLAUDE.md Git 섹션 추가 + .gitattributes 생성 + ~$* 제외 규칙 추가

### 산출물
- `CLAUDE.md` — Git 저장소 URL·커밋 규칙 섹션 추가
- `.gitattributes` — LF 정책 + 바이너리 설정
- `.gitignore` — ~$* 임시 파일 추가
- GitHub: https://github.com/aptimerp/K-ICFR (master, 초기 커밋)

---

## Phase 6 — AppLayout v6 교체 + 증빙제출 완전 구현 ✅
- **완료일**: 2026-05-22
- **소요**: 1세션
- **빌드 검증**: `npm run build` 성공 — **24페이지 정적 생성 (21→24 +3), 경고 0건**

- **작업 내용**:
  1. `components/AppLayout.jsx` — v6 아코디언 사이드바 (1+6 그룹, disabled 설계평가)
  2. `components/SubPageTabs.jsx` — 공통 탭 컴포넌트 (?tab= URL 동기화)
  3. `components/EvalTermToggle.jsx` — 중간1/중간2/기말 3상태 토글 (헤더 적용)
  4. `jsconfig.json` 신규 생성 (@/ 경로 별칭 — 빌드 오류 수정 핵심)
  5. `app/page.jsx` — P1~P5 5페르소나 홈 화면 (localStorage 폴링 동기화)
  6. `app/operations/{period,rcm}/page.jsx` — 운영관리 2 서브페이지
  7. `app/design/{prep,self,eval,progress}/page.jsx` — 설계평가관리 4 서브페이지 (구현예정 플레이스홀더)
  8. `app/op-eval/sampling/page.jsx` — 6탭 + P5 단독 ShieldAlert 배너
  9. `app/op-eval/evidence/page.jsx` ⭐⭐ — 증빙제출 완전 구현 4탭
     - Tab1 수집: 통제 테이블 + STATUS_LABEL 배지 5종 + ERP 동기화 버튼
     - Tab2 AI검증: 요약 카드(ok/warn/error) + 상세 결과 테이블
     - Tab3 제출수행: 좌측 통제목록(반려배너) + 우측 TRANSACTION_ID+드래그업로드+AI경고+결재
     - Tab4 제출승인: P2 일괄승인 + 체크박스 + AI경고 컬럼
  10. `app/op-eval/{eval,progress}/page.jsx` — 운영평가 + 진행관리
  11. `app/approval/{todo,sent,inbox}/page.jsx` — 결재관리 3페이지
  12. `app/results/status/page.jsx` — 6탭 (평가현황~결과보고PDF)
  13. `app/settings/{users,permissions,log,evidence-log,env}/page.jsx` — 시스템관리 5페이지

- **삭제 파일** (구버전 라우팅 정리):
  - `app/{scoping,elc,attachments,population,evidence,period,reports}/`
  - `app/operations/page.jsx`, `app/operations/evidence/`, `app/design/page.jsx`
  - `app/settings/page.jsx`, `app/rcm/`

- **핵심 결정 (D1~D4)**:
  - D1: 구버전 라우팅 완전 삭제
  - D2: 설계평가관리 → `disabled: true` + opacity-60 + 준비중 뱃지
  - D3: 페르소나 토글 → 헤더 드롭다운 (localStorage 연동)
  - D4: 증빙제출 수행(Tab3) — 최우선 완전 구현

- **핵심 발견 (재사용 가능한 패턴)**:
  - jsconfig.json (@/ 별칭)은 프로젝트 초기부터 필수 — 누락 시 모든 import 실패
  - useSearchParams() 사용 페이지는 반드시 Suspense 래핑 필요 (Next.js 15 정적 생성)
  - localStorage 폴링(500ms) + storage 이벤트 조합으로 컴포넌트 간 상태 동기화
  - disabled 메뉴: `pointer-events-none opacity-60` + cursor-not-allowed 조합

---

## Phase 5 — IA v6 사용자 검토·확정 ✅
- **완료일**: 2026-05-21
- **소요**: 1세션 (IA v5 → v6 단계적 검토 + 매뉴얼 분석 + 사용자 직접 메뉴 구조 확정)
- **산출물**:
  - `.planning/IA_DESIGN.md` v6 (헤더 + §0~§8 모두 v6 확정)
  - `01_PJT산출물/Smart-ICM_메뉴구조_v6.xlsx` (64행 4시트: 메뉴구조 / 통계 / v5→v6 변경 / 범례·페르소나)
- **검토 통과 섹션**: §0 시스템 정의 / §1 설계 원칙 / §4 메뉴 트리 (v6 확정) / §5 매트릭스 / §6 홈 화면 / §8 확정사항
- **v6 핵심 결정 20개 (V6-1 ~ V6-20)**: 메뉴구조 / RCM 지정 / 검토요청관리 / 통제수행자 명칭 / 예외 4분류 / 엑셀+ERP API / 평가증빙 ZIP 등
- **추가 분석 자료**:
  - 04_시스템자료 MicolCM 업무메뉴얼·메뉴구조도
  - 04_시스템자료 ERP 모집단 양식
  - 03_평가자료 7개 폴더 (범위선정·설계평가·운영평가·미비점·문서작성·평가지정·시스템세팅)
  - Z드라이브 2023 증빙제출 매뉴얼 / 2024 개선수행 매뉴얼
- **미해결 (다음 페이즈 이관)**:
  - §2 페르소나 P1~P5 추가 검토 (현재 v5 그대로)
  - §3 시스템 경계 v6 메뉴와 정합성 재확인
  - 시각화 페이지 / AppLayout v6 교체 (Phase 6)
  - Z드라이브 2023 설계평가(변화관리) 매뉴얼 → 설계평가관리 구현 시점 분석

---

## Phase 4.5-A — MCP 자동 로딩 핫픽스 ✅ (2026-05-20 후속)
- **완료일**: 2026-05-20 (Phase 4.5 마무리 직후)
- **소요**: 30분
- **트리거**: 사용자 질문 "Notion MCP 자동 로딩이 되는가? 매번 작업해야 하나?"

- **문제 진단**:
  - 증상: `.mcp.json`에 Notion API 키가 설정되어 있음에도 Claude Code 세션에서 Notion MCP 도구가 노출되지 않음
  - 1차 우회: Notion REST API를 Node.js https 모듈로 직접 호출 → 40개 블록 추가 성공
  - 2차 진단: `.mcp.json` 바이트 분석으로 **NBSP(U+00A0) 52개 발견**
  - 근본 원인: JSON.parse 실패 → Claude Code도 동일하게 파싱 못 함 → MCP 서버 등록 실패

- **해결**:
  - `.mcp.json` NBSP → 일반 스페이스 일괄 치환 + JSON.stringify로 재포맷
  - 검증: `JSON.parse` 통과 + NBSP 0개 잔여 확인
  - 파일 크기: 438 → 410 bytes

- **보안 보강**:
  - `.gitignore` 62줄에 `.notion-temp/` 추가 (임시 스크립트 폴더 보호)
  - `.mcp.json`·`.env*`·`.cursor/mcp.json` 모두 git 추적 안 됨 확인 완료
  - 추적 중인 민감 파일: 0건

- **산출물**:
  - `.mcp.json` (정상화, 410 bytes)
  - `.notion-temp/test.cjs` — Notion API 페이지 조회 (NBSP-resistant 정규식 키 추출)
  - `.notion-temp/append.cjs` — Phase 4.5 블록 일괄 추가 (40 블록)
  - `.gitignore` `.notion-temp/` 추가

- **검증**:
  - Notion REST API GET /v1/pages 성공
  - PATCH /v1/blocks/{id}/children 성공 (40 blocks added)
  - 노션 프로젝트 페이지 https://www.notion.so/seohoo/35609b4dcd5781569b1ceae52d2ba49e 업데이트 확인

- **다음 세션 기대**:
  - Claude Code 재시작 → `.mcp.json` 정상 파싱 → MCP 활성화 프롬프트 1회 표시 → 승인 후 자동 로딩
  - 향후 `/마무리` 시 Notion MCP 도구 직접 사용 가능 (API 직접 호출 스크립트 불필요)
  - 만약 미작동 시: `claude mcp list` / `claude mcp restart notion` 확인
