# 요구사항 명세

**프로젝트**: 내부회계관리시스템 구축
**PL**: 장한나
**생성일**: 2026-05-15

---

## ▶ Phase 8-C-2 요구사항 (2026-06-09) — 결재함(inbox) 표준화

### 📌 작업 개요
Phase 8-C-1에서 상신함(`sent/page.jsx`)을 완전 고도화 완료 (EvidenceViewer + useEvalTerm + 2단계 게이트).
결재함(`inbox/page.jsx`)은 아직 Phase 8 이전 상태. 동일 표준 컴포넌트를 적용해 화면 수준을 맞춘다.

**작업 대상**: `app/approval/inbox/page.jsx` 전면 개편 (컴포넌트는 변경 금지)

### ✅ 핵심 요구사항

**R1. 전역 통제기간 (useEvalTerm)**
- 하드코딩 `TERM` 제거 → `useEvalTerm()` 훅 교체
- `isClosed` 시: 승인/반려/일괄승인 전부 `disabled` + 마감 안내 배너

**R2. EvidenceViewer 표준 적용**
- 패널 내 증빙 플레이스홀더 → EvidenceViewer 컴포넌트
- 다건 파일 목록 + 개별/일괄 다운로드 + 전체 미리보기 (`openPreview` 패턴)

**R3. 더미 데이터 고도화 (상신함 수준)**
- CTRL_POOL 12건 + 40건 더미 (대기/승인/반려 혼재)
- 각 행에 `evidenceFiles` 배열(1~4건), `sample` 정보, `ctrlDesc/evidenceReq/testProc` 포함

**R4. 필터/목록/페이지네이션 표준화 (UI_패턴.md §4)**
- 필터 바: 업무구분·통제번호·결재상태·평가결과 + 조회/초기화
- 요약 바: 전체 N건 · 정상/예외/해당없음
- 액션 바: 좌(일괄승인/반려) / 우(건수범위 + 표시개수 셀렉터 + 엑셀저장)
- 페이지네이션: 하단 중앙, 기본 50건, 자연정렬

**R5. 패널 내 결재 UX (Y5 확정 기준)**
- 섹션 순서: 기본정보 → AI경고 → 통제활동내용 → 평가증빙요구 → 테스트절차 → 샘플링정보 → 상신의견 → 첨부증빙(EvidenceViewer) → 결재현황 → 결재의견 입력
- 반려 의견 필수 검증 (opinion 없으면 반려 버튼 `disabled`)
- 승인 의견 선택 입력 가능

**미적용 항목 (결재함 불필요)**: 2단계 상신 게이트, 재상신/취소 버튼, 일괄상신 모달

### ✅ 성공 기준
| # | 기준 |
|---|------|
| 1 | `isClosed` 시 모든 결재 액션 비활성 + 배너 노출 |
| 2 | EvidenceViewer로 증빙 미리보기 동작 |
| 3 | 40건 더미 + evidenceFiles 1~4건 포함 |
| 4 | 조회·초기화·자연정렬·페이지네이션 동작 |
| 5 | 반려 의견 없이 반려 버튼 비활성 |
| 6 | 패널 섹션 6종 표시 순서 유지 |

---

## ▶ Phase 8-B 요구사항 (2026-06-08) — M1/M2 결재 UX 재설계 (홈·상신함·결재함)

### 📌 작업 개요
v8 변경포인트 M1(홈 = 실질 결재 처리 창구)·M2(결재관리 내 할일 탭 제거)의 **구성항목·디테일을 확정**한다.
"전반적 흐름은 맞지만 홈화면과 상신함·결재함의 구성항목·디테일 수정 필요"(장한나 PL, 2026-06-05) 피드백을 해소.
본 페이즈는 **요구사항 확정**이며, 실제 코드 반영은 /계획 → /실행 단계에서 수행한다.

### 🎯 목표 (Goal)
- 홈 "내 할일" 통합 수준 확정 + 결재관리 메뉴 구조 2개로 단순화
- 상신함·결재함 구성항목 및 인터랙션 디테일 확정
- 사이드패널(Drawer) UX의 작동 위치 명확화

### ✅ 확정 결정 사항 (2026-06-08)

| # | 항목 | 확정 내용 |
|---|------|----------|
| **M1-1** | 홈 "내 할일" 통합 수준 | **홈 = 요약(유형별 건수)만 표시**, 클릭 시 해당 작업 탭(증빙제출·운영평가·결재함 등)으로 이동하여 처리 |
| **M2-1** | 결재관리 "내 할일" 탭 | **완전 제거** → 결재관리는 `상신함` + `결재함` 2개 메뉴만 (단일메뉴 6→5) |
| **M1-2** | 사이드패널 작동 위치 | 홈 직접처리 아님. **상신함·결재함 탭 안에서** 통제 클릭 시 우측 Drawer 슬라이드 |

### 📋 상신함 (내가 올린 결재) — 구성항목 확정

| 항목 | 유형 | 비고 |
|------|------|------|
| 증빙제출 의견 표시 | 신규 | 상신 시 작성한 제출 의견 노출 |
| 현재 결재자 컬럼 | 신규 컬럼 | "지금 누구 결재 차례인지" (예: 이차장 결재 대기) |
| 일괄 체크 → 다건 일괄 취소 | 신규 인터랙션 | 체크박스 + 일괄 취소 버튼 |
| 재상신 버튼 | 신규 액션 | 반려된 건을 상신함에서 바로 수정·재상신 |
| (유지) 제목·통제코드·상신일·결재단계(2/3)·상태 | 기존 | — |

### 📋 결재함 (내가 승인할 결재) — 구성항목 확정

| 항목 | 유형 | 비고 |
|------|------|------|
| 통제번호 클릭 → 증빙 원본 조회 | 신규 인터랙션 | 상신자가 제출한 증빙 내용을 **그대로** 조회 (사이드패널) |
| 증빙 미리보기 | 신규 | 파일·이미지 미리보기 패널 |
| 단건 의견 입력 | 신규 | 일괄 승인 외 개별 건별 의견 입력 칸 |
| 반려 시 의견 **필수** | 신규 검증 | 반려 액션은 의견 미입력 시 차단 |
| 승인 일시 표시 | 신규 컬럼 | 승인 완료 시 승인 시각 기록·표시 |
| (유지) 제목·상신자·접수일·AI경고·일괄 승인/반려 | 기존 | — |

### 📊 영향 (Impact / Scope)
**코드 변경 대상** (/실행 단계):
- `app/page.jsx` — 홈 "내 할일" 카드 = 유형별 건수 요약 + 해당 탭 딥링크 (5 페르소나)
- `app/approval/todo/page.jsx` — **삭제** (라우팅 제거)
- `app/approval/sent/page.jsx` — 상신함 항목 추가 + 사이드패널
- `app/approval/inbox/page.jsx` — 결재함 항목 추가 + 사이드패널 + 반려 의견 필수 검증
- `components/AppLayout.jsx` — 결재관리 하위 "내 할일" 메뉴 제거 (3→2)
- (신규 후보) `components/ApprovalDrawer.jsx` — 공통 사이드패널 컴포넌트

**DB 영향**:
- `approvals` 테이블: `action_note`(반려 의견)·`action_at`(승인 일시) 기존 컬럼 활용 → **스키마 변경 없음**
- 반려 의견 필수는 **앱 레벨 검증** (NOT NULL 제약은 선택)
- 리스크 등급: 🟢 LOW (G 영역) — UI·인터랙션 레벨, 데이터 꼬임 없음 (RISK_DECISION_LOG.md Y5 해소)

### ⏰ 마감 (Deadline)
- 요구사항 확정: 본 세션 내
- 코드 반영: 별도 /실행 세션 (Supabase 연동 전이라 더미 데이터 기준)

### 🔗 의존성 (Dependencies)
- ✅ v8 결재 사이드패널 UX 방향 확정 (2026-06-04)
- ✅ 현재 결재관리 3종 페이지 구현 존재 (todo·sent·inbox)
- ⚠️ M3/M4/M5 미확정 — 본 페이즈와 독립 (병행 가능)
- ❌ Supabase 연동 없음 (더미 데이터로 UI 우선 구현)

### ✅ 성공 기준 (Acceptance Criteria)
- [ ] 홈 "내 할일" = 유형별 건수 요약 + 클릭 시 해당 탭 이동 (직접 처리 아님)
- [ ] 결재관리 메뉴에서 "내 할일" 제거, 상신함·결재함 2개만 노출
- [ ] 상신함: 증빙제출 의견·현재 결재자 컬럼·일괄 취소·재상신 버튼 동작
- [ ] 결재함: 통제번호 클릭 시 증빙 원본 사이드패널 조회·미리보기
- [ ] 결재함: 반려 시 의견 미입력 차단 + 단건 의견 입력 + 승인 일시 표시
- [ ] `npm run build` 성공 (경고 0건)

### 🚫 명시적 비목표 (Non-Goals)
- M3/M4 평가설정·연동설정 서브페이지 (별도 검토)
- M5 차수 복사 기능 (별도)
- Supabase 실데이터 연동 (Phase 8-C)
- 실제 결재선 엔진·알림 발송 (Phase 9)

---

## ▶ Phase 8 설계논의2 — v8 메뉴 검토 + 신규 기능 요건 (2026-06-05 진행중)

### 📌 작업 개요
IA v7 기준으로 v8 변경 포인트 6개(M1~M6) 검토 및 신규 기능 요건 정의.
데이터 꼬임 리스크 분류 완료 → `.planning/RISK_DECISION_LOG.md` 참조.

### ✅ 확정된 변경 사항

| # | 항목 | 결정 내용 | 확정일 |
|---|------|----------|-------|
| M6 | RCM-부서 Map 소프트게이트 | 모집단 수신 하드차단 제거, ⚠️ 경고 배너만 표시 | 2026-06-04 |
| - | 결재 처리 UX | 팝업 → 사이드 패널(Drawer) 전환 | 2026-06-04 |
| - | ERP API 모니터링 | 하이브리드 구조 (탭 분산형 + 시스템관리 집중형) | 2026-06-04 |
| - | rcm_dept_map 분리 | `rcm_default_owners` + `rcm_term_assignments` 2테이블 | 2026-06-04 |

### 🔜 검토 중 (미확정)

| # | 항목 | 현황 |
|---|------|------|
| M1 | 홈 내 할일 완전 통합 | 방향 동의, 구성항목·디테일 수정 필요 |
| M2 | 결재관리 상신함+결재함 2개 | 방향 동의, 상신함·결재함 컬럼 구성 수정 필요 |
| M3 | 시스템관리 > 평가설정 서브페이지 신설 | 미리보기 미구현, 미검토 |
| M4 | 시스템관리 > 연동설정 서브페이지 신설 | 미리보기 미구현, 미검토 |
| M5 | 평가기간 관리 > 차수 복사 기능 | 미확정 |

### 🆕 신규 기능 요건 — 통합 엑셀 다운로드 (FR-EXCEL-01)

#### 기능 정의
> 제출된 증빙·평가의견을 **1개의 엑셀 파일 (N개 시트)** 로 다운로드하는 기능

#### 적용 위치
- `app/results/status/page.jsx` > 평가증빙제출(ZIP) 탭 내 **"엑셀 다운로드" 버튼** 추가
- 기존 ZIP 감사패키지와 병존

#### 파일 구조 (안)
| 시트 | 내용 |
|------|------|
| Sheet 1 | 모집단·샘플링 현황 (통제코드·통제명·모집단수·샘플수·담당자·상태) |
| Sheet 2~N | 통제별 평가시트 — 증빙목록 + AI검증결과 + P3평가의견 + 예외등급 |

#### 미확정 사항 (Y4 — RISK_DECISION_LOG.md)
- [ ] 시트 단위: 통제 1개당 1시트 vs 프로세스(FR/FA 등) 단위 통합
- [ ] 기존 ZIP과의 관계: 완전 별개 vs 엑셀을 ZIP 안에 포함

#### 구현 방식
- Next.js API Route (`/api/export/evidence-excel`)
- `ExcelJS` 라이브러리 서버사이드 생성
- Supabase Storage `report-exports` 버킷에 임시 저장 후 Signed URL 반환

#### DB 영향
- **없음** — 기존 테이블 조회만, 스키마 변경 불필요

---

## ▶ IA v7 메뉴 구조 확정 (2026-06-01) — 운영관리·시스템관리 역할 명확화

### 📌 변경 배경
MicolCM(현 내부회계시스템) 메뉴구조도·업무매뉴얼 + ERP 운영매뉴얼 분석 결과,
운영관리 > 조직/권한 관리와 시스템관리 > 사용자·권한이 역할이 중복됨을 확인.
비개발자 P5의 관리 효율성을 위해 구조 단순화.

### ✅ 확정 변경 사항 3가지

| # | 항목 | 변경 전 | 변경 후 |
|---|------|--------|--------|
| V7-1 | 운영관리 탭 명칭 | 조직/권한 관리 | **부서·사원 관리** |
| V7-2 | 시스템관리 메뉴 | 사용자(1) + 권한(1) = 2개 | **사용자·권한(탭2개) = 1개** |
| V7-3 | ERP 수신 창구 | 운영관리 + 시스템관리 2곳 | **운영관리 > 부서·사원 관리 1곳** |

### 📋 확정 메뉴 구조 (v7)
```
1️⃣ 운영관리 > 평가관리
   ├─ 평가기간 관리
   ├─ 부서·사원 관리   ← ERP API 수신 + 내부 편집 (원본 창구)
   └─ 결재선 관리

6️⃣ 시스템관리
   ├─ 📄 사용자·권한
   │   ├─[탭] 사용자 관리   계정 활성화·페르소나 배정·외부사용자 추가
   │   └─[탭] 권한 설정     역할별 메뉴 접근 매트릭스
   ├─ 로그
   ├─ 증빙 로그
   └─ 환경설정
```

### 📊 데이터 흐름 (확정)
```
ERP → 운영관리 > 부서·사원 관리 (원본) → Supabase → 시스템관리 > 사용자·권한 (계정설정)
```

---

## ▶ Phase 7 요구사항 (2026-05-29) — Supabase DB 스키마 설계

### 📌 작업 개요
IA v6 메뉴 + ERP `ICM_SAMPLE_POPULATION_DT` 컬럼 구조를 기반으로
Supabase PostgreSQL 스키마를 설계하고 마이그레이션 파일 + 시딩 SQL을 작성한다.
Supabase 계정(홍세민 PM 공용)은 미수령 상태로, 스키마 문서·SQL 파일 작성을 먼저 완료한다.

### 🎯 목표 (Goal)
- `docs/DB_스키마.md` — 14개 테이블 설계 문서 완성
- `supabase/migrations/001_initial_schema.sql` — 전체 DDL
- `supabase/migrations/002_rls_policies.sql` — P1~P5 페르소나별 RLS 정책
- `supabase/migrations/003_audit_triggers.sql` — 변경이력 트리거
- `supabase/seeds/rcm_controls.sql` — RCM 402건 시딩 SQL
- `lib/supabase.ts` — Supabase 클라이언트 + TypeScript 타입 정의

### 📋 확인된 ERP 컬럼 (ICM_SAMPLE_POPULATION_DT)
`TERMID` / `TERMCNT` / `ENTITY_CODE` / `CTRL_NO` / `DEPT_CODE` /
`TRANSACTION_ID`(연결키★) / `TRANSACTION_DATE` / `TRANSACTION_DESCRIPTION` /
`ADD_INFO_1` / `ADD_INFO_2` / `SAMPLE_ID` / `N`(모집단수)

### ✅ 완료 항목 (2026-05-29)
- [x] ERP 모집단 양식 분석 (`ERP_모집단_업로드_양식_통합_20251128.xlsx`)
- [x] RCM JSON 402건 구조 확인 (`rcm_full_extracted.json`)
- [x] `docs/DB_스키마.md` 작성 (14개 테이블 + ERP 매핑)
- [x] `supabase/migrations/001_initial_schema.sql`
- [x] `supabase/migrations/002_rls_policies.sql`
- [x] `supabase/migrations/003_audit_triggers.sql`
- [x] `supabase/seeds/rcm_controls.sql` (402건)
- [x] `lib/supabase.ts` + TypeScript 타입
- [x] `.env.local.example` 환경변수 템플릿

### ⏳ 대기 항목
- [ ] Supabase 계정 수령 후 마이그레이션 실제 실행 (홍세민 PM)
- [ ] `.env.local` 설정 후 `lib/supabase.ts` 연동 확인

---

## ▶ Phase 6 요구사항 (2026-05-22) — AppLayout v6 교체 + 페이지 내 3단 탭 구축

### 📌 작업 개요
Phase 5에서 확정된 IA v6 (1+6 그룹, 11 서브페이지, 39 탭) 기반으로 `components/AppLayout.jsx`를 전면 교체하고,
페이지 내 3단 탭 공통 컴포넌트(`SubPageTabs.jsx`)를 신규 구축한다.
v6 라우팅 구조로 앱 전체를 재배치하며, 증빙제출(op-eval/evidence) 페이지는 완성도 있게 구현한다.

### 🎯 목표 (Goal)
- `AppLayout.jsx` v6 사이드바 (1단 그룹 + 2단 서브페이지) 완성
- `SubPageTabs.jsx` 공통 탭 컴포넌트 신규 생성
- v6 라우팅 30+ 페이지 골격 구축
- 증빙제출 페이지(4탭) 완성도 있게 구현 ⭐⭐
- 홈 화면 페르소나 5종 플레이스홀더 + 헤더 전환 토글

### 📊 영향 (Impact / Scope)
**신규 생성 파일**:
- `components/AppLayout.jsx` (전면 교체, 기존 백업: `AppLayout.v4.bak.jsx`)
- `components/SubPageTabs.jsx` (신규)
- `components/EvalTermToggle.jsx` (신규 — 중간1·중간2·기말 토글)
- `app/operations/period/page.jsx`, `app/operations/rcm/page.jsx`
- `app/design/prep/page.jsx`, `app/design/self/page.jsx`, `app/design/eval/page.jsx`, `app/design/progress/page.jsx`
- `app/op-eval/sampling/page.jsx`, `app/op-eval/evidence/page.jsx` ⭐, `app/op-eval/eval/page.jsx`, `app/op-eval/progress/page.jsx`
- `app/approval/todo/page.jsx`, `app/approval/sent/page.jsx`, `app/approval/inbox/page.jsx`
- `app/results/status/page.jsx`
- `app/settings/users/page.jsx`, `app/settings/permissions/page.jsx`, `app/settings/log/page.jsx`, `app/settings/evidence-log/page.jsx`, `app/settings/env/page.jsx`

**삭제 대상 (구버전 라우팅)**:
- `app/scoping/`, `app/elc/`, `app/attachments/`, `app/population/`
- `app/evidence/request/`, `app/evidence/assign/`
- `app/approval/sent/` (구버전), `app/approval/inbox/` (구버전 → v6 재생성)
- `app/reports/`, `app/reports/exception/`, `app/reports/progress/`
- `app/period/`, `app/settings/` (구버전 단일 페이지 → v6 서브 폴더로 재구성)
- `app/rcm/`, `app/design/` (구버전 단일 페이지 → v6 서브 폴더로 재생성)
- `app/operations/` (구버전 단일 페이지 → v6 op-eval 구조로 이전)

**유지 파일**:
- `app/layout.jsx` (루트 레이아웃)
- `app/globals.css`
- `app/login/page.jsx`
- `components/tokens.js`, `components/Placeholder.jsx`

### ⏰ 마감 (Deadline)
- **이번 Phase 6 세션 내 종료**
- `npm run build` 성공 (경고 0건 목표)

### 🔗 의존성 (Dependencies)
- ✅ IA v6 확정 완료 (`.planning/IA_DESIGN.md` v6)
- ✅ 메뉴 구조 v6 엑셀 (`01_PJT산출물/Smart-ICM_메뉴구조_v6.xlsx`)
- ✅ 스타일가이드 (`04_시스템자료/04_03_K_New_K-ICFR_SYSTEM/style-guide.html`)
- ✅ Next.js 15 + Tailwind CSS v4 + lucide-react 설치 완료
- ❌ Supabase 연동 없음 (Phase 7)
- ❌ SAC API 없음 (Phase 8)

### ✅ 성공 기준 (Acceptance Criteria)

**AppLayout v6 (필수)**:
- [ ] 사이드바 1단: 6개 그룹 (접힘 시 아이콘만, 펼침 시 레이블)
- [ ] 사이드바 2단: 그룹 클릭 시 서브페이지 목록 accordion
- [ ] 결재관리(3 단일 메뉴)·시스템관리(5 단일 메뉴)는 accordion 없이 직접 링크
- [ ] 설계평가관리: 회색 + "준비중" 배지, 클릭 비활성
- [ ] 현재 경로(pathname) 기준 그룹 자동 펼침 + 활성 항목 강조
- [ ] 차수 토글(중간1·중간2·기말) — 운영평가관리·결과조회 그룹 진입 시 헤더 표시

**SubPageTabs 공통 컴포넌트 (필수)**:
- [ ] `tabs`, `activeTab`, `onChange` props 인터페이스
- [ ] 스타일가이드 토큰 준수 (Primary blue-600, 밑줄 active 표시)
- [ ] URL search param 연동 (`?tab=xxx`)

**v6 라우팅 골격 (필수)**:
- [ ] 30+ 페이지 파일 존재 (빌드 성공 기준)
- [ ] 각 서브페이지는 SubPageTabs 컴포넌트로 탭 노출
- [ ] 구버전 라우팅 파일 완전 삭제

**증빙제출 페이지 (op-eval/evidence) ⭐⭐ (완성도 있게)**:
- [ ] 탭 4개: 증빙수집 / 증빙AI 검증 / 증빙제출 수행 / 증빙제출 승인
- [ ] 증빙제출 수행 탭: 좌측 목록 + 우측 상세 2단 레이아웃
- [ ] Status 배지 (MANUAL_UPLOADED, AI_VALIDATED, EVIDENCE_CONFIRMED 등)
- [ ] 파일 업로드 영역 UI
- [ ] AI 검증 결과 패널 (더미 데이터)

**홈 화면 (필수)**:
- [ ] 헤더 드롭다운: P1~P5 전환 (개발 테스트용)
- [ ] 페르소나별 홈 레이아웃 5종 (더미 카드, 구조만)

**빌드 검증 (필수)**:
- [ ] `npm run build` 성공
- [ ] 모든 페이지 TypeScript/ESLint 오류 0건

### 🚫 명시적 비목표 (Non-Goals)
- Supabase DB 연동 (Phase 7)
- SAC API 연동 (Phase 8)
- 실제 인증·로그인 연동
- 모바일 반응형 (Phase 6 비범위)
- 설계평가관리 페이지 실제 구현 (사이드바 UI만)
- 증빙 파일 실제 업로드 처리 (UI 골격만)

### 📝 결정 사항 (2026-05-22 확정)
| # | 항목 | 결정 |
|---|------|------|
| D1 | 구버전 라우팅 처리 | **삭제** (리다이렉트 없음, v6로 완전 교체) |
| D2 | 설계평가관리 표시 방식 | **회색 + 준비중 배지** (클릭 불가) |
| D3 | 홈 페르소나 전환 | **헤더 드롭다운 토글** (개발·데모용) |
| D4 | 우선 완성도 구현 페이지 | **증빙제출 (op-eval/evidence)** ⭐⭐ |

---

## ▶ Phase 5 요구사항 (2026-05-20) — IA v5 사용자 검토 및 v6 확정

### 📌 작업 개요
Phase 4.5에서 작성한 `.planning/IA_DESIGN.md` v5 (714라인, 10개 섹션, 15개 확정사항)를 사용자가 **세션별 순차 검토**.
모호하거나 변경이 필요한 부분만 해소하고, 즉시 IA_DESIGN.md v6으로 직접 업데이트.
이후 Phase 6 (시각화 + AppLayout 교체) 진입 토대 마련.

### 🎯 목표 (Goal)
- IA v5 → v6로 사용자 검토·확정
- 주요 변경·모호한 부분 모두 해소
- 시각화·코드 작업 직전 마지막 안정화

### 📊 영향 (Impact / Scope)
**대상**:
- `.planning/IA_DESIGN.md` (v5 → v6, 직접 업데이트)
- 필요 시 `memory/ia_design_patterns.md` (학습 보강)

**비대상**:
- 코드(`components/`, `app/`) 변경 없음
- 시각화 페이지 구현 ❌ (다음 페이즈)
- DB 스키마 ❌

### ⏰ 마감 (Deadline)
- **이번 세션 내 종료** (자연스럽게 진행, 시간 명시 없음)
- 사용자 페이스에 맞춰 세션별 순차 검토

### 🔗 의존성 (Dependencies)
- ✅ IA_DESIGN.md v5 작성 완료 (Phase 4.5)
- ✅ ERP 모집단 양식 분석 완료
- ✅ Notion MCP 자동 로딩 환경 (Phase 4.5-A — 다음 세션부터)
- ❌ 외부 의존성 없음

### ✅ 성공 기준 (Acceptance Criteria)

**검토 진행** (필수):
- [ ] §0 시스템 정의 — 7기능·비범위·평가모드·연결내부회계 OK
- [ ] §1 설계 원칙 12개 OK
- [ ] §2 페르소나 5명 (P1~P5) OK
- [ ] §3 시스템 경계 + Status 8단계 + 통제유형별 흐름 OK
- [ ] §4 메뉴 트리 12개 OK
- [ ] §5 페르소나 × 메뉴 매트릭스 OK
- [ ] §6 페르소나별 홈 화면 5종 OK
- [ ] §8 확정 사항 V5-1~V5-15 OK

**최종 산출물**:
- [ ] IA_DESIGN.md v6 (모든 주요 이슈 해소 상태)
- [ ] 변경 이력은 문서 상단 버전 로그에 기재

### 🚫 명시적 비목표 (Non-Goals)
- 사소한 디테일 모두 확정 (구현 단계에서 조정)
- 사용자 모호한 부분 외 추가 변경 강요
- 새로운 페르소나·메뉴·기능 추가
- 코드 작업

### 📝 검토 방식 (확정)
- **방식**: 세션별 순차 (§0 → §1 → §2 …)
- **각 세션마다**: 제가 요약 제시 → 사용자 OK/수정 → 즉시 v6 반영 → 다음 섹션
- **종료 기준**: 모든 섹션 통과, 주요 이슈 0건

---

## ▶ Phase 4 요구사항 (2026-05-20) — 사이드바·헤더 디자인 디테일 보완

### 📌 작업 개요
Phase 3에서 스타일가이드 기반으로 전체 UI를 재구축했음.
이번 페이즈에서는 **사이드바·헤더 공통 레이아웃(`AppLayout.jsx`)의 디자인 디테일을 끝장 수준으로 끌어올린다.**
특정 버그·결함은 없으며, "전반적 품질·세련도 향상"이 목표.

### 🎯 목표 (Goal)
- 사이드바·헤더가 **금강 Kind 스타일가이드와 완전히 일치**하는 수준의 디자인 디테일 달성
- 사용자가 매일 보는 영역인 만큼, **5분 이상 사용해도 어색함이 없는** 마감 품질 확보
- Phase 5(Supabase 연동) 진입 전 UI 토대 확정

### 📊 영향 (Impact / Scope)
**대상 파일** (확정):
- `components/AppLayout.jsx` — 사이드바 + 헤더 (주 작업 대상)
- `app/globals.css` — 필요 시 토큰·유틸 추가

**영향 페이지** (전체):
- 모든 메인 페이지가 `AppLayout`을 공유하므로 일관 적용
- 로그인 페이지는 별도 (영향 없음)

**비대상**:
- 페이지별 콘텐츠 내부는 변경 안 함
- DB·API·로직 연결 없음

### ⏰ 마감 (Deadline)
- **이번 세션 내 종료** (1일 수준)
- `npm run build` 통과 + 시각 검증까지 포함

### 🔗 의존성 (Dependencies)
- ✅ Tailwind CSS v4 (설치 완료)
- ✅ Lucide React (설치 완료)
- ✅ Pretendard Variable (CDN)
- ✅ `Kumkang-Kind-logo.png` (있음)
- ❌ 외부 의존성 없음 (SAC·Supabase 미관여)

### ✅ 성공 기준 (Acceptance Criteria)

**디자인 디테일** (필수):
- [ ] 사이드바 접힘 애니메이션이 자연스럽고 잔상 없음
- [ ] 접힘 상태에서 아이콘이 완벽히 가운데 정렬
- [ ] 활성 네비 항목의 호버·포커스·active 상태가 모두 명확히 구분됨
- [ ] 섹션 레이블(`기준정보` 등)의 위계가 명확함
- [ ] 사이드바 스크롤 시 그림자·페이드 처리
- [ ] 헤더 글래스모피즘이 스크롤 시에도 일관 (`bg-white/80 backdrop-blur-md`)
- [ ] 로고 + 서비스명 + 구분선 + 페이지 제목 간격·정렬 일관
- [ ] ERP 연동 배지가 펄스 애니메이션 자연스러움
- [ ] 사용자 드롭다운 메뉴의 그림자·테두리·간격이 가이드 기준

**인터랙션** (선택, 시간 허용 시):
- [ ] 사이드바 토글 시 외부 클릭으로 자동 접힘 (가이드 명시)
- [ ] 키보드 단축키 `Cmd/Ctrl + B`로 사이드바 토글
- [ ] 사용자 드롭다운 ESC 키 닫기

**검증**:
- [ ] `npm run build` 성공 (경고 0건)
- [ ] 9개 페이지 모두 동일한 레이아웃 동작
- [ ] `preview.html`도 동일하게 반영

### 🚫 명시적 비목표 (Non-Goals)
- 다크모드 지원 (스타일가이드: Light only)
- 사이드바 네비 항목 추가·변경
- 페이지 콘텐츠 영역 수정
- 모바일 반응형 (Phase 4 비범위)

### 📝 메모
- Phase 3 결과물의 사이드바·헤더는 **이미 잘 작동**하나, "디테일 끝장"이 목표
- 작업 후 Phase 5(Supabase) 진입 직전 사용자 시각 검증 필요

---

## ▶ 요구사항 (2026-05-18 업데이트) — Phase 1 증빙 스마트팩 [완료]

### 작업 개요
**전표(Voucher) 조회·검토 화면에서 증빙(Evidence) 파일 표시 버그 수정**

외부 시스템에서 스크래핑으로 증빙이 자동 첨부될 때, 전표 정보와 AI 추출값은 표시되지만
첨부된 증빙 파일/이미지/링크가 UI에 보이지 않는 문제를 수정한다.

---

### 기능 요구사항

#### FR-01: 전표 조회 화면 — 증빙 첨부 표시
- [x] **현재 표시되는 항목** (정상)
  - 전표 정보 (금액, 날짜, 계정과목 등)
  - AI 추출값 (스크래핑으로 뽑아낸 데이터)
- [ ] **수정 후 표시되어야 할 항목** (버그 수정 목표)
  - 증빙 파일명 또는 링크 (클릭 가능)
  - 증빙 이미지 미리보기 (가능한 경우)
  - 증빙 첨부 여부 상태 표시

#### FR-02: 자동 첨부 흐름 (스크래핑 → 증빙 + 전표 동시 첨부)
- [ ] 외부 시스템 스크래핑으로 증빙 파일 획득 시, 전표와 증빙을 묶어서 저장
- [ ] 저장된 증빙은 전표 조회 시 함께 표시
- [ ] 증빙 파일명, URL, 미리보기 중 하나 이상 표시

---

### 비기능 요구사항
- 증빙 파일 URL은 Supabase Storage 또는 외부 URL (스크래핑 출처)
- 파일 표시 시 보안 고려 (서버사이드 프록시 경유 가능)

---

### 제약 조건 & 의존성
- 코드 출처: 이전 채팅 세션에서 생성 (파일로 미저장 상태)
- SAC API 의존성: 전표 데이터는 SAC API 경유
- Supabase: 증빙 URL은 Supabase DB(JSONB) 또는 Storage

---

### 성공 기준
- [ ] 전표 조회 화면에서 증빙 파일명·링크가 보임
- [ ] 스크래핑 자동 첨부 시 증빙도 함께 표시됨
- [ ] 증빙 없는 전표는 "증빙 없음" 또는 빈 상태로 표시

---

## 사용할 기술 스택 (예정)
- **Frontend**: Next.js + TypeScript + React
- **Backend**: Vercel API Routes
- **Database**: Supabase (PostgreSQL)
- **ERP 연동**: SAC API (MSSQL 경유)

---

## 타임라인 (예정)
- Phase 1: 2026-05-15 ~ 05-20 (요구사항)
- Phase 2: 2026-05-20 ~ 05-30 (설계)
- Phase 3: 2026-06-01 ~ 06-15 (개발)
- Phase 4: 2026-06-15 ~ 06-20 (검증)
- Phase 5: 2026-06-20 ~ 06-30 (배포)

---

**다음 단계**: `/시작` 명령 실행 → GSD discuss-phase 진입
