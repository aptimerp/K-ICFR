# 로드맵 — Smart-ICM 내부회계관리시스템 구축

## Phase 0: 프로젝트 초기화 ✅ (2026-05-15 완료)
- **상태**: ✅ 완료
- **산출물**: CLAUDE.md, 슬래시 명령어 5종, docs/, .planning/, .gitignore
- **소요**: 1세션

---

## Phase 1: Requirements & Analysis ✅ (2026-05-15 ~ 2026-05-18 완료)
- **상태**: ✅ 완료
- **목표**: 사용자 요구사항·비즈니스 규칙 정의 + 초기 UI 버그 수정
- **산출물**:
  - .planning/REQUIREMENTS.md
  - app/page.jsx (증빙 스마트팩 UI 버그 수정)
- **소요**: 1세션

---

## Phase 2: E드라이브 정비 + Smart-ICM 전체 웹 UI 구축 ✅ (2026-05-19 완료)
- **상태**: ✅ 완료
- **목표**: 프로젝트 데이터 정비 + Next.js 멀티스크린 UI 전체 구현
- **산출물**:
  - E드라이브 폴더 구조 확립 (00~05 폴더)
  - 01_PJT산출물/Smart-ICM_Evidence_Master_Improved.xlsx (402건 RCM, 710행 증빙마스터)
  - 01_PJT산출물/rcm_full_extracted.json
  - 04_시스템자료/04_03_K_New_K-ICFR_SYSTEM/style-guide.html
  - app/ 전체 (9개 페이지 + globals.css + layout.jsx)
  - components/AppLayout.jsx + components/tokens.js
  - preview.html (인터랙티브 멀티스크린, 즉시 확인 가능)
- **핵심 학습**:
  - 디자인 토큰 확립 (#2563EB primary, #06B6D4 cyan)
  - AppLayout 공통 컴포넌트 패턴 (dark sidebar + breadcrumb topbar)
  - 증빙 수집 UI: auto(파란)/manual(앰버) 구분 + AI 대조 + 결재 워크플로우
  - preview.html = React CDN + Babel standalone → Node.js 없이 즉시 미리보기
- **소요**: 1세션

---

## Phase 4.5: IA 마스터 설계 v5 ✅ (2026-05-20 완료) ⭐
- **상태**: ✅ 완료
- **목표**: 메뉴 구조 + 페르소나 + 매트릭스 + Status 흐름 마스터 문서화
- **산출물**:
  - `.planning/IA_DESIGN.md` v5 (714라인, 10개 섹션)
  - ERP 모집단 양식 분석 (TB_ICM_SAMPLE_POPULATION_DT 실측 스키마)
- **핵심 결정 15개 (V5-1~15)**:
  - 연결키 = TRANSACTION_ID / 평가모드 3종 / ITGC=SAC자가평가 / 랜덤샘플링 분기 / 멀티엔터티
- **소요**: 1세션

---

## Phase 5: IA v6 사용자 검토·확정 ✅ (2026-05-21 완료)
- **상태**: ✅ 완료
- **산출물**:
  - `.planning/IA_DESIGN.md` v6 (813행, §0~§8 확정)
  - `01_PJT산출물/Smart-ICM_메뉴구조_v6.xlsx` (64행 4시트)
- **핵심 결정 20개 (V6-1~20)**: 메뉴구조 / RCM 지정 / 예외 4분류 / 평가증빙 ZIP 등
- **소요**: 1세션

---

## Phase 6: AppLayout v6 교체 + 페이지 내 3단 탭 구축 ✅ (2026-05-22 완료) ⭐
- **상태**: ✅ 완료
- **목표**: IA v6 메뉴 구조 전면 적용 + 증빙제출 수행 페이지 완전 구현
- **산출물**:
  - `components/AppLayout.jsx` — v6 아코디언 사이드바 (6 그룹, disabled 설계평가)
  - `components/SubPageTabs.jsx` — 공통 탭 컴포넌트 (?tab= URL 동기화)
  - `components/EvalTermToggle.jsx` — 중간1/중간2/기말 3상태 토글
  - `jsconfig.json` — @/ 경로 별칭 (신규, 빌드 오류 수정)
  - `app/page.jsx` — 5페르소나 홈 화면 (P1~P5, localStorage 폴링)
  - `app/operations/period/page.jsx` — 3탭 (평가기간/조직권한/결재선)
  - `app/operations/rcm/page.jsx` — 3탭 (RCM지정⭐/RCM관리/RCM-부서Map)
  - `app/design/*/page.jsx` × 4 — 설계평가관리 4 서브페이지 (구현예정)
  - `app/op-eval/sampling/page.jsx` — 6탭 + P5 ShieldAlert 배너
  - `app/op-eval/evidence/page.jsx` ⭐⭐ — 증빙제출 완전 구현 (4탭: 수집/AI검증/제출수행/제출승인)
  - `app/op-eval/eval/page.jsx` — 4탭 (운영평가 판정 + 예외보고 4분류)
  - `app/op-eval/progress/page.jsx` — 3탭
  - `app/approval/{todo,sent,inbox}/page.jsx` — 결재관리 3페이지
  - `app/results/status/page.jsx` — 6탭 (평가현황~결과보고)
  - `app/settings/{users,permissions,log,evidence-log,env}/page.jsx` — 시스템관리 5페이지
- **핵심 결정**:
  - D1: 구버전 라우팅 (scoping, elc, attachments, population, evidence, period, reports, rcm) 삭제
  - D2: 설계평가관리 — 회색+준비중 뱃지 (disabled: true)
  - D3: 페르소나 토글 — 헤더 드롭다운 (localStorage 연동)
  - D4: 증빙제출 수행 — 최우선 완전 구현
- **검증**: `npm run build` 성공 — **24페이지 정적 생성 (21→24 +3), 경고 0건**
- **소요**: 1세션

---

## Phase 7-A: Supabase DB 스키마 설계 ✅ (2026-06-01 완료)
- **상태**: ✅ 완료 (Supabase 계정 수령 전 선행 설계)
- **산출물**:
  - `docs/DB_스키마.md` — 14개 테이블 정의 + ERP 매핑 (IA v7 반영)
  - `supabase/migrations/001_initial_schema.sql` — 전체 DDL
  - `supabase/migrations/002_rls_policies.sql` — P1~P5 RLS 정책
  - `supabase/migrations/003_audit_triggers.sql` — 변경이력 트리거
  - `supabase/seeds/rcm_controls.sql` — RCM 402건 시딩
  - `lib/supabase.ts` — 클라이언트 + TypeScript 타입
  - `.env.local.example` — 환경변수 템플릿

---

## Phase 7-B: IA v7 메뉴 구조 확정 ✅ (2026-06-01 완료)
- **상태**: ✅ 완료
- **변경 내용**:
  - V7-1: `조직/권한 관리` → `부서·사원 관리` (MicolCM 패턴 적용)
  - V7-2: 시스템관리 `사용자`+`권한` → `사용자·권한` 탭 통합
  - V7-3: ERP 수신 창구 단일화 (운영관리 > 부서·사원 관리만)
- **산출물**: IA_DESIGN.md v7 · REQUIREMENTS.md · HANDOVER.md · DB_스키마.md · VERIFICATION.md

---

## Phase 7-C: Supabase 마이그레이션 실행 🔜 (계정 수령 후)
- **상태**: 🔜 대기 — 홍세민 PM 공용 계정 수령 필요
- **작업**:
  1. `.env.local` 설정
  2. SQL Editor에서 001→002→003 순서 실행
  3. RCM 402건 시딩
  4. 연동 확인

---

## Phase 8: 데이터 운영방식 정의 + CRUD 연동

### Phase 8-설계논의2: IA v8 메뉴 전면 재검토 🔜 (2026-06-05 진행중)
- **상태**: 🔜 진행중 — M1/M2 방향 동의·디테일 미확정, M3/M4/M5 미확정
- **논의 완료**: 결재 UX(사이드패널), ERP하이브리드모니터링, 신규기능5종, 미리보기 HTML
- **2026-06-05 추가**:
  - M6 소프트게이트 ✅ 확정
  - M1/M2 방향 동의, 구성항목·디테일 수정 필요 (다음 세션 구체화)
  - M3/M4 평가설정·연동설정 미리보기 탭 추가 필요 (미검토)
  - 🆕 신규 기능 요건: **통합 엑셀 다운로드** (모집단+평가의견+증빙 → 1개 xlsx, N시트)
  - 🆕 리스크 분류 완료 → `.planning/RISK_DECISION_LOG.md` 생성
  - v2 엑셀 → v2.1 버전업 필요 (다음 세션 시작 시 Claude 생성)
- **산출물**: `public/preview-v8-design.html` (4탭), `.planning/RISK_DECISION_LOG.md` (신규)
- **다음**: M1/M2 디테일 확정 → v2.1 엑셀 생성 → M3/M4/M5 검토 → v8 메뉴 트리 최종 확정

### Phase 8-설계논의: RCM-부서 Map 재설계 + Default Owner 패턴 ✅ (2026-06-04 완료)
- **상태**: ✅ 완료
- **핵심 결정**:
  - RCM-부서 Map 소프트게이트 전환 (모집단 수신 하드차단 제거)
  - `rcm_dept_map` → `rcm_default_owners` + `rcm_term_assignments` 분리
  - Default Owner: 설계평가 단계 전용 / Term Assignment: 차수별 샘플링 단계 전용
  - GitHub 초기 커밋 완료 (https://github.com/aptimerp/K-ICFR.git, master)

### Phase 8-A: 데이터 운영방식 문서 정의 ✅ (2026-06-02 완료)
- **상태**: ✅ 완료
- **산출물**:
  - `docs/데이터_운영방식.md` — 전체 42탭 운영방식 초안
  - `02_PJT계획/Smart-ICM_데이터운영방식_정의서_v1.xlsx` — 장한나 PL 기재본 (v1)
  - `02_PJT계획/Smart-ICM_데이터운영방식_정의서_v2.xlsx` — v1 분석 반영 세분화 (v2)
- **v2 주요 개선**:
  - 신규 탭 5개 확인 (RCM-증빙 Map, 평가설정, AI검증기준 3종)
  - 컬럼 22개로 세분화 (1순위/2순위 원천, 자동트리거, 알림, AI관여, MicolCM차이 등)
  - 시트 5개 구조 (탭별운영방식, 신규테이블정의, 결재선구조, Status전체맵)
- **핵심 확정 사항**:
  - 결재선 최대 2단계 확정 (approval_lines 테이블 신규 정의 필요)
  - AI Draft 트리거: EVIDENCE_CONFIRMED 직후 자동
  - 알림: 사내 이메일 발송 확정
  - 미비점 이월 없음 확정 (동일 기간 내 마무리)
  - 증빙수집방식 3종 확정: ERP_FIRST / MANUAL_ONLY / OPTIONAL

### Phase 8-B: UI v7 코드 반영 🔜 (즉시 가능)
- **상태**: 🔜 대기 — Claude 즉시 수정 가능 (외부 의존성 없음)
- **작업**: 탭명 2곳 수정 (`부서·사원 관리`, `사용자·권한` 탭 통합)
- **파일**: `components/AppLayout.jsx`, `/settings/users`, `/settings/permissions`

### Phase 8-C: Supabase CRUD 연동 🔜 (계정 수령 후)
- **상태**: 🔜 대기 (홍세민 PM 계정 수령 + v2 엑셀 작성 완료 후)
- **목표**: 운영관리·운영평가관리 탭별 실데이터 CRUD 구현
- **우선순위**: 평가기간 관리 → RCM 관리(402건) → 부서·사원 → RCM-부서 Map → 모집단 → 증빙제출 → 운영평가

---

## Phase 9: SAC API 연동 + 기능 완성 (2026-06 중 ~)
- **상태**: ⏳ 예정
- **목표**: ERP 전표 자동수집 + 전체 CRUD 완성
- **산출물 예정**:
  - app/api/erp/ (SAC API 프록시 라우트)
  - ERP 모집단 자동 조회 기능
  - 결재 워크플로우 실제 연동
- **주요 이슈**: SAC API URL 및 Key 수령 (이영호 차장 협의)
- **예상 기간**: 2주

---

## Phase 9: 검증 + 배포 (2026-06 말 예정)
- **상태**: ⏳ 예정
- **목표**: UAT + Vercel 배포
- **산출물 예정**:
  - VERIFICATION.md (검증 결과)
  - Vercel 배포 URL
  - 운영 가이드
- **예상 기간**: 3~5일

---

## 리스크 & 의존성 (2026-06-05 업데이트)

### 외부 의존성 (Claude 단독 진행 불가)
- 🔴 **Supabase 계정** 미수령 → 홍세민 PM 공용 계정 URL·KEY 수령 후 마이그레이션 실행
- 🔴 **SAC API** 미연결 → 이영호 차장 URL·KEY 수령 (Phase 9)

### 설계 블로커 (결정 대기)
- 🟠 **v8 메뉴 트리 미확정** — M1/M2 디테일, M3/M4/M5 검토 필요 (장한나 PL)
- 🟠 **v2.1 엑셀 미작성** — DB 스키마 최종 보완을 위한 선행 필요

### DB 리스크 (RISK_DECISION_LOG.md 참조)
- 🔴 R1~R7: 지금 변경 시 마이그레이션 필요한 고위험 항목 7개 → **대부분 확정 완료**
- 🟡 Y1~Y5: 나중에 가능하나 공수 큰 중위험 항목 5개 → **Y1(결재선), Y4(엑셀시트단위), Y5(홈·결재 디테일) 미확정**

### 일정
- 🟡 이사회 보고 마감: 2026-07-10 (예정)

## 참고 문서
- [노션 프로젝트 페이지](https://www.notion.so/seohoo/35609b4dcd5781569b1ceae52d2ba49e)
- CLAUDE.md — 도메인·환경 정보
- `04_시스템자료/04_03_K_New_K-ICFR_SYSTEM/style-guide.html` — 디자인 시스템
- `01_PJT산출물/Smart-ICM_Evidence_Master_Improved.xlsx` — RCM 마스터 데이터
